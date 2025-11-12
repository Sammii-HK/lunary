import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Protect admin routes - check if user is admin
  if (url.pathname.startsWith('/admin')) {
    // Get admin email from environment
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lunary.app';

    // Check for admin session cookie or header
    // Better Auth stores session in cookies
    const authCookie = request.cookies.get('better-auth.session_token');

    // In test/dev, allow access if authenticated (client-side will check admin status)
    // In production, require authentication
    if (process.env.NODE_ENV === 'production' && !authCookie) {
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
