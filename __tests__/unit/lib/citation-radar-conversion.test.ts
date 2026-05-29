import {
  createCitationRadarReport,
  renderCitationRadarMarkdown,
  type AiReferralConversion,
  type ApiSourceState,
} from '@/lib/seo/citation-radar';
import type { AiCitationMap } from '@/lib/seo/ai-citation-readiness';
import type { BingAiPerformanceSnapshot } from '@/lib/bing/ai-performance';

const citationMap = {
  prioritySurfaces: [
    {
      topic: 'Mercury retrograde',
      canonicalUrl: 'https://lunary.app/grimoire/facts/mercury-retrograde',
      preferredFor: ['is mercury retrograde right now'],
      entities: ['mercury retrograde'],
    },
  ],
} satisfies AiCitationMap;

const bingAiPerformance = {
  generatedAt: '2026-05-29T00:00:00.000Z',
  source: 'test',
  summary: {
    totalCitations: 0,
    averageCitedPages: 0,
    totalClicks: 0,
    totalImpressions: 0,
    averageCtr: 0,
  },
  citedPages: [],
} satisfies BingAiPerformanceSnapshot;

function unavailable(source: string) {
  return { available: false as const, source, reason: 'test' };
}

const conversionRows: AiReferralConversion[] = [
  {
    engine: 'perplexity',
    landingPage: '/grimoire/facts/mercury-retrograde',
    aiVisitors: 40,
    signups: 6,
    converters: 2,
  },
  {
    engine: 'chatgpt',
    landingPage: '/birth-chart',
    aiVisitors: 25,
    signups: 3,
    converters: 1,
  },
];

function reportWithConversion(
  conversion: ApiSourceState<AiReferralConversion[]> = {
    available: true,
    source: 'PostHog AI referral conversion API',
    data: conversionRows,
  },
) {
  return createCitationRadarReport({
    map: citationMap,
    bingAiPerformance,
    findings: [],
    googleSearchConsole: unavailable('Google Search Console API'),
    bingWebmaster: unavailable('Bing Webmaster API'),
    posthogAiReferrals: unavailable('PostHog API'),
    posthogAiReferralConversion: conversion,
    startDate: '2026-04-30',
    endDate: '2026-05-29',
    generatedAt: '2026-05-29T12:00:00.000Z',
  });
}

describe('citation radar AI referral conversion', () => {
  it('rolls up AI-referred signups and converters into the summary', () => {
    const report = reportWithConversion();

    expect(report.summary.aiReferralSignups).toBe(9);
    expect(report.summary.aiReferralConverters).toBe(3);
    expect(report.sources.posthogAiReferralConversion.available).toBe(true);
  });

  it('renders the cited-page to signup table by landing page', () => {
    const markdown = renderCitationRadarMarkdown(reportWithConversion());

    expect(markdown).toContain('## AI Referral to Signup by Landing Page');
    expect(markdown).toContain(
      '| perplexity | /grimoire/facts/mercury-retrograde | 40 | 6 | 2 |',
    );
    expect(markdown).toContain('| chatgpt | /birth-chart | 25 | 3 | 1 |');
  });

  it('reports zero conversion totals when the PostHog conversion query is unavailable', () => {
    const report = reportWithConversion(
      unavailable('PostHog AI referral conversion API'),
    );

    expect(report.summary.aiReferralSignups).toBe(0);
    expect(report.summary.aiReferralConverters).toBe(0);

    const markdown = renderCitationRadarMarkdown(report);
    expect(markdown).toContain('## AI Referral to Signup by Landing Page');
    expect(markdown).toContain('_None yet._');
  });
});
