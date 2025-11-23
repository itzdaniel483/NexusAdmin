# NexusAdmin Installation Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "      NexusAdmin Installer (Windows)     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check for Administrator privileges
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Error: This script must be run as Administrator." -ForegroundColor Red
    Write-Host "Please right-click and select 'Run as Administrator'." -ForegroundColor Yellow
    exit
}

# 1. Check for Node.js
Write-Host "Step 1/5: Checking system requirements..." -ForegroundColor Green
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Gray
} catch {
    Write-Host "Error: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js v18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# 2. Install SteamCMD
Write-Host "Step 2/5: Setting up SteamCMD..." -ForegroundColor Green
$steamcmdDir = "$HOME\steamcmd"
$steamcmdExe = "$steamcmdDir\steamcmd.exe"
$steamcmdUrl = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip"
$steamcmdZip = "$steamcmdDir\steamcmd.zip"

if (-not (Test-Path $steamcmdDir)) {
    New-Item -ItemType Directory -Path $steamcmdDir | Out-Null
}

if (-not (Test-Path $steamcmdExe)) {
    Write-Host "Downloading SteamCMD..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $steamcmdUrl -OutFile $steamcmdZip
    
    Write-Host "Extracting SteamCMD..." -ForegroundColor Gray
    Expand-Archive -Path $steamcmdZip -DestinationPath $steamcmdDir -Force
    Remove-Item $steamcmdZip
    
    Write-Host "✓ SteamCMD installed to $steamcmdDir" -ForegroundColor Gray
} else {
    Write-Host "✓ SteamCMD already installed" -ForegroundColor Gray
}

# 3. Install Backend Dependencies
Write-Host "Step 3/5: Installing backend dependencies..." -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Go up two levels (installers\windows -> installers -> root) then into backend
$backendDir = Join-Path $scriptDir "..\..\backend"
Set-Location $backendDir

try {
    npm install
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Gray
} catch {
    Write-Host "Error installing backend dependencies." -ForegroundColor Red
    exit
}

# 4. Configure SteamCMD Path
Write-Host "Step 4/5: Configuring application..." -ForegroundColor Green
$steamcmdJs = "$backendDir\services\steamcmd.js"

if (Test-Path $steamcmdJs) {
    $content = Get-Content $steamcmdJs
    # Escape backslashes for JS string
    $escapedPath = $steamcmdExe -replace "\\", "\\"
    $newContent = $content -replace "const STEAMCMD_PATH = .*", "const STEAMCMD_PATH = '$escapedPath';"
    Set-Content -Path $steamcmdJs -Value $newContent
    Write-Host "✓ SteamCMD path configured" -ForegroundColor Gray
}

# 5. Create Data Directories
Write-Host "Step 5/5: Creating data directories..." -ForegroundColor Green
$dataDir = "$backendDir\data"
$serversDir = "$backendDir\servers"
$cacheDir = "$backendDir\cache"

if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }
if (-not (Test-Path $serversDir)) { New-Item -ItemType Directory -Path $serversDir | Out-Null }
if (-not (Test-Path $cacheDir)) { New-Item -ItemType Directory -Path $cacheDir | Out-Null }

Write-Host "✓ Data directories created" -ForegroundColor Gray

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "      Installation Complete! 🚀          " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start NexusAdmin:" -ForegroundColor Cyan
Write-Host "1. Open a terminal in the root folder" -ForegroundColor White
Write-Host "2. Run: npm start" -ForegroundColor White
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Cyan
Write-Host "Username: admin" -ForegroundColor White
Write-Host "Password: admin" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Please change the default password after first login!" -ForegroundColor Red
Write-Host ""
Read-Host -Prompt "Press Enter to exit"
