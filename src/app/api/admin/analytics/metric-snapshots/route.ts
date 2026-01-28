import { NextRequest, NextResponse } from 'next/server';
import {
  getMetricSnapshots,
  type MetricSnapshot,
} from '@/lib/analytics/metric-snapshots';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodType = (searchParams.get('type') || 'weekly') as
      | 'weekly'
      | 'monthly';
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '24', 10),
      100,
    );

    const snapshots: MetricSnapshot[] = await getMetricSnapshots(
      periodType,
      limit,
    );

    const response = NextResponse.json({ snapshots });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error: any) {
    console.error('[Metric Snapshots API] Failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch snapshots' },
      { status: 500 },
    );
  }
}
