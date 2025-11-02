# PWA Troubleshooting Guide

If your PWA stopped working, try these steps:

## Quick Fix Steps

1. **Clear Service Worker Cache**

   - Open browser DevTools (F12)
   - Go to Application > Service Workers
   - Click "Unregister" on any existing service workers
   - Also go to Application > Storage > Clear site data

2. **Hard Refresh**

   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Safari: `Cmd+Option+R`

3. **Check Browser Console**

   - Open DevTools > Console
   - Look for any red error messages
   - Check if service worker registration succeeded

4. **Verify Service Worker File**

   - Try accessing `http://localhost:3000/sw.js` directly
   - Should return JavaScript code, not 404

5. **Check Service Worker Status**
   - DevTools > Application > Service Workers
   - Should show "activated and is running"

## Common Issues

### Service Worker Not Registering

- Check browser console for errors
- Ensure you're on HTTPS or localhost
- Check if `/sw.js` file exists in `public/` folder

### Manifest Issues

- Verify `/manifest.json` is accessible
- Check that all icon paths are correct
- Ensure manifest.json is valid JSON

### Install Prompt Not Showing

- Must meet PWA criteria (HTTPS, manifest, service worker)
- Try opening in incognito/private mode
- Check browser DevTools > Application > Manifest

### Cached Service Worker

- Unregister old service worker
- Clear browser cache
- Hard refresh

## Debug Commands

In browser console:

```javascript
// Check service worker registration
navigator.serviceWorker.getRegistration().then((reg) => console.log(reg));

// Check if service worker is ready
navigator.serviceWorker.ready.then(() => console.log('Ready'));

// Check PWA install status
window.matchMedia('(display-mode: standalone)').matches;
```
