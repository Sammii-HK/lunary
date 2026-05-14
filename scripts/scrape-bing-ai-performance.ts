import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { chromium, type Page } from 'playwright';

import {
  metricFromBingAiText,
  parseBingAiPerformanceSummaryText,
} from '../src/lib/bing/ai-performance-scrape';
import { writeBingAiPerformanceSnapshot } from '../src/lib/bing/ai-performance-output';
import type {
  BingAiCitedPage,
  BingAiPerformanceSnapshot,
} from '../src/lib/bing/ai-performance';
import { normalizeProtectedSeoUrl } from '../src/lib/seo/protected-pages';

const args = process.argv.slice(2);

function hasFlag(flag: string) {
  return args.includes(flag);
}

function getOption(name: string) {
  const prefix = `--${name}=`;
  return args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

const siteUrl = getOption('site-url') || 'https://lunary.app';
const targetUrl =
  getOption('url') ||
  `https://www.bing.com/webmasters/aiperformance?siteUrl=${encodeURIComponent(siteUrl)}`;
const profileDir = resolve(
  process.cwd(),
  getOption('profile') || '.playwright-bing-webmaster',
);
const headed =
  hasFlag('--headed') || process.env.BING_AI_SCRAPER_HEADED === '1';
const dryRun = hasFlag('--dry-run');

function isLoginUrl(url: string) {
  return /login\.live\.com|login\.microsoftonline\.com|account\.microsoft\.com/i.test(
    url,
  );
}

async function waitForAuthenticatedPage(page: Page) {
  await page.goto(targetUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  if (!isLoginUrl(page.url())) return;

  if (!headed) {
    throw new Error(
      `Bing Webmaster auth is required. Run once with --headed to create ${profileDir}, then schedule the headless scraper.`,
    );
  }

  console.log('Microsoft login required. Complete it in the opened browser.');
  await page.waitForURL(/bing\.com\/webmasters\/aiperformance/i, {
    timeout: 10 * 60_000,
  });
}

async function extractCitedPages(page: Page): Promise<BingAiCitedPage[]> {
  const rows = await page.locator('tr, [role="row"]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      text: (node.textContent || '').replace(/\s+/g, ' ').trim(),
      links: Array.from(node.querySelectorAll('a'))
        .map((link) => link.getAttribute('href') || link.textContent || '')
        .filter(Boolean),
    })),
  );

  const byUrl = new Map<string, BingAiCitedPage>();

  for (const row of rows) {
    const url = normalizeProtectedSeoUrl(
      row.links.find((link) => link.includes('lunary.app')) ||
        row.text.match(/https?:\/\/lunary\.app\/[^\s)]+/i)?.[0] ||
        '',
    );
    if (!url) continue;

    const citations = metricFromBingAiText(row.text, 'Citations');
    const clicks = metricFromBingAiText(row.text, 'Clicks');
    const impressions = metricFromBingAiText(row.text, 'Impressions');
    const ctr = metricFromBingAiText(row.text, 'CTR') / 100;

    const existing =
      byUrl.get(url) ||
      ({
        url,
        citations: 0,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        groundingQueries: [],
        recommendation: 'protect',
      } satisfies BingAiCitedPage);

    existing.citations += citations;
    existing.clicks = (existing.clicks || 0) + clicks;
    existing.impressions = (existing.impressions || 0) + impressions;
    existing.ctr =
      existing.impressions && existing.clicks
        ? existing.clicks / existing.impressions
        : ctr || existing.ctr || 0;
    existing.recommendation =
      existing.citations >= 10
        ? 'protect-expand'
        : (existing.impressions || 0) >= 100 && (existing.clicks || 0) === 0
          ? 'expand'
          : 'protect';

    byUrl.set(url, existing);
  }

  return Array.from(byUrl.values()).sort(
    (a, b) =>
      b.citations - a.citations ||
      (b.impressions || 0) - (a.impressions || 0) ||
      a.url.localeCompare(b.url),
  );
}

async function main() {
  mkdirSync(profileDir, { recursive: true });

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: !headed,
    viewport: { width: 1440, height: 1200 },
  });

  try {
    const page = context.pages()[0] || (await context.newPage());
    await waitForAuthenticatedPage(page);
    await page
      .waitForLoadState('networkidle', { timeout: 60_000 })
      .catch(() => {
        // Bing's dashboard can leave long-polling requests open; DOM text is enough.
      });
    await page.waitForTimeout(2500);

    const bodyText = await page.locator('body').innerText({ timeout: 30_000 });
    const summary = parseBingAiPerformanceSummaryText(bodyText);
    const citedPages = await extractCitedPages(page);

    if (
      !summary.totalCitations &&
      !summary.averageCitedPages &&
      !summary.totalImpressions
    ) {
      throw new Error(
        'Bing AI Performance metrics were not found in the page text. The UI may have changed or auth may have expired.',
      );
    }

    const snapshot: BingAiPerformanceSnapshot = {
      generatedAt: new Date().toISOString(),
      source: `Automated Bing Webmaster Tools AI Performance scrape from ${targetUrl}. The public Bing Webmaster API does not expose AI citation rows yet.`,
      summary,
      citedPages,
    };

    if (dryRun) {
      console.log(JSON.stringify(snapshot, null, 2));
      return;
    }

    const { outputPath, protectedOutputPath } = writeBingAiPerformanceSnapshot(
      snapshot,
      'scripts/scrape-bing-ai-performance.ts',
    );

    console.log(
      `Scraped ${summary.totalCitations.toLocaleString()} AI citations and ${citedPages.length} cited pages.`,
    );
    console.log(`Updated ${outputPath}`);
    console.log(`Updated ${protectedOutputPath}`);
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
