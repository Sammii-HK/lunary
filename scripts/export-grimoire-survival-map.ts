#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { sql } from '@vercel/postgres';
import { querySearchConsole } from '@/lib/google/search-console';
import generateSitemap from '@/app/sitemap';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

type FamilyKey =
  | 'placements_leaf'
  | 'houses_leaf'
  | 'houses_planet_in_house'
  | 'compatibility_leaf'
  | 'horoscope_yearly'
  | 'horoscope_monthly'
  | 'horoscope_weekly'
  | 'horoscope_daily'
  | 'planet_page'
  | 'planet_in_signs'
  | 'zodiac_sign'
  | 'zodiac_in_the_chart'
  | 'retrograde_planet'
  | 'moon_phase_leaf'
  | 'moon_timed_leaf'
  | 'other';

interface FamilyDefinition {
  key: FamilyKey;
  label: string;
  description: string;
  pattern: RegExp;
}

interface PageMetrics {
  path: string;
  family: FamilyKey;
  gscClicks: number;
  gscImpressions: number;
  gscCtr: number;
  gscPosition: number;
  organicLandingViews: number;
  organicLandingUsers: number;
  seoSignups: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
  }>;
  suggestedAction: 'keep_indexed' | 'keep_live_deprioritize' | 'merge_later';
  rationale: string;
}

const FAMILY_DEFINITIONS: FamilyDefinition[] = [
  {
    key: 'placements_leaf',
    label: 'Placements leaves',
    description: 'Specific planet-in-sign interpretation pages.',
    pattern: /^\/grimoire\/placements\/[^/]+\/?$/,
  },
  {
    key: 'houses_planet_in_house',
    label: 'Planet in house leaves',
    description: 'Nested house leaves such as planet-in-house combinations.',
    pattern: /^\/grimoire\/houses\/[^/]+\/[^/]+\/?$/,
  },
  {
    key: 'houses_leaf',
    label: 'House leaves',
    description: 'Top-level house pages and single-segment house subpages.',
    pattern: /^\/grimoire\/houses\/[^/]+\/?$/,
  },
  {
    key: 'compatibility_leaf',
    label: 'Compatibility leaves',
    description: 'Sign-pair compatibility landing pages.',
    pattern: /^\/grimoire\/compatibility\/[^/]+\/?$/,
  },
  {
    key: 'horoscope_monthly',
    label: 'Monthly horoscopes',
    description: 'Sign + year + month horoscope pages.',
    pattern: /^\/grimoire\/horoscopes\/[^/]+\/\d{4}\/[^/]+\/?$/,
  },
  {
    key: 'horoscope_yearly',
    label: 'Yearly horoscopes',
    description: 'Sign + year horoscope pages.',
    pattern: /^\/grimoire\/horoscopes\/[^/]+\/\d{4}\/?$/,
  },
  {
    key: 'horoscope_weekly',
    label: 'Weekly horoscopes',
    description: 'Weekly forecast hub and sign pages.',
    pattern: /^\/grimoire\/horoscopes\/weekly(?:\/[^/]+)?\/?$/,
  },
  {
    key: 'horoscope_daily',
    label: 'Daily horoscopes',
    description: 'Daily forecast hub and sign pages.',
    pattern: /^\/grimoire\/horoscopes\/today(?:\/[^/]+)?\/?$/,
  },
  {
    key: 'planet_in_signs',
    label: 'Planet in signs',
    description: 'Planet matrix pages for sign interpretation.',
    pattern: /^\/grimoire\/astronomy\/planets\/[^/]+\/in-signs\/?$/,
  },
  {
    key: 'planet_page',
    label: 'Planet authority pages',
    description: 'Main planet meaning pages.',
    pattern: /^\/grimoire\/astronomy\/planets\/[^/]+\/?$/,
  },
  {
    key: 'zodiac_in_the_chart',
    label: 'Sign in the chart',
    description: 'Applied zodiac pages.',
    pattern: /^\/grimoire\/zodiac\/[^/]+\/in-the-chart\/?$/,
  },
  {
    key: 'zodiac_sign',
    label: 'Zodiac authority pages',
    description: 'Main zodiac meaning pages.',
    pattern: /^\/grimoire\/zodiac\/[^/]+\/?$/,
  },
  {
    key: 'retrograde_planet',
    label: 'Retrograde leaves',
    description: 'Planet retrograde pages.',
    pattern: /^\/grimoire\/astronomy\/retrogrades\/[^/]+\/?$/,
  },
  {
    key: 'moon_phase_leaf',
    label: 'Moon phase leaves',
    description: 'Specific moon phase explainer pages.',
    pattern: /^\/grimoire\/moon\/phases\/[^/]+\/?$/,
  },
  {
    key: 'moon_timed_leaf',
    label: 'Timed moon pages',
    description: 'Yearly and monthly moon-event pages.',
    pattern:
      /^\/grimoire\/moon\/(?:\d{4}(?:\/[^/]+)?|full-moons\/[^/]+|moon-in\/[^/]+)\/?$/,
  },
];

