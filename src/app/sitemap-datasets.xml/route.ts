import { listCurrentSkySnapshots } from '@/lib/seo/citation-snapshot-store';

const BASE_URL = 'https://lunary.app';

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
};

function stableToday() {
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const today = stableToday();
  const currentYear = new Date().getUTCFullYear();
  let snapshotEntries: SitemapEntry[] = [];

  try {
    const snapshots = await listCurrentSkySnapshots(366);
    snapshotEntries = snapshots.map((snapshot) => ({
      loc: `${BASE_URL}/grimoire/datasets/current-sky/${snapshot.snapshotDate}`,
      lastmod: snapshot.updatedAt.slice(0, 10),
      changefreq: 'yearly',
      priority: '0.5',
    }));
  } catch (error) {
    console.error('[sitemap-datasets] Snapshot list unavailable', error);
  }

  const entries: SitemapEntry[] = [
    {
      loc: `${BASE_URL}/grimoire/datasets`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.8',
    },
    {
      loc: `${BASE_URL}/grimoire/datasets/core-astrology.json`,
      lastmod: '2026-05-17',
      changefreq: 'weekly',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/datasets/core-astrology-2026-05-17.json`,
      lastmod: '2026-05-17',
      changefreq: 'yearly',
      priority: '0.6',
    },
    {
      loc: `${BASE_URL}/grimoire/datasets/current-sky-facts.json`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/datasets/current-sky`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/datasets/astrology-calendar/${currentYear}.json`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/datasets/astrology-calendar/${currentYear + 1}.json`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.6',
    },
    {
      loc: `${BASE_URL}/grimoire/datasets/current-sky/2026-05-17`,
      lastmod: '2026-05-17',
      changefreq: 'yearly',
      priority: '0.5',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/moon-phase-today`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/current-moon-sign`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/current-sun-sign`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/planetary-positions-today`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/mercury-retrograde-status`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/next-full-moon`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/next-new-moon`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/next-eclipse`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/facts/next-mercury-retrograde`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.7',
    },
    ...snapshotEntries,
    {
      loc: `${BASE_URL}/about/citations`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/about/methodology`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
    },
    {
      loc: `${BASE_URL}/grimoire/glossary`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
    },
  ];

  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.loc, entry])).values(),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueEntries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=900, s-maxage=3600',
    },
  });
}
