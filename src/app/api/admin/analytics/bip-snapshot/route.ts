import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getStripeSubscriptionSnapshot } from '@/lib/analytics/stripe-subscriptions';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * BIP Snapshot — returns subscriber count, MRR, new signups (7d), and DAU.
 * Called by Spellcast's BIP crons to avoid direct DB access.
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const nowIso = new Date().toISOString();
    const now7dAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [stripeSnapshot, signupsResult, dauResult] = await Promise.all([
      getStripeSubscriptionSnapshot(),
      sql.query(
        `SELECT COUNT(*) as count FROM "user"
         WHERE "createdAt" >= $1 AND "createdAt" <= $2
           AND (email IS NULL OR (email NOT LIKE '%@test.lunary.app' AND email != 'test@test.lunary.app'))`,
        [now7dAgo, nowIso],
      ),
      sql
        .query(
          `SELECT signed_in_product_dau
           FROM daily_metrics
           WHERE metric_date < CURRENT_DATE
             AND signed_in_product_dau IS NOT NULL
           ORDER BY metric_date DESC
           LIMIT 1`,
          [],
        )
        .catch(() => ({ rows: [] })),
    ]);

    return NextResponse.json({
      subscriberCount: Number(stripeSnapshot.activeSubscriptions || 0),
      mrr: Number(stripeSnapshot.mrr || 0),
      newSignups7d: Number(signupsResult.rows[0]?.count || 0),
      dau: Number(dauResult.rows[0]?.signed_in_product_dau || 0),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
