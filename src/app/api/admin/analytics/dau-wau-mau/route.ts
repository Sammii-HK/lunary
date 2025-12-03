import { NextRequest, NextResponse } from 'next/server';
import {
  getPostHogActiveUsers,
  getPostHogRetention,
} from '@/lib/posthog-server';

export async function GET(request: NextRequest) {
  try {
    const [posthogData, retentionData] = await Promise.all([
      getPostHogActiveUsers(),
      getPostHogRetention(),
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

    const churnRate = retentionData
      ? Number((100 - retentionData.day30).toFixed(2))
      : null;

    const returningUsers =
      posthogData.wau > 0 && posthogData.dau > 0
        ? Math.round(posthogData.wau - posthogData.dau * 0.5)
        : 0;

    return NextResponse.json({
      dau: posthogData.dau,
      wau: posthogData.wau,
      mau: posthogData.mau,
      returning_users: returningUsers,
      retention,
      churn_rate: churnRate,
      trends: [],
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
