import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { type HouseSystem } from '@utils/astrology/houseSystems';

const HOUSE_SYSTEMS = [
  'whole-sign',
  'placidus',
  'koch',
  'porphyry',
  'alcabitius',
] as const;

export const dynamic = 'force-dynamic';

/**
 * GET /api/profile/birth-chart/houses
 * Fetch all 5 house systems in a single call
 * Returns: { placidus: HouseCusp[], koch: HouseCusp[], ... }
 * Cached on client to minimize API calls
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's birth chart data from profile
    const result = await sql`
      SELECT birth_chart, birth_date, birth_time, birth_location, birth_timezone
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No birth chart found for user' },
        { status: 404 },
      );
    }

    const profile = result.rows[0] as {
      birth_chart?: Array<{
        body: string;
        eclipticLongitude: number;
      }>;
      birth_date?: string;
      birth_time?: string;
      birth_location?: string;
      birth_timezone?: string;
    };

    if (!profile?.birth_chart) {
      return NextResponse.json(
        { error: 'No birth chart found for user' },
        { status: 404 },
      );
    }

    // Find Ascendant and MC from existing chart
    const planets = profile.birth_chart;
    const ascendant = planets.find((p) => p.body === 'Ascendant');
    const mc = planets.find((p) => p.body === 'Midheaven');

    if (!ascendant || !mc) {
      return NextResponse.json(
        { error: 'Birth chart missing Ascendant or MC' },
        { status: 400 },
      );
    }

    // Generate all 5 house systems in parallel
    const allHouses = await Promise.all(
      HOUSE_SYSTEMS.map(async (system) => {
        const result = await generateBirthChartWithHouses(
          profile.birth_date || '',
          profile.birth_time,
          profile.birth_location,
          profile.birth_timezone,
          undefined,
          system as HouseSystem,
        );
        return { system, houses: result.houses };
      }),
    );

    // Return as single object: { placidus: [...], koch: [...], ... }
    const response = Object.fromEntries(
      allHouses.map(({ system, houses }) => [system, houses]),
    );

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[Birth Chart Houses]', error);
    return NextResponse.json(
      { error: 'Failed to calculate houses' },
      { status: 500 },
    );
  }
}
