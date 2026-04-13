import { NextRequest } from 'next/server';
import { v1Handler, parseDateParam, apiResponse } from '@/lib/api/v1-handler';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '@utils/astrology/cosmic-og';
import { getZodiacSign } from '@utils/astrology/astronomical-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = v1Handler('free', async (request: NextRequest) => {
  const date = parseDateParam(request);
  const positions = getRealPlanetaryPositions(date);
  const moonPhase = getAccurateMoonPhase(date);
  const moonSign = getZodiacSign(positions.moon?.longitude || 0);

  return apiResponse({
    date: date.toISOString().split('T')[0],
    phase: moonPhase.name,
    illumination: Math.round(moonPhase.illumination * 100),
    sign: moonSign,
    age: moonPhase.age,
    trend: moonPhase.illumination > 0.5 ? 'waning' : 'waxing',
  });
});
