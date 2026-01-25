import {
  generateAllHoroscopeParams,
  ZODIAC_SIGNS,
} from '@/constants/seo/monthly-horoscope';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const horoscopes = generateAllHoroscopeParams();

  const urls = [
    {
      loc: `${baseUrl}/grimoire/horoscopes`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.9',
    },
    {
      loc: `${baseUrl}/grimoire/horoscopes/today`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.8',
    },
    {
      loc: `${baseUrl}/grimoire/horoscopes/weekly`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    ...ZODIAC_SIGNS.flatMap((sign) => [
      {
        loc: `${baseUrl}/grimoire/horoscopes/${sign}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7',
      },
      {
        loc: `${baseUrl}/grimoire/horoscopes/today/${sign}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.6',
      },
      {
        loc: `${baseUrl}/grimoire/horoscopes/weekly/${sign}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.6',
      },
    ]),
    ...horoscopes.map((h) => ({
      loc: `${baseUrl}/grimoire/horoscopes/${h.sign}/${h.year}/${h.month}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
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
