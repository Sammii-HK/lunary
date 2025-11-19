import { NextRequest, NextResponse } from 'next/server';
import {
  getSearchConsoleData,
  getTopQueries,
  getTopPages,
} from '@/lib/google/search-console';
import { resolveDateRange, formatDate } from '@/lib/analytics/date-range';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const startDate = formatDate(range.start);
    const endDate = formatDate(range.end);
    const siteUrl = searchParams.get('siteUrl') || undefined;

    const [performanceData, topQueries, topPages] = await Promise.all([
      getSearchConsoleData(startDate, endDate, siteUrl),
      getTopQueries(startDate, endDate, 10, siteUrl),
      getTopPages(startDate, endDate, 10, siteUrl),
    ]);

    return NextResponse.json({
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
  } catch (error) {
    console.error('[analytics/search-console] Error:', error);

    if (error instanceof Error) {
      // Check for common error messages
      if (error.message.includes('Missing')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            message:
              'Google Search Console API is not configured. See docs/GOOGLE_SEARCH_CONSOLE_SETUP.md',
          },
          { status: 503 },
        );
      }

      if (error.message.includes('Invalid credentials')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid credentials',
            message:
              'Google OAuth credentials are invalid. Regenerate refresh token.',
          },
          { status: 401 },
        );
      }

      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
            message:
              'OAuth scope missing. Ensure webmasters.readonly scope is added.',
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
