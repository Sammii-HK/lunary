import { NextRequest, NextResponse } from 'next/server';
import { getPostHogFeatureUsage } from '@/lib/posthog-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('days') || '7', 10);

    const featureUsage = await getPostHogFeatureUsage(daysBack);

    if (!featureUsage) {
      return NextResponse.json(
        {
          features: [],
          heatmap: [],
          error:
            'PostHog API not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID environment variables.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      features: featureUsage.features,
      heatmap: featureUsage.heatmap,
      source: 'posthog',
    });
  } catch (error) {
    console.error('[analytics/feature-usage] Failed to load metrics', error);
    return NextResponse.json(
      {
        features: [],
        heatmap: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
