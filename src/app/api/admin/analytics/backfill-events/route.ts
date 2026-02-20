import { NextRequest, NextResponse } from 'next/server';
import { runPostHogBackfill } from '@/lib/analytics/posthog-backfill';
import { requireAdminAuth } from '@/lib/admin-auth';

type Payload = {
  start_date?: string;
  end_date?: string;
  dry_run?: boolean;
  limit?: number;
};

function parseDate(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed;
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const body = (await request.json().catch(() => ({}))) as Payload;

  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setUTCDate(defaultStart.getUTCDate() - 30);

  const start = parseDate(body.start_date, defaultStart);
  const end = parseDate(body.end_date, now);
  const dryRun = body.dry_run === true;
  const limit =
    typeof body.limit === 'number' && body.limit > 0 ? body.limit : 5000;

  try {
    const counters = await runPostHogBackfill({
      start,
      end,
      dryRun,
      limit,
    });

    return NextResponse.json({
      success: true,
      start: start.toISOString(),
      end: end.toISOString(),
      ...counters,
      dry_run: dryRun,
    });
  } catch (error) {
    console.error('[analytics/backfill-events] Failed', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
