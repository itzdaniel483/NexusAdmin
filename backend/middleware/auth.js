const jwt = require('jsonwebtoken');
const settingsStore = require('../services/settingsStore');
const axios = require('axios');

const JWT_SECRET = 'tcadmin-secret-key-change-this'; // TODO: Move to environment variable

// Cache for Cloudflare public keys
let cfPublicKeysCache = null;
let cfKeysCacheTime = 0;
const CF_KEYS_CACHE_TTL = 3600000; // 1 hour

/**
 * Fetch Cloudflare Access public keys for JWT verification
 */
async function getCloudflarePublicKeys(teamDomain) {
    const now = Date.now();

    // Return cached keys if still valid
    if (cfPublicKeysCache && (now - cfKeysCacheTime) < CF_KEYS_CACHE_TTL) {
        return cfPublicKeysCache;
    }

    try {
        // Cloudflare publishes their public keys at this endpoint
        const certsUrl = `${teamDomain}/cdn-cgi/access/certs`;
        const response = await axios.get(certsUrl);

        cfPublicKeysCache = response.data;
        cfKeysCacheTime = now;

        return cfPublicKeysCache;
    } catch (err) {
        console.error('Failed to fetch Cloudflare public keys:', err.message);
        throw new Error('Unable to verify Cloudflare JWT: Cannot fetch public keys');
    }
}

/**
 * Verify Cloudflare Access JWT token
 */
async function verifyCloudflareJWT(token, teamDomain, audience) {
    try {
        // Decode token header to get the key ID (kid)
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded || !decoded.header || !decoded.header.kid) {
            throw new Error('Invalid JWT format');
        }

        const kid = decoded.header.kid;

        // Get Cloudflare public keys
        const keys = await getCloudflarePublicKeys(teamDomain);

        // Find the matching public key
        const publicKey = keys.public_certs?.find(cert => cert.kid === kid);
        if (!publicKey) {
            throw new Error('Public key not found for token');
        }

        // Verify the JWT using the public key
        const verified = jwt.verify(token, publicKey.cert, {
            audience: audience,
            algorithms: ['RS256']
        });

        return verified;
    } catch (err) {
        console.error('Cloudflare JWT verification failed:', err.message);
        throw err;
    }
}

const authMiddleware = async (req, res, next) => {
    // Public routes that don't require authentication
    const publicRoutes = ['/api/login', '/api/settings'];
    if (publicRoutes.includes(req.originalUrl)) {
        return next();
    }

    try {
        const settings = await settingsStore.getSettings();

        // External Auth Mode (Cloudflare Zero Trust)
        if (settings.authMode === 'external') {
            // Check for Cloudflare Access JWT
            const cfJwt = req.headers['cf-access-jwt-assertion'];

            // If no Cloudflare JWT, allow for local testing
            if (!cfJwt) {
                console.warn('External auth mode enabled but no Cloudflare JWT found. Allowing for local testing.');
                req.user = {
                    username: 'local_test_user',
                    role: 'admin',
                    local_testing: true
                };
                return next();
            }

            // Verify we have the required Cloudflare configuration
            if (!settings.cfAccessTeamDomain || !settings.cfAccessAud) {
                return res.status(500).json({
                    error: 'Cloudflare Access not properly configured. Please set Team Domain and AUD in Settings.'
                });
            }

            try {
                // Verify the Cloudflare JWT
                const verified = await verifyCloudflareJWT(
                    cfJwt,
                    settings.cfAccessTeamDomain,
                    settings.cfAccessAud
                );

                // Extract user info from the verified token
                req.user = {
                    username: verified.email || verified.sub || 'cloudflare_user',
                    role: 'admin', // You can customize this based on Cloudflare groups
                    email: verified.email,
                    cloudflare: true
                };

                return next();
            } catch (err) {
                return res.status(401).json({
                    error: 'Invalid Cloudflare Access JWT',
                    details: err.message
                });
            }
        }

        // Local Auth Mode - verify local JWT
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ error: 'Authentication error' });
    }
};

module.exports = { authMiddleware, JWT_SECRET };
