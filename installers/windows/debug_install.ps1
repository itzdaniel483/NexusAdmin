Write-Host "Debug Start"

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
    
    Write-Host "SteamCMD installed to $steamcmdDir" -ForegroundColor Gray
}

Write-Host "Debug End"
