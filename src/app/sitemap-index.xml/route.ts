import {
  CANONICAL_SITE_URL,
  CURATED_DISCOVERY_SITEMAPS,
} from '@/lib/seo/discovery';

export async function GET() {
  const now = new Date();
  const stableMonthStamp = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, '0')}-01`;

  const sitemapEntries = CURATED_DISCOVERY_SITEMAPS.map(
    (sitemap) => `
  <sitemap>
    <loc>${CANONICAL_SITE_URL}/${sitemap}</loc>
    <lastmod>${stableMonthStamp}</lastmod>
  </sitemap>`,
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
