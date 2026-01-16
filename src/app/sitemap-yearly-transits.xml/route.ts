import {
  generateAllTransitParams,
  generateTransitYears,
} from '@/constants/seo/yearly-transits';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const transits = generateAllTransitParams();

  const urls = [
    {
      loc: `${baseUrl}/grimoire/transits`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8',
    },
    ...transits.map((t) => ({
      loc: `${baseUrl}/grimoire/transits/${t.transit}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'yearly',
      priority: '0.7',
    })),
    ...generateTransitYears().map((year) => ({
      loc: `${baseUrl}/grimoire/transits/year/${year}`,
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
