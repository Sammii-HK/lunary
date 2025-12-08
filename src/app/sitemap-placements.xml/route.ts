import { getAllPlanetSignSlugs } from '@/constants/seo/planet-sign-content';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date().toISOString();
  const slugs = getAllPlanetSignSlugs();

  const placementUrls = slugs
    .map(
      (slug) => `
    <url>
      <loc>${baseUrl}/grimoire/placements/${slug}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/grimoire/placements</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${placementUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
