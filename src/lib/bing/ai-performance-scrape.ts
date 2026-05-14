import { parseMetricNumber } from './ai-performance-import';

export function metricFromBingAiText(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `${escaped}[\\s\\S]{0,120}?([\\d,.]+\\s?[KkMm]?%?)`,
    'i',
  );
  const match = text.match(regex);
  return match ? parseMetricNumber(match[1]) : 0;
}

export function parseBingAiPerformanceSummaryText(text: string) {
  const totalCitations = metricFromBingAiText(text, 'Total Citations');
  const averageCitedPages = metricFromBingAiText(text, 'Avg. Cited Pages');
  const totalClicks = metricFromBingAiText(text, 'Total Clicks');
  const totalImpressions = metricFromBingAiText(text, 'Total Impressions');
  const averageCtr = metricFromBingAiText(text, 'Avg. CTR') / 100;

  return {
    totalCitations,
    averageCitedPages,
    totalClicks,
    totalImpressions,
    averageCtr:
      averageCtr || (totalImpressions > 0 ? totalClicks / totalImpressions : 0),
  };
}
