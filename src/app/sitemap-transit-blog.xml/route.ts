import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic'; // Must be dynamic — queries DB, no DB available at build time

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';

  const result = await sql`
    SELECT slug, published_at, updated_at
    FROM transit_blog_posts
    WHERE status = 'published'
    ORDER BY start_date ASC
  `;

  const urls = [
    {
      loc: `${baseUrl}/blog/transits`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    },
    ...result.rows.map((row) => ({
      loc: `${baseUrl}/blog/transits/${row.slug}`,
      lastmod: (row.updated_at || row.published_at || new Date())
        .toISOString()
        .split('T')[0],
      changefreq: 'monthly',
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
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
