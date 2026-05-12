import { getAllPlanetSignSlugs } from '@/constants/seo/planet-sign-content';

const baseUrl = 'https://lunary.app';
const RECOVERY_PLACEMENT_PLANETS = new Set([
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
]);

export async function GET() {
  const currentDate = new Date();
  const stableMonthStamp = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;
  const now = stableMonthStamp;
  const slugs = getAllPlanetSignSlugs().filter((slug) => {
    const [planet] = slug.split('-in-');
    return RECOVERY_PLACEMENT_PLANETS.has(planet);
  });

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
