import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalHost(request: NextRequest): boolean {
  const hostname = request.nextUrl.hostname.toLowerCase();
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith('.localhost');
}

function sanitizeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !isLocalHost(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const redirectTo = sanitizeRedirect(
    request.nextUrl.searchParams.get('redirect'),
  );
  const redirectJson = JSON.stringify(redirectTo);

  const response = new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Clearing local cache</title>
    <meta name="robots" content="noindex,nofollow" />
  </head>
  <body>
    <script>
      (async function clearLocalCache() {
        try {
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
          }

          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
        } finally {
          const target = new URL(${redirectJson}, window.location.origin);
          target.searchParams.set('cacheReset', String(Date.now()));
          window.location.replace(target.href);
        }
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Clear-Site-Data': '"cache"',
        'Content-Type': 'text/html; charset=utf-8',
      },
    },
  );

  return response;
}
