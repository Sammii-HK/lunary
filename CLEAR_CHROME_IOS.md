# Clear Chrome iOS PWA Cache - Step by Step

Chrome iOS caches PWA settings aggressively. Here's how to completely clear it:

## Method 1: iOS Settings (Most Reliable)

1. **Settings → General → iPhone Storage**
2. Find "Chrome" app
3. Tap it → "Offload App" (keeps data) or "Delete App" (removes everything)
4. Reinstall Chrome from App Store
5. Open Chrome, go to your site

## Method 2: Chrome Settings

1. Open Chrome on iPhone
2. Three dots → **Settings**
3. **Privacy and Security** → **Clear Browsing Data**
4. Select **All time**
5. Check:
   - ✅ Browsing history
   - ✅ Cookies and site data
   - ✅ Cached images and files
   - ✅ Saved passwords (optional)
6. Tap **Clear Browsing Data**
7. Close Chrome completely (swipe up from bottom, swipe up on Chrome)
8. Reopen Chrome

## Method 3: Nuclear Option (Complete Reset)

1. Delete Chrome app completely
2. Settings → Safari → Clear History and Website Data
3. Restart iPhone (hold power + volume down)
4. Reinstall Chrome
5. Try again

## After Clearing Cache

1. Start dev server: `yarn dev`
2. On iPhone: `http://YOUR_LOCAL_IP:3000`
3. **Wait 30 seconds** for service worker to install
4. Open Chrome DevTools (if possible) or check console logs
5. Look for: "✅ Service worker installed"
6. **Then** add to home screen

## Critical: Service Worker Must Be Ready FIRST

Chrome iOS checks if the service worker is active BEFORE allowing PWA installation. If you add to home screen before the SW is ready, it creates a bookmark instead.

**Wait for these console logs before adding to home screen:**

- ✅ Service worker installing...
- ✅ Service worker installed
- ✅ Service worker activated and controlling pages
- ✅ Start URL confirmed in cache

## If Still Not Working

The issue might be that **Chrome iOS requires HTTPS** (not local IP). Try:

1. Use production URL: `https://lunary.app` (if deployed)
2. Or use `localhost` via port forwarding (complex setup)
3. Or test on Android Chrome first to verify PWA works
