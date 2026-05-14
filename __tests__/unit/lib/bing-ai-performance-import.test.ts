import {
  parseBingAiPerformanceCsv,
  parseMetricNumber,
} from '@/lib/bing/ai-performance-import';

describe('Bing AI Performance import', () => {
  it('parses rounded metric numbers', () => {
    expect(parseMetricNumber('1.2K')).toBe(1200);
    expect(parseMetricNumber('333')).toBe(333);
    expect(parseMetricNumber('1.8%')).toBe(1.8);
  });

  it('turns cited page CSV exports into a snapshot', () => {
    const snapshot = parseBingAiPerformanceCsv(
      [
        'Cited Page,Citations,Clicks,Impressions,CTR,Grounding Query',
        'https://lunary.app/grimoire/moon/phases,12,2,100,2%,moon phases meaning',
        'https://lunary.app/grimoire/moon/phases,3,1,50,2%,waxing crescent meaning',
        'https://example.com/not-lunary,99,9,999,1%,ignored',
      ].join('\n'),
      {
        totalCitations: 333,
        averageCitedPages: 62,
        totalClicks: 21,
        totalImpressions: 1200,
      },
    );

    expect(snapshot.summary.totalCitations).toBe(333);
    expect(snapshot.summary.averageCitedPages).toBe(62);
    expect(snapshot.summary.totalClicks).toBe(21);
    expect(snapshot.summary.totalImpressions).toBe(1200);
    expect(snapshot.citedPages).toHaveLength(1);
    expect(snapshot.citedPages[0]).toMatchObject({
      url: 'https://lunary.app/grimoire/moon/phases',
      citations: 15,
      clicks: 3,
      impressions: 150,
      recommendation: 'protect-expand',
    });
    expect(snapshot.citedPages[0].groundingQueries).toEqual([
      'moon phases meaning',
      'waxing crescent meaning',
    ]);
  });
});
