import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Redirect www to non-www (fix duplicate content issue)
  // Only redirect if we have a valid hostname (not during build)
  if (hostname && hostname.startsWith('www.')) {
    const newHostname = hostname.replace('www.', '');
    const url = request.nextUrl.clone();
    // Construct redirect URL using Next.js NextURL properly
    const redirectUrl = new URL(
      `${url.protocol}//${newHostname}${url.pathname}${url.search}`,
    );
    return NextResponse.redirect(redirectUrl, 301);
  }

  const url = request.nextUrl.clone();

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
