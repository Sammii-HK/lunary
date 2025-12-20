import { NextRequest, NextResponse } from 'next/server';
import { getPostHogSignupTrends } from '@/lib/posthog-server';
import { resolveDateRange } from '@/lib/analytics/date-range';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = (searchParams.get('granularity') || 'day') as
      | 'day'
      | 'week'
      | 'month';
    const range = resolveDateRange(searchParams, 30);

    const trends = await getPostHogSignupTrends(
      range.start,
      range.end,
      granularity,
    );

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
      source: 'posthog',
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
