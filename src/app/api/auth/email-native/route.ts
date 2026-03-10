import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Signs a cookie value using HMAC-SHA256, matching better-call's setSignedCookie format.
 * The resulting format is `value.base64signature`.
 */
async function signCookieValue(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  );
  const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${value}.${base64Sig}`;
}

/**
 * Native iOS email sign-in endpoint.
 *
 * WKWebView doesn't reliably persist Set-Cookie headers from programmatic fetch
 * requests. This endpoint proxies the better-auth email sign-in and returns the
 * signed session token in the JSON body so the client can set it via document.cookie
 * (the same pattern used by apple-native).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 },
      );
    }

    // Use the actual request origin so better-auth picks the right cookie
    // prefix. If we used NEXT_PUBLIC_BASE_URL (https://lunary.app) on a
    // localhost dev server, better-auth would set __Secure- prefixed cookies
    // which WKWebView silently rejects over HTTP.
    const baseUrl = req.nextUrl.origin;

    // Call better-auth's sign-in handler internally
    const signInReq = new Request(`${baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: baseUrl,
      },
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    });

    const response = await (auth as any).handler(signInReq);

    if (!response.ok) {
      const errBody = await response
        .json()
        .catch(() => ({ error: 'Sign in failed' }));
      return NextResponse.json(
        { error: errBody.message || errBody.error || 'Invalid credentials' },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Prefer extracting the already-signed token from Set-Cookie header
    let signedToken: string | null = null;
    let cookieName: string | null = null;

    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const firstDirective = setCookieHeader.split(';')[0];
      const eqIdx = firstDirective.indexOf('=');
      if (eqIdx !== -1) {
        cookieName = firstDirective.substring(0, eqIdx).trim();
        signedToken = firstDirective.substring(eqIdx + 1).trim();
      }
    }

    // Fall back: sign the raw token from the response body ourselves
    if (!signedToken && data?.session?.token) {
      const secret =
        process.env.BETTER_AUTH_SECRET ||
        'local-dev-secret-key-change-in-production';
      signedToken = await signCookieValue(data.session.token, secret);
    }

    if (!signedToken) {
      console.error('[email-native] Could not obtain session token', {
        hasCookie: !!setCookieHeader,
        hasSessionToken: !!data?.session?.token,
      });
      return NextResponse.json(
        { error: 'Sign in failed — no session token' },
        { status: 500 },
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const finalCookieName =
      cookieName ||
      (isProduction
        ? '__Secure-better-auth.session_token'
        : 'better-auth.session_token');

    const expiresAt = data?.session?.expiresAt
      ? new Date(data.session.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      token: signedToken,
      cookieName: finalCookieName,
      expiresAt: expiresAt.toISOString(),
      user: data.user,
    });
  } catch (err: any) {
    console.error('[email-native] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: 500 },
    );
  }
}
