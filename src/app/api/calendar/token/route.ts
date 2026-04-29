import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Issue (or rotate) the per-user calendar subscription token.
 *
 * GET — returns the existing token, minting one if it doesn't exist
 *       so subscribing is one round-trip from the UI.
 * POST — rotates the token (invalidates the old subscription URL).
 */

async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function mintToken(): string {
  return randomBytes(24).toString('base64url');
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const existing = await sql`
    SELECT calendar_token FROM "user" WHERE id = ${userId} LIMIT 1
  `;
  let token: string | null = existing.rows[0]?.calendar_token ?? null;
  if (!token) {
    token = mintToken();
    await sql`
      UPDATE "user" SET calendar_token = ${token} WHERE id = ${userId}
    `;
  }
  return NextResponse.json({ ok: true, token });
}

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = mintToken();
  await sql`UPDATE "user" SET calendar_token = ${token} WHERE id = ${userId}`;
  return NextResponse.json({ ok: true, token });
}
