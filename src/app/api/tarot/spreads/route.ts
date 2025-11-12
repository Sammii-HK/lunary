import { NextResponse } from 'next/server';
import { TAROT_SPREADS } from '@/constants/tarotSpreads';

export async function GET() {
  return NextResponse.json({
    spreads: TAROT_SPREADS,
  });
}
