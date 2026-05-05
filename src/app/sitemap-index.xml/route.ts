const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date();
  const stableMonthStamp = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, '0')}-01`;

  const sitemaps = [
    'sitemap.xml',
    'sitemap-horoscopes.xml',
    'sitemap-yearly-transits.xml',
    'sitemap-transits.xml',
    'sitemap-aspects.xml',
    'sitemap-numerology.xml',
    'sitemap-placements.xml',
    'sitemap-houses.xml',
    'sitemap-decans.xml',
    'sitemap-cusps.xml',
    'sitemap-zodiac.xml',
    'sitemap-compatibility.xml',
  ];

  const sitemapEntries = sitemaps
    .map(
      (sitemap) => `
  <sitemap>
    <loc>${baseUrl}/${sitemap}</loc>
    <lastmod>${stableMonthStamp}</lastmod>
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
