import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { buildSixWord, type TopTransit } from '@/lib/six-word/build';
import { findNextHit } from '@/lib/live-transits/find-next';
import { getRealPlanetaryPositions } from '../../../../../utils/astrology/astronomical-data';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function toNatalChart(value: unknown): BirthChartData[] {
  return Array.isArray(value)
    ? (value as BirthChartData[]).filter(
        (p) =>
          p &&
          typeof p.body === 'string' &&
          typeof p.eclipticLongitude === 'number',
      )
    : [];
}

function toCurrentSky(
  positions: ReturnType<typeof getRealPlanetaryPositions>,
): Record<string, { longitude: number; sign?: string; retrograde?: boolean }> {
  const sky: Record<
    string,
    { longitude: number; sign?: string; retrograde?: boolean }
  > = {};
  for (const [body, payload] of Object.entries(positions)) {
    if (!payload || typeof payload.longitude !== 'number') continue;
    sky[body] = {
      longitude: payload.longitude,
      sign: payload.sign,
      retrograde: Boolean(payload.retrograde),
    };
  }
  return sky;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const todayUTC = new Date().toISOString().slice(0, 10);

    const profileResult = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;
    const natalChart = toNatalChart(profileResult.rows[0]?.birth_chart);

    if (natalChart.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'no_birth_chart',
          message: 'Add your birthday to unlock your six-word horoscope.',
        },
        { status: 400 },
      );
    }

    const positions = getRealPlanetaryPositions(new Date());
    const currentSky = toCurrentSky(positions);
    const nextHit = findNextHit({
      natalChart,
      currentSky,
      withinDays: 1,
    });
    const topTransit: TopTransit | null = nextHit
      ? {
          transitPlanet: nextHit.transitPlanet,
          natalPlanet: nextHit.natalPlanet,
          aspect: nextHit.aspect,
        }
      : null;

    const result = buildSixWord({
      userId: user.id,
      dateUTC: todayUTC,
      natalChart,
      currentSky,
      topTransit,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=10800, max-age=0',
        },
      },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[six-word/today] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to build six-word horoscope' },
      { status: 500 },
    );
  }
}
