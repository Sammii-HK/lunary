import {
  generateAllTransitParams,
  generateTransitYears,
} from '@/constants/seo/yearly-transits';

// Must match the range in grimoire/transits/year/[year]/page.tsx
const START_YEAR = 2025;
const CURRENT_YEAR = new Date().getFullYear();
const END_YEAR = Math.max(CURRENT_YEAR + 10, START_YEAR + 10);

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const transits = generateAllTransitParams();

  // Filter years to only include those the page actually renders
  // (avoids sitemap entries that return 404/soft-404)
  const validYears = generateTransitYears().filter(
    (year) => year >= START_YEAR && year <= END_YEAR,
  );

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
    ...validYears.map((year) => ({
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
