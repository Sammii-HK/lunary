import { NextResponse } from 'next/server';
import { TAROT_SPREADS } from '@/constants/tarotSpreads';

export async function GET() {
  return NextResponse.json(TAROT_SPREADS, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
