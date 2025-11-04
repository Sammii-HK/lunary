import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
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
  matcher: '/grimoire',
};
