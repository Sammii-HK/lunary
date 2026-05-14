import { getSearchConsoleData, getTopPages } from '@/lib/google/search-console';
import {
  getBingTopPages,
  getBingWebmasterPerformance,
} from '@/lib/bing/webmaster';
import { getBingAiPerformanceSnapshot } from '@/lib/bing/ai-performance';

export interface BipAcquisitionSnapshot {
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  impressionsPerDay: number;
  clicksPerDay: number;
  topPages: Array<{ url: string; clicks: number; impressions: number }>;
  sources: {
    google: boolean;
    bing: boolean;
    bingAiCitations: number;
    bingAiCitedPages: number;
  };
}

function dayCount(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(1, diff);
}

function weightedPosition(
  values: Array<{ averagePosition: number; impressions: number }>,
) {
  const denominator = values.reduce((sum, row) => sum + row.impressions, 0);
  if (denominator <= 0) return 0;
  return (
    values.reduce(
      (sum, row) => sum + row.averagePosition * row.impressions,
      0,
    ) / denominator
  );
}

export async function getBipAcquisitionSnapshot(
  startDate: string,
  endDate: string,
): Promise<BipAcquisitionSnapshot> {
  const [
    googlePerformanceResult,
    googlePagesResult,
    bingPerformanceResult,
    bingPagesResult,
  ] = await Promise.allSettled([
    getSearchConsoleData(startDate, endDate),
    getTopPages(startDate, endDate, 10),
    getBingWebmasterPerformance(startDate, endDate),
    getBingTopPages(startDate, endDate, 10),
  ]);

  const googlePerformance =
    googlePerformanceResult.status === 'fulfilled'
      ? googlePerformanceResult.value
      : null;
  const bingPerformance =
    bingPerformanceResult.status === 'fulfilled'
      ? bingPerformanceResult.value
      : null;
  const googlePages =
    googlePagesResult.status === 'fulfilled' ? googlePagesResult.value : [];
  const bingPages =
    bingPagesResult.status === 'fulfilled' ? bingPagesResult.value : [];

  const clicks =
    Number(googlePerformance?.totalClicks || 0) +
    Number(bingPerformance?.totalClicks || 0);
  const impressions =
    Number(googlePerformance?.totalImpressions || 0) +
    Number(bingPerformance?.totalImpressions || 0);
  const days = dayCount(startDate, endDate);
  const aiSnapshot = getBingAiPerformanceSnapshot();

  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    averagePosition: weightedPosition([
      {
        averagePosition: Number(googlePerformance?.averagePosition || 0),
        impressions: Number(googlePerformance?.totalImpressions || 0),
      },
      {
        averagePosition: Number(bingPerformance?.averagePosition || 0),
        impressions: Number(bingPerformance?.totalImpressions || 0),
      },
    ]),
    impressionsPerDay: Math.round(impressions / days),
    clicksPerDay: Math.round(clicks / days),
    topPages: [
      ...bingPages.map((page) => ({
        url: page.page,
        clicks: page.clicks,
        impressions: page.impressions,
      })),
      ...googlePages.map((page) => ({
        url: page.page,
        clicks: page.clicks,
        impressions: page.impressions,
      })),
    ]
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 10),
    sources: {
      google: Boolean(googlePerformance),
      bing: Boolean(bingPerformance),
      bingAiCitations: aiSnapshot?.totalCitations || 0,
      bingAiCitedPages: aiSnapshot?.averageCitedPages || 0,
    },
  };
}
