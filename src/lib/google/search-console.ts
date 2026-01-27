import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

export interface SearchConsoleMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
}

export interface SearchConsoleData {
  startDate: string;
  endDate: string;
  metrics: SearchConsoleMetrics[];
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

/**
 * Get authenticated Google Search Console client
 * Supports both Service Account (preferred) and OAuth2 (fallback)
 */
function getSearchConsoleClient() {
  // Try Service Account first (never expires)
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    try {
      const credentials = JSON.parse(serviceAccountJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES,
      });

      return google.searchconsole({
        version: 'v1',
        auth,
      });
    } catch (error) {
      console.error('[Search Console] Invalid service account JSON:', error);
      // Fall through to OAuth2 attempt
    }
  }

  // Fallback to OAuth2 (requires manual token refresh)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    const error = new Error(
      'Missing Google Search Console credentials. Set either GOOGLE_SERVICE_ACCOUNT_JSON (recommended) or GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.',
    ) as Error & { code?: string };
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost', // Redirect URI must match what was used during token generation
  );

  // Set credentials with refresh token
  // Note: The refresh token must have been generated with the Search Console scope
  // If you get 403 errors, regenerate the token using: npx tsx scripts/regenerate-google-token.ts
  // Important: The refresh token already contains the scopes it was generated with.
  // You cannot modify scopes after token generation - if scopes are missing,
  // you must regenerate the token using: npx tsx scripts/regenerate-google-token.ts
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.searchconsole({
    version: 'v1',
    auth: oauth2Client,
  });
}

/**
 * Fetch search performance data from Google Search Console
 */
export async function getSearchConsoleData(
  startDate: string,
  endDate: string,
  siteUrl?: string,
): Promise<SearchConsoleData> {
  const searchConsole = getSearchConsoleClient();
  let propertyUrl = siteUrl || process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || '';

  if (!propertyUrl) {
    throw new Error(
      'Missing GOOGLE_SEARCH_CONSOLE_SITE_URL. Set the site URL in environment variables.',
    );
  }

  // Convert https://domain.com to sc-domain:domain.com if needed
  // Search Console domain properties use sc-domain: prefix
  if (
    propertyUrl.startsWith('https://') &&
    !propertyUrl.startsWith('sc-domain:')
  ) {
    const domain = propertyUrl.replace(/^https?:\/\/(www\.)?/, '');
    propertyUrl = `sc-domain:${domain}`;
  }

  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl: propertyUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 1000,
      },
    });

    const rows = response.data.rows || [];
    const metrics: SearchConsoleMetrics[] = rows.map((row) => ({
      date: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }));

    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
    const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
    const averageCtr =
      totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const averagePosition =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.position, 0) / metrics.length
        : 0;

    return {
      startDate,
      endDate,
      metrics,
      totalClicks,
      totalImpressions,
      averageCtr,
      averagePosition,
    };
  } catch (error: unknown) {
    const googleError = error as {
      code?: number;
      message?: string;
      errors?: Array<{ message: string; domain: string; reason: string }>;
      response?: { status: number; statusText: string; data?: unknown };
    };

    console.error('[Search Console] Error fetching data:', {
      message: googleError.message,
      code: googleError.code,
      errors: googleError.errors,
      responseStatus: googleError.response?.status,
      responseData: googleError.response?.data,
      propertyUrl,
      dateRange: { startDate, endDate },
    });

    if (googleError.code === 401 || googleError.response?.status === 401) {
      throw new Error(
        'Google Search Console: Invalid or expired credentials. Refresh token may need regeneration. ' +
          'Run "npx tsx scripts/regenerate-google-token.ts" to regenerate the token.',
      );
    }

    if (googleError.code === 403 || googleError.response?.status === 403) {
      // Check if it's a scope issue
      const errorMessage = googleError.message || '';
      if (
        errorMessage.includes('insufficient authentication scopes') ||
        errorMessage.includes('insufficient authentication')
      ) {
        throw new Error(
          `Google Search Console: Insufficient authentication scopes. Your refresh token was generated without Search Console access. ` +
            `To fix: Run "npx tsx scripts/regenerate-google-token.ts" to regenerate the token with Search Console scope included. ` +
            `Then update GOOGLE_REFRESH_TOKEN in your environment variables.`,
        );
      }
      throw new Error(
        `Google Search Console: Permission denied for property "${propertyUrl}". Verify the property exists and you have access.`,
      );
    }

    if (googleError.code === 404 || googleError.response?.status === 404) {
      throw new Error(
        `Google Search Console: Property "${propertyUrl}" not found. Check GOOGLE_SEARCH_CONSOLE_SITE_URL format (should be "sc-domain:lunary.app" or "https://lunary.app").`,
      );
    }

    throw new Error(
      `Google Search Console API error: ${googleError.message || 'Unknown error'}`,
    );
  }
}

