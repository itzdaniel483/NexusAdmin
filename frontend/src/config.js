// Frontend configuration
// Dynamically determines API and WebSocket URLs based on environment

// For production builds, use the current origin (same domain as frontend)
// For development, can be overridden with VITE_API_URL environment variable
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
export const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

// Export for debugging
if (import.meta.env.DEV) {
    console.log('🔧 Frontend Config:', { API_URL, WS_URL });
}
