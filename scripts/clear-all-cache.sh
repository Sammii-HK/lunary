#!/bin/bash

# Comprehensive cache clearing script for localhost development
# This clears Next.js cache, browser cache instructions, and service worker info

set -e

echo "🧹 Clearing all caches for localhost development..."
echo ""

PORT=3000

# 1. Kill any running dev servers
echo "1️⃣ Stopping dev servers..."
PORT_PIDS=$(lsof -ti:${PORT} 2>/dev/null || true)
DEV_PROCESSES=$(ps aux | grep -E "(pnpm|yarn|npm).*dev|next dev" | grep -v grep | awk '{print $2}' || true)

if [ -n "$PORT_PIDS" ]; then
  for PID in $PORT_PIDS; do
    pkill -9 -P $PID 2>/dev/null || true
    kill -9 $PID 2>/dev/null || true
  done
fi

if [ -n "$DEV_PROCESSES" ]; then
  for PID in $DEV_PROCESSES; do
    pkill -9 -P $PID 2>/dev/null || true
    kill -9 $PID 2>/dev/null || true
  done
fi

sleep 1
echo "✅ Dev servers stopped"
echo ""

# 2. Clear Next.js cache
echo "2️⃣ Clearing Next.js cache..."
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Next.js cache cleared"
else
  echo "ℹ️  No .next directory found"
fi
echo ""

# 3. Clear node_modules/.cache if it exists
echo "3️⃣ Clearing node_modules cache..."
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Node modules cache cleared"
else
  echo "ℹ️  No node_modules/.cache found"
fi
echo ""

# 4. Browser cache instructions
echo "4️⃣ Browser cache clearing instructions:"
echo ""
echo "   📱 Chrome/Edge:"
echo "      - Open DevTools (F12 or Cmd+Option+I)"
echo "      - Right-click refresh button → 'Empty Cache and Hard Reload'"
echo "      - OR: Application tab → Storage → 'Clear site data'"
echo "      - OR: Application tab → Service Workers → Unregister all"
echo ""
echo "   🦊 Firefox:"
echo "      - Open DevTools (F12)"
echo "      - Network tab → Right-click → 'Clear Browser Cache'"
echo "      - OR: Storage tab → Clear All"
echo ""
echo "   🍎 Safari:"
echo "      - Develop menu → Empty Caches (Cmd+Option+E)"
echo "      - OR: Safari → Preferences → Advanced → 'Show Develop menu'"
echo ""
echo "   ⚡ Quick shortcuts:"
echo "      - Chrome/Edge: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)"
echo "      - Firefox: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)"
echo "      - Safari: Cmd+Option+E"
echo ""

# 5. Service Worker unregister instructions
echo "5️⃣ Service Worker unregister:"
echo ""
echo "   Option A - Browser DevTools:"
echo "      - Open DevTools → Application tab"
echo "      - Service Workers section → Click 'Unregister' for each"
echo ""
echo "   Option B - Browser Console:"
echo "      - Open DevTools → Console tab"
echo "      - Run: navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))"
echo ""
echo "   Option C - Visit reset page:"
echo "      - http://localhost:3000/pwa-reset (when server is running)"
echo ""

# 6. Clear browser storage instructions
echo "6️⃣ Clear browser storage:"
echo ""
echo "   - DevTools → Application → Storage → Clear site data"
echo "   - This clears: Local Storage, Session Storage, IndexedDB, Cache Storage"
echo ""

echo "✨ Cache clearing complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Clear browser cache using instructions above"
echo "   2. Unregister service workers"
echo "   3. Restart dev server: pnpm dev"
echo "   4. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""