/**
 * Get top performing queries
 */
export async function getTopQueries(
  startDate: string,
  endDate: string,
  limit: number = 10,
  siteUrl?: string,
) {
  const searchConsole = getSearchConsoleClient();
  let propertyUrl = siteUrl || process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || '';

  if (!propertyUrl) {
    throw new Error(
      'Missing GOOGLE_SEARCH_CONSOLE_SITE_URL. Set the site URL in environment variables.',
    );
  }

  // Convert https://domain.com to sc-domain:domain.com if needed
  if (
    propertyUrl.startsWith('https://') &&
    !propertyUrl.startsWith('sc-domain:')
  ) {
    const domain = propertyUrl.replace(/^https?:\/\/(www\.)?/, '');
    propertyUrl = `sc-domain:${domain}`;
  }

  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl: propertyUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: limit,
      },
    });

    return (
      response.data.rows?.map((row) => ({
        query: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || []
    );
  } catch (error: unknown) {
    const googleError = error as {
      code?: number;
      message?: string;
      response?: { status: number };
    };

    console.error('[Search Console] Error fetching top queries:', {
      message: googleError.message,
      code: googleError.code,
      responseStatus: googleError.response?.status,
      propertyUrl,
    });

    throw new Error(
      `Google Search Console API error (queries): ${googleError.message || 'Unknown error'}`,
    );
  }
}

/**
 * Get top performing pages
 */
export async function getTopPages(
  startDate: string,
  endDate: string,
  limit: number = 10,
  siteUrl?: string,
) {
  const searchConsole = getSearchConsoleClient();
  let propertyUrl = siteUrl || process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || '';

  if (!propertyUrl) {
    throw new Error(
      'Missing GOOGLE_SEARCH_CONSOLE_SITE_URL. Set the site URL in environment variables.',
    );
  }

  // Convert https://domain.com to sc-domain:domain.com if needed
  if (
    propertyUrl.startsWith('https://') &&
    !propertyUrl.startsWith('sc-domain:')
  ) {
    const domain = propertyUrl.replace(/^https?:\/\/(www\.)?/, '');
    propertyUrl = `sc-domain:${domain}`;
  }

  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl: propertyUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: limit,
      },
    });

    return (
      response.data.rows?.map((row) => ({
        page: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })) || []
    );
  } catch (error: unknown) {
    const googleError = error as {
      code?: number;
      message?: string;
      response?: { status: number };
    };

    console.error('[Search Console] Error fetching top pages:', {
      message: googleError.message,
      code: googleError.code,
      responseStatus: googleError.response?.status,
      propertyUrl,
    });

    throw new Error(
      `Google Search Console API error (pages): ${googleError.message || 'Unknown error'}`,
    );
  }
}

// ============================================
// URL Inspection API - Indexing Status
// ============================================

export interface PageIndexingStatus {
  url: string;
  verdict: string; // "PASS" = indexed, "NEUTRAL" = not indexed, "FAIL" = error
  coverageState: string; // "Submitted and indexed", "Crawled - currently not indexed", etc.
  robotsTxtState: string;
  indexingState: string;
  lastCrawlTime: string | null;
  pageFetchState: string;
  googleCanonical: string | null;
  userCanonical: string | null;
  crawledAs: string;
  issues: string[];
}

/**
 * Get the indexing status of a specific URL using the URL Inspection API
 * @param pageUrl - The full URL to inspect (e.g., "https://lunary.app/grimoire/zodiac/aries")
 */
