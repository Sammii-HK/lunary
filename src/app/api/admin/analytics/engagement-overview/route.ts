import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getEngagementOverview } from '@/lib/analytics/kpis';

const familyToEventType = (
  family: string | null,
): 'app_opened' | 'product_opened' | 'grimoire_viewed' => {
  switch (family) {
    case 'product':
      return 'product_opened';
    case 'grimoire':
      return 'grimoire_viewed';
    case 'site':
      return 'app_opened';
    default:
      return 'app_opened';
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const includeAudit = searchParams.get('debug') === '1';
    const family = searchParams.get('family');
    const eventType = familyToEventType(family);

    const overview = await getEngagementOverview(range, {
      includeAudit,
      eventType,
    });
    return NextResponse.json({
      source: 'database',
      family: family ?? 'site',
      event_type: eventType,
      range,
      ...overview,
    });
  } catch (error) {
    console.error('[analytics/engagement-overview] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