const SEARCH_REFERRER_SQL = `
  (
    LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%google.%'
    OR LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%bing.%'
    OR LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%duckduckgo.%'
    OR LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%yahoo.%'
    OR LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%ecosia.%'
    OR LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%brave.%'
    OR LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%qwant.%'
    OR LOWER(COALESCE(metadata->>'referrer', '')) LIKE '%search.%'
  )
`;

function parseArgs(argv: string[]) {
  const args = new Map<string, string | boolean>();

  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith('--')) continue;

    const [rawKey, inlineValue] = part.slice(2).split('=');
    if (inlineValue !== undefined) {
      args.set(rawKey, inlineValue);
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args.set(rawKey, true);
      continue;
    }

    args.set(rawKey, next);
    i += 1;
  }

  return args;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function normalizePath(input: string): string | null {
  if (!input) return null;

  try {
    const url = input.startsWith('http')
      ? new URL(input)
      : new URL(input, 'https://lunary.app');
    const pathname = url.pathname.replace(/\/$/, '') || '/';
    return pathname.startsWith('/grimoire') ? pathname : null;
  } catch {
    return input.startsWith('/grimoire')
      ? input.replace(/\/$/, '') || '/'
      : null;
  }
}

function classifyFamily(path: string): FamilyKey {
  const match = FAMILY_DEFINITIONS.find((family) => family.pattern.test(path));
  return match?.key || 'other';
}

function familyLabel(familyKey: FamilyKey): string {
  return (
    FAMILY_DEFINITIONS.find((family) => family.key === familyKey)?.label ||
    'Other'
  );
}

function suggestAction(metrics: PageMetrics): {
  action: PageMetrics['suggestedAction'];
  rationale: string;
} {
  if (
    metrics.seoSignups > 0 ||
    metrics.gscClicks >= 10 ||
    metrics.gscImpressions >= 200 ||
    metrics.organicLandingUsers >= 10
  ) {
    return {
      action: 'keep_indexed',
      rationale:
        'This page shows meaningful external demand or conversion value.',
    };
  }

  if (
    metrics.gscClicks > 0 ||
    metrics.gscImpressions >= 25 ||
    metrics.organicLandingViews >= 3 ||
    metrics.organicLandingUsers >= 2 ||
    metrics.topQueries.length > 0
  ) {
    return {
      action: 'keep_live_deprioritize',
      rationale:
        'This page has some signal, but not enough yet to force it as a recovery surface.',
    };
  }

  return {
    action: 'merge_later',
    rationale:
      'No meaningful demand surfaced in the current measurement window.',
  };
}

