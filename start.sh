#!/bin/bash

# --- ARCHITECT CG-223 BOOT PROTOCOL ---
echo "🛰️ Initializing Bamako Node..."

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "📦 Missing dependencies. Installing..."
  npm install
fi

# Run the bot in a loop for auto-restart
while true; do
  echo "🟢 ARCHITECT ONLINE (Version: $(cat version.txt))"
  node index.js
  echo "⚠️ System Failure. Rebooting in 5 seconds..."
  sleep 5
done
