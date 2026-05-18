import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { BingAiPerformanceSnapshot } from '@/lib/bing/ai-performance';
import type { AiCitationMap, AiCitationSurface } from './ai-citation-readiness';

export type CitationRadarEngine =
  | 'bing-ai-performance'
  | 'google-ai-overview'
  | 'google-ai-mode'
  | 'chatgpt-search'
  | 'perplexity'
  | 'claude-search'
  | 'copilot'
  | 'gemini'
  | 'manual';

export type CitationSource = {
  url: string;
  title?: string;
  domain?: string;
  snippet?: string;
  position?: number;
};

export type CitationFinding = {
  capturedAt: string;
  engine: CitationRadarEngine;
  query: string;
  promptId?: string;
  topic?: string;
  locale?: string;
  country?: string;
  citedSources: CitationSource[];
  screenshotPath?: string;
  notes?: string;
};

export type CitationRadarPrompt = {
  id: string;
  topic: string;
  prompt: string;
  targetUrl: string;
  entities: string[];
  source: 'ai-citation-map';
};

export type SearchMetricRow = {
  query?: string;
  page?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type ApiSourceState<T> =
  | {
      available: true;
      source: string;
      data: T;
    }
  | {
      available: false;
      source: string;
      reason: string;
    };

export type AiReferralSummary = {
  source: string;
  visits: number;
  users: number;
  conversions?: number;
};

export type CitationRadarOpportunity = {
  promptId: string;
  prompt: string;
  topic: string;
  targetUrl: string;
  status:
    | 'cited'
    | 'bing-cited'
    | 'competitor-cited'
    | 'traffic-without-browser-proof'
    | 'needs-browser-audit';
  evidence: string[];
  nextAction: string;
};

export type CitationRadarReport = {
  generatedAt: string;
  window: {
    startDate: string;
    endDate: string;
  };
  summary: {
    promptCount: number;
    browserFindingCount: number;
    browserCitationRate: number | null;
    competitorDomainCount: number;
    bingAiTotalCitations: number;
    bingAiAverageCitedPages: number;
    aiReferralVisits: number;
    opportunityCount: number;
  };
  sources: {
    bingAiPerformance: BingAiPerformanceSnapshot;
    googleSearchConsole: ApiSourceState<{
      topQueries: SearchMetricRow[];
      topPages: SearchMetricRow[];
    }>;
    bingWebmaster: ApiSourceState<{
      topQueries: SearchMetricRow[];
      topPages: SearchMetricRow[];
    }>;
    posthogAiReferrals: ApiSourceState<AiReferralSummary[]>;
    browserFindings: CitationFinding[];
  };
  promptPack: CitationRadarPrompt[];
  competitorDomains: Array<{
    domain: string;
    citations: number;
    engines: CitationRadarEngine[];
    exampleUrls: string[];
  }>;
  opportunities: CitationRadarOpportunity[];
};

const LUNARY_HOSTS = new Set(['lunary.app', 'www.lunary.app']);

export function normalizeCitationUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    url.hash = '';
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

export function domainFromUrl(rawUrl: string) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function isLunaryCitationUrl(rawUrl: string) {
  const domain = domainFromUrl(rawUrl);
  return LUNARY_HOSTS.has(domain);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeSource(source: CitationSource): CitationSource {
  const url = normalizeCitationUrl(source.url);
  return {
    ...source,
    url,
    domain: source.domain || domainFromUrl(url),
  };
}

function normalizeFinding(finding: CitationFinding): CitationFinding {
  return {
    ...finding,
    citedSources: Array.isArray(finding.citedSources)
      ? finding.citedSources.map(normalizeSource).filter((source) => source.url)
      : [],
  };
}

export function loadCitationFindings(
  projectRoot: string,
  relativePath = 'data/ai-citation-radar/findings.json',
): CitationFinding[] {
  const path = resolve(projectRoot, relativePath);
  if (!existsSync(path)) return [];

  const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${relativePath} must contain an array of findings`);
  }

  return parsed.map((finding) => normalizeFinding(finding as CitationFinding));
}

export function buildCitationPromptPack(
  map: AiCitationMap,
): CitationRadarPrompt[] {
  const surfaces = Array.isArray(map.prioritySurfaces)
    ? map.prioritySurfaces
    : [];

  return surfaces.flatMap((surface) => buildPromptsForSurface(surface));
}

function buildPromptsForSurface(
  surface: AiCitationSurface,
): CitationRadarPrompt[] {
  const topic = surface.topic || 'Lunary citation surface';
  const targetUrl = surface.canonicalUrl || '';
  const entities = Array.isArray(surface.entities) ? surface.entities : [];
  const preferredFor = Array.isArray(surface.preferredFor)
    ? surface.preferredFor.slice(0, 3)
    : [];

  return preferredFor.filter(Boolean).map((query, index) => ({
    id: `${slugify(topic)}-${index + 1}`,
    topic,
    prompt: query,
    targetUrl,
    entities,
    source: 'ai-citation-map' as const,
  }));
}

function promptMatchesFinding(
  prompt: CitationRadarPrompt,
  finding: CitationFinding,
) {
  if (finding.promptId) return finding.promptId === prompt.id;
  if (finding.topic && finding.topic === prompt.topic) return true;

  const query = finding.query.toLowerCase();
  const promptText = prompt.prompt.toLowerCase();
  return query === promptText || query.includes(promptText);
}

function findingHasLunaryCitation(finding: CitationFinding) {
  return finding.citedSources.some((source) => isLunaryCitationUrl(source.url));
}

function createCompetitorDomains(findings: CitationFinding[]) {
  const byDomain = new Map<
    string,
    {
      domain: string;
      citations: number;
      engines: Set<CitationRadarEngine>;
      exampleUrls: Set<string>;
    }
  >();

  for (const finding of findings) {
    for (const source of finding.citedSources) {
      if (!source.url || isLunaryCitationUrl(source.url)) continue;
      const domain = source.domain || domainFromUrl(source.url);
      if (!domain) continue;
      const current =
        byDomain.get(domain) ||
        ({
          domain,
          citations: 0,
          engines: new Set<CitationRadarEngine>(),
          exampleUrls: new Set<string>(),
        } satisfies {
          domain: string;
          citations: number;
          engines: Set<CitationRadarEngine>;
          exampleUrls: Set<string>;
        });
      current.citations += 1;
      current.engines.add(finding.engine);
      if (current.exampleUrls.size < 3) current.exampleUrls.add(source.url);
      byDomain.set(domain, current);
    }
  }

  return Array.from(byDomain.values())
    .map((row) => ({
      domain: row.domain,
      citations: row.citations,
      engines: Array.from(row.engines).sort(),
      exampleUrls: Array.from(row.exampleUrls),
    }))
    .sort(
      (a, b) => b.citations - a.citations || a.domain.localeCompare(b.domain),
    );
}

function pagePath(rawUrl: string) {
  try {
    return new URL(rawUrl).pathname;
  } catch {
    return rawUrl;
  }
}

function rowMatchesTarget(row: SearchMetricRow, targetUrl: string) {
  const targetPath = pagePath(targetUrl);
  return (
    Boolean(row.page && pagePath(row.page).startsWith(targetPath)) ||
    Boolean(row.query && targetPath.includes(slugify(row.query)))
  );
}

function createOpportunities(params: {
  prompts: CitationRadarPrompt[];
  findings: CitationFinding[];
  bingAiPerformance: BingAiPerformanceSnapshot;
  googleSearchConsole: ApiSourceState<{
    topQueries: SearchMetricRow[];
    topPages: SearchMetricRow[];
  }>;
  bingWebmaster: ApiSourceState<{
    topQueries: SearchMetricRow[];
    topPages: SearchMetricRow[];
  }>;
}) {
  const bingCitedUrls = new Set(
    params.bingAiPerformance.citedPages.map((page) =>
      normalizeCitationUrl(page.url),
    ),
  );
  const opportunities: CitationRadarOpportunity[] = [];

  for (const prompt of params.prompts) {
    const matchingFindings = params.findings.filter((finding) =>
      promptMatchesFinding(prompt, finding),
    );
    const hasBrowserCitation = matchingFindings.some(findingHasLunaryCitation);
    const hasBingAiCitation = bingCitedUrls.has(
      normalizeCitationUrl(prompt.targetUrl),
    );
    const trafficEvidence = collectTrafficEvidence(prompt, {
      googleSearchConsole: params.googleSearchConsole,
      bingWebmaster: params.bingWebmaster,
    });

    if (hasBrowserCitation) {
      opportunities.push({
        promptId: prompt.id,
        prompt: prompt.prompt,
        topic: prompt.topic,
        targetUrl: prompt.targetUrl,
        status: 'cited',
        evidence: matchingFindings.map(
          (finding) => `${finding.engine}: "${finding.query}"`,
        ),
        nextAction:
          'Protect this answer format: keep direct answer, schema, methodology, and internal glossary links fresh.',
      });
      continue;
    }

    if (hasBingAiCitation) {
      opportunities.push({
        promptId: prompt.id,
        prompt: prompt.prompt,
        topic: prompt.topic,
        targetUrl: prompt.targetUrl,
        status: 'bing-cited',
        evidence: ['Bing AI Performance cites this target URL.'],
        nextAction:
          'Use Bing citation proof as the model page pattern for Google/ChatGPT/Perplexity source checks.',
      });
      continue;
    }

    if (matchingFindings.length > 0) {
      const competitorDomains = Array.from(
        new Set(
          matchingFindings.flatMap((finding) =>
            finding.citedSources
              .filter((source) => !isLunaryCitationUrl(source.url))
              .map((source) => source.domain || domainFromUrl(source.url))
              .filter(Boolean),
          ),
        ),
      ).slice(0, 8);
      opportunities.push({
        promptId: prompt.id,
        prompt: prompt.prompt,
        topic: prompt.topic,
        targetUrl: prompt.targetUrl,
        status: 'competitor-cited',
        evidence: [
          ...matchingFindings.map(
            (finding) => `${finding.engine}: "${finding.query}"`,
          ),
          `Competitors cited: ${competitorDomains.join(', ') || 'unknown'}`,
          ...trafficEvidence,
        ],
        nextAction:
          'Upgrade the target page against the cited competitors: direct answer first, citeable facts, methodology/source links, and fresher supporting data.',
      });
      continue;
    }

    if (trafficEvidence.length > 0) {
      opportunities.push({
        promptId: prompt.id,
        prompt: prompt.prompt,
        topic: prompt.topic,
        targetUrl: prompt.targetUrl,
        status: 'traffic-without-browser-proof',
        evidence: trafficEvidence,
        nextAction:
          'Run this prompt in the Lunary research browser and compare cited competitors against the target page.',
      });
      continue;
    }

    opportunities.push({
      promptId: prompt.id,
      prompt: prompt.prompt,
      topic: prompt.topic,
      targetUrl: prompt.targetUrl,
      status: 'needs-browser-audit',
      evidence: [`Prompt not yet sampled: "${prompt.prompt}"`],
      nextAction:
        'Sample this prompt in the research profile, save cited sources, then upgrade the matching Lunary page if a competitor wins.',
    });
  }

  const priority: Record<CitationRadarOpportunity['status'], number> = {
    'competitor-cited': 0,
    'traffic-without-browser-proof': 1,
    'needs-browser-audit': 2,
    'bing-cited': 3,
    cited: 4,
  };

  return opportunities.sort(
    (a, b) =>
      priority[a.status] - priority[b.status] || a.topic.localeCompare(b.topic),
  );
}

function collectTrafficEvidence(
  prompt: CitationRadarPrompt,
  sources: {
    googleSearchConsole: ApiSourceState<{
      topQueries: SearchMetricRow[];
      topPages: SearchMetricRow[];
    }>;
    bingWebmaster: ApiSourceState<{
      topQueries: SearchMetricRow[];
      topPages: SearchMetricRow[];
    }>;
  },
) {
  const evidence: string[] = [];

  if (sources.googleSearchConsole.available) {
    const rows = [
      ...sources.googleSearchConsole.data.topPages,
      ...sources.googleSearchConsole.data.topQueries,
    ].filter((row) => rowMatchesTarget(row, prompt.targetUrl));
    const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
    if (impressions > 0) {
      evidence.push(
        `Google Search Console has ${impressions} impressions for matching page/query rows.`,
      );
    }
  }

  if (sources.bingWebmaster.available) {
    const rows = [
      ...sources.bingWebmaster.data.topPages,
      ...sources.bingWebmaster.data.topQueries,
    ].filter((row) => rowMatchesTarget(row, prompt.targetUrl));
    const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
    if (impressions > 0) {
      evidence.push(
        `Bing Webmaster has ${impressions} impressions for matching page/query rows.`,
      );
    }
  }

  return evidence;
}

export function createCitationRadarReport(params: {
  map: AiCitationMap;
  bingAiPerformance: BingAiPerformanceSnapshot;
  findings: CitationFinding[];
  googleSearchConsole: ApiSourceState<{
    topQueries: SearchMetricRow[];
    topPages: SearchMetricRow[];
  }>;
  bingWebmaster: ApiSourceState<{
    topQueries: SearchMetricRow[];
    topPages: SearchMetricRow[];
  }>;
  posthogAiReferrals: ApiSourceState<AiReferralSummary[]>;
  startDate: string;
  endDate: string;
  generatedAt?: string;
}): CitationRadarReport {
  const promptPack = buildCitationPromptPack(params.map);
  const browserFindings = params.findings.map(normalizeFinding);
  const competitorDomains = createCompetitorDomains(browserFindings);
  const browserCitationRate =
    browserFindings.length > 0
      ? browserFindings.filter(findingHasLunaryCitation).length /
        browserFindings.length
      : null;
  const aiReferralVisits = params.posthogAiReferrals.available
    ? params.posthogAiReferrals.data.reduce((sum, row) => sum + row.visits, 0)
    : 0;
  const opportunities = createOpportunities({
    prompts: promptPack,
    findings: browserFindings,
    bingAiPerformance: params.bingAiPerformance,
    googleSearchConsole: params.googleSearchConsole,
    bingWebmaster: params.bingWebmaster,
  });

  return {
    generatedAt: params.generatedAt || new Date().toISOString(),
    window: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
    summary: {
      promptCount: promptPack.length,
      browserFindingCount: browserFindings.length,
      browserCitationRate,
      competitorDomainCount: competitorDomains.length,
      bingAiTotalCitations: params.bingAiPerformance.summary.totalCitations,
      bingAiAverageCitedPages:
        params.bingAiPerformance.summary.averageCitedPages,
      aiReferralVisits,
      opportunityCount: opportunities.length,
    },
    sources: {
      bingAiPerformance: params.bingAiPerformance,
      googleSearchConsole: params.googleSearchConsole,
      bingWebmaster: params.bingWebmaster,
      posthogAiReferrals: params.posthogAiReferrals,
      browserFindings,
    },
    promptPack,
    competitorDomains,
    opportunities,
  };
}

function pct(value: number | null) {
  if (value === null) return 'n/a';
  return `${Math.round(value * 100)}%`;
}

function sourceStatus(source: ApiSourceState<unknown>) {
  return source.available ? 'available' : `skipped: ${source.reason}`;
}

function renderRows(rows: string[][]) {
  if (rows.length === 0) return '_None yet._\n';
  return rows.map((row) => `| ${row.join(' | ')} |`).join('\n') + '\n';
}

function renderOpportunityRows(opportunities: CitationRadarOpportunity[]) {
  return opportunities.map((item) => [
    item.status,
    item.prompt,
    item.topic,
    item.targetUrl,
    item.evidence.join('<br>'),
    item.nextAction,
  ]);
}

export function renderCitationRadarMarkdown(report: CitationRadarReport) {
  const topCompetitors = report.competitorDomains.slice(0, 12);
  const topOpportunities = report.opportunities.slice(0, 20);
  const promptRows = report.promptPack
    .slice(0, 30)
    .map((prompt) => [
      prompt.id,
      prompt.topic,
      prompt.prompt,
      prompt.targetUrl,
    ]);

  return `# AI Citation Radar

Generated: ${report.generatedAt}
Window: ${report.window.startDate} to ${report.window.endDate}

## Summary

| Metric | Value |
| --- | ---: |
| Prompt pack size | ${report.summary.promptCount} |
| Browser findings captured | ${report.summary.browserFindingCount} |
| Browser citation rate | ${pct(report.summary.browserCitationRate)} |
| Competitor domains found | ${report.summary.competitorDomainCount} |
| Bing AI citations | ${report.summary.bingAiTotalCitations} |
| Bing average cited pages | ${report.summary.bingAiAverageCitedPages} |
| AI referral visits via API | ${report.summary.aiReferralVisits} |

## Source Health

| Source | Status |
| --- | --- |
| Bing AI Performance snapshot | available |
| Google Search Console API | ${sourceStatus(report.sources.googleSearchConsole)} |
| Bing Webmaster API | ${sourceStatus(report.sources.bingWebmaster)} |
| PostHog AI referrals API | ${sourceStatus(report.sources.posthogAiReferrals)} |
| Browser citation findings | ${report.sources.browserFindings.length} findings |

## Competitor Citation Domains

| Domain | Citations | Engines | Example URLs |
| --- | ---: | --- | --- |
${renderRows(
  topCompetitors.map((domain) => [
    domain.domain,
    String(domain.citations),
    domain.engines.join(', '),
    domain.exampleUrls.join('<br>'),
  ]),
)}
## Top Prompt Opportunities

| Status | Prompt | Topic | Target | Evidence | Next Action |
| --- | --- | --- | --- | --- | --- |
${renderRows(renderOpportunityRows(topOpportunities))}
## Prompt Pack

Use these in the \`lunary-research\` Cloak profile when an API does not expose citation/source panels. Save findings to \`data/ai-citation-radar/findings.json\`.

| ID | Topic | Prompt | Target |
| --- | --- | --- | --- |
${renderRows(promptRows)}`;
}
