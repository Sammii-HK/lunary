import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { type HouseSystem } from '@utils/astrology/houseSystems';

const HOUSE_SYSTEMS = [
  'whole-sign',
  'placidus',
  'koch',
  'porphyry',
  'alcabitius',
] as const;

/**
 * GET /api/profile/birth-chart/houses
 * Fetch all 5 house systems in a single call
 * Returns: { placidus: HouseCusp[], koch: HouseCusp[], ... }
 * Cached on client to minimize API calls
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Get user's birth chart data from profile
    const profile = await db.query.userProfiles.findFirst({
      where: (fields) => ({
        userId: user.id,
      }),
      columns: {
        birthChart: true,
        birthDate: true,
        birthTime: true,
        birthLocation: true,
        birthTimezone: true,
      },
    });

    if (!profile?.birthChart) {
      return NextResponse.json(
        { error: 'No birth chart found for user' },
        { status: 404 },
      );
    }

    // Find Ascendant and MC from existing chart
    const planets = profile.birthChart as Array<{
      body: string;
      eclipticLongitude: number;
    }>;
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
          profile.birthDate || '',
          profile.birthTime,
          profile.birthLocation,
          profile.birthTimezone,
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
