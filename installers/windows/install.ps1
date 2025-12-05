Write-Host "Error: This script must be run as Administrator." -ForegroundColor Red
Write-Host "Please right-click and select 'Run as Administrator'." -ForegroundColor Yellow
exit
}

# 1. Check for Node.js
Write-Host "Step 1/5: Checking system requirements..." -ForegroundColor Green
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js v18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit
}
$nodeVersion = node -v
Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Gray

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
    
    Write-Host "[OK] SteamCMD installed to $steamcmdDir" -ForegroundColor Gray
}
if (Test-Path $steamcmdExe) {
    Write-Host "[OK] SteamCMD is ready" -ForegroundColor Gray
}

# 3. Install Backend Dependencies
Write-Host "Step 3/5: Installing backend dependencies..." -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Go up two levels (installers\windows -> installers -> root) then into backend
$backendDir = Join-Path $scriptDir "..\..\backend"
Set-Location $backendDir

Write-Host "Installing npm packages..." -ForegroundColor Gray
cmd /c "npm install"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing backend dependencies." -ForegroundColor Red
    exit
}
Write-Host "[OK] Backend dependencies installed" -ForegroundColor Gray

# 4. Configure SteamCMD Path
Write-Host "Step 4/5: Configuring application..." -ForegroundColor Green
$steamcmdJs = "$backendDir\services\steamcmd.js"

if (Test-Path $steamcmdJs) {
    $content = Get-Content $steamcmdJs
    
    # Use [char]92 for backslash to avoid escaping issues
    $bs = [char]92
    
    # Escape backslashes for JS string (replace \ with \\)
    $escapedPath = $steamcmdExe -replace [regex]::Escape($bs), "$bs$bs"
    
    $newContent = $content -replace "const STEAMCMD_PATH = .*", "const STEAMCMD_PATH = '$escapedPath';"
    Set-Content -Path $steamcmdJs -Value $newContent
    Write-Host "[OK] SteamCMD path configured" -ForegroundColor Gray
}

# 5. Create Data Directories
Write-Host "Step 5/5: Creating data directories..." -ForegroundColor Green
$dataDir = "$backendDir\data"
$serversDir = "$backendDir\servers"
$cacheDir = "$backendDir\cache"

if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir | Out-Null }
if (-not (Test-Path $serversDir)) { New-Item -ItemType Directory -Path $serversDir | Out-Null }
if (-not (Test-Path $cacheDir)) { New-Item -ItemType Directory -Path $cacheDir | Out-Null }

Write-Host "[OK] Data directories created" -ForegroundColor Gray

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "      Installation Complete!             " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start ServerForge:" -ForegroundColor Cyan
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
