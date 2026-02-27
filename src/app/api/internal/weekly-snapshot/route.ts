import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Internal endpoint: weekly snapshot of Lunary metrics.
 * Called by content-creator's collect-context cron to fuel dynamic persona context.
 * Auth: Bearer CRON_SECRET (same secret used by Vercel Cron).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [latestResult, signupsResult] = await Promise.all([
    sql`
      SELECT mau, mrr, metric_date
      FROM daily_metrics
      ORDER BY metric_date DESC
      LIMIT 1
    `,
    sql`
      SELECT COALESCE(SUM(new_signups), 0) AS signups_this_week
      FROM daily_metrics
      WHERE metric_date >= NOW() - INTERVAL '7 days'
    `,
  ]);

  const latest = latestResult.rows[0];
  const mrr = Number(latest?.mrr ?? 0);
  const mrrFormatted = `£${mrr.toFixed(2)}`;

  return NextResponse.json({
    mau: latest?.mau ?? 0,
    mrr,
    mrrFormatted,
    signupsThisWeek: Number(signupsResult.rows[0]?.signups_this_week ?? 0),
    asOf: latest?.metric_date ?? null,
    generatedAt: new Date().toISOString(),
  });
}
