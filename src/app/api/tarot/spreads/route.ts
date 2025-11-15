import { NextResponse } from 'next/server';
import { TAROT_SPREADS } from '@/constants/tarotSpreads';

export const runtime = 'edge';
export const revalidate = 86400; // Cache static spreads data for 24 hours

export async function GET() {
  return NextResponse.json(
    {
      spreads: TAROT_SPREADS,
    },
    {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=43200, max-age=86400',
        'CDN-Cache-Control': 'public, s-maxage=86400',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=86400',
      },
    },
  );
}
