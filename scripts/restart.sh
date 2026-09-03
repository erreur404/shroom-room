#!/usr/bin/env bash
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "/home/dietpi/shroom-room" ]; then
  APP_DIR="/home/dietpi/shroom-room"
fi
cd "$APP_DIR"

echo "=========================================="
echo "🔄 Restarting Shroom Room..."
echo "=========================================="

if command -v pm2 &> /dev/null; then
  if pm2 describe shroom-room > /dev/null 2>&1; then
    pm2 restart shroom-room
    pm2 save
  else
    "$APP_DIR/start.sh"
    exit 0
  fi
else
  "$APP_DIR/stop.sh"
  sleep 1
  "$APP_DIR/start.sh"
  exit 0
fi

sleep 2
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
HOST_IP=${HOST_IP:-"192.168.178.34"}

if curl -s -f http://localhost:3002/api/health > /dev/null 2>&1; then
  echo "=========================================="
  echo "✅ Shroom Room restarted successfully!"
  echo "🌐 Access: http://${HOST_IP}:3002"
  echo "=========================================="
else
  echo "⚠️ Process restarted, checking logs:"
  pm2 logs shroom-room --lines 10 --nostream
fi
