import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

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

/**
 * Links an Apple Sign In identity to the currently authenticated user's account.
 * This handles the case where a user signed up on web with email/password and
 * wants to also use Apple Sign In on iOS — even when their Apple ID email differs
 * from their web account email.
 *
 * Requires: valid session cookie (user must be logged in) + Apple identity token.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identityToken } = body as { identityToken: string };

    if (typeof identityToken !== 'string' || identityToken.length === 0) {
      return NextResponse.json(
        { error: 'identityToken required' },
        { status: 400 },
      );
    }

    // Get the current user from their session cookie
    const pool = getPool();

    // Extract session token from cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = isProduction
      ? '__Secure-better-auth.session_token'
      : 'better-auth.session_token';
    const rawCookie = req.cookies.get(cookieName)?.value;

    if (!rawCookie) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in first.' },
        { status: 401 },
      );
    }

    // Cookie is signed as `token.signature` — extract the actual token
    const sessionToken = rawCookie.split('.')[0];

    const sessionResult = await pool.query(
      `SELECT s."userId", u.email, u.name
       FROM session s
       JOIN "user" u ON u.id = s."userId"
       WHERE s.token = $1 AND s."expiresAt" > NOW()`,
      [sessionToken],
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 401 },
      );
    }

    const currentUserId = sessionResult.rows[0].userId;

    // Verify Apple identity token
    const JWKS = createRemoteJWKSet(new URL(APPLE_JWKS_URL));
    const { payload } = await jwtVerify(identityToken, JWKS, {
      issuer: APPLE_ISSUER,
      audience: APPLE_BUNDLE_ID,
    });

    const appleSub = payload.sub as string;
    if (!appleSub) {
      return NextResponse.json(
        { error: 'Invalid Apple identity token' },
        { status: 401 },
      );
    }

    // Check if this Apple ID is already linked to any account
    const existingLink = await pool.query(
      `SELECT a."userId", u.email
       FROM account a
       JOIN "user" u ON u.id = a."userId"
       WHERE a."providerId" = 'apple' AND a."accountId" = $1`,
      [appleSub],
    );

    if (existingLink.rows.length > 0) {
      if (existingLink.rows[0].userId === currentUserId) {
        return NextResponse.json({
          success: true,
          message: 'Apple ID is already linked to your account.',
          alreadyLinked: true,
        });
      }
      return NextResponse.json(
        {
          error:
            'This Apple ID is already linked to a different account. Please contact support if you need help.',
        },
        { status: 409 },
      );
    }

    // Check if the current user already has an Apple account linked
    const userAppleAccount = await pool.query(
      `SELECT id FROM account
       WHERE "providerId" = 'apple' AND "userId" = $1`,
      [currentUserId],
    );

    if (userAppleAccount.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            'Your account already has an Apple ID linked. Unlink the existing one first.',
        },
        { status: 409 },
      );
    }

    // Link the Apple account to the current user
    const accountId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO account (id, "accountId", "providerId", "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, 'apple', $3, NOW(), NOW())`,
      [accountId, appleSub, currentUserId],
    );

    return NextResponse.json({
      success: true,
      message:
        'Apple ID linked successfully. You can now sign in with Apple on any device.',
    });
  } catch (err: any) {
    console.error('[link-apple] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to link Apple ID' },
      { status: 500 },
    );
  }
}
