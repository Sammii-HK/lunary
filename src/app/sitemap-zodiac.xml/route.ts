import { zodiacSigns } from '../../../utils/zodiac/zodiac';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];

  const zodiacSignKeys = Object.keys(zodiacSigns);

  const urls = zodiacSignKeys
    .map((sign) => {
      const signData = zodiacSigns[sign as keyof typeof zodiacSigns];
      return `
    <url>
      <loc>${baseUrl}/grimoire/zodiac/${sign.toLowerCase()}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/grimoire/zodiac</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  ${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
