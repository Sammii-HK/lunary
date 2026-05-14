const BING_WEBMASTER_API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

export interface BingWebmasterMetric {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface BingWebmasterPerformance {
  startDate: string;
  endDate: string;
  metrics: BingWebmasterMetric[];
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

export interface BingWebmasterQueryOrPage {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface BingWebmasterBacklinkPage {
  url: string;
  count: number;
}

type BingJsonResponse<T> = {
  d?: T;
  ErrorCode?: number;
  Message?: string;
};

type BingRankAndTrafficRow = {
  Clicks?: number;
  Date?: string;
  Impressions?: number;
};

type BingQueryStatsRow = BingRankAndTrafficRow & {
  AvgClickPosition?: number;
  AvgImpressionPosition?: number;
  Query?: string;
};

type BingLinkCounts = {
  Links?: Array<{
    Count?: number;
    Url?: string;
  }>;
  TotalPages?: number;
};

function getBingApiKey() {
  const apiKey = process.env.BING_WEBMASTER_API_KEY;
  if (!apiKey) {
    const error = new Error(
      'Missing BING_WEBMASTER_API_KEY. Add the Bing Webmaster API key to environment variables.',
    ) as Error & { code?: string };
    error.code = 'MISSING_BING_WEBMASTER_API_KEY';
    throw error;
  }
  return apiKey;
}

function resolveBingSiteUrl(siteUrl?: string) {
  return (
    siteUrl || process.env.BING_WEBMASTER_SITE_URL || 'https://lunary.app/'
  );
}

export function parseBingApiDate(value?: string): string {
  if (!value) return '';

  const microsoftDateMatch = value.match(/\/Date\((-?\d+)([+-]\d{4})?\)\//);
  if (microsoftDateMatch) {
    return new Date(Number(microsoftDateMatch[1])).toISOString().slice(0, 10);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toISOString().slice(0, 10);
}

function isDateInRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate;
}

async function callBingWebmaster<T>(
  method: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${BING_WEBMASTER_API_BASE}/${method}`);
  url.searchParams.set('apikey', getBingApiKey());

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 * 60 },
  });

  const body = (await response
    .json()
    .catch(() => null)) as BingJsonResponse<T> | null;

  if (!response.ok || body?.ErrorCode) {
    const error = new Error(
      body?.Message || `Bing Webmaster API error: ${response.status}`,
    ) as Error & { code?: string };
    error.code = body?.ErrorCode
      ? `BING_WEBMASTER_${body.ErrorCode}`
      : 'BING_WEBMASTER_ERROR';
    throw error;
  }

  return body?.d as T;
}

function aggregateMetricRows(
  rows: BingRankAndTrafficRow[],
  startDate: string,
  endDate: string,
): BingWebmasterPerformance {
  const metrics = rows
    .map((row) => {
      const date = parseBingApiDate(row.Date);
      const clicks = Number(row.Clicks || 0);
      const impressions = Number(row.Impressions || 0);
      return {
        date,
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : 0,
        position: 0,
      };
    })
    .filter((row) => row.date && isDateInRange(row.date, startDate, endDate))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalClicks = metrics.reduce((sum, row) => sum + row.clicks, 0);
  const totalImpressions = metrics.reduce(
    (sum, row) => sum + row.impressions,
    0,
  );

  return {
    startDate,
    endDate,
    metrics,
    totalClicks,
    totalImpressions,
    averageCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    averagePosition: 0,
  };
}

function aggregateQueryRows(
  rows: BingQueryStatsRow[],
  startDate: string,
  endDate: string,
  limit: number,
) {
  const byKey = new Map<
    string,
    {
      key: string;
      clicks: number;
      impressions: number;
      positionTotal: number;
      rows: number;
    }
  >();

  for (const row of rows) {
    const date = parseBingApiDate(row.Date);
    if (date && !isDateInRange(date, startDate, endDate)) continue;

    const key = row.Query || '';
    if (!key) continue;

    const current =
      byKey.get(key) ||
      ({
        key,
        clicks: 0,
        impressions: 0,
        positionTotal: 0,
        rows: 0,
      } as const);

    current.clicks += Number(row.Clicks || 0);
    current.impressions += Number(row.Impressions || 0);
    current.positionTotal += Number(
      row.AvgImpressionPosition || row.AvgClickPosition || 0,
    );
    current.rows += 1;
    byKey.set(key, current);
  }

  return Array.from(byKey.values())
    .map((row) => ({
      query: row.key,
      page: row.key,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.impressions > 0 ? row.clicks / row.impressions : 0,
      position: row.rows > 0 ? row.positionTotal / row.rows : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, limit);
}

export async function getBingWebmasterPerformance(
  startDate: string,
  endDate: string,
  siteUrl?: string,
) {
  const rows = await callBingWebmaster<BingRankAndTrafficRow[]>(
    'GetRankAndTrafficStats',
    { siteUrl: resolveBingSiteUrl(siteUrl) },
  );
  return aggregateMetricRows(rows || [], startDate, endDate);
}

export async function getBingTopQueries(
  startDate: string,
  endDate: string,
  limit = 10,
  siteUrl?: string,
) {
  const rows = await callBingWebmaster<BingQueryStatsRow[]>('GetQueryStats', {
    siteUrl: resolveBingSiteUrl(siteUrl),
  });
  return aggregateQueryRows(rows || [], startDate, endDate, limit).map(
    ({ query, clicks, impressions, ctr, position }) => ({
      query,
      clicks,
      impressions,
      ctr,
      position,
    }),
  );
}

export async function getBingTopPages(
  startDate: string,
  endDate: string,
  limit = 10,
  siteUrl?: string,
) {
  const rows = await callBingWebmaster<BingQueryStatsRow[]>('GetPageStats', {
    siteUrl: resolveBingSiteUrl(siteUrl),
  });
  return aggregateQueryRows(rows || [], startDate, endDate, limit).map(
    ({ page, clicks, impressions, ctr, position }) => ({
      page,
      clicks,
      impressions,
      ctr,
      position,
    }),
  );
}

export async function getBingBacklinkPages(
  siteUrl?: string,
  limit = 10,
): Promise<BingWebmasterBacklinkPage[]> {
  const firstPage = await callBingWebmaster<BingLinkCounts>('GetLinkCounts', {
    siteUrl: resolveBingSiteUrl(siteUrl),
    page: 0,
  });

  return (firstPage?.Links || [])
    .map((link) => ({
      url: link.Url || '',
      count: Number(link.Count || 0),
    }))
    .filter((link) => link.url)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
