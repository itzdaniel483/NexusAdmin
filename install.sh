#!/bin/bash
# TCadmin Installation Script for Linux
# This script installs SteamCMD and sets up TCadmin

set -e

echo "========================================="
echo "  TCadmin Installation Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root${NC}"
    exit 1
fi

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
else
    echo -e "${RED}Unsupported operating system${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1/5: Checking dependencies...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js version must be 18 or higher (current: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) found${NC}"

echo ""
echo -e "${GREEN}Step 2/5: Installing SteamCMD...${NC}"

# Create steamcmd directory
STEAMCMD_DIR="$HOME/steamcmd"
mkdir -p "$STEAMCMD_DIR"

if [ "$OS" == "linux" ]; then
    # Install 32-bit libraries (required for SteamCMD on 64-bit systems)
    echo "Installing required 32-bit libraries..."
    
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        sudo dpkg --add-architecture i386
        sudo apt-get update
        sudo apt-get install -y lib32gcc-s1 lib32stdc++6 curl
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        sudo yum install -y glibc.i686 libstdc++.i686 curl
    else
        echo -e "${YELLOW}Warning: Could not detect package manager. You may need to install 32-bit libraries manually.${NC}"
    fi
    
    # Download SteamCMD
    cd "$STEAMCMD_DIR"
    if [ ! -f "steamcmd.sh" ]; then
        echo "Downloading SteamCMD..."
        curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz" | tar zxvf -
        chmod +x steamcmd.sh
        
        # Run SteamCMD once to update itself
        echo "Initializing SteamCMD (this may take a moment)..."
        ./steamcmd.sh +quit
    else
        echo -e "${GREEN}✓ SteamCMD already installed${NC}"
    fi
elif [ "$OS" == "mac" ]; then
    # Download SteamCMD for macOS
    cd "$STEAMCMD_DIR"
    if [ ! -f "steamcmd.sh" ]; then
        echo "Downloading SteamCMD for macOS..."
        curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz" | tar zxvf -
        chmod +x steamcmd.sh
        
        # Run SteamCMD once to update itself
        echo "Initializing SteamCMD (this may take a moment)..."
        ./steamcmd.sh +quit
    else
        echo -e "${GREEN}✓ SteamCMD already installed${NC}"
    fi
fi

echo -e "${GREEN}✓ SteamCMD installed at $STEAMCMD_DIR${NC}"

echo ""
echo -e "${GREEN}Step 3/5: Installing backend dependencies...${NC}"

cd "$(dirname "$0")/backend"
npm install

echo -e "${GREEN}✓ Backend dependencies installed${NC}"

echo ""
echo -e "${GREEN}Step 4/5: Creating data directories...${NC}"

mkdir -p data
mkdir -p ../servers
mkdir -p cache

echo -e "${GREEN}✓ Data directories created${NC}"

echo ""
echo -e "${GREEN}Step 5/5: Configuring SteamCMD path...${NC}"

# Update steamcmd.js with the correct path
STEAMCMD_JS="services/steamcmd.js"
if [ -f "$STEAMCMD_JS" ]; then
    # Create backup
    cp "$STEAMCMD_JS" "$STEAMCMD_JS.bak"
    
    # Update the STEAMCMD_PATH
    if [[ "$OS" == "linux" ]] || [[ "$OS" == "mac" ]]; then
        sed -i.tmp "s|const STEAMCMD_PATH = .*|const STEAMCMD_PATH = '$STEAMCMD_DIR/steamcmd.sh';|" "$STEAMCMD_JS"
        rm -f "$STEAMCMD_JS.tmp"
    fi
    
    echo -e "${GREEN}✓ SteamCMD path configured${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "SteamCMD installed at: $STEAMCMD_DIR"
echo ""
echo "To start TCadmin:"
echo "  cd $(dirname "$0")"
echo "  npm start"
echo ""
echo "Default login credentials:"
echo "  Username: admin"
echo "  Password: admin"
echo ""
echo -e "${YELLOW}⚠️  Please change the default password after first login!${NC}"
echo ""
