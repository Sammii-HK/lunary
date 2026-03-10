import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Native iOS form-based sign-in endpoint.
 *
 * Accepts a form POST (application/x-www-form-urlencoded) with email/password.
 * Calls better-auth internally, then FORWARDS the exact Set-Cookie headers from
 * better-auth's response directly to the client in a 303 redirect to /app.
 *
 * Why form POST instead of fetch + document.cookie:
 * - WKWebView always processes Set-Cookie on navigation responses (POST redirect)
 * - No re-encoding of token values (avoids HMAC signature mismatch)
 * - Exact cookie headers from better-auth are forwarded verbatim
 *
 * Auth.tsx submits a hidden form to this endpoint on native iOS.
 */
export async function POST(req: NextRequest) {
  try {
    let email: string;
    let password: string;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      email = String(formData.get('email') || '');
      password = String(formData.get('password') || '');
    } else {
      const body = await req.json();
      email = body.email || '';
      password = body.password || '';
    }

    if (!email.trim() || !password) {
      return NextResponse.redirect(
        new URL('/auth?error=missing_credentials', req.url),
        303,
      );
    }

    // Use actual request origin so better-auth picks the right cookie prefix
    // (no __Secure- on localhost HTTP)
    const baseUrl = req.nextUrl.origin;

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
      return NextResponse.redirect(
        new URL('/auth?error=invalid_credentials', req.url),
        303,
      );
    }

    // Redirect to /app with a 303 (See Other) — browsers follow 303 with GET
    const redirect = NextResponse.redirect(new URL('/app', req.url), 303);

    // Forward ALL Set-Cookie headers from better-auth verbatim — no re-encoding
    const rawSetCookie = response.headers.get('set-cookie');
    if (rawSetCookie) {
      // Headers.get() returns multiple values joined by ', ' for most headers,
      // but Set-Cookie is special — each cookie is a separate header.
      // Use getSetCookie() if available (Node 20+), otherwise split carefully.
      let cookies: string[];
      if (typeof (response.headers as any).getSetCookie === 'function') {
        cookies = (response.headers as any).getSetCookie();
      } else {
        // Fallback: split on ', ' but only at cookie boundaries
        // (cookie values can contain commas, so this is best-effort)
        cookies = [rawSetCookie];
      }

      for (const cookie of cookies) {
        redirect.headers.append('Set-Cookie', cookie);
      }
    }

    return redirect;
  } catch (err: any) {
    console.error('[signin-native] Error:', err);
    return NextResponse.redirect(
      new URL('/auth?error=server_error', req.url),
      303,
    );
  }
}
