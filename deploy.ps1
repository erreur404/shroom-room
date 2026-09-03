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

# 1. Build frontend and backend bundle locally
Write-Host "[1/4] Building production assets (Vite + esbuild)..." -ForegroundColor Yellow
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    throw "Production build failed!"
}

# 2. Prepare remote directory
Write-Host "[2/4] Ensuring remote directory exists..." -ForegroundColor Yellow
ssh "${RemoteUser}@${RemoteHost}" "mkdir -p ${RemoteDir}"

# 3. Create deploy tarball and transfer via SCP
Write-Host "[3/4] Packaging and transferring production files (dist + runtime configs)..." -ForegroundColor Yellow
tar -czf deploy.tgz dist package.json package-lock.json ecosystem.config.cjs scripts
if (Test-Path .env) {
    tar -rf deploy.tgz .env
}

scp deploy.tgz "${RemoteUser}@${RemoteHost}:${RemoteDir}/"
Remove-Item -Path deploy.tgz -Force -ErrorAction SilentlyContinue

# 4. Extract, install production dependencies, set up scripts, and start PM2 service
Write-Host "[4/4] Extracting, installing production dependencies, and starting service..." -ForegroundColor Yellow
$remoteCommands = @'
set -euo pipefail
cd ~/shroom-room
tar -xzf deploy.tgz
rm -f deploy.tgz

# Make scripts executable and link them to home directory (~/) for convenience
chmod +x scripts/*.sh
cp -f scripts/*.sh .
for f in start.sh stop.sh restart.sh status.sh logs.sh; do
  ln -sf ~/shroom-room/$f ~/$f
done

# Install production dependencies only (no dev bundlers, tsx, or compilers)
npm install --omit=dev

if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

# Start or restart using ecosystem.config.cjs
pm2 startOrRestart ecosystem.config.cjs
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
Write-Host " 💡 Raspberry Pi helper scripts available in ~ and ~/shroom-room:" -ForegroundColor Green
Write-Host "    ~/start.sh   - Starts Shroom Room with PM2" -ForegroundColor Green
Write-Host "    ~/stop.sh    - Stops Shroom Room" -ForegroundColor Green
Write-Host "    ~/restart.sh - Restarts Shroom Room" -ForegroundColor Green
Write-Host "    ~/status.sh  - Checks PM2 process and HTTP health" -ForegroundColor Green
Write-Host "    ~/logs.sh    - Tails application logs" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

