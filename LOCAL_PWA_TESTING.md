# Local PWA Testing Guide

Test your PWA locally before deploying to reduce builds and iterate faster.

## Quick Start

1. **Start dev server on local network:**

   ```bash
   yarn dev
   # Note the IP address shown (e.g., http://192.168.1.117:3000)
   ```

2. **On iPhone (same WiFi):**
   - Safari: Open `http://YOUR_IP:3000` (e.g., `http://192.168.1.117:3000`)
   - Wait 10-15 seconds for service worker to register
   - Add to Home Screen
   - Tap icon - should open standalone

## Detailed Steps

### 1. Start Dev Server

```bash
# From project root
yarn dev

# Should show:
# ▲ Next.js 15.5.4
# - Local:        http://localhost:3000
# - Network:      http://192.168.1.117:3000
```

**Copy the Network URL** - you'll need it on your phone.

### 2. Find Your Local IP (if not shown)

```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Or specific interface
ipconfig getifaddr en0  # WiFi
ipconfig getifaddr en1  # Ethernet
```

You'll see something like `192.168.1.117` - use that with port `:3000`.

### 3. Test on iPhone Safari (RECOMMENDED)

1. **Connect iPhone to same WiFi** as your computer
2. **Open Safari** on iPhone
3. **Navigate to:** `http://YOUR_IP:3000` (e.g., `http://192.168.1.117:3000`)
4. **Wait 15-30 seconds** - let service worker install
5. **Check service worker status:**
   - Open Safari → Settings → Advanced → Web Inspector (enable if needed)
   - Or use Safari on Mac: Develop → [Your iPhone] → [lunary.local] → Show Web Inspector
6. **Verify in console:**
   ```javascript
   navigator.serviceWorker.getRegistration().then((reg) => {
     console.log('SW registered:', reg?.scope);
     console.log('SW active:', reg?.active?.state);
     console.log('SW controlling:', !!navigator.serviceWorker.controller);
   });
   ```
7. **Add to Home Screen:**
   - Tap Share button (square with arrow)
   - Scroll down → **Add to Home Screen**
   - Name it "Lunary" → **Add**
8. **Test PWA:**
   - Close Safari completely
   - Tap the home screen icon
   - **Should open standalone** (no Safari UI)

### 4. Test on iPhone Chrome (if needed)

1. Same WiFi connection
2. Open Chrome on iPhone
3. Go to `http://YOUR_IP:3000`
4. **CRITICAL:** Wait 30 seconds for service worker
5. **Check console** (if possible):
   - Look for "✅ Service worker activated"
6. **Add to Home Screen** from Chrome menu
7. Test - but note Chrome iOS PWAs are less reliable

### 5. Verify Service Worker is Working

#### Option A: Browser Console (if accessible)

```javascript
// Check registration
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log('Registration:', reg);
  console.log('Active:', reg?.active?.state); // Should be "activated"
  console.log('Controlling:', !!navigator.serviceWorker.controller); // Should be true
});

// Check cache
caches.keys().then((keys) => console.log('Caches:', keys)); // Should see "lunary-v4"

// Check start_url is cached
caches.open('lunary-v4').then((cache) => {
  cache.match('/').then((cached) => {
    console.log('Start URL cached:', !!cached); // Should be true
  });
});
```

#### Option B: Network Tab

1. Open DevTools → Network tab
2. Reload page
3. Look for `sw.js` - should show status 200
4. Check `Response Headers`:
   - `Service-Worker-Allowed: /`
   - `Content-Type: application/javascript`

#### Option C: Application Tab (Safari Desktop)

1. Connect iPhone to Mac
2. Safari on Mac: Develop → [Your iPhone] → [Your Site]
3. Go to **Storage** → **Service Workers**
4. Should see service worker registered and active

### 6. Test PWA Installation Flow

**Signs it's working:**

- ✅ Service worker registers without errors
- ✅ Console shows "✅ Service worker activated and controlling pages"
- ✅ Cache contains `lunary-v4` with `/` cached
- ✅ Home screen icon opens in **standalone mode** (no browser UI)

**Signs it's broken:**

- ❌ Opens in browser tab (with Chrome/Safari UI)
- ❌ Service worker not registering
- ❌ Errors in console about service worker

### 7. Common Local Testing Issues

#### Issue: Can't connect to local IP

**Fix:**

- Ensure iPhone and computer on **same WiFi network**
- Check firewall allows port 3000
- Try `http://192.168.1.X:3000` not `localhost:3000`

#### Issue: Service worker not registering

**Fix:**

- Service workers require HTTPS OR localhost/local IP
- Make sure you're using `http://192.168.1.X:3000` not just `192.168.1.X`
- Check browser console for errors

#### Issue: Service worker registers but PWA still opens in tab

**Fix:**

- Service worker must be **active** before adding to home screen
- Wait 30 seconds after page load
- Verify: `navigator.serviceWorker.controller` is not null
- Try deleting old home screen icon first

#### Issue: Can't access console on iPhone

**Fix:**

- Use Safari on Mac with Web Inspector connected to iPhone
- Or use Chrome DevTools via USB debugging (if possible)
- Or just test the end result: add to home screen and check if it opens standalone

### 8. What to Check Before Deploying

✅ Service worker registers successfully
✅ Service worker caches `/` (start_url)
✅ Service worker is **active** and **controlling** the page
✅ Adding to home screen creates standalone app (no browser UI)
✅ App opens from home screen icon correctly

If all ✅ pass locally, it should work in production too!

### 9. Dev vs Production Differences

| Feature        | Local (dev)  | Production |
| -------------- | ------------ | ---------- |
| HTTPS          | ❌ HTTP only | ✅ HTTPS   |
| Service Worker | ✅ Works     | ✅ Works   |
| Manifest       | ✅ Works     | ✅ Works   |
| PWA Install    | ✅ Works     | ✅ Works   |

**Note:** Local HTTP works fine for service workers, but some features (like push notifications) require HTTPS.

### 10. Quick Test Script

Run this in browser console to verify everything:

```javascript
(async function testPWA() {
  console.log('=== PWA Test ===');

  // Check service worker
  const reg = await navigator.serviceWorker.getRegistration();
  console.log('SW registered:', !!reg);
  console.log('SW active:', reg?.active?.state);
  console.log('SW controlling:', !!navigator.serviceWorker.controller);

  // Check cache
  const cacheNames = await caches.keys();
  console.log('Caches:', cacheNames);

  const cache = await caches.open('lunary-v4');
  const cached = await cache.match('/');
  console.log('Start URL cached:', !!cached);

  // Check manifest
  const manifest = await fetch('/manifest.json');
  const manifestData = await manifest.json();
  console.log('Manifest:', manifestData.name, manifestData.start_url);

  // Check display mode
  console.log(
    'Standalone mode:',
    window.matchMedia('(display-mode: standalone)').matches,
  );

  console.log('=== Test Complete ===');
})();
```

Run this after page loads and service worker registers. All checks should pass ✅.
