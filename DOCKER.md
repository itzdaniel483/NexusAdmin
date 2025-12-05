# Docker Deployment Guide for ServerForge

This guide covers deploying ServerForge using Docker, including local testing and deployment to Dokploy with multi-instance support.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Building the Docker Image](#building-the-docker-image)
- [Running Locally](#running-locally)
- [Deploying to Dokploy](#deploying-to-dokploy)
- [Multi-Instance Setup](#multi-instance-setup)
- [Data Persistence](#data-persistence)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker installed (version 20.10+)
- Docker Compose (optional, for local testing)
- Dokploy account (for production deployment)
- Basic understanding of Docker and environment variables

## Quick Start

### Local Testing with Docker Compose

1. **Clone the repository** (if not already done):
   ```bash
   cd c:\Users\dobbi\Desktop\TCadmin
   ```

2. **Create environment file**:
   ```bash
   copy .env.example .env
   ```

3. **Edit `.env`** and set your configuration:
   ```env
   PORT=3000
   APP_URL=http://localhost:3000
   JWT_SECRET=your-random-secret-here
   ```

4. **Build and run**:
   ```bash
   docker-compose up -d
   ```

5. **Access the application**:
   Open your browser to `http://localhost:3000`

6. **View logs**:
   ```bash
   docker-compose logs -f
   ```

7. **Stop the application**:
   ```bash
   docker-compose down
   ```

## Environment Variables

All configuration is done via environment variables. Here's a complete reference:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Port the backend listens on | `3000` | No |
| `NODE_ENV` | Node environment | `production` | No |
| `APP_URL` | Public URL of the application | `http://localhost:3000` | Yes |
| `FRONTEND_URL` | Frontend URL (usually same as APP_URL) | `http://localhost:3000` | No |
| `JWT_SECRET` | Secret key for JWT tokens | ⚠️ Must be changed! | **Yes** |
| `DATA_DIR` | Data directory inside container | `/app/data` | No |
| `CACHE_DIR` | Cache directory inside container | `/app/cache` | No |
| `SERVERS_DIR` | Servers directory inside container | `/app/servers` | No |

### Generating a Secure JWT Secret

**Windows (PowerShell)**:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Linux/Mac**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Building the Docker Image

### Manual Build

```bash
cd c:\Users\dobbi\Desktop\TCadmin
docker build -t serverforge:latest .
```

The build process:
1. Builds the React frontend with Vite
2. Sets up the Node.js backend
3. Copies the built frontend into the backend
4. Installs production dependencies
5. Creates necessary directories

### Build Arguments (Optional)

You can customize the build with build arguments:

```bash
docker build --build-arg NODE_VERSION=18 -t serverforge:latest .
```

## Running Locally

### Using Docker Run

```bash
docker run -d \
  --name serverforge \
  -p 3000:3000 \
  -e PORT=3000 \
  -e APP_URL=http://localhost:3000 \
  -e JWT_SECRET=your-secret-here \
  -v serverforge_data:/app/data \
  -v serverforge_cache:/app/cache \
  -v serverforge_servers:/app/servers \
  -v serverforge_backups:/app/backups \
  serverforge:latest
```

### Using Docker Compose

See the [Quick Start](#quick-start) section above.

## Deploying to Dokploy

Dokploy makes it easy to deploy Docker applications with environment variable management and automatic SSL.

### Step 1: Prepare Your Repository

1. Ensure all changes are committed to your Git repository
2. Push to GitHub/GitLab/Bitbucket

### Step 2: Create Application in Dokploy

1. Log in to your Dokploy dashboard
2. Click **"Create New Application"**
3. Select **"Docker"** as the application type
4. Connect your Git repository

### Step 3: Configure Build Settings

In Dokploy's build settings:

- **Dockerfile Path**: `Dockerfile`
- **Build Context**: `.` (root directory)
- **Port**: `3000` (internal container port)

### Step 4: Set Environment Variables

In Dokploy's environment variables section, add:

```env
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com
JWT_SECRET=<generate-a-secure-random-string>
```

> **Important**: Replace `your-domain.com` with your actual domain!

### Step 5: Configure Volumes (Persistent Storage)

Add these volume mappings in Dokploy:

| Container Path | Volume Name | Description |
|----------------|-------------|-------------|
| `/app/data` | `serverforge_data` | User data and configuration |
| `/app/cache` | `serverforge_cache` | SteamCMD cache |
| `/app/servers` | `serverforge_servers` | Game server installations |
| `/app/backups` | `serverforge_backups` | Server backups |

### Step 6: Configure Domain

1. In Dokploy, go to **Domains** section
2. Add your domain (e.g., `panel.yourdomain.com`)
3. Dokploy will automatically configure SSL via Let's Encrypt

### Step 7: Deploy

1. Click **"Deploy"**
2. Monitor the build logs
3. Once deployed, access your application at your configured domain

## Multi-Instance Setup

One of the key features is running multiple independent instances on the same server.

### Example: Two Instances

**Instance 1** (panel1.yourdomain.com):
```env
PORT=3000
APP_URL=https://panel1.yourdomain.com
JWT_SECRET=random-secret-for-instance-1
```

**Instance 2** (panel2.yourdomain.com):
```env
PORT=3000
APP_URL=https://panel2.yourdomain.com
JWT_SECRET=random-secret-for-instance-2
```

### In Dokploy

1. Create two separate applications in Dokploy
2. Each application gets its own:
   - Environment variables
   - Docker volumes (automatically isolated)
   - Domain name
   - SSL certificate

3. Both can use the same port (`3000`) internally because they're in separate containers

### Using Docker Compose (Local Multi-Instance)

Uncomment the second instance in `docker-compose.yml`:

```yaml
serverforge-instance2:
  build: .
  container_name: serverforge-instance2
  ports:
    - "3001:3000"  # External port 3001 -> Internal port 3000
  environment:
    - APP_URL=http://localhost:3001
    - JWT_SECRET=different-secret-for-instance2
  volumes:
    - serverforge_data_instance2:/app/data
    - serverforge_cache_instance2:/app/cache
    - serverforge_servers_instance2:/app/servers
    - serverforge_backups_instance2:/app/backups
```

Then run:
```bash
docker-compose up -d
```

Access:
- Instance 1: `http://localhost:3000`
- Instance 2: `http://localhost:3001`

## Data Persistence

### Volume Structure

All persistent data is stored in Docker volumes:

```
/app/data/          # User accounts, settings, server metadata
/app/cache/         # SteamCMD downloads cache
/app/servers/       # Installed game servers
/app/backups/       # Server backups
```

### Backing Up Data

**Export volumes**:
```bash
docker run --rm -v serverforge_data:/data -v ${PWD}:/backup alpine tar czf /backup/serverforge_data_backup.tar.gz -C /data .
```

**Restore volumes**:
```bash
docker run --rm -v serverforge_data:/data -v ${PWD}:/backup alpine tar xzf /backup/serverforge_data_backup.tar.gz -C /data
```

### Accessing Volume Data

**List volumes**:
```bash
docker volume ls | grep serverforge
```

**Inspect a volume**:
```bash
docker volume inspect serverforge_data
```

## Troubleshooting

### Container Won't Start

**Check logs**:
```bash
docker logs serverforge
```

**Common issues**:
- Missing `JWT_SECRET` environment variable
- Port already in use
- Insufficient permissions for volumes

### Frontend Can't Connect to Backend

**Verify environment variables**:
```bash
docker exec serverforge env | grep APP_URL
```

**Check if backend is running**:
```bash
docker exec serverforge curl http://localhost:3000/api/settings
```

### WebSocket Connection Issues

If real-time features (logs, stats) don't work:

1. **Check CORS configuration**: Ensure `APP_URL` matches your actual domain
2. **Verify WebSocket support**: Some reverse proxies need special configuration
3. **For Cloudflare Tunnel**: Ensure WebSocket support is enabled

### Permission Denied Errors

If you see permission errors accessing game servers:

```bash
# Fix volume permissions
docker exec -u root serverforge chown -R node:node /app/data /app/cache /app/servers /app/backups
```

### Rebuilding After Code Changes

```bash
# Stop and remove container
docker-compose down

# Rebuild image
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

### Viewing Real-Time Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker logs -f serverforge

# Last 100 lines
docker logs --tail 100 serverforge
```

## Production Best Practices

1. **Always use a strong JWT_SECRET** - Never use the default in production
2. **Set up regular backups** - Use volume backups or external backup solutions
3. **Monitor resource usage** - Game servers can be resource-intensive
4. **Use SSL/TLS** - Dokploy handles this automatically
5. **Keep Docker images updated** - Rebuild periodically for security updates
6. **Limit exposed ports** - Only expose what's necessary
7. **Use environment-specific configs** - Different secrets for dev/staging/prod

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Dokploy Documentation](https://dokploy.com/docs)
- [ServerForge GitHub](https://github.com/yourusername/serverforge)

## Support

If you encounter issues:
1. Check the logs first
2. Review this troubleshooting guide
3. Check GitHub issues
4. Create a new issue with logs and configuration (redact secrets!)
