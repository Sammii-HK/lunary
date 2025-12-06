import { spells } from '@/constants/spells';
import { stringToKebabCase } from '../../../utils/string';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date().toISOString();

  const spellUrls = spells
    .map((spell) => {
      return `
    <url>
      <loc>${baseUrl}/grimoire/spells/${spell.id}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
    })
    .join('');

  const ritualPages = ['moon-rituals', 'practices', 'correspondences'];

  const ritualPageUrls = ritualPages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}/grimoire/${page}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${ritualPageUrls}
  ${spellUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
