import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname =
    request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';

  // Skip ALL redirects in test/CI environments and for localhost
  // Check CI more robustly (GitHub Actions sets CI=true, Edge Runtime may handle it differently)
  const isTestOrCI =
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    !!process.env.CI ||
    process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined ||
    process.env.GITHUB_ACTIONS === 'true';

  // Detect localhost (CI and local dev both use localhost:3000)
  const isLocalhost =
    hostname.includes('localhost') ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('127.') ||
    hostname.includes('0.0.0.0');

  // Check for admin subdomains early (before production domain check)
  const configuredAdminHosts = [
    process.env.ADMIN_DASHBOARD_HOST,
    process.env.ADMIN_APP_HOST,
    process.env.NEXT_PUBLIC_ADMIN_APP_HOST,
  ]
    .filter(Boolean)
    .map((host) => host!.toLowerCase());

  const isAdminSubdomain =
    hostname.startsWith('admin.') || configuredAdminHosts.includes(hostname);

  // Only allow redirects for production domains (lunary.app, www.lunary.app, admin.lunary.app)
  // This is a whitelist approach: if it's not a known production domain, skip redirects
  // This ensures CI/localhost/dev environments never trigger redirects
  const isProductionDomain =
    hostname === 'lunary.app' ||
    hostname === 'www.lunary.app' ||
    hostname === 'admin.lunary.app' ||
    isAdminSubdomain;

  // Skip redirects if:
  // 1. It's a test/CI environment (env var check - may not work in Edge Runtime)
  // 2. It's localhost (CI uses localhost:3000, local dev uses localhost:3000)
  // 3. It's NOT a production domain (safety net - only lunary.app domains get redirects)
  if (isTestOrCI || isLocalhost || !isProductionDomain) {
    // Only allow blog week and grimoire redirects (these are safe path redirects)
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

    if (url.pathname === '/grimoire' && url.searchParams.has('item')) {
      const item = url.searchParams.get('item');
      if (item) {
        const slug = item
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '');
        const hash = url.hash || '';
        return NextResponse.redirect(
          new URL(`/grimoire/${slug}${hash}`, request.url),
        );
      }
    }

    return NextResponse.next();
  }

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production';

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

  // console.log('🔍 Middleware check:', {
  //   hostname,
  //   isAdminSubdomain,
  //   pathname: url.pathname,
  //   configuredAdminHosts,
  //   nodeEnv: process.env.NODE_ENV,
  // });

  const adminPrefix = '/admin';
  const skipAdminRewritePrefixes = ['/auth', '/api', '/_next'];

  const hasAdminPrefix = url.pathname.startsWith(adminPrefix);
  const shouldSkip = skipAdminRewritePrefixes.some((prefix) =>
    url.pathname.startsWith(prefix),
  );

  // Skip admin redirects in test/CI environments
  if (!isTestOrCI && !isLocalhost) {
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

      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Rewriting admin subdomain:', {
          from: request.nextUrl.pathname,
          to: newPathname,
          hostname,
        });
      }

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
