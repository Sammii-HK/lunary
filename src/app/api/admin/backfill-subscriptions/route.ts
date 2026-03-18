import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * ADMIN ONLY: One-time backfill free subscription rows for users
 * who signed up before the auth hook was fixed.
 *
 * This ensures lifecycle drip emails can find all users.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const dryRun = (body as { dryRun?: boolean }).dryRun !== false;

    // Find users missing a subscription row
    const missing = await sql`
      SELECT u.id, u.email, u.name, u."createdAt"
      FROM "user" u
      WHERE NOT EXISTS (
        SELECT 1 FROM subscriptions s WHERE s.user_id = u.id
      )
      ORDER BY u."createdAt" DESC
    `;

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        missingCount: missing.rows.length,
        users: missing.rows.map((u) => ({
          id: u.id,
          email: u.email,
          createdAt: u.createdAt,
        })),
        message: 'Send { "dryRun": false } to execute the backfill.',
      });
    }

    // Insert free subscription rows for all missing users
    const result = await sql`
      INSERT INTO subscriptions (user_id, user_email, user_name, status, plan_type, created_at)
      SELECT u.id, u.email, u.name, 'free', 'free', u."createdAt"
      FROM "user" u
      WHERE NOT EXISTS (
        SELECT 1 FROM subscriptions s WHERE s.user_id = u.id
      )
      ON CONFLICT (user_id) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      backfilledCount: result.rowCount,
      message: `Created ${result.rowCount} free subscription rows.`,
    });
  } catch (error) {
    console.error('[Backfill Subscriptions] Failed:', error);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
}
