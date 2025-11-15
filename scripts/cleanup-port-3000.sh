#!/bin/bash

# Cleanup script to kill any process running on port 3000
# Useful for manually cleaning up before running e2e tests

set -e

PORT=3000

echo "🔍 Checking for processes on port ${PORT}..."

# Find processes using port 3000
PIDS=$(lsof -ti:${PORT} 2>/dev/null || true)

if [ -z "$PIDS" ]; then
  echo "✅ Port ${PORT} is free - no processes found"
  exit 0
fi

echo "⚠️  Found processes on port ${PORT}:"
lsof -i:${PORT} || true

echo ""
read -p "Kill these processes? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🔄 Killing processes..."
  echo $PIDS | xargs kill -9 2>/dev/null || true
  sleep 1
  
  # Verify port is now free
  REMAINING=$(lsof -ti:${PORT} 2>/dev/null || true)
  if [ -z "$REMAINING" ]; then
    echo "✅ Port ${PORT} is now free"
  else
    echo "⚠️  Some processes may still be running. Try: lsof -i:${PORT}"
    exit 1
  fi
else
  echo "❌ Cancelled - port ${PORT} still in use"
  exit 1
fi

