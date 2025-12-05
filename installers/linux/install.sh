#!/bin/bash

# ServerForge Installation Script for Linux/macOS
# Run this script with: chmod +x install.sh && ./install.sh

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=========================================${NC}"
echo -e "${CYAN}     # ServerForge Linux/Mac Installer (Linux/Mac)   ${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

# 1. Check for Node.js
echo -e "${GREEN}Step 1/5: Checking system requirements...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js found: $(node -v)"

# 2. Install SteamCMD
echo -e "${GREEN}Step 2/5: Setting up SteamCMD...${NC}"
STEAMCMD_DIR="$HOME/steamcmd"

if [ ! -d "$STEAMCMD_DIR" ]; then
    mkdir -p "$STEAMCMD_DIR"
    echo "Downloading SteamCMD..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz" | tar zxvf - -C "$STEAMCMD_DIR"
    else
        # Linux
        curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf - -C "$STEAMCMD_DIR"
    fi
    echo "[OK] SteamCMD installed to $STEAMCMD_DIR"
else
    echo "[OK] SteamCMD already installed"
fi

# 3. Install Backend Dependencies
echo -e "${GREEN}Step 3/5: Installing backend dependencies...${NC}"

# Go up two levels from installers/linux to root, then into backend
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/../../backend"

cd "$BACKEND_DIR" || exit
npm install
echo "[OK] Backend dependencies installed"

# 4. Configure SteamCMD Path
echo -e "${GREEN}Step 4/5: Configuring application...${NC}"
STEAMCMD_JS="$BACKEND_DIR/services/steamcmd.js"

if [ -f "$STEAMCMD_JS" ]; then
    # Update path in steamcmd.js
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|const STEAMCMD_PATH = .*|const STEAMCMD_PATH = '$STEAMCMD_DIR/steamcmd.sh';|g" "$STEAMCMD_JS"
    else
        sed -i "s|const STEAMCMD_PATH = .*|const STEAMCMD_PATH = '$STEAMCMD_DIR/steamcmd.sh';|g" "$STEAMCMD_JS"
    fi
    echo "[OK] SteamCMD path configured"
fi

# 5. Create Data Directories
echo -e "${GREEN}Step 5/5: Creating data directories...${NC}"
mkdir -p "$BACKEND_DIR/data"
mkdir -p "$BACKEND_DIR/servers"
mkdir -p "$BACKEND_DIR/cache"

echo "[OK] Data directories created"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}      Installation Complete!             ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${CYAN}To start ServerForge:${NC}"
echo "1. Go to the root folder: cd ../.."
echo "2. Run: npm start"
echo ""
echo -e "${CYAN}Default Login:${NC}"
echo "Username: admin"
echo "Password: admin"
echo ""
echo -e "${RED}IMPORTANT: Please change the default password after first login!${NC}"
echo ""
