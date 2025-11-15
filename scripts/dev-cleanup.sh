#!/bin/bash

# Quick dev cleanup script - frees port 3000 and clears Next.js cache
# Usage: ./scripts/dev-cleanup.sh

set -e

echo "🧹 Cleaning up dev environment..."

PORT=3000

# Find all processes using port 3000
PORT_PIDS=$(lsof -ti:${PORT} 2>/dev/null || true)

# Find parent processes that might restart the dev server
# Look for pnpm/yarn/npm dev processes
DEV_PROCESSES=$(ps aux | grep -E "(pnpm|yarn|npm).*dev|next dev" | grep -v grep | awk '{print $2}' || true)

# Kill processes on port 3000 first
if [ -n "$PORT_PIDS" ]; then
  echo "🔄 Killing processes on port ${PORT}..."
  for PID in $PORT_PIDS; do
    # Kill the process and its entire process tree
    pkill -9 -P $PID 2>/dev/null || true
    kill -9 $PID 2>/dev/null || true
  done
  sleep 1
fi

# Kill any dev server processes (pnpm/yarn/npm dev, next dev)
if [ -n "$DEV_PROCESSES" ]; then
  echo "🔄 Killing dev server processes..."
  for PID in $DEV_PROCESSES; do
    # Kill the entire process tree
    pkill -9 -P $PID 2>/dev/null || true
    kill -9 $PID 2>/dev/null || true
  done
  sleep 1
fi

# Verify port is free
REMAINING=$(lsof -ti:${PORT} 2>/dev/null || true)
if [ -z "$REMAINING" ]; then
  echo "✅ Port ${PORT} is now free"
else
  echo "⚠️  Some processes may still be running. Trying force kill..."
  echo $REMAINING | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Clear Next.js cache
if [ -d ".next" ]; then
  echo "🗑️  Clearing Next.js cache..."
  rm -rf .next
  echo "✅ Next.js cache cleared"
fi

echo ""
echo "✨ Dev environment cleaned up!"
echo "💡 Tip: Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) to clear browser cache"

