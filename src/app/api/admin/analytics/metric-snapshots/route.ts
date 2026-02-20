import { NextRequest, NextResponse } from 'next/server';
import {
  getMetricSnapshots,
  type MetricSnapshot,
} from '@/lib/analytics/metric-snapshots';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const periodType = searchParams.get('type') as
      | 'weekly'
      | 'monthly'
      | 'both'
      | null;
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '24', 10),
      100,
    );

    // type=both (or no type) returns both weekly + monthly in one call
    if (!periodType || periodType === 'both') {
      const [weekly, monthly] = await Promise.all([
        getMetricSnapshots('weekly', limit),
        getMetricSnapshots('monthly', limit),
      ]);
      const response = NextResponse.json({ weekly, monthly });
      response.headers.set(
        'Cache-Control',
        `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
      );
      return response;
    }

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
