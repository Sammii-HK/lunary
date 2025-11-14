import { NextRequest, NextResponse } from 'next/server';

import { cacheTransits } from '@/lib/ai/transit-cache';
import { getCurrentTransits } from '@/lib/ai/providers';

type TransitRequest = {
  userId?: string;
  cacheKey?: string;
};

const jsonResponse = (payload: unknown, status = 200) =>
  NextResponse.json(payload, { status });

const isAuthorised = (request: NextRequest): boolean => {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (isVercelCron) return true;

  const header = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    return true;
  }

  return header === `Bearer ${process.env.CRON_SECRET}`;
};

export async function POST(request: NextRequest) {
  if (!isAuthorised(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as TransitRequest;
    const userId = body.userId ?? 'system';
    const now = new Date();

    const data = await getCurrentTransits({ userId, now });
    const cacheKey =
      body.cacheKey ?? `${userId}:${now.toISOString().split('T')[0]}`;

    const record = cacheTransits(cacheKey, data);

    return jsonResponse({
      ok: true,
      cacheKey: record.key,
      cachedAt: record.cachedAt,
      transits: record.payload.transits.length,
    });
  } catch (error) {
    console.error('[AI Transits] Failed to refresh cache', error);
    return jsonResponse({ error: 'Failed to refresh transits' }, 500);
  }
}
