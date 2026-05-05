import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  auditUrlsIndexing,
  getSuggestedFix,
  type PageIndexingStatus,
} from '@/lib/google/search-console';

export const dynamic = 'force-dynamic';

// Recovery canaries: keep this list aligned with the focused astrology sitemap.
const GRIMOIRE_URLS_TO_AUDIT = [
  // Primary discovery and trust pages
  'https://lunary.app/',
  'https://lunary.app/grimoire',
  'https://lunary.app/about/methodology',
  'https://lunary.app/birth-chart',
  'https://lunary.app/grimoire/birth-chart',
  'https://lunary.app/grimoire/guides',
  'https://lunary.app/grimoire/guides/learn-birth-chart',
  'https://lunary.app/grimoire/guides/birth-chart-complete-guide',
  'https://lunary.app/grimoire/astrology/sky-now',

  // Astrology learning hubs
  'https://lunary.app/grimoire/planets',
  'https://lunary.app/grimoire/placements',
  'https://lunary.app/grimoire/houses',
  'https://lunary.app/grimoire/aspects',
  'https://lunary.app/grimoire/aspects/types',
  'https://lunary.app/grimoire/decans',
  'https://lunary.app/grimoire/rising',
  'https://lunary.app/grimoire/rising-sign',
  'https://lunary.app/grimoire/moon-in',
  'https://lunary.app/grimoire/zodiac',
  'https://lunary.app/grimoire/moon',
  'https://lunary.app/grimoire/transits',
  'https://lunary.app/grimoire/horoscopes',

  // Zodiac signs
  'https://lunary.app/grimoire/zodiac/aries',
  'https://lunary.app/grimoire/zodiac/taurus',
  'https://lunary.app/grimoire/zodiac/gemini',
  'https://lunary.app/grimoire/zodiac/cancer',
  'https://lunary.app/grimoire/zodiac/leo',
  'https://lunary.app/grimoire/zodiac/virgo',
  'https://lunary.app/grimoire/zodiac/libra',
  'https://lunary.app/grimoire/zodiac/scorpio',
  'https://lunary.app/grimoire/zodiac/sagittarius',
  'https://lunary.app/grimoire/zodiac/capricorn',
  'https://lunary.app/grimoire/zodiac/aquarius',
  'https://lunary.app/grimoire/zodiac/pisces',

  // Planets
  'https://lunary.app/grimoire/planets/sun',
  'https://lunary.app/grimoire/planets/moon',
  'https://lunary.app/grimoire/planets/mercury',
  'https://lunary.app/grimoire/planets/venus',
  'https://lunary.app/grimoire/planets/mars',
  'https://lunary.app/grimoire/planets/jupiter',
  'https://lunary.app/grimoire/planets/saturn',
  'https://lunary.app/grimoire/planets/uranus',
  'https://lunary.app/grimoire/planets/neptune',
  'https://lunary.app/grimoire/planets/pluto',

  // Chart-reading example pages
  'https://lunary.app/grimoire/placements/sun-in-aries',
  'https://lunary.app/grimoire/placements/moon-in-capricorn',
  'https://lunary.app/grimoire/placements/venus-in-taurus',
  'https://lunary.app/grimoire/placements/mars-in-leo',
  'https://lunary.app/grimoire/houses/1st-house',
  'https://lunary.app/grimoire/houses/7th-house',
  'https://lunary.app/grimoire/houses/moon/7',
  'https://lunary.app/grimoire/aspects/moon/square/mars',
  'https://lunary.app/grimoire/aspects/types/square',
  'https://lunary.app/grimoire/decans/aquarius/2',
  'https://lunary.app/grimoire/rising/capricorn-rising',
  'https://lunary.app/grimoire/moon-in/capricorn',

  // Query families that were still showing strong positions in tiny tests
  'https://lunary.app/grimoire/horoscopes/taurus/2027',
  'https://lunary.app/grimoire/horoscopes/cancer/2026/june',
  'https://lunary.app/grimoire/horoscopes/scorpio/2026/june',
  'https://lunary.app/grimoire/transits/year/2027',
  'https://lunary.app/grimoire/compatibility/aries-and-leo',

  // Moon phases
  'https://lunary.app/grimoire/moon/phases/new-moon',
  'https://lunary.app/grimoire/moon/phases/waxing-crescent',
  'https://lunary.app/grimoire/moon/phases/first-quarter',
  'https://lunary.app/grimoire/moon/phases/waxing-gibbous',
  'https://lunary.app/grimoire/moon/phases/full-moon',
  'https://lunary.app/grimoire/moon/phases/waning-gibbous',
  'https://lunary.app/grimoire/moon/phases/last-quarter',
  'https://lunary.app/grimoire/moon/phases/waning-crescent',
];

