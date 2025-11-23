# Package NexusAdmin for Release

$version = "v1.0"
$releaseName = "NexusAdmin_$version"
$releaseDir = "release\$releaseName"
$zipFile = "release\$releaseName.zip"

Write-Host "Packaging $releaseName..." -ForegroundColor Cyan

# 1. Clean up previous release
if (Test-Path "release") {
    Remove-Item "release" -Recurse -Force
}
New-Item -ItemType Directory -Path $releaseDir | Out-Null

# 2. Copy Backend
Write-Host "Copying Backend..." -ForegroundColor Green
$backendDest = "$releaseDir\backend"
New-Item -ItemType Directory -Path $backendDest | Out-Null

# Copy backend files (excluding node_modules, data, cache, etc.)
Get-ChildItem "backend" -Exclude "node_modules", "data", "cache", "servers", ".env", "nodemon.json" | Copy-Item -Destination $backendDest -Recurse

# Create empty data directories
New-Item -ItemType Directory -Path "$backendDest\data" | Out-Null
New-Item -ItemType Directory -Path "$backendDest\cache" | Out-Null
New-Item -ItemType Directory -Path "$releaseDir\servers" | Out-Null

# Copy default data files if they exist (e.g., templates)
if (Test-Path "backend\data\templates.json") {
    Copy-Item "backend\data\templates.json" "$backendDest\data\"
}

# 3. Copy Frontend (Build Artifacts Only)
Write-Host "Copying Frontend..." -ForegroundColor Green
$frontendDest = "$releaseDir\frontend"
New-Item -ItemType Directory -Path "$frontendDest\dist" | Out-Null

# Copy only the dist folder
Copy-Item "frontend\dist\*" "$frontendDest\dist\" -Recurse

# 4. Copy Root Files
Write-Host "Copying Installation Files..." -ForegroundColor Green
Copy-Item "installers" "$releaseDir\" -Recurse
Copy-Item "README.md" "$releaseDir\"

# 5. Create Zip
Write-Host "Creating Zip Archive..." -ForegroundColor Green
Compress-Archive -Path "$releaseDir\*" -DestinationPath $zipFile

Write-Host ""
Write-Host "Package created successfully!" -ForegroundColor Green
Write-Host "Location: $zipFile" -ForegroundColor Cyan
Write-Host ""
