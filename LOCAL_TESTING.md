# Local PWA Testing - Quick Guide

Test locally to avoid unnecessary production builds.

## Quick Test (2 minutes)

1. **Start dev server:**

   ```bash
   yarn dev
   # Note the Network URL (e.g., http://192.168.1.117:3000)
   ```

2. **On iPhone Safari (same WiFi):**
   - Open Safari → `http://YOUR_IP:3000`
   - Wait 15 seconds for service worker
   - Tap Share → **Add to Home Screen**
   - Tap the icon → **If standalone = ✅ WORKS**

## Verify Service Worker (Optional)

Run in browser console:

```javascript
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log('SW active:', reg?.active?.state); // Should be "activated"
  console.log('SW controlling:', !!navigator.serviceWorker.controller); // Should be true
});
```

## Find Your IP

```bash
# Mac
ipconfig getifaddr en0

# Or check the Network URL from `yarn dev`
```

## Pro Tips

- **Use Safari** - better PWA support on iOS than Chrome
- **Delete old home screen icon** before testing new version
- **Wait 15-30 seconds** after page load for service worker to activate
- **Test the icon** - if it opens standalone, PWA works!

See `LOCAL_PWA_TESTING.md` for detailed guide.
