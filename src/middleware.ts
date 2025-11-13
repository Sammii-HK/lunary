import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname =
    request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';

  const configuredAdminHosts = [
    process.env.ADMIN_DASHBOARD_HOST,
    process.env.ADMIN_APP_HOST,
    process.env.NEXT_PUBLIC_ADMIN_APP_HOST,
  ]
    .filter(Boolean)
    .map((host) => host!.toLowerCase());

  const isAdminSubdomain =
    hostname.startsWith('admin.') || configuredAdminHosts.includes(hostname);

  console.log('🔍 Middleware check:', {
    hostname,
    isAdminSubdomain,
    pathname: url.pathname,
    configuredAdminHosts,
    nodeEnv: process.env.NODE_ENV,
  });

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
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