interface AuditResponse {
  success: boolean;
  timestamp: string;
  summary: {
    totalUrls: number;
    indexed: number;
    notIndexed: number;
    errors: number;
    indexRate: string;
  };
  notIndexedReasons: Record<string, number>;
  notIndexedPages: Array<{
    url: string;
    reason: string;
    suggestedFix: string;
    lastCrawl: string | null;
  }>;
  allPages: PageIndexingStatus[];
}

/**
 * GET /api/admin/seo/indexing-audit
 *
 * Audits the indexing status of key grimoire pages using Google Search Console's URL Inspection API.
 *
 * Query params:
 * - limit: Number of URLs to check (default: all)
 * - urls: Comma-separated list of specific URLs to check
 */
export async function GET(
  request: Request,
): Promise<NextResponse<AuditResponse | { error: string }>> {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const urlsParam = searchParams.get('urls');

    let urlsToAudit: string[];

    if (urlsParam) {
      // Use specific URLs provided
      urlsToAudit = urlsParam.split(',').map((u) => u.trim());
    } else {
      // Use default list
      urlsToAudit = GRIMOIRE_URLS_TO_AUDIT;

      // Apply limit if specified
      if (limitParam) {
        const limit = parseInt(limitParam, 10);
        if (!isNaN(limit) && limit > 0) {
          urlsToAudit = urlsToAudit.slice(0, limit);
        }
      }
    }

    console.log(
      `[Indexing Audit] Starting audit of ${urlsToAudit.length} URLs...`,
    );

    const result = await auditUrlsIndexing(urlsToAudit);

    // Format not-indexed pages with suggested fixes
    const notIndexedPages = result.pages
      .filter((p) => p.verdict !== 'PASS')
      .map((p) => ({
        url: p.url,
        reason: p.coverageState,
        suggestedFix: getSuggestedFix(p.coverageState),
        lastCrawl: p.lastCrawlTime,
      }));

    const response: AuditResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalUrls: result.totalUrls,
        indexed: result.indexed,
        notIndexed: result.notIndexed,
        errors: result.errors,
        indexRate: `${((result.indexed / result.totalUrls) * 100).toFixed(1)}%`,
      },
      notIndexedReasons: result.notIndexedReasons,
      notIndexedPages,
      allPages: result.pages,
    };

    console.log(
      `[Indexing Audit] Complete: ${result.indexed}/${result.totalUrls} indexed (${response.summary.indexRate})`,
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Indexing Audit] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to run indexing audit',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/seo/indexing-audit
 *
 * Audit specific URLs provided in the request body.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<AuditResponse | { error: string }>> {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { urls } = body as { urls?: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of URLs to audit' },
        { status: 400 },
      );
    }

    console.log(
      `[Indexing Audit] Starting audit of ${urls.length} custom URLs...`,
    );

    const result = await auditUrlsIndexing(urls);

    const notIndexedPages = result.pages
      .filter((p) => p.verdict !== 'PASS')
      .map((p) => ({
        url: p.url,
        reason: p.coverageState,
        suggestedFix: getSuggestedFix(p.coverageState),
        lastCrawl: p.lastCrawlTime,
      }));

    const response: AuditResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalUrls: result.totalUrls,
        indexed: result.indexed,
        notIndexed: result.notIndexed,
        errors: result.errors,
        indexRate: `${((result.indexed / result.totalUrls) * 100).toFixed(1)}%`,
      },
      notIndexedReasons: result.notIndexedReasons,
      notIndexedPages,
      allPages: result.pages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Indexing Audit] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to run indexing audit',
      },
      { status: 500 },
    );
  }
}
