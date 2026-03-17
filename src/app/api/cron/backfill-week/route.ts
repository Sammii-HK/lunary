import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Manual backfill endpoint: generates content for 7 consecutive days.
 *
 * Usage: /api/cron/backfill-week?startDate=2026-03-18
 *
 * Calls daily-posts, daily-threads, and daily-stories for each date.
 * Each cron's own dedup guards prevent duplicates, so safe to re-run.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const startDateParam = url.searchParams.get('startDate');
  const daysParam = url.searchParams.get('days');
  const days = daysParam ? Math.min(parseInt(daysParam, 10), 14) : 7;

  if (!startDateParam || !/^\d{4}-\d{2}-\d{2}$/.test(startDateParam)) {
    return NextResponse.json(
      { error: 'startDate required (YYYY-MM-DD)' },
      { status: 400 },
    );
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app'
  ).replace(/\/$/, '');

  const crons = [
    '/api/cron/daily-posts',
    '/api/cron/daily-threads',
    '/api/cron/daily-stories',
  ];

  const results: Record<
    string,
    Record<string, { success: boolean; skipped?: boolean; error?: string }>
  > = {};

  for (let i = 0; i < days; i++) {
    const date = new Date(startDateParam + 'T00:00:00Z');
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    results[dateStr] = {};

    for (const cronPath of crons) {
      const cronName = cronPath.split('/').pop()!;
      try {
        const cronUrl = `${baseUrl}${cronPath}?date=${dateStr}&force=true`;
        const res = await fetch(cronUrl, {
          headers: { Authorization: `Bearer ${cronSecret}` },
        });
        const data = await res.json();
        results[dateStr][cronName] = {
          success: data.success ?? false,
          ...(data.skipped ? { skipped: true } : {}),
        };
      } catch (error) {
        results[dateStr][cronName] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  }

  const totalDays = Object.keys(results).length;
  const successfulDays = Object.values(results).filter((day) =>
    Object.values(day).some((r) => r.success),
  ).length;

  return NextResponse.json({
    success: successfulDays > 0,
    message: `Backfilled ${successfulDays}/${totalDays} days`,
    startDate: startDateParam,
    days,
    results,
  });
}
