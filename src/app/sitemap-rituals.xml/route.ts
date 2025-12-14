import { spellDatabase as spells, spellCategories } from '@/lib/spells/index';
import spellsJson from '@/data/spells.json';

const baseUrl = 'https://lunary.app';

// Combine spells from both sources, avoiding duplicates
function getAllSpells() {
  const jsonSpellIds = new Set(spellsJson.map((s: { id: string }) => s.id));
  const constantsSpells = spells.filter((s) => !jsonSpellIds.has(s.id));
  return [...spellsJson, ...constantsSpells];
}

export async function GET() {
  const now = new Date().toISOString();
  const allSpells = getAllSpells();

  const spellUrls = allSpells
    .map((spell: { id: string }) => {
      return `
    <url>
      <loc>${baseUrl}/grimoire/spells/${spell.id}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
    })
    .join('');

  // Spell category pages
  const categoryUrls = Object.keys(spellCategories)
    .map(
      (category) => `
    <url>
      <loc>${baseUrl}/grimoire/spells/category/${category}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`,
    )
    .join('');

  const ritualPages = [
    'moon-rituals',
    'correspondences',
    'spells',
    'candle-magic',
  ];

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
  ${categoryUrls}
  ${spellUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
