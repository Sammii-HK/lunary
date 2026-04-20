import { NextRequest, NextResponse } from 'next/server';
import {
  buildPublicHoroscopeResponse,
  normalizeZodiacSign,
} from '@/lib/horoscope/public-horoscope';
import { requireGptAuth } from '@/lib/gptAuth';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';
export const revalidate = 86400; // minimum revalidation window (daily type)

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const signParam = searchParams.get('sign')?.toLowerCase();
    const dateParam = searchParams.get('date');
    const typeParam = searchParams.get('type') || 'daily';

    const sign = normalizeZodiacSign(signParam);
    if (!sign) {
      return NextResponse.json(
        {
          error: 'Valid zodiac sign required',
          validSigns: [
            'aries',
            'taurus',
            'gemini',
            'cancer',
            'leo',
            'virgo',
            'libra',
            'scorpio',
            'sagittarius',
            'capricorn',
            'aquarius',
            'pisces',
          ],
        },
        { status: 400 },
      );
    }

    const today = dateParam ? new Date(dateParam) : new Date();
    const response = buildPublicHoroscopeResponse(
      sign,
      typeParam === 'weekly' ? 'weekly' : 'daily',
      today,
    );

    // Daily: 1 day cache, Weekly: 7 day cache
    const cacheMaxAge = typeParam === 'weekly' ? 604800 : 86400;
    const staleWhileRevalidate = typeParam === 'weekly' ? 86400 : 3600;

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      },
    });
  } catch (error) {
    console.error('GPT horoscope error:', error);
    return NextResponse.json(
      { error: 'Failed to generate horoscope' },
      { status: 500 },
    );
  }
}
