import { PLANETS_FOR_HOUSES } from '@/constants/seo/houses';

const HOUSE_SLUGS = [
  '1st-house',
  '2nd-house',
  '3rd-house',
  '4th-house',
  '5th-house',
  '6th-house',
  '7th-house',
  '8th-house',
  '9th-house',
  '10th-house',
  '11th-house',
  '12th-house',
];

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const currentYear = new Date().getFullYear();
  const stableMonthStamp = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

  const urls = [
    {
      loc: `${baseUrl}/grimoire/houses`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.8',
    },
    ...HOUSE_SLUGS.map((houseSlug) => ({
      loc: `${baseUrl}/grimoire/houses/${houseSlug}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    ...PLANETS_FOR_HOUSES.map((planet) => ({
      loc: `${baseUrl}/grimoire/houses/${planet}`,
      lastmod: stableMonthStamp,
      changefreq: 'yearly',
      priority: '0.5',
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
