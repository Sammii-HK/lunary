import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
  checkSignIngress,
  checkRetrogradeEvents,
  checkSeasonalEvents,
} from '../../../../../utils/astrology/cosmic-og';
import { Observer } from 'astronomy-engine';
import dayjs from 'dayjs';

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

export const revalidate = 86400;

interface YearlyForecast {
  year: number;
  majorTransits: Array<{
    date: string;
    event: string;
    description: string;
    significance: string;
  }>;
  eclipses: Array<{
    date: string;
    type: 'solar' | 'lunar';
    sign: string;
    description: string;
  }>;
  retrogrades: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  keyAspects: Array<{
    date: string;
    aspect: string;
    planets: string[];
    description: string;
  }>;
  summary: string;
}

function calculateEclipses(year: number): YearlyForecast['eclipses'] {
  const eclipses: YearlyForecast['eclipses'] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const moonPhase = getAccurateMoonPhase(currentDate);
    const positions = getRealPlanetaryPositions(currentDate, DEFAULT_OBSERVER);

    if (
      moonPhase.isSignificant &&
      (moonPhase.name === 'New Moon' || moonPhase.name === 'Full Moon')
    ) {
      eclipses.push({
        date: currentDate.toISOString().split('T')[0],
        type: moonPhase.name === 'New Moon' ? 'solar' : 'lunar',
        sign: positions.moon?.sign || 'Unknown',
        description: `${moonPhase.name === 'New Moon' ? 'Solar' : 'Lunar'} Eclipse in ${positions.moon?.sign || 'Unknown'} - ${moonPhase.energy || 'A powerful cosmic event'}`,
      });
    }

    currentDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  }

  return eclipses.slice(0, 6);
}

async function generateYearlyForecast(
  year: number,
  userBirthday?: string,
): Promise<YearlyForecast> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const majorTransits: YearlyForecast['majorTransits'] = [];
  const retrogrades: YearlyForecast['retrogrades'] = [];
  const keyAspects: YearlyForecast['keyAspects'] = [];

  let currentDate = new Date(startDate);
  const checkedDates = new Set<string>();

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];

    if (checkedDates.has(dateStr)) {
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      continue;
    }
    checkedDates.add(dateStr);

    const positions = getRealPlanetaryPositions(currentDate, DEFAULT_OBSERVER);
    const aspects = calculateRealAspects(positions);
    const ingresses = checkSignIngress(positions, currentDate);
    const retrogradeEvents = checkRetrogradeEvents(positions);

    retrogradeEvents.forEach((event) => {
      if (
        event.type === 'starts' &&
        !retrogrades.find(
          (r) => r.planet === event.planet && r.startDate === dateStr,
        )
      ) {
        retrogrades.push({
          planet: event.planet || 'Unknown',
          startDate: dateStr,
          endDate: '',
          description: `${event.planet} retrograde begins`,
        });
      }
    });

    aspects
      .filter((a) => a.priority >= 8)
      .forEach((aspect) => {
        keyAspects.push({
          date: dateStr,
          aspect: aspect.aspect || '',
          planets: [aspect.planet1 || '', aspect.planet2 || ''],
          description: aspect.description || '',
        });

        majorTransits.push({
          date: dateStr,
          event: aspect.aspect || '',
          description: aspect.description || '',
          significance: `Major ${aspect.aspect} between ${aspect.planet1} and ${aspect.planet2}`,
        });
      });

    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const eclipses = calculateEclipses(year);

  const summary = `Your ${year} cosmic forecast reveals ${majorTransits.length} major planetary transits, ${retrogrades.length} planetary retrogrades, ${eclipses.length} eclipses, and ${keyAspects.length} significant aspects. This year brings transformative energies and opportunities for growth.`;

  return {
    year,
    majorTransits: majorTransits.slice(0, 20),
    eclipses,
    retrogrades: retrogrades.slice(0, 10),
    keyAspects: keyAspects.slice(0, 20),
    summary,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear() + 1;

    if (!year || year < 2025 || year > 2100) {
      return NextResponse.json(
        { error: 'Valid year required (2025-2100)' },
        { status: 400 },
      );
    }

    const subscriptionResult = await sql`
      SELECT plan_type, status
      FROM subscriptions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const subscription = subscriptionResult.rows[0];
    const subscriptionStatus = subscription?.status || 'free';
    const planType = normalizePlanType(subscription?.plan_type);

    if (!hasFeatureAccess(subscriptionStatus, planType, 'yearly_forecast')) {
      return NextResponse.json(
        {
          error:
            'Yearly cosmic forecast is available for Lunary+ AI Annual subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const userProfileResult = await sql`
      SELECT birthday
      FROM accounts
      WHERE id = ${userId}
      LIMIT 1
    `;

    const userBirthday = userProfileResult.rows[0]?.birthday || undefined;

    const forecast = await generateYearlyForecast(year, userBirthday);

    return NextResponse.json(
      { success: true, forecast },
      {
        headers: {
          'Cache-Control':
            'private, s-maxage=86400, stale-while-revalidate=43200',
        },
      },
    );
  } catch (error) {
    console.error('Failed to generate yearly forecast:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please sign in to access yearly forecast' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to generate yearly forecast' },
      { status: 500 },
    );
  }
}
