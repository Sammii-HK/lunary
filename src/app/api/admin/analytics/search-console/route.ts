import { NextRequest, NextResponse } from 'next/server';
import {
  getSearchConsoleData,
  getTopQueries,
  getTopPages,
} from '@/lib/google/search-console';
import { resolveDateRange, formatDate } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = resolveDateRange(searchParams, 30);
  const startDate = formatDate(range.start);
  const endDate = formatDate(range.end);
  const siteUrl = searchParams.get('siteUrl') || undefined;

  try {
    const [performanceData, topQueries, topPages] = await Promise.all([
      getSearchConsoleData(startDate, endDate, siteUrl),
      getTopQueries(startDate, endDate, 10, siteUrl),
      getTopPages(startDate, endDate, 10, siteUrl),
    ]);

    const response = NextResponse.json({
      success: true,
      data: {
        performance: performanceData,
        topQueries,
        topPages,
      },
      range: {
        start: startDate,
        end: endDate,
      },
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/search-console] Error:', error);

    const typedError = error as Error & { code?: string };
    const errorMessage = typedError.message || 'Unknown error';

    // Always return successful response with empty data to prevent analytics page from breaking
    // Log the error but don't fail the entire analytics dashboard
    return NextResponse.json({
      success: true,
      data: {
        performance: {
          startDate,
          endDate,
          metrics: [],
          totalClicks: 0,
          totalImpressions: 0,
          averageCtr: 0,
          averagePosition: 0,
        },
        topQueries: [],
        topPages: [],
      },
      range: {
        start: startDate,
        end: endDate,
      },
      warning: `Search Console unavailable: ${errorMessage}`,
      error: errorMessage,
    });
  }
}
