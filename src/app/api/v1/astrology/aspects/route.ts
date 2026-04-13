import { NextRequest } from 'next/server';
import { v1Handler, parseDateParam, apiResponse } from '@/lib/api/v1-handler';
import { getRealPlanetaryPositions } from '@utils/astrology/cosmic-og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ASPECT_TYPES = [
  { name: 'conjunction', angle: 0, orb: 8, glyph: '\u260c' },
  { name: 'sextile', angle: 60, orb: 6, glyph: '\u26b9' },
  { name: 'square', angle: 90, orb: 8, glyph: '\u25a1' },
  { name: 'trine', angle: 120, orb: 8, glyph: '\u25b3' },
  { name: 'opposition', angle: 180, orb: 8, glyph: '\u2609' },
];

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
];

export const GET = v1Handler('free', async (request: NextRequest) => {
  const date = parseDateParam(request);
  const positions = getRealPlanetaryPositions(date);

  const aspects: {
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    exact: boolean;
  }[] = [];

  for (let i = 0; i < PLANET_NAMES.length; i++) {
    for (let j = i + 1; j < PLANET_NAMES.length; j++) {
      const p1 = positions[PLANET_NAMES[i]];
      const p2 = positions[PLANET_NAMES[j]];
      if (!p1 || !p2) continue;

      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of ASPECT_TYPES) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: PLANET_NAMES[i],
            planet2: PLANET_NAMES[j],
            aspect: aspectType.name,
            orb: Math.round(orb * 100) / 100,
            exact: orb < 1,
          });
        }
      }
    }
  }

  aspects.sort((a, b) => a.orb - b.orb);

  return apiResponse({
    date: date.toISOString().split('T')[0],
    count: aspects.length,
    aspects,
  });
});
