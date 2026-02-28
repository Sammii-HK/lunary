import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Pool } from 'pg';

/**
 * Signs a cookie value using HMAC-SHA256, matching better-call's setSignedCookie format.
 * The resulting format is `value.base64signature` (not URI-encoded — Next.js will encode it).
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

const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_BUNDLE_ID = 'app.lunary';

let pgPool: Pool | null = null;
function getPool() {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL!,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });
  }
  return pgPool;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identityToken, user } = body as {
      identityToken: string;
      user?: { email?: string; givenName?: string; familyName?: string };
    };

    if (!identityToken) {
      return NextResponse.json(
        { error: 'identityToken required' },
        { status: 400 },
      );
    }

    // Verify Apple identity token
    const JWKS = createRemoteJWKSet(new URL(APPLE_JWKS_URL));
    const { payload } = await jwtVerify(identityToken, JWKS, {
      issuer: APPLE_ISSUER,
      audience: APPLE_BUNDLE_ID,
    });

    const appleSub = payload.sub as string;
    const appleEmail = (payload.email as string | undefined) || user?.email;

    if (!appleSub) {
      return NextResponse.json(
        { error: 'Invalid identity token' },
        { status: 401 },
      );
    }

    const pool = getPool();

    // Check for existing Apple account link
    const existingAccount = await pool.query(
      `SELECT a.*, u.id as user_id, u.name, u.email
       FROM account a
       JOIN "user" u ON u.id = a."userId"
       WHERE a."providerId" = 'apple' AND a."accountId" = $1`,
      [appleSub],
    );

    let userId: string;

    if (existingAccount.rows.length > 0) {
      // Existing Apple user - sign them in
      userId = existingAccount.rows[0].user_id;
    } else {
      // New Apple sign-in - find or create user
      let existingUser = null;

      if (appleEmail) {
        const emailResult = await pool.query(
          `SELECT id FROM "user" WHERE email = $1`,
          [appleEmail.toLowerCase()],
        );
        if (emailResult.rows.length > 0) {
          existingUser = emailResult.rows[0];
        }
      }

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user
        if (!appleEmail) {
          return NextResponse.json(
            {
              error:
                'Email required for new accounts. Please allow email access in Sign in with Apple.',
            },
            { status: 400 },
          );
        }

        const name =
          [user?.givenName, user?.familyName]
            .filter(Boolean)
            .join(' ')
            .trim() || appleEmail.split('@')[0];

        const newUserId = crypto.randomUUID();
        await pool.query(
          `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, true, NOW(), NOW())`,
          [newUserId, name, appleEmail.toLowerCase()],
        );
        userId = newUserId;
      }

      // Link Apple account
      const accountId = crypto.randomUUID();
      await pool.query(
        `INSERT INTO account (id, "accountId", "providerId", "userId", "createdAt", "updatedAt")
         VALUES ($1, $2, 'apple', $3, NOW(), NOW())`,
        [accountId, appleSub, userId],
      );
    }

    // Create a better-auth session
    const sessionToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      `INSERT INTO session (id, "expiresAt", token, "createdAt", "updatedAt", "userId")
       VALUES ($1, $2, $3, NOW(), NOW(), $4)`,
      [sessionId, expiresAt, sessionToken, userId],
    );

    // Sign the token — better-call's getSignedCookie expects `token.base64(HMAC-SHA256(token, secret))`
    const secret =
      process.env.BETTER_AUTH_SECRET ||
      'local-dev-secret-key-change-in-production';
    const signedToken = await signCookieValue(sessionToken, secret);

    // Match better-auth's cookie name exactly.
    // In production: __Secure- prefix (because NEXT_PUBLIC_BASE_URL is https).
    // In development: no prefix (useSecureCookies: false in auth.ts stops __Secure- on HTTP localhost).
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = isProduction
      ? '__Secure-better-auth.session_token'
      : 'better-auth.session_token';

    const response = NextResponse.json({
      success: true,
      token: signedToken,
      cookieName,
      expiresAt: expiresAt.toISOString(),
    });

    response.cookies.set(cookieName, signedToken, {
      secure: isProduction,
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('[apple-native] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Authentication failed' },
      { status: 500 },
    );
  }
}
