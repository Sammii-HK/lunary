import { NextRequest } from 'next/server';
import { v1Handler, apiResponse, apiError } from '@/lib/api/v1-handler';
import {
  getCurrentDashaState,
  calculateDashaTimeline,
} from '@utils/astrology/vedic-dasha';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = v1Handler('developer', async (request: NextRequest) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body');
  }

  const { moonDegree, birthDate } = body;

  if (moonDegree === undefined || !birthDate) {
    return apiError('Required: moonDegree (0-360), birthDate (ISO)');
  }

  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) {
    return apiError('Invalid birthDate format');
  }

  const current = getCurrentDashaState(birth, Number(moonDegree));
  const timeline = calculateDashaTimeline(birth, Number(moonDegree));

  return apiResponse({
    current: current
      ? {
          mahadasha: current.mahadasha,
          antardasha: current.antardasha,
        }
      : null,
    timeline: timeline.map((p: any) => ({
      planet: p.planet,
      startDate: p.startDate?.toISOString?.() || null,
      endDate: p.endDate?.toISOString?.() || null,
      level: p.level || 'mahadasha',
    })),
  });
});
