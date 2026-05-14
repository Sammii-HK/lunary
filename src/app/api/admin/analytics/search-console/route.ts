import { NextRequest, NextResponse } from 'next/server';
import {
  getSearchConsoleData,
  getTopQueries,
  getTopPages,
  querySearchConsole,
} from '@/lib/google/search-console';
import {
  getBingBacklinkPages,
  getBingTopPages,
  getBingTopQueries,
  getBingWebmasterPerformance,
} from '@/lib/bing/webmaster';
import { getBingAiPerformanceSnapshot } from '@/lib/bing/ai-performance';
import { resolveDateRange, formatDate } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

type SearchPerformance = {
  startDate: string;
  endDate: string;
  metrics: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
};

function combinePerformance(
  startDate: string,
  endDate: string,
  sources: Array<SearchPerformance | null>,
): SearchPerformance {
  const byDate = new Map<string, SearchPerformance['metrics'][number]>();

  for (const source of sources) {
    for (const metric of source?.metrics || []) {
      const current =
        byDate.get(metric.date) ||
        ({
          date: metric.date,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0,
        } satisfies SearchPerformance['metrics'][number]);

      const previousImpressions = current.impressions;
      current.clicks += metric.clicks;
      current.impressions += metric.impressions;
      current.position =
        current.impressions > 0
          ? (current.position * previousImpressions +
              metric.position * metric.impressions) /
            current.impressions
          : 0;
      current.ctr =
        current.impressions > 0 ? current.clicks / current.impressions : 0;
      byDate.set(metric.date, current);
    }
  }

  const metrics = Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0);
  const totalImpressions = metrics.reduce(
    (sum, metric) => sum + metric.impressions,
    0,
  );
  const weightedPositionDenominator = metrics.reduce(
    (sum, metric) => sum + metric.impressions,
    0,
  );
  const averagePosition =
    weightedPositionDenominator > 0
      ? metrics.reduce(
          (sum, metric) => sum + metric.position * metric.impressions,
          0,
        ) / weightedPositionDenominator
      : 0;

  return {
    startDate,
    endDate,
    metrics,
    totalClicks,
    totalImpressions,
    averageCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    averagePosition,
  };
}

function summarizeSourceError(error: unknown) {
  const typed = error as Error & { code?: string };
  return {
    code: typed.code || 'UNKNOWN',
    message: typed.message || 'Unknown error',
  };
}

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const range = resolveDateRange(searchParams, 30);
  const startDate = formatDate(range.start);
  const endDate = formatDate(range.end);
  const siteUrl = searchParams.get('siteUrl') || undefined;

  const [
    googlePerformanceResult,
    googleQueriesResult,
    googlePagesResult,
    bingPerformanceResult,
    bingQueriesResult,
    bingPagesResult,
    bingBacklinksResult,
  ] = await Promise.allSettled([
    getSearchConsoleData(startDate, endDate, siteUrl),
    getTopQueries(startDate, endDate, 10, siteUrl),
    getTopPages(startDate, endDate, 10, siteUrl),
    getBingWebmasterPerformance(startDate, endDate, siteUrl),
    getBingTopQueries(startDate, endDate, 10, siteUrl),
    getBingTopPages(startDate, endDate, 10, siteUrl),
    getBingBacklinkPages(siteUrl, 10),
  ]);

  const googlePerformance =
    googlePerformanceResult.status === 'fulfilled'
      ? googlePerformanceResult.value
      : null;
  const googleTopQueries =
    googleQueriesResult.status === 'fulfilled' ? googleQueriesResult.value : [];
  const googleTopPages =
    googlePagesResult.status === 'fulfilled' ? googlePagesResult.value : [];
  const bingPerformance =
    bingPerformanceResult.status === 'fulfilled'
      ? bingPerformanceResult.value
      : null;
  const bingTopQueries =
    bingQueriesResult.status === 'fulfilled' ? bingQueriesResult.value : [];
  const bingTopPages =
    bingPagesResult.status === 'fulfilled' ? bingPagesResult.value : [];
  const bingBacklinks =
    bingBacklinksResult.status === 'fulfilled' ? bingBacklinksResult.value : [];
  const bingAiPerformance = getBingAiPerformanceSnapshot();

  const sourceErrors = {
    google:
      googlePerformanceResult.status === 'rejected'
        ? summarizeSourceError(googlePerformanceResult.reason)
        : null,
    bing:
      bingPerformanceResult.status === 'rejected'
        ? summarizeSourceError(bingPerformanceResult.reason)
        : null,
  };

  const hasAnyPerformance = Boolean(googlePerformance || bingPerformance);

  if (hasAnyPerformance) {
    const performanceData = combinePerformance(startDate, endDate, [
      googlePerformance,
      bingPerformance,
    ]);

    const response = NextResponse.json({
      success: true,
      data: {
        performance: performanceData,
        topQueries: [...bingTopQueries, ...googleTopQueries]
          .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
          .slice(0, 10),
        topPages: [...bingTopPages, ...googleTopPages]
          .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
          .slice(0, 10),
        sources: {
          google: googlePerformance
            ? {
                performance: googlePerformance,
                topQueries: googleTopQueries,
                topPages: googleTopPages,
              }
            : null,
          bing: bingPerformance
            ? {
                performance: bingPerformance,
                topQueries: bingTopQueries,
                topPages: bingTopPages,
                backlinks: bingBacklinks,
                aiPerformance: bingAiPerformance,
              }
            : null,
        },
        sourceErrors,
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
  }

  console.error('[analytics/search-console] All search sources failed:', {
    google:
      googlePerformanceResult.status === 'rejected'
        ? googlePerformanceResult.reason
        : null,
    bing:
      bingPerformanceResult.status === 'rejected'
        ? bingPerformanceResult.reason
        : null,
  });

  return NextResponse.json(
    {
      success: false,
      error: 'All search performance sources failed',
      errorType: 'SEARCH_PERFORMANCE_UNAVAILABLE',
      message: 'Search performance data unavailable',
      data: null,
      sourceErrors,
      range: {
        start: startDate,
        end: endDate,
      },
    },
    { status: 503 },
  );
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const startDate = body?.startDate;
    const endDate = body?.endDate;

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing startDate or endDate',
          message: 'Native Search Console query requires startDate and endDate',
        },
        { status: 400 },
      );
    }

    const result = await querySearchConsole({
      startDate,
      endDate,
      siteUrl: body?.siteUrl,
      dimensions: body?.dimensions,
      rowLimit: body?.rowLimit,
      startRow: body?.startRow,
      dimensionFilterGroups: body?.dimensionFilterGroups,
      aggregationType: body?.aggregationType,
      dataState: body?.dataState,
      type: body?.type,
      searchType: body?.searchType,
    });

    const response = NextResponse.json({
      success: true,
      data: result,
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
    console.error('[analytics/search-console] Native query error:', error);

    const typedError = error as Error & { code?: string };
    return NextResponse.json(
      {
        success: false,
        error: typedError.message || 'Unknown error',
        errorType: typedError.code || 'SEARCH_CONSOLE_ERROR',
        message: 'Native Search Console query unavailable',
        data: null,
      },
      { status: 503 },
    );
  }
}
