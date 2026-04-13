import { NextRequest } from 'next/server';
import { v1Handler, parseDateParam, apiResponse } from '@/lib/api/v1-handler';
import { getRealPlanetaryPositions } from '@utils/astrology/cosmic-og';
import { getZodiacSign } from '@utils/astrology/astronomical-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RETROGRADE_PLANETS = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

export const GET = v1Handler('free', async (request: NextRequest) => {
  const date = parseDateParam(request);
  const positions = getRealPlanetaryPositions(date);

  const retrogrades = RETROGRADE_PLANETS.filter(
    (p) => positions[p]?.retrograde,
  ).map((p) => ({
    planet: p,
    sign: getZodiacSign(positions[p].longitude),
  }));

  return apiResponse({
    date: date.toISOString().split('T')[0],
    retrogrades,
    retrogradeCount: retrogrades.length,
  });
});
