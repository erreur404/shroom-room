#!/usr/bin/env bash
set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# In case this script is invoked from a symlink in ~
if [ -d "/home/dietpi/shroom-room" ]; then
  APP_DIR="/home/dietpi/shroom-room"
fi
cd "$APP_DIR"

echo "=========================================="
echo "🍄 Starting Shroom Room..."
echo "=========================================="

if command -v pm2 &> /dev/null; then
  if [ -f "ecosystem.config.cjs" ]; then
    pm2 startOrRestart ecosystem.config.cjs
  else
    if pm2 describe shroom-room > /dev/null 2>&1; then
      pm2 restart shroom-room
    else
      pm2 start dist/index.js --name "shroom-room" --time --env NODE_ENV=production,PORT=3002
    fi
  fi
  pm2 save
else
  echo "⚠️ PM2 not found, starting via standard Node.js..."
  nohup node dist/index.js > app.log 2>&1 &
fi

echo "⏳ Waiting for service to become healthy..."
sleep 2

HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
HOST_IP=${HOST_IP:-"192.168.178.34"}

if curl -s -f http://localhost:3002/api/health > /dev/null 2>&1; then
  echo "=========================================="
  echo "✅ Shroom Room is RUNNING!"
  echo "🌐 Local:   http://localhost:3002"
  echo "🌐 Network: http://${HOST_IP}:3002"
  echo "=========================================="
else
  echo "⚠️ Process started, but health check has not responded yet."
  echo "Run './logs.sh' or 'pm2 logs shroom-room' to inspect output."
fi
