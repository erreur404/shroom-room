#!/usr/bin/env bash
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "/home/dietpi/shroom-room" ]; then
  APP_DIR="/home/dietpi/shroom-room"
fi
cd "$APP_DIR"

echo "=========================================="
echo "📊 Shroom Room Status"
echo "=========================================="
if command -v pm2 &> /dev/null; then
  pm2 status shroom-room
else
  ps aux | grep "[n]ode dist/index.js" || echo "No direct Node process found."
fi

echo ""
if curl -s -f http://localhost:3002/api/health > /dev/null 2>&1; then
  echo "✅ Health check: OK (HTTP 200 on port 3002)"
else
  echo "❌ Health check: Offline or unreachable on port 3002"
fi
