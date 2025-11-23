# TCadmin Installation Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  TCadmin Installation Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1/5: Checking dependencies..." -ForegroundColor Green

# Check for Node.js
try {
    $nodeVersion = node -v
    $nodeMajorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    
    if ($nodeMajorVersion -lt 18) {
        Write-Host "Node.js version must be 18 or higher (current: $nodeVersion)" -ForegroundColor Red
        Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check for npm
try {
    $npmVersion = npm -v
    Write-Host "✓ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2/5: Installing SteamCMD..." -ForegroundColor Green

# Create steamcmd directory
$steamcmdDir = "$env:USERPROFILE\steamcmd"
if (-not (Test-Path $steamcmdDir)) {
    New-Item -ItemType Directory -Path $steamcmdDir | Out-Null
}

$steamcmdExe = "$steamcmdDir\steamcmd.exe"

if (-not (Test-Path $steamcmdExe)) {
    Write-Host "Downloading SteamCMD..." -ForegroundColor Yellow
    
    # Download SteamCMD
    $steamcmdZip = "$steamcmdDir\steamcmd.zip"
    $steamcmdUrl = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip"
    
    try {
        Invoke-WebRequest -Uri $steamcmdUrl -OutFile $steamcmdZip
        
        # Extract SteamCMD
        Write-Host "Extracting SteamCMD..." -ForegroundColor Yellow
        Expand-Archive -Path $steamcmdZip -DestinationPath $steamcmdDir -Force
        Remove-Item $steamcmdZip
        
        # Run SteamCMD once to update itself
        Write-Host "Initializing SteamCMD (this may take a moment)..." -ForegroundColor Yellow
        Start-Process -FilePath $steamcmdExe -ArgumentList "+quit" -Wait -NoNewWindow
        
        Write-Host "✓ SteamCMD installed at $steamcmdDir" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download or extract SteamCMD: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ SteamCMD already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3/5: Installing backend dependencies..." -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Go up two levels (installers\windows -> installers -> root) then into backend
Set-Location "$scriptDir\..\..\backend"

try {
    npm install
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "Failed to install backend dependencies: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4/5: Creating data directories..." -ForegroundColor Green

$directories = @("data", "..\servers", "cache")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

Write-Host "✓ Data directories created" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5/5: Configuring SteamCMD path..." -ForegroundColor Green

# Update steamcmd.js with the correct path
$steamcmdJs = "services\steamcmd.js"
if (Test-Path $steamcmdJs) {
    # Create backup
    Copy-Item $steamcmdJs "$steamcmdJs.bak" -Force
    
    # Read the file
    $content = Get-Content $steamcmdJs -Raw
    
    # Update the STEAMCMD_PATH (escape backslashes for JavaScript)
    $escapedPath = $steamcmdExe -replace '\\', '\\'
    $content = $content -replace "const STEAMCMD_PATH = .*?;", "const STEAMCMD_PATH = '$escapedPath';"
    
    # Write back
    Set-Content $steamcmdJs $content -NoNewline
    
    Write-Host "✓ SteamCMD path configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "SteamCMD installed at: $steamcmdDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start TCadmin:" -ForegroundColor Yellow
Write-Host "  cd $scriptDir" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Please change the default password after first login!" -ForegroundColor Red
Write-Host ""
