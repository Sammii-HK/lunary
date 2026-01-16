import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getEngagementOverview } from '@/lib/analytics/kpis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const overview = await getEngagementOverview(range);
    return NextResponse.json({ source: 'database', range, ...overview });
  } catch (error) {
    console.error('[analytics/engagement-overview] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
