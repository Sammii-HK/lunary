# Production Notification Testing Guide

After pushing to production, wait 3 minutes for deployment, then test:

## Production URL

- Base URL: `https://lunary.app` (or your production URL)

## Testing Steps

### 1. Check Service Worker (DevTools Console)

```javascript
// In browser console on production site
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log('Service Worker:', reg);
  console.log('Scope:', reg?.scope);
  console.log('Active:', reg?.active);
});
```

### 2. Check Setup Status

```javascript
// Run debug function if available
debugPushNotifications();
```

### 3. Test Notification Setup Endpoint

```bash
curl https://lunary.app/api/notifications/test
```

Should return:

```json
{
  "vapidPublicKeySet": true,
  "vapidPrivateKeySet": true,
  "activeSubscriptions": <number>,
  "setupComplete": true
}
```

### 4. Enable Notifications on Production

1. Go to `/profile` page
2. Click "Enable Notifications"
3. Grant permission when prompted
4. Check console for subscription logs

### 5. Test Sending Notification

```bash
curl -X POST https://lunary.app/api/notifications/test \
  -H "Content-Type: application/json"
```

Should return notification sent status.

### 6. Verify Service Worker Push Handler

- Check browser DevTools > Application > Service Workers
- Verify service worker is "activated and is running"
- Look for push event listener in service worker code

## Common Production Issues

1. **VAPID Keys Not Set**

   - Check environment variables in hosting platform
   - Verify `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set
   - Verify `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` are set

2. **Service Worker Not Registering**

   - Check HTTPS is working
   - Verify `/sw.js` is accessible: `https://lunary.app/sw.js`
   - Check for CORS or security policy issues

3. **Notifications Not Showing**

   - Check browser notification permissions
   - Verify subscription exists in database
   - Check service worker push event listener is active

4. **Database Connection**
   - Ensure PostgreSQL connection is working
   - Verify `push_subscriptions` table exists
   - Check for database connection errors in logs
