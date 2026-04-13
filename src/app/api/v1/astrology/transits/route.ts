import { NextRequest } from 'next/server';
import { v1Handler, parseDateParam, apiResponse } from '@/lib/api/v1-handler';
import { getUpcomingTransits } from '@utils/astrology/transitCalendar';
import dayjs from 'dayjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = v1Handler('developer', async (request: NextRequest) => {
  const date = parseDateParam(request);

  const transits = getUpcomingTransits(dayjs(date));

  return apiResponse({
    date: date.toISOString().split('T')[0],
    count: transits.length,
    transits: transits.map((t: any) => ({
      type: t.type,
      planet: t.planet,
      sign: t.sign || t.toSign || null,
      description: t.description || t.title || '',
      date: t.date?.toISOString?.() || t.date?.format?.('YYYY-MM-DD') || null,
      significance: t.significance || 'medium',
    })),
  });
});
