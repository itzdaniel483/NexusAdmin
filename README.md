# TCadmin - Game Server Management Panel

A modern, web-based game server management panel with support for Source engine games and more.

## Features

- 🎮 **16+ Game Support** - Garry's Mod, CS:GO, TF2, Rust, ARK, and more
- 🚀 **Pre-Cache System** - Download games once, install instantly
- 👥 **User Management** - Multi-user support with role-based access
- 🔐 **Dual Authentication** - Local login or Cloudflare Zero Trust
- 📊 **Real-time Monitoring** - Live console, stats, and player info
- 📁 **File Manager** - Edit configs directly from the web interface
- 💾 **Backup System** - Automated and manual backups
- 🔌 **Plugin Support** - Extend server functionality
- 👤 **Server Ownership** - Track who installed each server

## System Requirements

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Operating System:** Windows, Linux, or macOS
- **RAM:** 2GB minimum (4GB+ recommended)
- **Disk Space:** 10GB+ (for game servers)

## Quick Installation

### Windows

1. **Run the installer as Administrator:**
   ```powershell
   # Right-click PowerShell and select "Run as Administrator"
   cd path\to\TCadmin
   .\install.ps1
   ```

2. **Start TCadmin:**
   ```powershell
   npm start
   ```

3. **Access the panel:**
   - Open browser to `http://localhost:5173`
   - Login with `admin` / `admin`
   - **Change your password immediately!**

### Linux / macOS

1. **Run the installer:**
   ```bash
   cd /path/to/TCadmin
   chmod +x install.sh
   ./install.sh
   ```

2. **Start TCadmin:**
   ```bash
   npm start
   ```

3. **Access the panel:**
   - Open browser to `http://localhost:5173`
   - Login with `admin` / `admin`
   - **Change your password immediately!**

## What the Installer Does

The installation script automatically:

✅ Checks for Node.js and npm
✅ Downloads and installs SteamCMD
✅ Installs all backend dependencies
✅ Creates required data directories
✅ Configures SteamCMD path
✅ Sets up default admin account

## Manual Installation

If you prefer to install manually:

### 1. Install SteamCMD

**Windows:**
- Download from: https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip
- Extract to `C:\steamcmd\`
- Run `steamcmd.exe` once to initialize

**Linux:**
```bash
mkdir ~/steamcmd && cd ~/steamcmd
curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -
./steamcmd.sh +quit
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure SteamCMD Path

Edit `backend/services/steamcmd.js` and update the path:

```javascript
// Windows
const STEAMCMD_PATH = 'C:\\steamcmd\\steamcmd.exe';

// Linux/Mac
const STEAMCMD_PATH = '/home/username/steamcmd/steamcmd.sh';
```

### 4. Start the Application

```bash
npm start
```

## Configuration

### Authentication Modes

**Local Authentication (Default):**
- Username/password login
- User management in Settings → Users
- Default credentials: `admin` / `admin`

**External Authentication (Cloudflare Zero Trust):**
1. Go to Settings → General → Authentication
2. Select "External Authentication"
3. Enter your Cloudflare Team Domain and AUD Tag
4. Save configuration
5. Deploy behind Cloudflare Access

### Steam API Key (Optional)

For enhanced server query features:
1. Get your key at: https://steamcommunity.com/dev/apikey
2. Go to Settings → General → Steam Integration
3. Enter your API key and save

## Production Deployment

### Option 1: Serve Frontend from Backend

The backend can serve the built frontend files:

```bash
# Build the frontend
cd frontend
npm run build

# Update backend/server.js to serve static files
# (Add static file serving middleware)

# Start backend only
cd ../backend
npm start
```

### Option 2: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        root /path/to/TCadmin/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Option 3: Docker

```bash
docker-compose up -d
```

## Supported Games

- Garry's Mod
- Team Fortress 2
- Counter-Strike: Global Offensive
- Counter-Strike: Source
- Left 4 Dead 2
- Left 4 Dead
- Half-Life 2: Deathmatch
- Day of Defeat: Source
- Zombie Panic! Source
- Insurgency
- Rust
- ARK: Survival Evolved
- 7 Days to Die
- Killing Floor
- The Forest
- Project Zomboid

## Troubleshooting

### SteamCMD Issues

**"SteamCMD not found"**
- Verify SteamCMD path in `backend/services/steamcmd.js`
- Ensure SteamCMD is executable (`chmod +x steamcmd.sh` on Linux)

**"Failed to download game"**
- Check internet connection
- Verify Steam servers are online
- Try running SteamCMD manually to test

### Port Already in Use

If port 3000 or 5173 is already in use:

**Backend (port 3000):**
- Edit `backend/server.js` and change `const PORT = 3000;`

**Frontend (port 5173):**
- Edit `frontend/vite.config.js` and add:
  ```javascript
  server: { port: 5174 }
  ```

### Permission Errors

**Linux:**
```bash
sudo chown -R $USER:$USER ~/steamcmd
chmod +x ~/steamcmd/steamcmd.sh
```

**Windows:**
- Run PowerShell as Administrator
- Ensure antivirus isn't blocking SteamCMD

## Security Recommendations

1. **Change default password** immediately after first login
2. **Use HTTPS** in production (via Cloudflare or Let's Encrypt)
3. **Enable Cloudflare Zero Trust** for enterprise-grade authentication
4. **Restrict firewall** to only necessary ports
5. **Keep Node.js updated** for security patches

## Support

For issues, questions, or feature requests:
- Check the troubleshooting section above
- Review the documentation
- Contact your system administrator

## License

[Your License Here]

## Credits

Built with:
- React + Vite
- Node.js + Express
- Socket.IO
- xterm.js
- Lucide Icons
