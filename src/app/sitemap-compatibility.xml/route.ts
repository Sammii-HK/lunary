import { getCuratedCompatibilitySlugs } from '@/constants/seo/compatibility-content';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date();
  const stableMonthStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const slugs = getCuratedCompatibilitySlugs();

  const compatibilityUrls = slugs
    .map(
      (slug) => `
    <url>
      <loc>${baseUrl}/grimoire/compatibility/${slug}</loc>
      <lastmod>${stableMonthStamp}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.5</priority>
    </url>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${compatibilityUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
