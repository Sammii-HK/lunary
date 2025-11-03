# Production PWA Checklist

If PWA isn't working on production (`https://lunary.app`), check these:

## 1. Service Worker File Access

Open in browser:

- `https://lunary.app/sw.js`
- Should show JavaScript code (not 404, not HTML)

**If 404:** The service worker file isn't being deployed. Check:

- File exists in `public/sw.js`
- Vercel build logs show the file
- No `.vercelignore` excluding `public/`

## 2. Content-Type Header

The service worker MUST be served with `Content-Type: application/javascript`

Check in browser DevTools:

1. Open Network tab
2. Load `https://lunary.app/sw.js`
3. Check Response Headers
4. Should show: `Content-Type: application/javascript`

**If wrong Content-Type:** Next.js config should set it (already added in `next.config.mjs`)

## 3. Service Worker Registration

Open browser console on `https://lunary.app`:

```javascript
// Should return a registration object
navigator.serviceWorker.getRegistration().then((reg) => console.log(reg));

// Should show "ready"
navigator.serviceWorker.ready.then(() => console.log('Service worker ready'));
```

**Look for console errors:**

- `Failed to register a ServiceWorker`
- `ServiceWorker script has been blocked by content security policy`

## 4. Chrome iOS Cache

Even on production, Chrome iOS might have cached old PWA settings:

1. **Delete Chrome app** (Settings → iPhone Storage → Chrome → Delete App)
2. Reinstall Chrome
3. Visit `https://lunary.app`
4. **Wait 30 seconds** for SW to register
5. Check console logs for "✅ Service worker activated"
6. **Then** add to home screen

## 5. Manifest File

Open in browser:

- `https://lunary.app/manifest.json`
- Should show valid JSON (not 404)

Check manifest validity:

- All icon paths are correct
- `start_url` is `/`
- `display` is set (currently `minimal-ui`)

## 6. Debug Commands (Run in Console)

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then((regs) => {
  console.log('Service workers:', regs);
  regs.forEach((reg) => {
    console.log('SW:', reg.scope, 'Active:', reg.active?.state);
  });
});

// Check if PWA is installed
console.log(
  'Standalone mode:',
  window.matchMedia('(display-mode: standalone)').matches,
);

// Check cache
caches.keys().then((keys) => console.log('Caches:', keys));

// Check if start_url is cached
caches.open('lunary-v3').then((cache) => {
  cache.match('/').then((cached) => {
    console.log('Start URL cached:', !!cached);
  });
});
```

## 7. Common Production Issues

### Issue: Service worker returns 404

**Fix:** Ensure `public/sw.js` exists and is committed to git

### Issue: Service worker has wrong Content-Type

**Fix:** Already configured in `next.config.mjs` - might need to redeploy

### Issue: Service worker blocked by CSP

**Fix:** Check Vercel headers/config for Content-Security-Policy that blocks service workers

### Issue: Old service worker cached

**Fix:**

1. Unregister in DevTools: Application → Service Workers → Unregister
2. Or bump cache version (already `lunary-v3`)
3. Clear browser cache
4. Hard reload

## 8. Chrome iOS Specific

Chrome iOS is EXTREMELY strict. It requires:

1. ✅ HTTPS (production has this)
2. ✅ Valid manifest.json
3. ✅ Service worker registered and ACTIVE
4. ✅ Service worker must serve `start_url` from cache
5. ✅ Service worker must be controlling the page BEFORE adding to home screen

**The critical step:** After opening the site, **wait 30 seconds** for service worker to fully activate, THEN add to home screen. If you add to home screen too early, Chrome creates a bookmark instead of a PWA.

## Testing Steps for Production

1. Open `https://lunary.app` in Chrome iOS
2. Open DevTools (if possible) or use Safari Web Inspector
3. Check console for service worker logs
4. Wait for: "✅ Service worker activated and controlling pages"
5. Verify: `navigator.serviceWorker.controller` is not null
6. **Then** add to home screen
7. Tap home screen icon - should open standalone (no Chrome UI)