async function seedSitemapPages(
  pages: Map<string, PageMetrics>,
  allowedFamilies: Set<string> | null,
) {
  const sitemapEntries = await generateSitemap();

  for (const entry of sitemapEntries) {
    const path = normalizePath(entry.url);
    if (!path) continue;

    const family = classifyFamily(path);
    if (family === 'other') continue;
    if (allowedFamilies && !allowedFamilies.has(family)) continue;
    if (pages.has(path)) continue;

    pages.set(path, {
      path,
      family,
      gscClicks: 0,
      gscImpressions: 0,
      gscCtr: 0,
      gscPosition: 0,
      organicLandingViews: 0,
      organicLandingUsers: 0,
      seoSignups: 0,
      topQueries: [],
      suggestedAction: 'merge_later',
      rationale: '',
    });
  }
}

async function fetchGscPageRows(
  startDate: string,
  endDate: string,
  siteUrl?: string,
): Promise<
  Map<
    string,
    Omit<
      PageMetrics,
      | 'family'
      | 'organicLandingViews'
      | 'organicLandingUsers'
      | 'seoSignups'
      | 'suggestedAction'
      | 'rationale'
    >
  >
> {
  const report = await querySearchConsole({
    startDate,
    endDate,
    siteUrl,
    dimensions: ['page', 'query'],
    rowLimit: 25000,
  });

  const byPage = new Map<
    string,
    Omit<
      PageMetrics,
      | 'family'
      | 'organicLandingViews'
      | 'organicLandingUsers'
      | 'seoSignups'
      | 'suggestedAction'
      | 'rationale'
    >
  >();

  for (const row of report.rows) {
    const path = normalizePath(row.keys[0] || '');
    const query = (row.keys[1] || '').trim();
    if (!path) continue;

    const existing = byPage.get(path) || {
      path,
      gscClicks: 0,
      gscImpressions: 0,
      gscCtr: 0,
      gscPosition: 0,
      topQueries: [],
    };

    existing.gscClicks += row.clicks;
    existing.gscImpressions += row.impressions;
    existing.gscPosition += row.position * row.impressions;

    if (query) {
      const queryRow = existing.topQueries.find((item) => item.query === query);
      if (queryRow) {
        queryRow.clicks += row.clicks;
        queryRow.impressions += row.impressions;
      } else {
        existing.topQueries.push({
          query,
          clicks: row.clicks,
          impressions: row.impressions,
        });
      }
    }

    byPage.set(path, existing);
  }

  for (const entry of byPage.values()) {
    entry.gscCtr =
      entry.gscImpressions > 0 ? entry.gscClicks / entry.gscImpressions : 0;
    entry.gscPosition =
      entry.gscImpressions > 0 ? entry.gscPosition / entry.gscImpressions : 0;
    entry.topQueries = entry.topQueries
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 5);
  }

  return byPage;
}

async function fetchOrganicLandingMetrics(
  startDate: string,
  endDate: string,
): Promise<
  Map<string, { organicLandingViews: number; organicLandingUsers: number }>
> {
  const result = await sql.query(
    `
      SELECT
        page_path,
        COUNT(*)::int AS views,
        COUNT(DISTINCT COALESCE(user_id, 'anon:' || anonymous_id))::int AS users
      FROM conversion_events
      WHERE event_type = 'page_viewed'
        AND page_path LIKE '/grimoire/%'
        AND created_at >= $1::date
        AND created_at < ($2::date + INTERVAL '1 day')
        AND ${SEARCH_REFERRER_SQL}
      GROUP BY page_path
      ORDER BY views DESC
    `,
    [startDate, endDate],
  );

  const byPath = new Map<
    string,
    { organicLandingViews: number; organicLandingUsers: number }
  >();

  for (const row of result.rows) {
    const path = normalizePath(String(row.page_path || ''));
    if (!path) continue;
    byPath.set(path, {
      organicLandingViews: Number(row.views || 0),
      organicLandingUsers: Number(row.users || 0),
    });
  }

  return byPath;
}

