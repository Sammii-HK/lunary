import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getPostHogSignupTrends } from '@/lib/posthog-server';
import { resolveDateRange, formatTimestamp } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = (searchParams.get('granularity') || 'day') as
      | 'day'
      | 'week'
      | 'month';
    const range = resolveDateRange(searchParams, 30);

    const posthogTrends = await getPostHogSignupTrends(
      range.start,
      range.end,
      granularity,
    );

    const trends =
      posthogTrends.length > 0
        ? posthogTrends
        : await getSignupTrendsFromDb(range.start, range.end, granularity);

    // Calculate growth rate
    let growthRate = 0;
    if (trends.length >= 2) {
      const firstHalf = trends.slice(0, Math.floor(trends.length / 2));
      const secondHalf = trends.slice(Math.floor(trends.length / 2));
      const firstHalfAvg =
        firstHalf.reduce((sum, t) => sum + t.signups, 0) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((sum, t) => sum + t.signups, 0) / secondHalf.length;
      growthRate =
        firstHalfAvg > 0
          ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
          : 0;
    }

    return NextResponse.json({
      trends,
      growthRate: Number(growthRate.toFixed(2)),
      totalSignups: trends.reduce((sum, t) => sum + t.signups, 0),
      source: posthogTrends.length > 0 ? 'posthog' : 'conversion_events',
    });
  } catch (error) {
    console.error('[analytics/user-growth] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        trends: [],
        growthRate: 0,
        totalSignups: 0,
      },
      { status: 500 },
    );
  }
}

async function getSignupTrendsFromDb(
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) {
  const dateTrunc =
    granularity === 'week'
      ? "DATE_TRUNC('week', created_at)"
      : granularity === 'month'
        ? "DATE_TRUNC('month', created_at)"
        : 'DATE(created_at)';

  const result = await sql.query(
    `
      SELECT ${dateTrunc} as date, COUNT(DISTINCT user_id) as signups
      FROM conversion_events
      WHERE event_type = 'signup'
        AND created_at >= $1
        AND created_at <= $2
        AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
      GROUP BY ${dateTrunc}
      ORDER BY date ASC
    `,
    [
      formatTimestamp(startDate),
      formatTimestamp(endDate),
      TEST_EMAIL_PATTERN,
      TEST_EMAIL_EXACT,
    ],
  );

  return result.rows.map((row) => ({
    date:
      row.date instanceof Date
        ? row.date.toISOString().split('T')[0]
        : String(row.date),
    signups: Number(row.signups || 0),
  }));
}
