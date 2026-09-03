#!/usr/bin/env bash
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "/home/dietpi/shroom-room" ]; then
  APP_DIR="/home/dietpi/shroom-room"
fi
cd "$APP_DIR"

echo "=========================================="
echo "🛑 Stopping Shroom Room..."
echo "=========================================="

if command -v pm2 &> /dev/null; then
  if pm2 describe shroom-room > /dev/null 2>&1; then
    pm2 stop shroom-room
    pm2 save
    echo "✅ Shroom Room stopped (PM2 saved)."
  else
    echo "ℹ️ Process 'shroom-room' was not running in PM2."
  fi
else
  pkill -f "node dist/index.js" || echo "No running process found."
fi
