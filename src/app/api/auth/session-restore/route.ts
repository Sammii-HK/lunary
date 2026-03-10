import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Native session restore via redirect.
 *
 * After email-native (or any manual sign-in), instead of setting the cookie
 * via document.cookie (unreliable in WKWebView), we navigate to this endpoint.
 * It sets the session cookie via a proper Set-Cookie on a navigation response
 * and redirects to /app. WKWebView always respects Set-Cookie on navigation
 * responses, so the session sticks reliably.
 *
 * GET /api/auth/session-restore?token=SIGNED_TOKEN&name=COOKIE_NAME
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get('token');
  const cookieNameParam = searchParams.get('name');

  if (!token) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // Determine secure based on actual request protocol, not NODE_ENV.
  // NEXT_PUBLIC_BASE_URL may point to https:// even in dev, which causes
  // better-auth to issue __Secure- cookies — but on HTTP (localhost) the
  // Secure flag must be omitted or WKWebView silently drops the cookie.
  const isHttps = req.nextUrl.protocol === 'https:';
  const cookieName =
    cookieNameParam ||
    (isHttps
      ? '__Secure-better-auth.session_token'
      : 'better-auth.session_token');

  const destination = new URL('/app', req.url);
  const response = NextResponse.redirect(destination);

  response.cookies.set(cookieName, token, {
    secure: isHttps,
    sameSite: 'lax',
    httpOnly: false, // must be readable by JS for better-auth client compat
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
