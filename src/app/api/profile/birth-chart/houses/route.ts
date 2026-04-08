import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateBirthChartWithHouses } from '@/utils/astrology/birthChart';
import { type HouseSystem } from '@/utils/astrology/houseSystems';

const houseSystemSchema = z.enum([
  'whole-sign',
  'placidus',
  'koch',
  'porphyry',
  'alcabitius',
]);

const querySchema = z.object({
  system: houseSystemSchema.default('whole-sign'),
});

/**
 * GET /api/profile/birth-chart/houses
 * Recalculate birth chart houses for the specified system
 * Returns HouseCusp[] for the selected system
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = req.nextUrl.searchParams;
    const query = querySchema.parse({
      system: searchParams.get('system') || 'whole-sign',
    });

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

    // Generate houses for the specified system
    const result = await generateBirthChartWithHouses(
      profile.birthDate || '',
      profile.birthTime,
      profile.birthLocation,
      profile.birthTimezone,
      undefined,
      query.system as HouseSystem,
    );

    return NextResponse.json(result.houses, {
      headers: {
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[Birth Chart Houses]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid house system', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to calculate houses' },
      { status: 500 },
    );
  }
}
