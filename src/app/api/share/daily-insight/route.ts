import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGeneralCrystalRecommendation } from '../../../../../utils/crystals/generalCrystals';
import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import { getGeneralTarotReading } from '../../../../../utils/tarot/generalTarot';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/cosmic-og';

export async function GET(request: NextRequest) {
  try {
    let isPersonalized = false;
    let userName: string | null = null;

    const cookieHeader = request.headers.get('cookie') || '';

    try {
      const sessionResponse = await auth.api.getSession({
        headers: new Headers({ cookie: cookieHeader }),
      });

      if (sessionResponse?.user) {
        isPersonalized = true;
        userName = sessionResponse.user.name || null;
      }
    } catch {}

    const today = new Date();
    const positions = getRealPlanetaryPositions(today);
    const moonPhase = getAccurateMoonPhase(today);
    const crystalRec = getGeneralCrystalRecommendation(today);
    const horoscope = getGeneralHoroscope(today);
    const tarotReading = getGeneralTarotReading();

    const transit = horoscope.moonPhase
      ? `${moonPhase.name} in ${positions.Moon?.sign || 'Aries'} — ${moonPhase.energy}`
      : '';

    const insight = horoscope.reading.split('.').slice(0, 2).join('.') + '.';

    const firstName = userName ? userName.split(' ')[0] : '';

    const ogParams = new URLSearchParams({
      tarot: tarotReading.daily.name,
      tarotKeywords: tarotReading.daily.keywords.slice(0, 3).join(' • '),
      crystal: crystalRec.name,
      insight: insight.substring(0, 200),
      personalized: isPersonalized ? 'true' : 'false',
      name: firstName,
    });

    const ogImageUrl = `/api/og/daily-insight?${ogParams.toString()}`;

    return NextResponse.json({
      success: true,
      card: {
        date: today.toISOString(),
        moonPhase: moonPhase.name,
        moonSign: positions.Moon?.sign || 'Aries',
        moonEmoji: moonPhase.emoji,
        planets: Object.entries(positions).map(
          ([name, data]: [string, any]) => ({
            name,
            sign: data.sign,
            retrograde: data.retrograde,
          }),
        ),
        tarot: {
          name: tarotReading.daily.name,
          keywords: tarotReading.daily.keywords,
        },
        crystal: {
          name: crystalRec.name,
          reason: crystalRec.reason,
        },
        transit,
        insight,
        isPersonalized,
        userName,
        ogImageUrl,
      },
    });
  } catch (error) {
    console.error('[share/daily-insight] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily insight card' },
      { status: 500 },
    );
  }
}
