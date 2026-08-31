#!/usr/bin/env bash
# ==============================================================================
# Deployment Script for Shroom Room
# ==============================================================================
set -euo pipefail

REMOTE_USER="dietpi"
REMOTE_HOST="192.168.178.34"
REMOTE_DIR="/home/dietpi/shroom-room"
APP_PORT="3002"

echo "=========================================================="
echo " Deploying Shroom Room to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Build frontend locally
echo "[1/4] Building frontend assets (vite build)..."
npm run build

# 2. Prepare remote directory
echo "[2/4] Ensuring remote directory exists..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}"

# 3. Create deploy tarball and transfer via SCP
echo "[3/4] Packaging and transferring files..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.agents' \
    --exclude='.scratch' \
    --exclude='.vscode' \
    --exclude='deploy.tgz' \
    --exclude='*.log' \
    -czf deploy.tgz .

scp deploy.tgz "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
rm -f deploy.tgz

# 4. Extract, install dependencies, and start with PM2 in production mode
echo "[4/4] Extracting, installing dependencies, and restarting production server on remote host..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "bash -s" << 'EOF'
  set -euo pipefail
  cd ~/shroom-room
  tar -xzf deploy.tgz
  rm -f deploy.tgz

  # Install dependencies
  npm install

  # Ensure PM2 is available
  if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
  fi

  # Start/Restart service with PM2 in production mode
  export PORT=3002
  export NODE_ENV=production
  pm2 delete shroom-room 2>/dev/null || true
  pm2 start ./node_modules/.bin/tsx --name "shroom-room" --time -- server/index.ts


  # Save PM2 state for automatic restart on reboot
  pm2 save

  # Wait for process initialization
  sleep 2

  # Verify health
  if curl -s -f http://localhost:3002/api/health > /dev/null; then
    echo "✅ Health check PASSED: Server is running on port 3002!"
  else
    echo "⚠️ Health check check: PM2 logs:"
    pm2 logs shroom-room --lines 15 --nostream
  fi
EOF

echo "=========================================================="
echo " ✅ Shroom Room deployed successfully!"
echo " 🌐 Open in your browser: http://${REMOTE_HOST}:${APP_PORT}"
echo "=========================================================="
