import { NextRequest, NextResponse } from 'next/server';
import {
  getSearchConsoleData,
  getTopQueries,
  getTopPages,
} from '@/lib/google/search-console';
import { resolveDateRange, formatDate } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

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

    // Return proper error state with 503 status
    // Frontend should handle gracefully and show empty state
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorType: typedError.code || 'SEARCH_CONSOLE_ERROR',
        message: 'Search Console data unavailable',
        data: null,
        range: {
          start: startDate,
          end: endDate,
        },
      },
      { status: 503 },
    );
  }
}
