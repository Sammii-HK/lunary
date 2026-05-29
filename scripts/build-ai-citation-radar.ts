#!/usr/bin/env tsx

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from 'dotenv';

import { getBingAiPerformanceSnapshot } from '@/lib/bing/ai-performance';
import { getBingTopPages, getBingTopQueries } from '@/lib/bing/webmaster';
import { getTopPages, getTopQueries } from '@/lib/google/search-console';
import {
  createCitationRadarReport,
  loadCitationFindings,
  renderCitationRadarMarkdown,
  type AiReferralConversion,
  type AiReferralSummary,
  type ApiSourceState,
  type SearchMetricRow,
} from '@/lib/seo/citation-radar';
import { loadAiCitationMap } from '@/lib/seo/ai-citation-readiness';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

type Args = Map<string, string | boolean>;

function parseArgs(argv: string[]) {
  const args: Args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];
    if (!part.startsWith('--')) continue;

    const [rawKey, inlineValue] = part.slice(2).split('=');
    if (inlineValue !== undefined) {
      args.set(rawKey, inlineValue);
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args.set(rawKey, true);
      continue;
    }

    args.set(rawKey, next);
    index += 1;
  }

  return args;
}

function dateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function stringArg(args: Args, key: string, fallback: string) {
  const value = args.get(key);
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function boolArg(args: Args, key: string) {
  return args.get(key) === true || args.get(key) === 'true';
}

function unavailable<T>(source: string, error: unknown): ApiSourceState<T> {
  return {
    available: false,
    source,
    reason: error instanceof Error ? error.message : String(error),
  };
}

async function loadGoogleSearchConsole(
  startDate: string,
  endDate: string,
  skipLive: boolean,
): Promise<
  ApiSourceState<{
    topQueries: SearchMetricRow[];
    topPages: SearchMetricRow[];
  }>
> {
  const source = 'Google Search Console API';
  if (skipLive) {
    return { available: false, source, reason: '--skip-live was provided' };
  }

  try {
    const [topQueries, topPages] = await Promise.all([
      getTopQueries(startDate, endDate, 25),
      getTopPages(startDate, endDate, 25),
    ]);
    return {
      available: true,
      source,
      data: { topQueries, topPages },
    };
  } catch (error) {
    return unavailable(source, error);
  }
}

async function loadBingWebmaster(
  startDate: string,
  endDate: string,
  skipLive: boolean,
): Promise<
  ApiSourceState<{
    topQueries: SearchMetricRow[];
    topPages: SearchMetricRow[];
  }>
> {
  const source = 'Bing Webmaster API';
  if (skipLive) {
    return { available: false, source, reason: '--skip-live was provided' };
  }

  try {
    const [topQueries, topPages] = await Promise.all([
      getBingTopQueries(startDate, endDate, 25),
      getBingTopPages(startDate, endDate, 25),
    ]);
    return {
      available: true,
      source,
      data: { topQueries, topPages },
    };
  } catch (error) {
    return unavailable(source, error);
  }
}

function postHogApiHost() {
  const configured =
    process.env.POSTHOG_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    'https://eu.posthog.com';
  const normalized = configured.replace(/\/$/, '');

  if (normalized === 'https://eu.i.posthog.com')
    return 'https://eu.posthog.com';
  if (normalized === 'https://us.i.posthog.com')
    return 'https://us.posthog.com';
  return normalized;
}

function aiReferralCaseExpression() {
  return `multiIf(
    positionCaseInsensitive(coalesce(toString(properties.utm_source), ''), 'chatgpt') > 0
      OR positionCaseInsensitive(coalesce(toString(properties['$referrer']), ''), 'chatgpt') > 0
      OR positionCaseInsensitive(coalesce(toString(properties.referrer), ''), 'chatgpt') > 0,
    'chatgpt',
    positionCaseInsensitive(coalesce(toString(properties.utm_source), ''), 'perplexity') > 0
      OR positionCaseInsensitive(coalesce(toString(properties['$referrer']), ''), 'perplexity') > 0
      OR positionCaseInsensitive(coalesce(toString(properties.referrer), ''), 'perplexity') > 0,
    'perplexity',
    positionCaseInsensitive(coalesce(toString(properties.utm_source), ''), 'copilot') > 0
      OR positionCaseInsensitive(coalesce(toString(properties['$referrer']), ''), 'copilot') > 0
      OR positionCaseInsensitive(coalesce(toString(properties.referrer), ''), 'copilot') > 0
      OR positionCaseInsensitive(coalesce(toString(properties['$referrer']), ''), 'bing.com/chat') > 0,
    'copilot',
    positionCaseInsensitive(coalesce(toString(properties.utm_source), ''), 'claude') > 0
      OR positionCaseInsensitive(coalesce(toString(properties['$referrer']), ''), 'claude') > 0
      OR positionCaseInsensitive(coalesce(toString(properties.referrer), ''), 'claude') > 0,
    'claude',
    positionCaseInsensitive(coalesce(toString(properties.utm_source), ''), 'gemini') > 0
      OR positionCaseInsensitive(coalesce(toString(properties['$referrer']), ''), 'gemini') > 0
      OR positionCaseInsensitive(coalesce(toString(properties.referrer), ''), 'gemini') > 0,
    'gemini',
    positionCaseInsensitive(coalesce(toString(properties.utm_source), ''), 'google_ai') > 0
      OR positionCaseInsensitive(coalesce(toString(properties.utm_source), ''), 'google-ai') > 0,
    'google-ai',
    ''
  )`;
}

async function loadPostHogAiReferrals(
  startDate: string,
  endDate: string,
  skipLive: boolean,
): Promise<ApiSourceState<AiReferralSummary[]>> {
  const source = 'PostHog API';
  if (skipLive) {
    return { available: false, source, reason: '--skip-live was provided' };
  }

  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId =
    process.env.POSTHOG_PROJECT_ID ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    return {
      available: false,
      source,
      reason:
        'POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID/NEXT_PUBLIC_POSTHOG_PROJECT_ID are required',
    };
  }

  const aiSource = aiReferralCaseExpression();
  const query = `
    SELECT
      source,
      count() AS visits,
      count(DISTINCT distinct_id) AS users
    FROM (
      SELECT
        ${aiSource} AS source,
        distinct_id
      FROM events
      WHERE timestamp >= toDateTime('${startDate} 00:00:00')
        AND timestamp < toDateTime('${endDate} 23:59:59')
    )
    WHERE source != ''
    GROUP BY source
    ORDER BY visits DESC
  `;

  try {
    const response = await fetch(
      `${postHogApiHost()}/api/projects/${projectId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `PostHog API returned ${response.status}: ${(await response.text()).slice(0, 240)}`,
      );
    }

    const payload = (await response.json()) as {
      results?: Array<[string, number, number]>;
    };

    return {
      available: true,
      source,
      data: (payload.results || []).map(([name, visits, users]) => ({
        source: name,
        visits: Number(visits || 0),
        users: Number(users || 0),
      })),
    };
  } catch (error) {
    return unavailable(source, error);
  }
}

async function loadPostHogAiReferralConversion(
  startDate: string,
  endDate: string,
  skipLive: boolean,
): Promise<ApiSourceState<AiReferralConversion[]>> {
  const source = 'PostHog AI referral conversion API';
  if (skipLive) {
    return { available: false, source, reason: '--skip-live was provided' };
  }

  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId =
    process.env.POSTHOG_PROJECT_ID ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    return {
      available: false,
      source,
      reason:
        'POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID/NEXT_PUBLIC_POSTHOG_PROJECT_ID are required',
    };
  }

  // Closes the loop from volume to conversion: bucket each distinct_id by AI
  // engine + landing page, then join later signup / trial_started /
  // subscription_started events fired by the same distinct_id. Referrers are
  // often stripped, so these counts are a floor, not the true total.
  const aiSource = aiReferralCaseExpression();
  const query = `
    WITH ai AS (
      SELECT
        distinct_id,
        ${aiSource} AS ai_engine,
        argMin(coalesce(toString(properties.$pathname), ''), timestamp) AS landing_page,
        min(timestamp) AS first_ai_seen
      FROM events
      WHERE timestamp >= toDateTime('${startDate} 00:00:00')
        AND timestamp < toDateTime('${endDate} 23:59:59')
        AND ${aiSource} != ''
      GROUP BY distinct_id, ai_engine
    )
    SELECT
      ai.ai_engine AS ai_engine,
      ai.landing_page AS landing_page,
      count(DISTINCT ai.distinct_id) AS ai_visitors,
      count(DISTINCT if(e.event = 'signup', ai.distinct_id, NULL)) AS signups,
      count(DISTINCT if(e.event IN ('trial_started', 'subscription_started'), ai.distinct_id, NULL)) AS converters
    FROM ai
    LEFT JOIN events AS e
      ON e.distinct_id = ai.distinct_id AND e.timestamp >= ai.first_ai_seen
    GROUP BY ai.ai_engine, ai.landing_page
    ORDER BY ai_visitors DESC
    LIMIT 200
  `;

  try {
    const response = await fetch(
      `${postHogApiHost()}/api/projects/${projectId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `PostHog API returned ${response.status}: ${(await response.text()).slice(0, 240)}`,
      );
    }

    const payload = (await response.json()) as {
      results?: Array<[string, string, number, number, number]>;
    };

    return {
      available: true,
      source,
      data: (payload.results || []).map(
        ([engine, landingPage, aiVisitors, signups, converters]) => ({
          engine,
          landingPage: landingPage || '',
          aiVisitors: Number(aiVisitors || 0),
          signups: Number(signups || 0),
          converters: Number(converters || 0),
        }),
      ),
    };
  } catch (error) {
    return unavailable(source, error);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const startDate = stringArg(args, 'start-date', dateDaysAgo(29));
  const endDate = stringArg(args, 'end-date', dateDaysAgo(1));
  const outDir = stringArg(args, 'out-dir', 'docs/reports');
  const findingsPath = stringArg(
    args,
    'findings',
    'data/ai-citation-radar/findings.json',
  );
  const skipLive = boolArg(args, 'skip-live');

  const [
    googleSearchConsole,
    bingWebmaster,
    posthogAiReferrals,
    posthogAiReferralConversion,
  ] = await Promise.all([
    loadGoogleSearchConsole(startDate, endDate, skipLive),
    loadBingWebmaster(startDate, endDate, skipLive),
    loadPostHogAiReferrals(startDate, endDate, skipLive),
    loadPostHogAiReferralConversion(startDate, endDate, skipLive),
  ]);

  const report = createCitationRadarReport({
    map: loadAiCitationMap(projectRoot, 'public/ai-citation-map.json'),
    bingAiPerformance: getBingAiPerformanceSnapshot(),
    findings: loadCitationFindings(projectRoot, findingsPath),
    googleSearchConsole,
    bingWebmaster,
    posthogAiReferrals,
    posthogAiReferralConversion,
    startDate,
    endDate,
  });

  const resolvedOutDir = resolve(projectRoot, outDir);
  mkdirSync(resolvedOutDir, { recursive: true });

  const jsonPath = resolve(resolvedOutDir, 'ai-citation-radar.json');
  const markdownPath = resolve(resolvedOutDir, 'ai-citation-radar.md');
  const promptsPath = resolve(resolvedOutDir, 'ai-citation-prompts.json');

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownPath, renderCitationRadarMarkdown(report));
  writeFileSync(promptsPath, `${JSON.stringify(report.promptPack, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        summary: report.summary,
        sourceHealth: {
          googleSearchConsole: report.sources.googleSearchConsole.available,
          bingWebmaster: report.sources.bingWebmaster.available,
          posthogAiReferrals: report.sources.posthogAiReferrals.available,
          posthogAiReferralConversion:
            report.sources.posthogAiReferralConversion.available,
          browserFindings: report.sources.browserFindings.length,
        },
        outputs: {
          json: jsonPath,
          markdown: markdownPath,
          prompts: promptsPath,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.stack || error.message : String(error),
  );
  process.exit(1);
});
