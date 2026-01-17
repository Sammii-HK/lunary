import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getFeatureAdoption } from '@/lib/analytics/kpis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const adoption = await getFeatureAdoption(range);
    return NextResponse.json({ source: 'database', range, ...adoption });
  } catch (error) {
    console.error('[analytics/feature-adoption] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
