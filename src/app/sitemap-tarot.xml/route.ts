import { tarotCards } from '../../../utils/tarot/tarot-cards';
import { tarotSpreads } from '@/constants/tarot';
import { stringToKebabCase } from '../../../utils/string';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date().toISOString();

  const majorArcanaUrls = Object.keys(tarotCards.majorArcana)
    .map((cardKey) => {
      const card =
        tarotCards.majorArcana[cardKey as keyof typeof tarotCards.majorArcana];
      const slug = stringToKebabCase(card.name);
      return `
    <url>
      <loc>${baseUrl}/grimoire/tarot/${slug}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
    })
    .join('');

  const minorArcanaUrls: string[] = [];
  Object.entries(tarotCards.minorArcana).forEach(([suit, cards]) => {
    Object.values(cards).forEach((card: any) => {
      const slug = stringToKebabCase(card.name);
      minorArcanaUrls.push(`
    <url>
      <loc>${baseUrl}/grimoire/tarot/${slug}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`);
    });
  });

  const spreadUrls = Object.keys(tarotSpreads)
    .map((spreadKey) => {
      const slug = stringToKebabCase(spreadKey);
      return `
    <url>
      <loc>${baseUrl}/grimoire/tarot-spreads/${slug}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/grimoire/tarot</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  ${majorArcanaUrls}
  ${minorArcanaUrls.join('')}
  ${spreadUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
