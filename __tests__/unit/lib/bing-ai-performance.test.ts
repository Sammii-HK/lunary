import { getBingAiPerformanceSnapshot } from '@/lib/bing/ai-performance';

describe('Bing AI Performance snapshot', () => {
  it('loads the manual Bing citation summary', () => {
    const snapshot = getBingAiPerformanceSnapshot();

    expect(snapshot.summary.totalCitations).toBe(333);
    expect(snapshot.summary.averageCitedPages).toBe(62);
    expect(snapshot.summary.totalClicks).toBe(21);
    expect(snapshot.summary.totalImpressions).toBe(1200);
    expect(snapshot.summary.averageCtr).toBe(0.018);
    expect(snapshot.source).toContain('AI Performance');
  });
});
