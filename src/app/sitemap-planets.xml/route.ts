import { planetaryBodies } from '../../../utils/zodiac/zodiac';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date().toISOString();

  const planetKeys = Object.keys(planetaryBodies);

  const urls = planetKeys
    .map((planet) => {
      return `
    <url>
      <loc>${baseUrl}/grimoire/astronomy/planets/${planet.toLowerCase()}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
