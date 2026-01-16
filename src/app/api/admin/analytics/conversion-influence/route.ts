import { NextRequest, NextResponse } from 'next/server';
import { resolveDateRange } from '@/lib/analytics/date-range';
import { getConversionInfluence } from '@/lib/analytics/kpis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const influence = await getConversionInfluence(range);
    return NextResponse.json({ source: 'database', range, ...influence });
  } catch (error) {
    console.error('[analytics/conversion-influence] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
