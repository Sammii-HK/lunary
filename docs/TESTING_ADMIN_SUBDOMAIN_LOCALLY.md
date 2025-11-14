# Testing Admin Subdomain Locally

## Method 1: Using /etc/hosts (Recommended)

This allows you to test `admin.localhost` locally.

### Steps:

1. **Edit your hosts file:**

   ```bash
   sudo nano /etc/hosts
   ```

2. **Add this line:**

   ```
   127.0.0.1 admin.localhost
   ```

3. **Start your dev server:**

   ```bash
   yarn dev
   ```

4. **Visit:**
   - `http://admin.localhost:3000/` - Should show admin dashboard
   - `http://localhost:3000/admin` - Should redirect to `/` (not admin subdomain)

### Verify it's working:

- Check browser console for middleware logs
- Should see `🔍 Middleware check:` logs
- Should see `🔄 Rewriting admin subdomain:` logs

## Method 2: Test Middleware Logic Directly

Create a test script to verify the middleware logic:

```bash
# Run: yarn test:middleware
```

## Method 3: Use curl with Host Header

Test the middleware by simulating the admin subdomain:

```bash
# Test admin subdomain
curl -H "Host: admin.localhost" http://localhost:3000/ -v

# Should see rewrite happening (check response)
```

## Method 4: Browser DevTools

1. Open DevTools → Network tab
2. Visit `http://admin.localhost:3000/`
3. Check the request headers - should show `Host: admin.localhost`
4. Check response - should be admin dashboard content

## Troubleshooting

If `admin.localhost` doesn't work:

- Make sure `/etc/hosts` has the entry
- Try `admin.lunary.local` instead
- Clear browser cache
- Check middleware logs in terminal
