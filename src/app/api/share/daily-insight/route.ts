import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { getGeneralCrystalRecommendation } from '../../../../../utils/crystals/generalCrystals';
import {
  calculateCrystalRecommendation,
  getCrystalGuidance,
} from '../../../../../utils/crystals/personalizedCrystals';
import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import { getGeneralTarotReading } from '../../../../../utils/tarot/generalTarot';
import { getTarotCard } from '../../../../../utils/tarot/tarot';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(utc);
dayjs.extend(dayOfYear);
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/cosmic-og';

export async function GET(request: NextRequest) {
  try {
    let isPersonalized = false;
    let userName: string | null = null;
    let userBirthday: string | undefined;

    const cookieHeader = request.headers.get('cookie') || '';

    try {
      const sessionResponse = await auth.api.getSession({
        headers: new Headers({ cookie: cookieHeader }),
      });

      if (sessionResponse?.user) {
        isPersonalized = true;
        userName = sessionResponse.user.name || null;

        const userId = sessionResponse.user.id;

        try {
          const result = await sql`
            SELECT name, birthday, birth_chart
            FROM user_profiles
            WHERE user_id = ${userId}
            LIMIT 1
          `;
          if (result.rows.length > 0) {
            const row = result.rows[0];
            if (row.birthday) {
              userBirthday = row.birthday;
            }
            if (row.name && !userName) {
              userName = row.name;
            }
          }
        } catch (e: any) {
          if (e?.code !== '42P01') {
            console.error('[share/daily-insight] Error getting user data:', e);
          }
        }
      }
    } catch {}

    const today = new Date();
    const positions = getRealPlanetaryPositions(today);
    const moonPhase = getAccurateMoonPhase(today);
    const horoscope = getGeneralHoroscope(today);

    let tarotName: string;
    let tarotKeywords: string[];
    let crystalName: string;
    let crystalReason: string;

    console.log(
      '[share/daily-insight] userBirthday:',
      userBirthday,
      'userName:',
      userName,
    );

    const dateStr = dayjs(today).format('YYYY-MM-DD');

    if (userName && userBirthday) {
      const card = getTarotCard(`daily-${dateStr}`, userName, userBirthday);
      tarotName = card.name;
      tarotKeywords = card.keywords?.slice(0, 3) || [];

      const currentTransits = Object.entries(positions).map(
        ([body, data]: [string, any]) => ({
          body,
          sign: data.sign,
          eclipticLongitude: data.longitude || 0,
          retrograde: data.retrograde,
        }),
      );

      const mockBirthChart = currentTransits.map((t) => ({
        body: t.body,
        sign: t.sign,
        eclipticLongitude: t.eclipticLongitude,
      }));

      const { crystal, reasons } = calculateCrystalRecommendation(
        mockBirthChart,
        currentTransits,
        today,
        userBirthday,
      );

      const sunSign =
        mockBirthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
      crystalName = crystal.name;
      crystalReason = getCrystalGuidance(crystal, reasons, sunSign);
    } else {
      const nowUtc = dayjs(today).utc();
      const dayOfYearUtc = nowUtc.dayOfYear();
      const generalSeed = `cosmic-${nowUtc.format('YYYY-MM-DD')}-${dayOfYearUtc}-energy`;
      const card = getTarotCard(generalSeed);
      tarotName = card.name;
      tarotKeywords = card.keywords?.slice(0, 3) || [];

      const generalCrystal = getGeneralCrystalRecommendation(today);
      crystalName = generalCrystal.name;
      crystalReason = generalCrystal.reason;
    }

    const transit = horoscope.moonPhase
      ? `${moonPhase.name} in ${positions.Moon?.sign || 'Aries'} — ${moonPhase.energy}`
      : '';

    const insight = horoscope.reading.split('.').slice(0, 2).join('.') + '.';

    const firstName = userName ? userName.split(' ')[0] : '';

    const ogParams = new URLSearchParams({
      tarot: tarotName,
      tarotKeywords: tarotKeywords.slice(0, 3).join(' • '),
      crystal: crystalName,
      crystalReason: crystalReason.substring(0, 100),
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
          name: tarotName,
          keywords: tarotKeywords,
        },
        crystal: {
          name: crystalName,
          reason: crystalReason,
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
