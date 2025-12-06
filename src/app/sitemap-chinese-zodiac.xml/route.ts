import { CHINESE_ANIMALS } from '@/constants/seo/chinese-zodiac';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';

  const urls = [
    {
      loc: `${baseUrl}/grimoire/chinese-zodiac`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8',
    },
    ...CHINESE_ANIMALS.map((animal) => ({
      loc: `${baseUrl}/grimoire/chinese-zodiac/${animal}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'yearly',
      priority: '0.7',
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
