import { NextRequest, NextResponse } from 'next/server';
import {
  getRealPlanetaryPositions,
  getDegreeInSign,
  getMinutesInDegree,
  getZodiacSign,
} from '@utils/astrology/astronomical-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Internal session-friendly endpoint mirroring the public v1 route shape.
 *
 * The public `/api/v1/astrology/planetary-positions` requires an API key
 * (Bearer token). The authenticated app (e.g. Time Machine) doesn't have
 * one — it relies on the user's session — so it uses this route instead.
 *
 * Response is shaped `{ ok: true, data: { date, planets: [...] } }` to match
 * the v1 contract so callers can swap endpoints without changing parsing.
 */

// `getRealPlanetaryPositions` keys results by capitalized body name
// ("Sun", "Moon", ...). We expose the same lowercase shape as the public
// v1 endpoint for client compatibility.
const PLANETS = [
  { key: 'Sun', label: 'sun' },
  { key: 'Moon', label: 'moon' },
  { key: 'Mercury', label: 'mercury' },
  { key: 'Venus', label: 'venus' },
  { key: 'Mars', label: 'mars' },
  { key: 'Jupiter', label: 'jupiter' },
  { key: 'Saturn', label: 'saturn' },
  { key: 'Uranus', label: 'uranus' },
  { key: 'Neptune', label: 'neptune' },
  { key: 'Pluto', label: 'pluto' },
] as const;

function parseDateParam(request: NextRequest): Date {
  const dateParam = new URL(request.url).searchParams.get('date');
  if (!dateParam) return new Date();
  const parsed = new Date(dateParam);
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const date = parseDateParam(request);
    const positions = getRealPlanetaryPositions(date);

    const planets = PLANETS.map(({ key, label }) => {
      const pos = positions[key];
      if (!pos) return null;
      const sign = pos.sign ?? getZodiacSign(pos.longitude);
      const degree = pos.degree ?? getDegreeInSign(pos.longitude);
      const minutes = pos.minutes ?? getMinutesInDegree(pos.longitude);
      return {
        planet: label,
        longitude: Math.round(pos.longitude * 1000) / 1000,
        sign,
        degree,
        minutes,
        retrograde: pos.retrograde || false,
      };
    }).filter(Boolean);

    return NextResponse.json(
      {
        ok: true,
        data: {
          date: date.toISOString().split('T')[0],
          planets,
        },
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to load positions',
      },
      { status: 500 },
    );
  }
}
