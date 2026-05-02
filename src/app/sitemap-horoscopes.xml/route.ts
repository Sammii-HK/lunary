import {
  generateAllHoroscopeParams,
  ZODIAC_SIGNS,
} from '@/constants/seo/monthly-horoscope';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const horoscopes = generateAllHoroscopeParams();
  const currentYear = new Date().getFullYear();
  const yearlyHoroscopeYears = [
    Math.max(2025, currentYear - 1),
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];
  const currentMonthStamp = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

  const urls = [
    {
      loc: `${baseUrl}/grimoire/horoscopes`,
      lastmod: currentMonthStamp,
      changefreq: 'weekly',
      priority: '0.9',
    },
    ...ZODIAC_SIGNS.flatMap((sign) => [
      ...yearlyHoroscopeYears.map((year) => ({
        loc: `${baseUrl}/grimoire/horoscopes/${sign}/${year}`,
        lastmod: `${year}-01-01`,
        changefreq: 'monthly' as const,
        priority: '0.8',
      })),
    ]),
    ...horoscopes.map((h) => ({
      loc: `${baseUrl}/grimoire/horoscopes/${h.sign}/${h.year}/${h.month}`,
      lastmod: `${h.year}-${String(new Date(`${h.month} 1, ${h.year}`).getMonth() + 1).padStart(2, '0')}-01`,
      changefreq: 'monthly',
      priority: '0.9',
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
