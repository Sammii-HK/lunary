import { normalizeProtectedSeoUrl } from '@/lib/seo/protected-pages';
import type {
  BingAiCitedPage,
  BingAiPerformanceSnapshot,
} from '@/lib/bing/ai-performance';

type CsvRow = Record<string, string>;

export type BingAiImportOptions = {
  generatedAt?: string;
  source?: string;
  totalCitations?: number;
  averageCitedPages?: number;
  totalClicks?: number;
  totalImpressions?: number;
  averageCtr?: number;
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normaliseHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseCsv(csv: string): CsvRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normaliseHeader);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
}

export function parseMetricNumber(value: string | number | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  const cleaned = value.replace(/,/g, '').trim().toLowerCase();
  const multiplier = cleaned.endsWith('k')
    ? 1_000
    : cleaned.endsWith('m')
      ? 1_000_000
      : 1;
  const numeric = Number(cleaned.replace(/[^\d.~-]/g, ''));
  return Number.isFinite(numeric) ? numeric * multiplier : 0;
}

function firstValue(row: CsvRow, keys: string[]) {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return '';
}

function inferRecommendation(page: BingAiCitedPage) {
  if (page.citations >= 10) return 'protect-expand';
  if ((page.impressions || 0) >= 100 && (page.clicks || 0) === 0) {
    return 'expand';
  }
  return 'protect';
}

export function parseBingAiPerformanceCsv(
  csv: string,
  options: BingAiImportOptions = {},
): BingAiPerformanceSnapshot {
  const rows = parseCsv(csv);
  const byUrl = new Map<string, BingAiCitedPage>();

  for (const row of rows) {
    const rawUrl = firstValue(row, [
      'url',
      'page',
      'cited_page',
      'cited_pages',
      'landing_page',
    ]);
    const url = normalizeProtectedSeoUrl(rawUrl);
    if (!url) continue;

    const citations = parseMetricNumber(
      firstValue(row, ['citations', 'total_citations', 'citation_count']),
    );
    const clicks = parseMetricNumber(
      firstValue(row, ['clicks', 'total_clicks']),
    );
    const impressions = parseMetricNumber(
      firstValue(row, ['impressions', 'total_impressions']),
    );
    const ctrRaw = firstValue(row, ['ctr', 'avg_ctr', 'average_ctr']);
    const ctr = ctrRaw ? parseMetricNumber(ctrRaw) / 100 : 0;
    const groundingQuery = firstValue(row, [
      'grounding_query',
      'query',
      'keyword',
      'prompt',
    ]);

    const current =
      byUrl.get(url) ||
      ({
        url,
        citations: 0,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        groundingQueries: [],
        recommendation: 'protect',
      } satisfies BingAiCitedPage);

    current.citations += citations;
    current.clicks = (current.clicks || 0) + clicks;
    current.impressions = (current.impressions || 0) + impressions;
    if (groundingQuery && !current.groundingQueries?.includes(groundingQuery)) {
      current.groundingQueries = [
        ...(current.groundingQueries || []),
        groundingQuery,
      ];
    }
    current.ctr =
      current.impressions && current.clicks
        ? current.clicks / current.impressions
        : ctr || current.ctr || 0;
    current.recommendation = inferRecommendation(current);

    byUrl.set(url, current);
  }

  const citedPages = Array.from(byUrl.values()).sort(
    (a, b) =>
      b.citations - a.citations ||
      (b.impressions || 0) - (a.impressions || 0) ||
      a.url.localeCompare(b.url),
  );

  const totalClicks =
    options.totalClicks ??
    citedPages.reduce((sum, page) => sum + (page.clicks || 0), 0);
  const totalImpressions =
    options.totalImpressions ??
    citedPages.reduce((sum, page) => sum + (page.impressions || 0), 0);

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    source:
      options.source ??
      'Bing Webmaster Tools AI Performance CSV import. The public Bing Webmaster API does not expose AI citation rows yet.',
    summary: {
      totalCitations:
        options.totalCitations ??
        citedPages.reduce((sum, page) => sum + page.citations, 0),
      averageCitedPages: options.averageCitedPages ?? citedPages.length,
      totalClicks,
      totalImpressions,
      averageCtr:
        options.averageCtr ??
        (totalImpressions > 0 ? totalClicks / totalImpressions : 0),
    },
    citedPages,
  };
}
