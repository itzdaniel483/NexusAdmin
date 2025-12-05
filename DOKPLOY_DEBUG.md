# Quick Dokploy Debugging Guide

## Issue: Frontend not loading

### Docker Terminal Access
The Alpine Linux image uses `sh` not `bash`. In Dokploy's Docker Terminal:
- Select **/bin/sh** from the dropdown (not Bash)

### Commands to run in container terminal:

```sh
# Check current directory
pwd

# List files in /app
ls -la /app

# Check if frontend directory exists
ls -la /app/frontend

# Check if dist directory exists
ls -la /app/frontend/dist

# Check if index.html exists
ls -la /app/frontend/dist/index.html

# See what Node.js is seeing
node -e "console.log('__dirname would be:', __dirname)"
```

### What to look for:
1. Does `/app/frontend/dist` exist?
2. Does it contain `index.html` and other built files?
3. If not, the frontend build failed during Docker build

### If frontend/dist is missing:
The issue is in the Docker build process. Check the build logs in Dokploy for errors during the frontend build stage.

### Alternative: Check build logs
In Dokploy, go to your application → Build Logs → Look for:
- "Stage 1: Build Frontend" 
- Any errors during `npm run build`
- Check if the build completed successfully
