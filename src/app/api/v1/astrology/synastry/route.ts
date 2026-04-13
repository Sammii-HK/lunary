import { NextRequest } from 'next/server';
import { v1Handler, apiResponse, apiError } from '@/lib/api/v1-handler';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { calculateSynastry } from '@utils/astrology/synastry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = v1Handler('developer', async (request: NextRequest) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { personA, personB } = body;

  if (!personA?.birthDate) {
    return apiError('Required: personA.birthDate');
  }
  if (!personB?.birthDate) {
    return apiError('Required: personB.birthDate');
  }

  const chartA = await generateBirthChartWithHouses(
    personA.birthDate,
    personA.birthTime || undefined,
    personA.latitude && personA.longitude
      ? `${personA.latitude},${personA.longitude}`
      : undefined,
  );
  const chartB = await generateBirthChartWithHouses(
    personB.birthDate,
    personB.birthTime || undefined,
    personB.latitude && personB.longitude
      ? `${personB.latitude},${personB.longitude}`
      : undefined,
  );

  const synastry = calculateSynastry(chartA as any, chartB as any);

  return apiResponse({
    compatibilityScore: synastry.compatibilityScore,
    aspects:
      synastry.aspects?.map((a: any) => ({
        personAPlanet: a.personAPlanet || a.planet1,
        personBPlanet: a.personBPlanet || a.planet2,
        aspect: a.aspectType || a.aspect,
        orb: Math.round((a.orb || 0) * 100) / 100,
        nature: a.nature || 'neutral',
      })) || [],
    strengths: synastry.strengths || [],
    challenges: synastry.challenges || [],
    summary: synastry.summary || '',
  });
});
