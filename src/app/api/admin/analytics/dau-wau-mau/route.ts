import { NextRequest, NextResponse } from 'next/server';
import { getPostHogActiveUsers } from '@/lib/posthog-server';

export async function GET(request: NextRequest) {
  try {
    const posthogData = await getPostHogActiveUsers();

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

    return NextResponse.json({
      dau: posthogData.dau,
      wau: posthogData.wau,
      mau: posthogData.mau,
      returning_users: 0,
      retention: { day_1: 0, day_7: 0, day_30: 0 },
      churn_rate: null,
      trends: [],
      source: 'posthog',
      note: 'View detailed retention and trends in PostHog dashboard',
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
