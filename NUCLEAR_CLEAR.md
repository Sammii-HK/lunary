# Nuclear Option: Clear ALL Chrome iOS PWA Cache

If service worker is working but PWA still opens in a tab, Chrome iOS has cached the "bookmark" decision at the OS level.

## Step 1: Delete Chrome App (REQUIRED)

1. **Settings → General → iPhone Storage**
2. Find "Chrome"
3. Tap "Delete App" (NOT "Offload App")
4. This removes ALL Chrome data including PWA cache

## Step 2: Clear Safari Data (iOS uses Safari's cache for PWAs)

1. **Settings → Safari**
2. **Clear History and Website Data**
3. Confirm deletion

## Step 3: Restart iPhone

1. Hold **Power + Volume Down** buttons
2. Slide to power off
3. Wait 30 seconds
4. Power back on

## Step 4: Reinstall Chrome

1. Open App Store
2. Search "Chrome"
3. Install fresh

## Step 5: Visit Site (CRITICAL ORDER)

1. Open Chrome
2. Go to `https://lunary.app` (production) or your local IP
3. **DON'T ADD TO HOME SCREEN YET**
4. Wait 30 seconds
5. Open Chrome DevTools (or check console logs)
6. Verify service worker is ACTIVE:
   ```javascript
   navigator.serviceWorker.getRegistration().then((reg) => {
     console.log('SW active:', reg.active?.state);
     console.log('SW controlling:', !!navigator.serviceWorker.controller);
   });
   ```
7. **Only AFTER** service worker is active, add to home screen

## Step 6: Add to Home Screen (Correct Way)

1. Chrome menu (three dots) → **Add to Home Screen**
2. Name it "Lunary"
3. Tap "Add"
4. **Immediately close Chrome** (swipe up, swipe up on Chrome)
5. Tap the home screen icon
6. Should open standalone (no Chrome UI)

## If STILL Opens in Tab

Chrome iOS might have a bug. Try:

1. **Change the manifest `start_url`** temporarily (force new PWA):

   - Change `start_url` to `/?pwa=1` in manifest
   - Redeploy
   - Delete Chrome app again
   - Reinstall
   - Try again

2. **Use Safari instead** (Safari has better PWA support on iOS):

   - Delete Chrome
   - Use Safari to visit site
   - Add to Home Screen from Safari
   - Safari PWAs work better on iOS

3. **Check iOS version**: iOS 18 might have PWA restrictions. Consider:
   - Updating iOS
   - Or testing on older iOS device if available

## Alternative: Test if PWA Works in General

Test on Android Chrome or desktop Chrome first to verify PWA works correctly:

1. Open `https://lunary.app` on Android Chrome
2. Should show "Install App" prompt
3. Install it
4. Tap icon - should open standalone

If it works on Android but not iOS Chrome, it's an iOS/Chrome iOS specific issue, not your code.

## Last Resort: Force New PWA Identity

Change these to force Chrome to see it as a "new" app:

1. **Bump cache version** in `public/sw.js`: `const CACHE_NAME = 'lunary-v4'`
2. **Change manifest `name`** temporarily: `"name": "Lunary App v2"`
3. **Change `start_url`**: `"start_url": "/?v=2"`
4. Redeploy
5. Delete Chrome, reinstall, try again

This forces Chrome to treat it as a completely new app.
