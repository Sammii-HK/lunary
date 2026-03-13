import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

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

/** Check whether the current user has an Apple ID linked. */
export async function GET(req: NextRequest) {
  try {
    const pool = getPool();

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = isProduction
      ? '__Secure-better-auth.session_token'
      : 'better-auth.session_token';
    const rawCookie = req.cookies.get(cookieName)?.value;

    if (!rawCookie) {
      return NextResponse.json({ linked: false });
    }

    const sessionToken = rawCookie.split('.')[0];

    const result = await pool.query(
      `SELECT a.id
       FROM session s
       JOIN account a ON a."userId" = s."userId" AND a."providerId" = 'apple'
       WHERE s.token = $1 AND s."expiresAt" > NOW()
       LIMIT 1`,
      [sessionToken],
    );

    return NextResponse.json({ linked: result.rows.length > 0 });
  } catch {
    return NextResponse.json({ linked: false });
  }
}
