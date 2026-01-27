import { NextRequest, NextResponse } from 'next/server';

/**
 * Cohort retention endpoint for insights
 * Aggregates data from cohorts endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Convert to YYYY-MM-DD format expected by cohorts endpoint
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    // Fetch from cohorts endpoint
    const cohortsResponse = await fetch(
      `${request.nextUrl.origin}/api/admin/analytics/cohorts?start_date=${formatDate(start)}&end_date=${formatDate(end)}`,
    );

    if (!cohortsResponse.ok) {
      throw new Error(`Failed to fetch cohorts: ${cohortsResponse.status}`);
    }

    const data = await cohortsResponse.json();

    // Calculate overall D30 retention (average of all cohorts)
    const cohorts = data.cohorts || [];
    const overallD30Retention =
      cohorts.length > 0
        ? cohorts.reduce(
            (sum: number, c: { day30: number }) => sum + c.day30,
            0,
          ) / cohorts.length
        : 0;

    return NextResponse.json({
      cohorts: cohorts.map((c: { cohort: string; day30: number }) => ({
        cohort: c.cohort,
        day_30_retention: c.day30,
      })),
      overall_d30_retention: Number(overallD30Retention.toFixed(2)),
    });
  } catch (error) {
    console.error('[analytics/cohort-retention] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
