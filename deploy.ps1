# ==============================================================================
# PowerShell Deployment Script for Shroom Room
# ==============================================================================
$ErrorActionPreference = "Stop"

$RemoteUser = "dietpi"
$RemoteHost = "192.168.178.34"
$RemoteDir = "/home/dietpi/shroom-room"
$AppPort = "3002"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Deploying Shroom Room to ${RemoteUser}@${RemoteHost}:${RemoteDir}" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# 1. Build frontend locally
Write-Host "[1/4] Building frontend assets (npm run build)..." -ForegroundColor Yellow
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    throw "Frontend build failed!"
}

# 2. Prepare remote directory
Write-Host "[2/4] Ensuring remote directory exists..." -ForegroundColor Yellow
ssh "${RemoteUser}@${RemoteHost}" "mkdir -p ${RemoteDir}"

# 3. Create deploy tarball and transfer via SCP
Write-Host "[3/4] Packaging and transferring files..." -ForegroundColor Yellow
tar --exclude='node_modules' `
    --exclude='.git' `
    --exclude='.agents' `
    --exclude='.scratch' `
    --exclude='.vscode' `
    --exclude='deploy.tgz' `
    --exclude='*.log' `
    -czf deploy.tgz .

scp deploy.tgz "${RemoteUser}@${RemoteHost}:${RemoteDir}/"
Remove-Item -Path deploy.tgz -Force -ErrorAction SilentlyContinue

# 4. Extract, install dependencies, and start on remote host
Write-Host "[4/4] Extracting, installing dependencies, and restarting production server on remote host..." -ForegroundColor Yellow
$remoteCommands = @'
set -euo pipefail
cd ~/shroom-room
tar -xzf deploy.tgz
rm -f deploy.tgz

npm install

if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

export PORT=3002
export NODE_ENV=production
pm2 delete shroom-room 2>/dev/null || true
pm2 start ./node_modules/.bin/tsx --name "shroom-room" --time -- server/index.ts
pm2 save

sleep 2
if curl -s -f http://localhost:3002/api/health > /dev/null; then
  echo "✅ Health check PASSED: Server is responding on port 3002!"
else
  echo "⚠️ Checking PM2 logs:"
  pm2 logs shroom-room --lines 15 --nostream
fi
'@

ssh "${RemoteUser}@${RemoteHost}" "bash -c '$remoteCommands'"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " ✅ Shroom Room deployed successfully!" -ForegroundColor Green
Write-Host " 🌐 Open in your browser: http://${RemoteHost}:${AppPort}" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