export async function getPageIndexingStatus(
  pageUrl: string,
): Promise<PageIndexingStatus> {
  const searchConsole = getSearchConsoleClient();
  let propertyUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || '';

  if (!propertyUrl) {
    throw new Error(
      'Missing GOOGLE_SEARCH_CONSOLE_SITE_URL. Set the site URL in environment variables.',
    );
  }

  // Convert to sc-domain format if needed
  if (
    propertyUrl.startsWith('https://') &&
    !propertyUrl.startsWith('sc-domain:')
  ) {
    const domain = propertyUrl.replace(/^https?:\/\/(www\.)?/, '');
    propertyUrl = `sc-domain:${domain}`;
  }

  try {
    const response = await searchConsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: pageUrl,
        siteUrl: propertyUrl,
      },
    });

    const result = response.data.inspectionResult;
    const indexStatus = result?.indexStatusResult;
    const issues: string[] = [];

    // Collect any issues
    if (indexStatus?.verdict === 'NEUTRAL' || indexStatus?.verdict === 'FAIL') {
      if (indexStatus?.coverageState) {
        issues.push(indexStatus.coverageState);
      }
      if (indexStatus?.robotsTxtState === 'DISALLOWED') {
        issues.push('Blocked by robots.txt');
      }
      if (indexStatus?.pageFetchState !== 'SUCCESSFUL') {
        issues.push(`Page fetch: ${indexStatus?.pageFetchState || 'Unknown'}`);
      }
    }

    return {
      url: pageUrl,
      verdict: indexStatus?.verdict || 'UNKNOWN',
      coverageState: indexStatus?.coverageState || 'Unknown',
      robotsTxtState: indexStatus?.robotsTxtState || 'Unknown',
      indexingState: indexStatus?.indexingState || 'Unknown',
      lastCrawlTime: indexStatus?.lastCrawlTime || null,
      pageFetchState: indexStatus?.pageFetchState || 'Unknown',
      googleCanonical: indexStatus?.googleCanonical || null,
      userCanonical: indexStatus?.userCanonical || null,
      crawledAs: indexStatus?.crawledAs || 'Unknown',
      issues,
    };
  } catch (error: unknown) {
    const googleError = error as {
      code?: number;
      message?: string;
      response?: { status: number; data?: unknown };
    };

    console.error('[Search Console] URL Inspection error:', {
      url: pageUrl,
      message: googleError.message,
      code: googleError.code,
      responseStatus: googleError.response?.status,
    });

    // Return error status instead of throwing
    return {
      url: pageUrl,
      verdict: 'ERROR',
      coverageState: 'API Error',
      robotsTxtState: 'Unknown',
      indexingState: 'Unknown',
      lastCrawlTime: null,
      pageFetchState: 'Unknown',
      googleCanonical: null,
      userCanonical: null,
      crawledAs: 'Unknown',
      issues: [googleError.message || 'Unknown API error'],
    };
  }
}

export interface IndexingAuditResult {
  totalUrls: number;
  indexed: number;
  notIndexed: number;
  errors: number;
  pages: PageIndexingStatus[];
  notIndexedReasons: Record<string, number>;
}

/**
 * Audit indexing status for multiple URLs
 * Note: URL Inspection API has a rate limit of 600 requests per minute
 * @param urls - Array of URLs to check
 * @param delayMs - Delay between requests to respect rate limits (default: 100ms)
 */
export async function auditUrlsIndexing(
  urls: string[],
  delayMs: number = 100,
): Promise<IndexingAuditResult> {
  const results: PageIndexingStatus[] = [];
  const notIndexedReasons: Record<string, number> = {};

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    try {
      const status = await getPageIndexingStatus(url);
      results.push(status);

      // Track not-indexed reasons
      if (status.verdict !== 'PASS') {
        const reason = status.coverageState || 'Unknown';
        notIndexedReasons[reason] = (notIndexedReasons[reason] || 0) + 1;
      }

      // Rate limiting delay
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`[Indexing Audit] Error checking ${url}:`, error);
      results.push({
        url,
        verdict: 'ERROR',
        coverageState: 'Check Failed',
        robotsTxtState: 'Unknown',
        indexingState: 'Unknown',
        lastCrawlTime: null,
        pageFetchState: 'Unknown',
        googleCanonical: null,
        userCanonical: null,
        crawledAs: 'Unknown',
        issues: ['Failed to check URL'],
      });
    }
  }

  const indexed = results.filter((r) => r.verdict === 'PASS').length;
  const notIndexed = results.filter(
    (r) => r.verdict === 'NEUTRAL' || r.verdict === 'FAIL',
  ).length;
  const errors = results.filter((r) => r.verdict === 'ERROR').length;

  return {
    totalUrls: urls.length,
    indexed,
    notIndexed,
    errors,
    pages: results,
    notIndexedReasons,
  };
}

/**
 * Get suggested fix for a coverage state
 */
export function getSuggestedFix(coverageState: string): string {
  const fixes: Record<string, string> = {
    'Crawled - currently not indexed':
      'Add more internal links to this page, improve content quality, or ensure unique value',
    'Discovered - currently not indexed':
      'Submit URL to Google Search Console, add internal links, include in sitemap',
    'Excluded by noindex tag': 'Remove noindex meta tag or X-Robots-Tag header',
    'Blocked by robots.txt': 'Update robots.txt to allow crawling of this path',
    'Duplicate without user-selected canonical':
      'Add canonical tag pointing to preferred URL',
    'Duplicate, Google chose different canonical than user':
      'Review canonical tags, ensure they point to correct URL',
    'Soft 404':
      'Ensure page returns meaningful content, not empty or error-like',
    'Not found (404)':
      'Page does not exist - remove from sitemap or create the page',
    'Redirect error': 'Fix redirect chain or loops',
    'Server error (5xx)': 'Fix server errors preventing page from loading',
  };

  return fixes[coverageState] || 'Review page for technical SEO issues';
}
