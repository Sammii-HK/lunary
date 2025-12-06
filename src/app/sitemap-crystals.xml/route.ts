import { crystalDatabase } from '@/constants/grimoire/crystals';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date().toISOString();

  const crystalUrls = crystalDatabase
    .map((crystal) => {
      return `
    <url>
      <loc>${baseUrl}/grimoire/crystals/${crystal.id}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/grimoire/crystals</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  ${crystalUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