async function fetchSeoSignupMetrics(
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  const result = await sql.query(
    `
      SELECT
        first_touch_page,
        COUNT(*)::int AS signups
      FROM user_attribution
      WHERE first_touch_source = 'seo'
        AND first_touch_page LIKE '/grimoire/%'
        AND first_touch_at >= $1::date
        AND first_touch_at < ($2::date + INTERVAL '1 day')
      GROUP BY first_touch_page
      ORDER BY signups DESC
    `,
    [startDate, endDate],
  );

  const byPath = new Map<string, number>();
  for (const row of result.rows) {
    const path = normalizePath(String(row.first_touch_page || ''));
    if (!path) continue;
    byPath.set(path, Number(row.signups || 0));
  }

  return byPath;
}

function toMarkdown(
  pages: PageMetrics[],
  startDate: string,
  endDate: string,
  sourceNotes: string[],
): string {
  const families = new Map<FamilyKey, PageMetrics[]>();
  for (const page of pages) {
    const familyPages = families.get(page.family) || [];
    familyPages.push(page);
    families.set(page.family, familyPages);
  }

  const lines: string[] = [];
  lines.push('# Grimoire Survival Map');
  lines.push('');
  lines.push(`Range: ${startDate} to ${endDate}`);
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  for (const note of sourceNotes) {
    lines.push(`- ${note}`);
  }

  for (const [family, familyPages] of families.entries()) {
    const ranked = familyPages.sort(
      (a, b) =>
        b.gscClicks - a.gscClicks ||
        b.gscImpressions - a.gscImpressions ||
        b.organicLandingViews - a.organicLandingViews,
    );
    const keep = ranked.filter(
      (page) => page.suggestedAction === 'keep_indexed',
    ).length;
    const deprioritize = ranked.filter(
      (page) => page.suggestedAction === 'keep_live_deprioritize',
    ).length;
    const merge = ranked.filter(
      (page) => page.suggestedAction === 'merge_later',
    ).length;

    lines.push('');
    lines.push(`## ${familyLabel(family)}`);
    lines.push('');
    lines.push(`- Pages measured: ${ranked.length}`);
    lines.push(`- Keep indexed candidates: ${keep}`);
    lines.push(`- Keep live, deprioritize candidates: ${deprioritize}`);
    lines.push(`- Merge later candidates: ${merge}`);
    lines.push('');
    lines.push(
      '| Page | GSC clicks | GSC impressions | Organic landing views | SEO signups | Suggested action |',
    );
    lines.push('| --- | ---: | ---: | ---: | ---: | --- |');
    for (const page of ranked.slice(0, 25)) {
      lines.push(
        `| ${page.path} | ${page.gscClicks} | ${page.gscImpressions} | ${page.organicLandingViews} | ${page.seoSignups} | ${page.suggestedAction} |`,
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const days = Number(args.get('days') || 180);
  const endDate = String(args.get('end-date') || formatDate(new Date()));
  const startDate =
    String(args.get('start-date') || '') ||
    formatDate(
      new Date(
        new Date(`${endDate}T00:00:00Z`).getTime() - (days - 1) * 86400000,
      ),
    );
  const outDir = String(
    args.get('out-dir') || resolve(process.cwd(), 'docs/reports'),
  );
  const siteUrl =
    typeof args.get('site-url') === 'string'
      ? String(args.get('site-url'))
      : undefined;
  const skipGsc = Boolean(args.get('skip-gsc'));
  const skipDb = Boolean(args.get('skip-db'));
  const includeSitemap = Boolean(args.get('include-sitemap'));

  const requestedFamily = args.get('family');
  const allowedFamilies =
    typeof requestedFamily === 'string'
      ? new Set(requestedFamily.split(',').map((part) => part.trim()))
      : null;

  const pages = new Map<string, PageMetrics>();
  const sourceNotes: string[] = [];

  if (includeSitemap) {
    try {
      await seedSitemapPages(pages, allowedFamilies);
      sourceNotes.push(
        'Sitemap-backed page inventory included so zero-signal candidates are visible.',
      );
    } catch (error) {
      sourceNotes.push(
        `Sitemap inventory skipped: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else {
    sourceNotes.push(
      'Sitemap inventory not included. Use --include-sitemap when the full app environment is available.',
    );
  }

  if (!skipGsc) {
    try {
      const gscRows = await fetchGscPageRows(startDate, endDate, siteUrl);
      sourceNotes.push('Google Search Console page+query export included.');
      for (const [path, gscMetrics] of gscRows.entries()) {
        const family = classifyFamily(path);
        if (allowedFamilies && !allowedFamilies.has(family)) continue;
        pages.set(path, {
          ...gscMetrics,
          family,
          organicLandingViews: 0,
          organicLandingUsers: 0,
          seoSignups: 0,
          suggestedAction: 'merge_later',
          rationale: '',
        });
      }
    } catch (error) {
      sourceNotes.push(
        `Google Search Console export failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else {
    sourceNotes.push('Google Search Console export skipped.');
  }

  if (!skipDb) {
    try {
      const [organicLandingMetrics, seoSignups] = await Promise.all([
        fetchOrganicLandingMetrics(startDate, endDate),
        fetchSeoSignupMetrics(startDate, endDate),
      ]);

      sourceNotes.push('Organic landing-page and SEO signup data included.');

      for (const [path, landingMetrics] of organicLandingMetrics.entries()) {
        const family = classifyFamily(path);
        if (allowedFamilies && !allowedFamilies.has(family)) continue;
        const existing = pages.get(path) || {
          path,
          family,
          gscClicks: 0,
          gscImpressions: 0,
          gscCtr: 0,
          gscPosition: 0,
          organicLandingViews: 0,
          organicLandingUsers: 0,
          seoSignups: 0,
          topQueries: [],
          suggestedAction: 'merge_later' as const,
          rationale: '',
        };
        existing.organicLandingViews = landingMetrics.organicLandingViews;
        existing.organicLandingUsers = landingMetrics.organicLandingUsers;
        pages.set(path, existing);
      }

      for (const [path, signups] of seoSignups.entries()) {
        const family = classifyFamily(path);
        if (allowedFamilies && !allowedFamilies.has(family)) continue;
        const existing = pages.get(path) || {
          path,
          family,
          gscClicks: 0,
          gscImpressions: 0,
          gscCtr: 0,
          gscPosition: 0,
          organicLandingViews: 0,
          organicLandingUsers: 0,
          seoSignups: 0,
          topQueries: [],
          suggestedAction: 'merge_later' as const,
          rationale: '',
        };
        existing.seoSignups = signups;
        pages.set(path, existing);
      }
    } catch (error) {
      sourceNotes.push(
        `Database metrics export failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  } else {
    sourceNotes.push('Database-backed landing-page and signup data skipped.');
  }

  const rankedPages = [...pages.values()]
    .filter((page) => page.family !== 'other')
    .map((page) => {
      const suggestion = suggestAction(page);
      return {
        ...page,
        suggestedAction: suggestion.action,
        rationale: suggestion.rationale,
      };
    })
    .sort(
      (a, b) =>
        b.gscClicks - a.gscClicks ||
        b.gscImpressions - a.gscImpressions ||
        b.organicLandingViews - a.organicLandingViews ||
        b.seoSignups - a.seoSignups,
    );

  mkdirSync(outDir, { recursive: true });
  const slug = `${startDate}_to_${endDate}`;
  const jsonPath = resolve(outDir, `grimoire-survival-map-${slug}.json`);
  const mdPath = resolve(outDir, `grimoire-survival-map-${slug}.md`);

  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        startDate,
        endDate,
        families: FAMILY_DEFINITIONS,
        pages: rankedPages,
        sourceNotes,
      },
      null,
      2,
    ),
  );
  writeFileSync(
    mdPath,
    toMarkdown(rankedPages, startDate, endDate, sourceNotes),
  );

  console.log(`Wrote JSON report to ${jsonPath}`);
  console.log(`Wrote Markdown report to ${mdPath}`);
  console.log(`Pages measured: ${rankedPages.length}`);
}

main().catch((error) => {
  console.error('[export-grimoire-survival-map] Failed:', error);
  process.exit(1);
});
