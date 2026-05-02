import { generateAllHouseParams } from '@/constants/seo/houses';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const currentYear = new Date().getFullYear();
  const stableMonthStamp = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
  const houses = generateAllHouseParams();

  const urls = [
    {
      loc: `${baseUrl}/grimoire/houses`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.8',
    },
    ...houses.map((h) => ({
      loc: `${baseUrl}/grimoire/houses/${h.planet}/${h.house}`,
      lastmod: stableMonthStamp,
      changefreq: 'yearly',
      priority: '0.6',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
