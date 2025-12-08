import { ZODIAC_SEASONS } from '@/constants/seo/zodiac-seasons';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const years = ['2025', '2026'];

  const urls = [
    {
      loc: `${baseUrl}/grimoire/seasons`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8',
    },
    ...years.flatMap((year) =>
      ZODIAC_SEASONS.map((s) => ({
        loc: `${baseUrl}/grimoire/seasons/${year}/${s.sign}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'yearly',
        priority: '0.6',
      })),
    ),
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
