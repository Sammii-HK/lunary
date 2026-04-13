import { NextRequest } from 'next/server';
import { v1Handler, apiResponse, apiError } from '@/lib/api/v1-handler';
import { calculateProgressedChart } from '@utils/astrology/progressedChart';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = v1Handler('developer', async (request: NextRequest) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { birthDate, targetDate } = body;

  if (!birthDate) {
    return apiError(
      'Required: birthDate (ISO). Optional: targetDate (ISO, defaults to today)',
    );
  }

  const birth = new Date(birthDate);
  const target = targetDate ? new Date(targetDate) : new Date();

  if (isNaN(birth.getTime())) {
    return apiError('Invalid birthDate format');
  }

  const progressed = await calculateProgressedChart(birth, target);

  return apiResponse({
    birthDate: birth.toISOString().split('T')[0],
    targetDate: target.toISOString().split('T')[0],
    progressedSun: progressed.progressedSun,
    progressedMoon: progressed.progressedMoon,
    progressedMercury: progressed.progressedMercury || null,
    progressedVenus: progressed.progressedVenus || null,
    progressedMars: progressed.progressedMars || null,
  });
});
