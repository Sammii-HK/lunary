# Testing CORS Locally

This guide shows you how to test the CORS implementation locally before deploying.

## Quick Test Script

Run the automated test script:

```bash
# Make sure your dev server is running first
yarn dev

# In another terminal, run the CORS test
yarn test:cors
```

Or test against a different URL:

```bash
TEST_URL=http://localhost:3000 yarn test:cors
```

## Manual Testing with curl

### Test OPTIONS Preflight Request

```bash
# Test valid origin (localhost)
curl -X OPTIONS http://localhost:3000/api/auth/get-session \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Test valid Vercel preview origin
curl -X OPTIONS http://localhost:3000/api/auth/get-session \
  -H "Origin: https://test-sammiis-projects.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Test invalid origin (should NOT have CORS headers)
curl -X OPTIONS http://localhost:3000/api/auth/get-session \
  -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Test Actual Auth Request

```bash
# Test GET request with valid origin
curl -X GET http://localhost:3000/api/auth/get-session \
  -H "Origin: https://test-sammiis-projects.vercel.app" \
  -H "Cookie: better-auth.session_token=test" \
  -v

# Check for Access-Control-Allow-Origin header in response
```

## Browser DevTools Testing

1. **Start your dev server:**

   ```bash
   yarn dev
   ```

2. **Open browser console** and run:

```javascript
// Test from different origin (simulated)
fetch('http://localhost:3000/api/auth/get-session', {
  method: 'GET',
  credentials: 'include',
  headers: {
    Origin: 'https://test-sammiis-projects.vercel.app',
  },
})
  .then((r) => {
    console.log('Status:', r.status);
    console.log('CORS Origin:', r.headers.get('Access-Control-Allow-Origin'));
    console.log(
      'CORS Credentials:',
      r.headers.get('Access-Control-Allow-Credentials'),
    );
    return r.json();
  })
  .then((data) => console.log('Response:', data))
  .catch((err) => console.error('Error:', err));
```

3. **Check Network tab:**
   - Open DevTools → Network tab
   - Look for the request to `/api/auth/get-session`
   - Check Response Headers for:
     - `Access-Control-Allow-Origin`
     - `Access-Control-Allow-Credentials`
     - `Access-Control-Allow-Methods`

## Testing Different Origins

The test script validates these scenarios:

✅ **Should work:**

- `http://localhost:3000` (local dev)
- `http://localhost:3001` (local dev alt port)
- `https://lunary.app` (production)
- `https://www.lunary.app` (production www)
- `https://*-sammiis-projects.vercel.app` (your preview deployments)

❌ **Should NOT work:**

- `https://invalid-origin.com` (not in allowed list)
- `https://malicious-site.com` (not in allowed list)

## Expected Results

### Valid Origin Response Headers:

```
Access-Control-Allow-Origin: https://test-sammiis-projects.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Invalid Origin Response:

- No `Access-Control-Allow-Origin` header
- Request may still succeed, but browser will block CORS

## Testing Preview Deployment Pattern

To specifically test the `-sammiis-projects` pattern:

```bash
# This should work
curl -X OPTIONS http://localhost:3000/api/auth/get-session \
  -H "Origin: https://lunary-git-branch-test-b098c4-sammiis-projects.vercel.app" \
  -v | grep -i "access-control"

# This should NOT work (missing sammiis-projects)
curl -X OPTIONS http://localhost:3000/api/auth/get-session \
  -H "Origin: https://lunary-git-branch-test-b098c4-other-projects.vercel.app" \
  -v | grep -i "access-control"
```

## Troubleshooting

If CORS headers aren't appearing:

1. **Check origin validation:**
   - Make sure the origin matches one of the patterns
   - Check `src/lib/origin-validation.ts` for the regex patterns

2. **Check server logs:**
   - Look for any errors in the terminal running `yarn dev`
   - Check if the request is reaching the handler

3. **Verify route handler:**
   - Ensure `withCors` wrapper is being used
   - Check that OPTIONS method is handled

4. **Test with actual browser:**
   - CORS is enforced by browsers, not curl
   - Use browser DevTools for real-world testing
