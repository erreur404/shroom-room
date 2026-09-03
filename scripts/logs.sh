#!/usr/bin/env bash
if command -v pm2 &> /dev/null; then
  echo "📜 Streaming PM2 logs for shroom-room (Press Ctrl+C to stop)..."
  pm2 logs shroom-room "$@"
else
  APP_LOG="/home/dietpi/shroom-room/app.log"
  if [ -f "$APP_LOG" ]; then
    tail -n 100 -f "$APP_LOG"
  else
    echo "No log file found at $APP_LOG"
  fi
fi
