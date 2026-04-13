import { NextRequest } from 'next/server';
import {
  v1Handler,
  parseDateParam,
  apiResponse,
  apiError,
} from '@/lib/api/v1-handler';
import { calculateFullEphemeris } from '@utils/astrology/ephemeris';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = v1Handler('starter', async (request: NextRequest) => {
  const date = parseDateParam(request);
  const params = new URL(request.url).searchParams;
  const lat = params.get('latitude');
  const lng = params.get('longitude');

  if (!lat || !lng) {
    return apiError(
      'Required query params: latitude, longitude. Optional: date (ISO)',
    );
  }

  const location = { latitude: Number(lat), longitude: Number(lng) };
  const ephemeris = calculateFullEphemeris(location, date);

  return apiResponse({
    date: date.toISOString().split('T')[0],
    location,
    sunMoon: {
      sunrise: ephemeris.sunMoon?.sunrise || null,
      sunset: ephemeris.sunMoon?.sunset || null,
      solarNoon: ephemeris.sunMoon?.solarNoon || null,
      moonrise: ephemeris.sunMoon?.moonrise || null,
      moonset: ephemeris.sunMoon?.moonset || null,
      dayLength: ephemeris.sunMoon?.dayLength || null,
      moonPhase: ephemeris.sunMoon?.moonPhase || null,
    },
    planets:
      ephemeris.planets?.map((p: any) => ({
        planet: p.body,
        sign: p.sign,
        constellation: p.constellation,
        distance: p.distance,
      })) || [],
  });
});
