import { NextResponse } from 'next/server';
import {
  auditUrlsIndexing,
  getSuggestedFix,
  type PageIndexingStatus,
} from '@/lib/google/search-console';

// Grimoire URLs to audit - key pages
const GRIMOIRE_URLS_TO_AUDIT = [
  // Main index pages
  'https://lunary.app/grimoire',
  'https://lunary.app/grimoire/zodiac',
  'https://lunary.app/grimoire/tarot',
  'https://lunary.app/grimoire/crystals',
  'https://lunary.app/grimoire/planets',
  'https://lunary.app/grimoire/moon',
  'https://lunary.app/grimoire/numerology',
  'https://lunary.app/grimoire/guides',
  'https://lunary.app/grimoire/spells',
  'https://lunary.app/grimoire/practices',
  'https://lunary.app/grimoire/correspondences',

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

  // Key guides
  'https://lunary.app/grimoire/guides/birth-chart-complete-guide',
  'https://lunary.app/grimoire/guides/tarot-complete-guide',
  'https://lunary.app/grimoire/guides/crystal-healing-guide',
  'https://lunary.app/grimoire/guides/moon-phases-guide',

  // Popular tarot cards
  'https://lunary.app/grimoire/tarot/the-fool',
  'https://lunary.app/grimoire/tarot/the-magician',
  'https://lunary.app/grimoire/tarot/the-high-priestess',
  'https://lunary.app/grimoire/tarot/the-empress',
  'https://lunary.app/grimoire/tarot/the-emperor',
  'https://lunary.app/grimoire/tarot/the-lovers',
  'https://lunary.app/grimoire/tarot/the-chariot',
  'https://lunary.app/grimoire/tarot/strength',
  'https://lunary.app/grimoire/tarot/the-hermit',
  'https://lunary.app/grimoire/tarot/wheel-of-fortune',
  'https://lunary.app/grimoire/tarot/justice',
  'https://lunary.app/grimoire/tarot/the-hanged-man',
  'https://lunary.app/grimoire/tarot/death',
  'https://lunary.app/grimoire/tarot/temperance',
  'https://lunary.app/grimoire/tarot/the-devil',
  'https://lunary.app/grimoire/tarot/the-tower',
  'https://lunary.app/grimoire/tarot/the-star',
  'https://lunary.app/grimoire/tarot/the-moon',
  'https://lunary.app/grimoire/tarot/the-sun',
  'https://lunary.app/grimoire/tarot/judgement',
  'https://lunary.app/grimoire/tarot/the-world',

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

  // Popular crystals
  'https://lunary.app/grimoire/crystals/amethyst',
  'https://lunary.app/grimoire/crystals/rose-quartz',
  'https://lunary.app/grimoire/crystals/clear-quartz',
  'https://lunary.app/grimoire/crystals/citrine',
  'https://lunary.app/grimoire/crystals/black-tourmaline',
  'https://lunary.app/grimoire/crystals/selenite',
  'https://lunary.app/grimoire/crystals/labradorite',
  'https://lunary.app/grimoire/crystals/moonstone',

  // Life path numbers
  'https://lunary.app/grimoire/life-path/1',
  'https://lunary.app/grimoire/life-path/2',
  'https://lunary.app/grimoire/life-path/3',
  'https://lunary.app/grimoire/life-path/4',
  'https://lunary.app/grimoire/life-path/5',
  'https://lunary.app/grimoire/life-path/6',
  'https://lunary.app/grimoire/life-path/7',
  'https://lunary.app/grimoire/life-path/8',
  'https://lunary.app/grimoire/life-path/9',

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
