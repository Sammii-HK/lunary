import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

export type BingAiCitedPage = {
  url: string;
  citations: number;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  groundingQueries?: string[];
  recommendation?: 'protect' | 'expand' | 'protect-expand';
};

export type BingAiPerformanceSnapshot = {
  generatedAt: string | null;
  source: string;
  summary: {
    totalCitations: number;
    averageCitedPages: number;
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
  };
  citedPages: BingAiCitedPage[];
};

const SNAPSHOT_PATH = resolvePath(
  process.cwd(),
  'data',
  'bing-ai-performance.json',
);

export function getBingAiPerformanceSnapshot(): BingAiPerformanceSnapshot {
  try {
    const parsed = JSON.parse(
      readFileSync(SNAPSHOT_PATH, 'utf8'),
    ) as Partial<BingAiPerformanceSnapshot>;

    return {
      generatedAt: parsed.generatedAt ?? null,
      source:
        parsed.source ??
        'data/bing-ai-performance.json manual AI Performance snapshot',
      summary: {
        totalCitations: Number(parsed.summary?.totalCitations || 0),
        averageCitedPages: Number(parsed.summary?.averageCitedPages || 0),
        totalClicks: Number(parsed.summary?.totalClicks || 0),
        totalImpressions: Number(parsed.summary?.totalImpressions || 0),
        averageCtr: Number(parsed.summary?.averageCtr || 0),
      },
      citedPages: Array.isArray(parsed.citedPages)
        ? parsed.citedPages
            .map((page) => ({
              url: page.url || '',
              citations: Number(page.citations || 0),
              clicks: Number(page.clicks || 0),
              impressions: Number(page.impressions || 0),
              ctr: Number(page.ctr || 0),
              groundingQueries: Array.isArray(page.groundingQueries)
                ? page.groundingQueries
                : [],
              recommendation: page.recommendation,
            }))
            .filter((page) => page.url)
        : [],
    };
  } catch {
    return {
      generatedAt: null,
      source: 'missing data/bing-ai-performance.json',
      summary: {
        totalCitations: 0,
        averageCitedPages: 0,
        totalClicks: 0,
        totalImpressions: 0,
        averageCtr: 0,
      },
      citedPages: [],
    };
  }
}
