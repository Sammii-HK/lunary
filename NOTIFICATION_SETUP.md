# PWA Push Notifications Setup Guide

This guide will help you set up and debug push notifications for the Lunary app.

## Required Setup

### 1. Generate VAPID Keys

You need to generate VAPID (Voluntary Application Server Identification) keys for push notifications. These are cryptographic keys that identify your application to push services.

#### Using Node.js (web-push package):

```bash
npx web-push generate-vapid-keys
```

This will output something like:

```
Public Key:
BOa... (long base64 string)

Private Key:
XOa... (long base64 string)
```

#### Alternative: Using Python

```python
from py_vapid import Vapid01
vapid = Vapid01()
vapid.generate_keys()
print("Public Key:", vapid.public_key.public_bytes_raw().hex())
print("Private Key:", vapid.private_key.private_bytes_raw().hex())
```

### 2. Set Environment Variables

Add these to your `.env.local` file (and your hosting platform's environment variables):

```env
# Client-side (public key - safe to expose)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here

# Server-side (private key - keep secret!)
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
```

**Important Notes:**

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` must match `VAPID_PUBLIC_KEY` (same value)
- The private key should NEVER be exposed in client-side code
- Both keys should be base64 URL-safe strings (typically 80+ characters)

### 3. Verify Setup

After setting up environment variables:

1. **Check the notification settings page** - It will show diagnostic information about your setup
2. **Use the test endpoint** - `GET /api/notifications/test` to check if everything is configured
3. **Check browser console** - Look for detailed error messages during subscription

## Testing Notifications

### Test Endpoint

You can test notifications using the test API endpoint:

```bash
# Check setup status
curl http://localhost:3000/api/notifications/test

# Send test notification to all subscribers
curl -X POST http://localhost:3000/api/notifications/test
```

### Manual Testing Steps

1. **Enable notifications in the profile page**

   - Go to `/profile`
   - Click "Enable Notifications"
   - Grant permission when prompted

2. **Verify subscription**

   - Open browser DevTools > Application > Service Workers
   - Check that service worker is registered and active
   - Check browser DevTools > Console for subscription logs

3. **Send a test notification**
   - Use the test endpoint or trigger an event
   - You should see a notification appear

## Common Issues and Solutions

### Issue: "VAPID public key not configured"

**Solution:**

- Make sure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set in your environment variables
- Restart your Next.js development server after adding environment variables
- In production, ensure the environment variable is set in your hosting platform

### Issue: "Service worker registration failed"

**Solutions:**

- Make sure you're using HTTPS (or localhost for development)
- Check that `/sw.js` is accessible (try visiting `http://localhost:3000/sw.js`)
- Clear browser cache and unregister old service workers:
  - DevTools > Application > Service Workers > Unregister
  - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: "Push messaging is not supported"

**Solutions:**

- Use a modern browser (Chrome, Firefox, Edge, Safari 16+)
- Ensure you're on HTTPS (push notifications require secure context)
- Check that the browser supports the Push API

### Issue: "Failed to save subscription to server"

**Solutions:**

- Check PostgreSQL connection and database schema
- Ensure the `push_subscriptions` table exists
- Check server logs for detailed error messages
- Note: Client-side subscription still works even if server save fails

### Issue: Notifications not appearing

**Debugging steps:**

1. Check browser DevTools > Application > Service Workers

   - Verify service worker is active
   - Check "Push" event listener is registered

2. Check browser DevTools > Console

   - Look for "Push message received" logs
   - Check for any error messages

3. Verify notification permission:

   - Browser settings > Notifications > Check if site is allowed
   - Try re-enabling notifications in the app

4. Test with the test endpoint to verify server-side sending works

## Browser Compatibility

- **Chrome/Edge:** Full support ✅
- **Firefox:** Full support ✅
- **Safari:** Support from Safari 16+ ✅
- **Opera:** Full support ✅
- **Mobile browsers:** iOS Safari 16.4+, Android Chrome ✅

## Service Worker Scope

The service worker is registered at `/sw.js` with scope `/`, meaning it controls all pages on your domain. This is necessary for push notifications to work.

## Security Notes

- VAPID keys are used to authenticate your server with push services
- The private key must be kept secret - never commit it to version control
- The public key can be safely exposed in client-side code (hence `NEXT_PUBLIC_` prefix)
- Each subscription is unique per browser/device

## Database Schema

Ensure your PostgreSQL database has the `push_subscriptions` table:

```sql
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  preferences JSONB DEFAULT '{}',
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_notification_sent TIMESTAMP
);
```

## Next Steps

Once notifications are working:

1. Set up event detection for astronomical events
2. Configure notification preferences per user
3. Schedule automatic event checking (cron job or scheduled function)
4. Customize notification content and timing

## Support

If you continue to have issues:

1. Check the browser console for detailed error messages
2. Check server logs for API errors
3. Use the test endpoint to diagnose issues
4. Verify all environment variables are set correctly
5. Ensure your database schema is up to date
