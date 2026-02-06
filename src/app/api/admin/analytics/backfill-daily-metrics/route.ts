import { NextRequest, NextResponse } from 'next/server';

/**
 * Backfill daily_metrics table by calling compute-metrics for each day
 *
 * Usage: GET/POST /api/admin/analytics/backfill-daily-metrics?start_date=2024-01-01&end_date=2025-02-04
 *
 * This will iterate through each day and call the compute-metrics cron endpoint
 * to populate/update the daily_metrics table with all metrics.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');

    if (!startDateParam) {
      return NextResponse.json(
        { error: 'start_date query parameter is required (YYYY-MM-DD)' },
        { status: 400 },
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = endDateParam
      ? new Date(endDateParam)
      : (() => {
          const yesterday = new Date();
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
          return yesterday;
        })();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 },
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'start_date must be before end_date' },
        { status: 400 },
      );
    }

    // Calculate days to process
    const days: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(currentDate.toISOString().split('T')[0]);
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    console.log(`[backfill-daily-metrics] Processing ${days.length} days...`);

    const results: Array<{ date: string; success: boolean; error?: string }> =
      [];
    const cronSecret = process.env.CRON_SECRET;

    // Process days sequentially to avoid overwhelming the database
    for (const day of days) {
      try {
        const computeUrl = new URL('/api/cron/compute-metrics', request.url);
        computeUrl.searchParams.set('date', day);

        const response = await fetch(computeUrl.toString(), {
          method: 'GET',
          headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
        });

        if (response.ok) {
          results.push({ date: day, success: true });
          console.log(`[backfill-daily-metrics] Done ${day}`);
        } else {
          const errorText = await response.text();
          results.push({ date: day, success: false, error: errorText });
          console.error(`[backfill-daily-metrics] Failed ${day}: ${errorText}`);
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        results.push({ date: day, success: false, error: errorMsg });
        console.error(`[backfill-daily-metrics] Failed ${day}: ${errorMsg}`);
      }

      // Small delay between requests to be nice to the database
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      summary: {
        total: days.length,
        successful,
        failed,
        duration: `${duration}ms`,
      },
      results,
    });
  } catch (error) {
    console.error('[backfill-daily-metrics] Failed', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 },
    );
  }
}

// Also support GET for easier testing from browser
export async function GET(request: NextRequest) {
  return POST(request);
}
