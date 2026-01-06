import { NextRequest, NextResponse } from 'next/server';
import {
  getPostHogActiveUsers,
  getPostHogRetention,
  getPostHogActiveUsersTrends,
} from '@/lib/posthog-server';
import { formatDate, resolveDateRange } from '@/lib/analytics/date-range';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = (searchParams.get('granularity') || 'day') as
      | 'day'
      | 'week'
      | 'month';
    const range = resolveDateRange(searchParams, 30);

    const [posthogData, retentionData, trendsData] = await Promise.all([
      getPostHogActiveUsers(range.end),
      getPostHogRetention(),
      getPostHogActiveUsersTrends(range.start, range.end, granularity),
    ]);

    if (!posthogData) {
      return NextResponse.json(
        {
          error:
            'PostHog API not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID environment variables.',
          dau: 0,
          wau: 0,
          mau: 0,
          returning_users: 0,
          retention: { day_1: 0, day_7: 0, day_30: 0 },
          churn_rate: null,
          trends: [],
          source: 'error',
        },
        { status: 503 },
      );
    }

    const retention = retentionData
      ? {
          day_1: Number(retentionData.day1.toFixed(2)),
          day_7: Number(retentionData.day7.toFixed(2)),
          day_30: Number(retentionData.day30.toFixed(2)),
        }
      : { day_1: 0, day_7: 0, day_30: 0 };

    // Churn rate: only calculate if we have valid day 30 retention data
    // Churn = users who didn't return = 100 - retention
    const churnRate =
      retentionData && retentionData.day30 > 0
        ? Number((100 - retentionData.day30).toFixed(2))
        : null;

    const returningUsers =
      posthogData.wau > 0 && posthogData.dau > 0
        ? Math.round(posthogData.wau - posthogData.dau * 0.5)
        : 0;

    const sortedTrends = [...(trendsData || [])].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    if (posthogData) {
      const lastDate = formatDate(range.end);
      const lastIndex = sortedTrends.findIndex(
        (trend) => trend.date === lastDate,
      );
      const wrappedSummary = {
        date: lastDate,
        ...posthogData,
      };
      if (lastIndex >= 0) {
        sortedTrends[lastIndex] = {
          ...sortedTrends[lastIndex],
          ...wrappedSummary,
        };
      } else {
        sortedTrends.push(wrappedSummary);
      }
    }

    return NextResponse.json({
      dau: posthogData.dau,
      wau: posthogData.wau,
      mau: posthogData.mau,
      returning_users: returningUsers,
      retention,
      churn_rate: churnRate,
      trends: sortedTrends,
      source: 'posthog',
    });
  } catch (error) {
    console.error('[analytics/dau-wau-mau] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
