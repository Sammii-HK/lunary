import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysIso = thirtyDaysAgo.toISOString();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayIso = todayStart.toISOString();

    const [mauResult, mrrResult, activeResult] = await Promise.all([
      // MAU: distinct users active in last 30 days
      sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM analytics_user_activity
        WHERE activity_date >= ${thirtyDaysIso}
          AND user_id IS NOT NULL
      `,
      // MRR: paying, non-cancelled subscriptions
      sql`
        SELECT COUNT(*) as count,
               COALESCE(SUM(monthly_amount_due), 0) as mrr
        FROM subscriptions
        WHERE is_paying = true
          AND status NOT IN ('cancelled')
      `,
      // Active today
      sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM analytics_user_activity
        WHERE activity_date >= ${todayIso}
          AND user_id IS NOT NULL
      `,
    ]);

    return NextResponse.json({
      mau: parseInt(mauResult.rows[0]?.count ?? '0'),
      mrr: parseFloat(mrrResult.rows[0]?.mrr ?? '0'),
      subscribers: parseInt(mrrResult.rows[0]?.count ?? '0'),
      activeToday: parseInt(activeResult.rows[0]?.count ?? '0'),
    });
  } catch (error) {
    console.error('[homebase-stats] error:', error);
    return NextResponse.json(
      { mau: 0, mrr: 0, subscribers: 0, activeToday: 0 },
      { status: 500 },
    );
  }
}
