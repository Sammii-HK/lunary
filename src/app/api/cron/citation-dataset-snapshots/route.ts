import { NextRequest, NextResponse } from 'next/server';
import {
  parseUtcDateKey,
  toUtcDateKey,
  upsertCurrentSkySnapshot,
} from '@/lib/seo/citation-snapshot-store';
import { isIndexNowConfigured, submitIndexNowUrls } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

const MAX_BACKFILL_DAYS = 31;

function isAuthorized(request: NextRequest) {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const authHeader = request.headers.get('authorization');

  return (
    isVercelCron ||
    (!!process.env.CRON_SECRET &&
      authHeader === `Bearer ${process.env.CRON_SECRET}`)
  );
}

function dateMinusUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date');
  const daysParam = Number(searchParams.get('days') ?? 1);
  const days = Number.isFinite(daysParam)
    ? Math.max(1, Math.min(Math.floor(daysParam), MAX_BACKFILL_DAYS))
    : 1;

  const startDate = requestedDate ? parseUtcDateKey(requestedDate) : new Date();

  if (!startDate) {
    return NextResponse.json(
      { error: 'Invalid date. Use YYYY-MM-DD in UTC.' },
      { status: 400 },
    );
  }

  const snapshots = [];

  for (let offset = 0; offset < days; offset += 1) {
    const targetDate = dateMinusUtcDays(startDate, offset);
    const snapshot = await upsertCurrentSkySnapshot(targetDate);
    snapshots.push({
      date: snapshot.snapshotDate,
      version: snapshot.version,
      url: `https://lunary.app/grimoire/datasets/current-sky/${snapshot.snapshotDate}`,
      generatedAt: snapshot.generatedAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  let indexNow: null | {
    ok: boolean;
    submitted?: string[];
    error?: string;
  } = null;

  if (isIndexNowConfigured()) {
    const currentYear = new Date().getUTCFullYear();
    const urls = [
      'https://lunary.app/grimoire/datasets',
      'https://lunary.app/grimoire/datasets/current-sky',
      'https://lunary.app/grimoire/datasets/current-sky-facts.json',
      `https://lunary.app/grimoire/datasets/astrology-calendar/${currentYear}.json`,
      `https://lunary.app/grimoire/datasets/astrology-calendar/${currentYear + 1}.json`,
      'https://lunary.app/grimoire/facts/moon-phase-today',
      'https://lunary.app/grimoire/facts/current-moon-sign',
      'https://lunary.app/grimoire/facts/planetary-positions-today',
      'https://lunary.app/grimoire/facts/mercury-retrograde-status',
      'https://lunary.app/grimoire/facts/next-full-moon',
      'https://lunary.app/grimoire/facts/next-new-moon',
      'https://lunary.app/grimoire/facts/next-eclipse',
      'https://lunary.app/grimoire/facts/next-mercury-retrograde',
      'https://lunary.app/sitemap-datasets.xml',
      ...snapshots.map((snapshot) => snapshot.url),
    ];

    try {
      const result = await submitIndexNowUrls(urls);
      indexNow = {
        ok: true,
        submitted: result.submitted,
      };
    } catch (error) {
      console.error('[citation-dataset-snapshots] IndexNow failed', error);
      indexNow = {
        ok: false,
        error:
          error instanceof Error ? error.message : 'IndexNow submission failed',
      };
    }
  }

  return NextResponse.json({
    ok: true,
    datasetKey: 'current-sky',
    startDate: toUtcDateKey(startDate),
    days,
    snapshots,
    indexNow,
  });
}
