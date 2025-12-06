const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date().toISOString();

  const sitemaps = [
    'sitemap.xml',
    'sitemap-zodiac.xml',
    'sitemap-planets.xml',
    'sitemap-tarot.xml',
    'sitemap-crystals.xml',
    'sitemap-rituals.xml',
    'sitemap-transits.xml',
    'sitemap-placements.xml',
    'sitemap-compatibility.xml',
  ];

  const sitemapEntries = sitemaps
    .map(
      (sitemap) => `
  <sitemap>
    <loc>${baseUrl}/${sitemap}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
    )
    .join('');

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
