import { NextRequest, NextResponse } from 'next/server';

const camelToKebab = (str: string) =>
  str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

function handleLegacyGrimoireRedirects(pathname: string): string | null {
  if (pathname.includes(' ') || pathname.includes('%20')) {
    const decoded = decodeURIComponent(pathname);
    if (decoded.includes(' ')) {
      return decoded.replace(/ /g, '-').toLowerCase();
    }
  }

  if (pathname.startsWith('/grimoire/') && /[A-Z]/.test(pathname)) {
    const segments = pathname.split('/');
    const kebabSegments = segments.map((segment, index) =>
      index > 1 && /[A-Z]/.test(segment) ? camelToKebab(segment) : segment,
    );
    const newPath = kebabSegments.join('/');
    if (newPath !== pathname) return newPath;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPathname =
    pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;
  const hostname =
    request.headers.get('host')?.split(':')[0].toLowerCase() ?? '';

  // FAST PATH: Skip non-production domains immediately
  const isProductionDomain =
    hostname === 'lunary.app' ||
    hostname === 'www.lunary.app' ||
    hostname.startsWith('admin.');

  if (!isProductionDomain) {
    // Only handle essential redirects for legacy URLs
    if (normalizedPathname === '/$' || normalizedPathname === '/%24') {
      return NextResponse.redirect(new URL('/', request.url), 301);
    }

    if (
      normalizedPathname === '/grimoire/guides/birth-chart-complete-guide-0'
    ) {
      return NextResponse.redirect(
        new URL('/grimoire/guides/birth-chart-complete-guide', request.url),
        301,
      );
    }

    const legacyRedirect = handleLegacyGrimoireRedirects(normalizedPathname);
    if (legacyRedirect) {
      return NextResponse.redirect(new URL(legacyRedirect, request.url), 301);
    }

    if (
      normalizedPathname === '/grimoire' &&
      request.nextUrl.searchParams.has('item')
    ) {
      const item = request.nextUrl.searchParams.get('item');
      if (item) {
        const slug = camelToKebab(item);
        return NextResponse.redirect(new URL(`/grimoire/${slug}`, request.url));
      }
    }

    const blogWeekMatch = normalizedPathname.match(
      /^\/blog\/week\/(\d+)-(\d{4})$/,
    );
    if (blogWeekMatch) {
      return NextResponse.redirect(
        new URL(
          `/blog/week/week-${blogWeekMatch[1]}-${blogWeekMatch[2]}`,
          request.url,
        ),
        301,
      );
    }

    return NextResponse.next();
  }

  // PRODUCTION PATH: Handle www redirect
  if (hostname === 'www.lunary.app') {
    const redirectUrl = new URL(request.url);
    redirectUrl.hostname = 'lunary.app';
    redirectUrl.protocol = 'https:';
    redirectUrl.port = '';
    return NextResponse.redirect(redirectUrl, 301);
  }

  // HTTPS redirect
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url);
  }

  // Admin subdomain handling
  const isAdminSubdomain = hostname.startsWith('admin.');

  if (isAdminSubdomain) {
    // Rewrite admin subdomain requests to /admin path
    if (
      !normalizedPathname.startsWith('/admin') &&
      !normalizedPathname.startsWith('/auth') &&
      !normalizedPathname.startsWith('/api')
    ) {
      const url = request.nextUrl.clone();
      url.pathname =
        normalizedPathname === '/' ? '/admin' : `/admin${normalizedPathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // Block /admin access on main domain
    if (normalizedPathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Legacy URL redirects
  if (normalizedPathname === '/$' || normalizedPathname === '/%24') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  if (normalizedPathname === '/grimoire/guides/birth-chart-complete-guide-0') {
    return NextResponse.redirect(
      new URL('/grimoire/guides/birth-chart-complete-guide', request.url),
      301,
    );
  }

  const legacyRedirect = handleLegacyGrimoireRedirects(normalizedPathname);
  if (legacyRedirect) {
    return NextResponse.redirect(new URL(legacyRedirect, request.url), 301);
  }

  if (
    normalizedPathname === '/grimoire' &&
    request.nextUrl.searchParams.has('item')
  ) {
    const item = request.nextUrl.searchParams.get('item');
    if (item) {
      const slug = camelToKebab(item);
      return NextResponse.redirect(new URL(`/grimoire/${slug}`, request.url));
    }
  }

  const blogWeekMatch = normalizedPathname.match(
    /^\/blog\/week\/(\d+)-(\d{4})$/,
  );
  if (blogWeekMatch) {
    return NextResponse.redirect(
      new URL(
        `/blog/week/week-${blogWeekMatch[1]}-${blogWeekMatch[2]}`,
        request.url,
      ),
      301,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by API)
     * - _next (static files, images, etc.)
     * - Static files with extensions
     * - Common static assets
     */
    '/((?!api|_next|.*\\.[\\w]+$|favicon\\.ico|sw\\.js|manifest\\.json|robots\\.txt|sitemap).*)',
  ],
};
