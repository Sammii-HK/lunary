# Fixing Duplicate Content Issue

## The Problem

Google sees both versions of your site as separate pages:

- `https://lunary.app` (non-www)
- `https://www.lunary.app` (www)

This splits your SEO authority and can cause:

- Lower rankings (authority split between two URLs)
- Confusion for search engines
- Duplicate content penalties

## The Solution

### Step 1: Choose Canonical Version

**Recommendation:** Use `lunary.app` (non-www) because:

- Shorter URL
- More modern standard
- Already using it in most places

### Step 2: Set Up 301 Redirects

Redirect all `www.lunary.app` traffic to `lunary.app`

### Step 3: Update Canonical URLs

Ensure all pages point to non-www version

## Implementation

### Option 1: Vercel Redirects (Recommended)

Add to `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "www.lunary.app"
        }
      ],
      "destination": "https://lunary.app/:path*",
      "permanent": true
    }
  ]
}
```

### Option 2: Next.js Middleware

Create/update `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Redirect www to non-www
  if (hostname.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.hostname = hostname.replace('www.', '');
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

### Option 3: DNS/Server Level

If you have access to DNS/server config:

- Set CNAME for www → lunary.app
- Configure server to redirect www → non-www

## Verify Canonical URLs

All pages should have:

```html
<link rel="canonical" href="https://lunary.app/..." />
```

NOT:

```html
<link rel="canonical" href="https://www.lunary.app/..." />
```

## After Implementation

1. **Submit to Google Search Console:**

   - Add both properties (www and non-www)
   - Set preferred domain to `lunary.app`
   - Request indexing of non-www pages

2. **Monitor:**

   - Check redirects are working
   - Verify canonical URLs
   - Monitor search console for issues

3. **Expected Results:**
   - Consolidated SEO authority
   - Better rankings
   - No duplicate content issues

## Current Status

✅ **Canonical URLs:** Already pointing to non-www
⚠️ **Redirects:** Need to implement
⚠️ **Search Console:** Need to set preferred domain

## Priority

**High Priority** - This is hurting your SEO right now. Fixing it will:

- Consolidate SEO authority
- Improve rankings
- Fix duplicate content issue
- Better user experience
