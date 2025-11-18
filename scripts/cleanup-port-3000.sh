#!/bin/bash

# Cleanup script to kill any process running on port 3000
# Useful for manually cleaning up before running e2e tests or switching projects

set -e

PORT=3000
INTERACTIVE=${1:-"--force"}

echo "🔍 Checking for processes on port ${PORT}..."

# Find processes using port 3000
PIDS=$(lsof -ti:${PORT} 2>/dev/null || true)

if [ -z "$PIDS" ]; then
  echo "✅ Port ${PORT} is free - no processes found"
  exit 0
fi

echo "⚠️  Found processes on port ${PORT}:"
lsof -i:${PORT} || true

# If --interactive flag is passed, ask for confirmation
if [ "$INTERACTIVE" = "--interactive" ] || [ "$INTERACTIVE" = "-i" ]; then
  echo ""
  read -p "Kill these processes? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled - port ${PORT} still in use"
    exit 1
  fi
fi

echo "🔄 Killing processes and their children..."
for PID in $PIDS; do
  # Kill the entire process tree (children first, then parent)
  pkill -9 -P $PID 2>/dev/null || true
  kill -9 $PID 2>/dev/null || true
done

# Also kill any pnpm/yarn/npm dev processes that might restart the server
DEV_PROCESSES=$(ps aux | grep -E "(pnpm|yarn|npm).*dev|next dev" | grep -v grep | awk '{print $2}' || true)
if [ -n "$DEV_PROCESSES" ]; then
  echo "🔄 Killing dev server processes..."
  for PID in $DEV_PROCESSES; do
    pkill -9 -P $PID 2>/dev/null || true
    kill -9 $PID 2>/dev/null || true
  done
fi

sleep 1

# Verify port is now free
REMAINING=$(lsof -ti:${PORT} 2>/dev/null || true)
if [ -z "$REMAINING" ]; then
  echo "✅ Port ${PORT} is now free"
else
  echo "⚠️  Some processes may still be running. Try: lsof -i:${PORT}"
  exit 1
fi

