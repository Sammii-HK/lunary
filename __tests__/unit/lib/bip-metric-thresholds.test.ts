import { filterVisibleMetrics } from '@/lib/bip/metric-thresholds';

describe('BIP metric thresholds', () => {
  it('labels organic clicks without calling them Google-only', () => {
    const metrics = filterVisibleMetrics({
      clicksPerDay: 75,
    });

    expect(metrics.visible).toContainEqual(
      expect.objectContaining({
        key: 'clicksPerDay',
        label: 'organic clicks/day',
      }),
    );
  });

  it('can use Bing AI citations as a visible BIP metric', () => {
    const metrics = filterVisibleMetrics({
      aiCitations: 333,
    });

    expect(metrics.hero).toEqual(
      expect.objectContaining({
        key: 'aiCitations',
        label: 'Bing AI citations',
        formatted: '333',
      }),
    );
  });
});
