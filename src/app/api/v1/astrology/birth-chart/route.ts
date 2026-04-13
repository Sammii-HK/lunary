import { NextRequest } from 'next/server';
import { v1Handler, apiResponse, apiError } from '@/lib/api/v1-handler';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = v1Handler('starter', async (request: NextRequest) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { birthDate, birthTime, latitude, longitude, houseSystem } = body;

  if (!birthDate) {
    return apiError(
      'Required: birthDate (ISO). Optional: birthTime (HH:MM), latitude, longitude, houseSystem',
    );
  }

  const chart = await generateBirthChartWithHouses(
    birthDate,
    birthTime || undefined,
    latitude && longitude ? `${latitude},${longitude}` : undefined,
  );

  return apiResponse({
    birthDate,
    birthTime: birthTime || null,
    houseSystem: houseSystem || 'placidus',
    planets: (chart as any).planets || [],
    houses: (chart as any).houses || [],
  });
});
