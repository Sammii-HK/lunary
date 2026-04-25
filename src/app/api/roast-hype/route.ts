/**
 * GET /api/roast-hype?mode=roast|hype
 *
 * Returns a 3-line chart-aware roast or hype reading for the authenticated
 * user. Pure template lookup over the natal chart + current sky — no LLM,
 * no per-tap cost. Cache `private, s-maxage=21600` (6h) so each tap can
 * surface a fresh-feeling combination across the day without hammering the
 * ephemeris.
 *
 * Auth pattern follows `src/app/api/journal/route.ts` (better-auth via
 * `requireUser`). Natal chart is read from `user_profiles.birth_chart`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { requireUser } from '@/lib/ai/auth';
import { buildRoastHype, type RoastHypeMode } from '@/lib/roast-hype/build';
import type { CurrentSky } from '@/lib/live-transits/find-next';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';
import { getRealPlanetaryPositions } from '../../../../utils/astrology/astronomical-data';

export const dynamic = 'force-dynamic';

const ALLOWED_MODES: ReadonlySet<RoastHypeMode> = new Set(['roast', 'hype']);

const SKY_BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

function parseMode(raw: string | null): RoastHypeMode {
  if (raw && ALLOWED_MODES.has(raw as RoastHypeMode)) {
    return raw as RoastHypeMode;
  }
  return 'roast';
}

function snapshotSky(date: Date): CurrentSky | undefined {
  try {
    const positions = getRealPlanetaryPositions(date);
    const out: CurrentSky = {};
    for (const body of SKY_BODIES) {
      const p = positions[body];
      if (p && typeof p.longitude === 'number') {
        out[body] = { longitude: p.longitude, sign: p.sign };
      }
    }
    return out;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const mode = parseMode(searchParams.get('mode'));

    const profileRes = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const rawChart = profileRes.rows[0]?.birth_chart ?? null;
    const natal: BirthChartData[] = Array.isArray(rawChart)
      ? (rawChart as BirthChartData[])
      : Array.isArray(rawChart?.planets)
        ? (rawChart.planets as BirthChartData[])
        : [];

    if (natal.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No birth chart on file. Add your birth details to unlock this.',
          reason: 'no_birth_chart',
        },
        { status: 422 },
      );
    }

    const currentSky = snapshotSky(new Date());
    const reading = buildRoastHype({
      mode,
      natalChart: natal,
      currentSky,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        mode,
        ...reading,
      },
      {
        headers: {
          // Private — per-user response. 6h freshness keeps the reading
          // stable for repeat taps within a session but lets it drift
          // across the day as the seed and sky evolve.
          'Cache-Control': 'private, s-maxage=21600, max-age=21600',
        },
      },
    );
  } catch (error) {
    if ((error as Error)?.name === 'UnauthorizedError') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    // Avoid logging raw user-controlled values per CLAUDE.md guidance.
    console.error('[roast-hype] error', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to build reading' },
      { status: 500 },
    );
  }
}
