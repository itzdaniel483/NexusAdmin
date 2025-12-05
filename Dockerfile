# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Backend + Built Frontend
FROM node:18-alpine

WORKDIR /app

# Install dependencies for backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create directories for persistent data
RUN mkdir -p /app/data /app/cache /app/servers /app/backups

# Expose port (configurable via environment variable)
EXPOSE 3000

# Set default environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/data \
    CACHE_DIR=/app/cache \
    SERVERS_DIR=/app/servers

# Start the application
CMD ["node", "server.js"]
