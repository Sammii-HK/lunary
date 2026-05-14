import { parseBingAiPerformanceSummaryText } from '@/lib/bing/ai-performance-scrape';

describe('Bing AI Performance scrape parsing', () => {
  it('parses the dashboard summary text', () => {
    const summary = parseBingAiPerformanceSummaryText(`
      Total Citations
      333
      Avg. Cited Pages
      62
      Total Clicks
      21
      Total Impressions
      1.2K
      Avg. CTR
      1.8%
    `);

    expect(summary).toMatchObject({
      totalCitations: 333,
      averageCitedPages: 62,
      totalClicks: 21,
      totalImpressions: 1200,
    });
    expect(summary.averageCtr).toBeCloseTo(0.018);
  });
});
