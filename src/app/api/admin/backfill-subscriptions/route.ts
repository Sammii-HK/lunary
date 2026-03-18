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
    const { dryRun: dryRunParam, mode } = body as {
      dryRun?: boolean;
      mode?: string;
    };
    const dryRun = dryRunParam !== false;

    // ─── Mode: grant-trials ──────────────────────────────────────
    if (mode === 'grant-trials') {
      const eligible = await sql`
        SELECT s.user_id, s.user_email as email
        FROM subscriptions s
        WHERE s.status = 'free'
          AND s.plan_type = 'free'
          AND s.trial_ends_at IS NULL
        ORDER BY s.created_at DESC
      `;

      if (dryRun) {
        return NextResponse.json({
          dryRun: true,
          mode: 'grant-trials',
          eligibleCount: eligible.rows.length,
          users: eligible.rows.map((u) => ({
            userId: u.user_id,
            email: u.email,
          })),
          message:
            'Send { "mode": "grant-trials", "dryRun": false } to grant trials.',
        });
      }

      const result = await sql`
        UPDATE subscriptions
        SET status = 'trial',
            plan_type = 'lunary_plus',
            trial_ends_at = NOW() + INTERVAL '7 days'
        WHERE status = 'free'
          AND plan_type = 'free'
          AND trial_ends_at IS NULL
      `;

      return NextResponse.json({
        success: true,
        mode: 'grant-trials',
        updatedCount: result.rowCount,
        message: `Granted 7-day trials to ${result.rowCount} free users.`,
      });
    }

    // ─── Default mode: backfill missing subscription rows ────────
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
