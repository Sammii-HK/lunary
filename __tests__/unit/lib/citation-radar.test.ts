import {
  buildCitationPromptPack,
  createCitationRadarReport,
  domainFromUrl,
  isLunaryCitationUrl,
  type CitationFinding,
} from '@/lib/seo/citation-radar';
import type { AiCitationMap } from '@/lib/seo/ai-citation-readiness';
import type { BingAiPerformanceSnapshot } from '@/lib/bing/ai-performance';

const citationMap = {
  prioritySurfaces: [
    {
      topic: 'Transits and current sky',
      canonicalUrl: 'https://lunary.app/grimoire/transits',
      preferredFor: ['astrology transits', 'current cosmic weather'],
      entities: ['transits', 'retrogrades'],
    },
  ],
} satisfies AiCitationMap;

const bingAiPerformance = {
  generatedAt: '2026-05-18T00:00:00.000Z',
  source: 'test',
  summary: {
    totalCitations: 8,
    averageCitedPages: 2,
    totalClicks: 1,
    totalImpressions: 20,
    averageCtr: 0.05,
  },
  citedPages: [],
} satisfies BingAiPerformanceSnapshot;

function unavailable(source: string) {
  return { available: false as const, source, reason: 'test' };
}

describe('citation radar', () => {
  it('builds browser prompt packs from the AI citation map', () => {
    expect(buildCitationPromptPack(citationMap)).toEqual([
      expect.objectContaining({
        id: 'transits-and-current-sky-1',
        prompt: 'astrology transits',
        targetUrl: 'https://lunary.app/grimoire/transits',
      }),
      expect.objectContaining({
        id: 'transits-and-current-sky-2',
        prompt: 'current cosmic weather',
      }),
    ]);
  });

  it('normalizes Lunary and competitor citation domains', () => {
    expect(
      domainFromUrl('https://www.lunary.app/grimoire/transits#today'),
    ).toBe('lunary.app');
    expect(isLunaryCitationUrl('https://lunary.app/grimoire/transits')).toBe(
      true,
    );
    expect(isLunaryCitationUrl('https://example.com/astrology')).toBe(false);
  });

  it('summarizes browser findings and competitor opportunities', () => {
    const findings: CitationFinding[] = [
      {
        capturedAt: '2026-05-18T12:00:00.000Z',
        engine: 'perplexity',
        query: 'astrology transits',
        promptId: 'transits-and-current-sky-1',
        citedSources: [
          { url: 'https://lunary.app/grimoire/transits' },
          { url: 'https://competitor.example/transits' },
        ],
      },
      {
        capturedAt: '2026-05-18T12:05:00.000Z',
        engine: 'chatgpt-search',
        query: 'current cosmic weather',
        promptId: 'transits-and-current-sky-2',
        citedSources: [{ url: 'https://competitor.example/current-sky' }],
      },
    ];

    const report = createCitationRadarReport({
      map: citationMap,
      bingAiPerformance,
      findings,
      googleSearchConsole: unavailable('Google Search Console API'),
      bingWebmaster: unavailable('Bing Webmaster API'),
      posthogAiReferrals: unavailable('PostHog API'),
      startDate: '2026-04-19',
      endDate: '2026-05-17',
      generatedAt: '2026-05-18T12:10:00.000Z',
    });

    expect(report.summary.browserFindingCount).toBe(2);
    expect(report.summary.browserCitationRate).toBe(0.5);
    expect(report.competitorDomains).toEqual([
      expect.objectContaining({
        domain: 'competitor.example',
        citations: 2,
        engines: ['chatgpt-search', 'perplexity'],
      }),
    ]);
    expect(report.opportunities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          topic: 'Transits and current sky',
          status: 'cited',
        }),
        expect.objectContaining({
          topic: 'Transits and current sky',
          status: 'needs-browser-audit',
        }),
      ]),
    );
  });
});
