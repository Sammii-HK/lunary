import fs from 'fs';
import { google } from 'googleapis';

// Parse service account from .env.local
const raw = fs.readFileSync('.env.local', 'utf-8');
const match = raw.match(/GOOGLE_SERVICE_ACCOUNT_JSON="(.+)"\nGOOGLE_SHEETS/s);
if (!match) {
  console.error('Could not find GOOGLE_SERVICE_ACCOUNT_JSON');
  process.exit(1);
}

const jsonRaw = match[1];
const field = (name: string) => {
  const m = jsonRaw.match(new RegExp(`"${name}":\\s*"(.*?)(?<!\\\\)"`));
  return m ? m[1] : '';
};

const privateKeyRaw =
  jsonRaw.match(
    /"private_key":\s*"(-----BEGIN.*?-----END PRIVATE KEY-----\\n)"/,
  )?.[1] || '';
const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

const credentials = {
  type: 'service_account',
  project_id: field('project_id'),
  private_key_id: field('private_key_id'),
  private_key: privateKey,
  client_email: field('client_email'),
  client_id: field('client_id'),
  auth_uri: field('auth_uri'),
  token_uri: field('token_uri'),
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters',
  ],
});

const searchconsole = google.searchconsole({ version: 'v1', auth });
const SITE_URL = 'sc-domain:lunary.app';

async function inspectUrl(url: string) {
  const res = await searchconsole.urlInspection.index.inspect({
    requestBody: { inspectionUrl: url, siteUrl: SITE_URL },
  });
  return {
    url,
    coverageState:
      res.data.inspectionResult?.indexStatusResult?.coverageState || 'UNKNOWN',
    verdict: res.data.inspectionResult?.indexStatusResult?.verdict || 'UNKNOWN',
    robotsTxtState:
      res.data.inspectionResult?.indexStatusResult?.robotsTxtState || '',
    pageFetchState:
      res.data.inspectionResult?.indexStatusResult?.pageFetchState || '',
    crawledAs: res.data.inspectionResult?.indexStatusResult?.crawledAs || '',
    lastCrawlTime:
      res.data.inspectionResult?.indexStatusResult?.lastCrawlTime || '',
  };
}

async function main() {
  // Fetch all sitemap URLs
  const sitemapIndex = await (
    await fetch('https://lunary.app/sitemap-index.xml')
  ).text();
  const sitemapUrls = Array.from(
    sitemapIndex.matchAll(/<loc>(.*?)<\/loc>/g),
    (m) => m[1],
  );
  console.log(`Found ${sitemapUrls.length} sitemaps in index`);

  // Fetch a few key sitemaps to get representative URLs
  const targetSitemaps = [
    'https://lunary.app/sitemap.xml', // main pages
    'https://lunary.app/sitemap-horoscopes.xml', // horoscopes (huge)
    'https://lunary.app/sitemap-zodiac.xml',
    'https://lunary.app/sitemap-yearly-transits.xml',
    'https://lunary.app/sitemap-crystals.xml',
    'https://lunary.app/sitemap-tarot.xml',
  ];

  const urlsByCategory: Record<string, string[]> = {};

  for (const smUrl of targetSitemaps) {
    const label = smUrl.replace('https://lunary.app/', '').replace('.xml', '');
    try {
      const xml = await (await fetch(smUrl)).text();
      const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (m) => m[1]);
      urlsByCategory[label] = urls;
      console.log(`${label}: ${urls.length} URLs`);
    } catch {
      console.log(`${label}: fetch failed`);
    }
  }

  // Sample strategically: 5 from each category
  const sampled: { url: string; category: string }[] = [];

  for (const [cat, urls] of Object.entries(urlsByCategory)) {
    // Take first, middle, and random samples
    const indices = [
      0,
      Math.floor(urls.length / 4),
      Math.floor(urls.length / 2),
      Math.floor((urls.length * 3) / 4),
      urls.length - 1,
    ];
    for (const i of indices) {
      if (urls[i]) sampled.push({ url: urls[i], category: cat });
    }
  }

  // Also test known problem patterns from the browser
  const knownProblems = [
    'https://lunary.app/grimoire/tarot?nav=marketing',
    'https://lunary.app/grimoire/moon-in?nav=marketing',
    'https://lunary.app/grimoire/astrology?nav=marketing',
    'https://lunary.app/community/questions',
    'https://lunary.app/shop/rising-sign-guide-pack?from=explore',
    'https://lunary.app/grimoire/events/2025',
    'https://lunary.app/grimoire/numerology',
    'https://lunary.app/grimoire/crystals',
    'https://lunary.app/grimoire/runes',
  ];

  for (const url of knownProblems) {
    sampled.push({ url, category: 'known-problem' });
  }

  console.log(`\nInspecting ${sampled.length} URLs...\n`);

  const results: Record<
    string,
    Array<{ url: string; category: string; details: string }>
  > = {};

  for (let i = 0; i < sampled.length; i++) {
    const { url, category } = sampled[i];
    try {
      const r = await inspectUrl(url);
      const state = r.coverageState;
      if (!results[state]) results[state] = [];
      results[state].push({
        url: url.replace('https://lunary.app', ''),
        category,
        details: `robots:${r.robotsTxtState} fetch:${r.pageFetchState} crawled:${r.lastCrawlTime?.split('T')[0] || 'never'}`,
      });
      const short = url.replace('https://lunary.app', '');
      process.stdout.write(
        `  [${i + 1}/${sampled.length}] ${state.padEnd(40)} ${category.padEnd(25)} ${short}\n`,
      );
      await new Promise((r) => setTimeout(r, 1200));
    } catch (err: any) {
      console.error(`  Error: ${url} — ${err.message?.substring(0, 60)}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log('\n\n========== RESULTS ==========\n');
  for (const [state, items] of Object.entries(results).sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    console.log(`\n--- ${state} (${items.length}) ---`);
    for (const item of items) {
      console.log(`  [${item.category}] ${item.url}`);
      console.log(`    ${item.details}`);
    }
  }
}

main().catch((e) => console.error('Fatal:', e));
