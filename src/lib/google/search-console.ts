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
 */
function getSearchConsoleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google Search Console credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables.',
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

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
        'Google Search Console: Invalid or expired credentials. Refresh token may need regeneration.',
      );
    }

    if (googleError.code === 403 || googleError.response?.status === 403) {
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
