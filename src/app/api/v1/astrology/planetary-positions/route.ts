import { NextRequest } from 'next/server';
import { v1Handler, parseDateParam, apiResponse } from '@/lib/api/v1-handler';
import {
  getRealPlanetaryPositions,
  getDegreeInSign,
  getMinutesInDegree,
  getZodiacSign,
} from '@utils/astrology/astronomical-data';
import { calculateTransitDuration } from '@utils/astrology/transit-duration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLANET_NAMES = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;

export const GET = v1Handler('free', async (request: NextRequest) => {
  const date = parseDateParam(request);
  const positions = getRealPlanetaryPositions(date);

  const planets = PLANET_NAMES.map((name) => {
    const pos = positions[name];
    if (!pos) return null;

    const sign = getZodiacSign(pos.longitude);
    const degree = getDegreeInSign(pos.longitude);
    const minutes = getMinutesInDegree(pos.longitude);
    const transit = calculateTransitDuration(
      name,
      sign,
      pos.longitude,
      date,
      pos.dailyMotion,
      pos.retrograde,
    );

    return {
      planet: name,
      longitude: Math.round(pos.longitude * 1000) / 1000,
      sign,
      degree,
      minutes,
      retrograde: pos.retrograde || false,
      transit: transit
        ? {
            totalDays: transit.totalDays,
            remainingDays: transit.remainingDays,
            display: transit.displayText,
          }
        : null,
    };
  }).filter(Boolean);

  return apiResponse({
    date: date.toISOString().split('T')[0],
    planets,
  });
});
