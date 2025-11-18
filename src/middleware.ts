import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname =
    request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';

  // Skip redirects in test/CI environments and for localhost
  const isTestOrCI =
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined;
  const isLocalhost =
    hostname.includes('localhost') || hostname === '127.0.0.1';
  const isProduction =
    !isTestOrCI &&
    !isLocalhost &&
    (process.env.NODE_ENV === 'production' ||
      process.env.VERCEL_ENV === 'production');

  // Redirect www to non-www FIRST (canonical domain: lunary.app)
  // This must happen before HTTPS redirect to avoid loops
  if (hostname.startsWith('www.') && !isTestOrCI && !isLocalhost) {
    const nonWwwHostname = hostname.replace('www.', '');
    const redirectUrl = new URL(request.url);
    redirectUrl.hostname = nonWwwHostname;
    // Always use HTTPS for the redirect in production
    if (isProduction) {
      redirectUrl.protocol = 'https:';
      redirectUrl.port = '';
    }
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Force HTTPS redirect in production (but skip in test/CI environments)
  // This happens AFTER www redirect to avoid loops
  if (isProduction && request.headers.get('x-forwarded-proto') !== 'https') {
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url);
  }

  const configuredAdminHosts = [
    process.env.ADMIN_DASHBOARD_HOST,
    process.env.ADMIN_APP_HOST,
    process.env.NEXT_PUBLIC_ADMIN_APP_HOST,
  ]
    .filter(Boolean)
    .map((host) => host!.toLowerCase());

  const isAdminSubdomain =
    hostname.startsWith('admin.') || configuredAdminHosts.includes(hostname);

  // console.log('🔍 Middleware check:', {
  //   hostname,
  //   isAdminSubdomain,
  //   pathname: url.pathname,
  //   configuredAdminHosts,
  //   nodeEnv: process.env.NODE_ENV,
  // });

  const adminPrefix = '/admin';
  const skipAdminRewritePrefixes = ['/auth', '/api', '/_next'];
  let shouldRewrite = false;

  const hasAdminPrefix = url.pathname.startsWith(adminPrefix);
  const shouldSkip = skipAdminRewritePrefixes.some((prefix) =>
    url.pathname.startsWith(prefix),
  );

  if (!isAdminSubdomain && hasAdminPrefix && !shouldSkip) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAdminSubdomain && hasAdminPrefix && !shouldSkip) {
    const trimmedPath = url.pathname.slice(adminPrefix.length) || '/';
    const cleanPath = trimmedPath.startsWith('/')
      ? trimmedPath
      : `/${trimmedPath}`;
    const redirectUrl = new URL(cleanPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminSubdomain && !hasAdminPrefix && !shouldSkip) {
    const newPathname =
      url.pathname === '/' ? adminPrefix : `${adminPrefix}${url.pathname}`;
    url.pathname = newPathname;

    console.log('🔄 Rewriting admin subdomain:', {
      from: request.nextUrl.pathname,
      to: newPathname,
      hostname,
    });

    return NextResponse.rewrite(url);
  }

  const isProductionLike =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production';

  if (url.pathname.startsWith(adminPrefix)) {
    // Check for admin session cookie (Better Auth stores session in cookies)
    const authCookie = request.cookies.get('better-auth.session_token');

    if (isProductionLike && !authCookie) {
      // Redirect to auth page if not authenticated
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Note: Full admin check happens client-side in the admin page component
    // Middleware just ensures user is authenticated
  }

  // Redirect old blog week URL format to canonical format
  // /blog/week/{N}-{YEAR} → /blog/week/week-{N}-{YEAR}
  const blogWeekMatch = url.pathname.match(/^\/blog\/week\/(\d+)-(\d{4})$/);
  if (blogWeekMatch) {
    const weekNumber = blogWeekMatch[1];
    const year = blogWeekMatch[2];
    const canonicalUrl = new URL(
      `/blog/week/week-${weekNumber}-${year}`,
      request.url,
    );
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // Redirect old query parameter URLs to new static routes
  // Only handle /grimoire?item=... requests
  if (url.pathname === '/grimoire' && url.searchParams.has('item')) {
    const item = url.searchParams.get('item');
    if (item) {
      // Convert camelCase to kebab-case
      const slug = item
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');

      // Preserve hash if present
      const hash = url.hash || '';
      return NextResponse.redirect(
        new URL(`/grimoire/${slug}${hash}`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|admin-manifest.json|icons/pwa).*)',
  ],
};
