import { NextRequest } from 'next/server';
import { v1Handler, parseDateParam, apiResponse } from '@/lib/api/v1-handler';
import { getUpcomingEclipses } from '@utils/astrology/eclipseTracker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = v1Handler('starter', async (request: NextRequest) => {
  const date = parseDateParam(request);
  const months = Number(new URL(request.url).searchParams.get('months')) || 6;

  const eclipses = getUpcomingEclipses(date, Math.min(months, 24));

  return apiResponse({
    from: date.toISOString().split('T')[0],
    months: Math.min(months, 24),
    eclipses: eclipses.map((e) => ({
      type: e.type,
      kind: e.kind,
      sign: e.sign,
      degree: e.degree,
      date: e.date?.toISOString?.() || null,
      daysAway: e.daysAway,
    })),
  });
});
