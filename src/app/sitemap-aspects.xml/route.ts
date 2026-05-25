import { ASPECTS, PLANETS } from '@/constants/seo/aspects';

type SitemapUrl = {
  loc: string;
  lastmod: string;
  changefreq: 'monthly' | 'yearly';
  priority: string;
};

function getCanonicalAspectPaths() {
  const paths: string[] = ['/grimoire/aspects'];

  PLANETS.forEach((planet) => {
    paths.push(`/grimoire/aspects/${planet}`);

    ASPECTS.forEach((aspect) => {
      paths.push(`/grimoire/aspects/${planet}/${aspect}`);
    });
  });

  for (let i = 0; i < PLANETS.length; i++) {
    for (let j = i + 1; j < PLANETS.length; j++) {
      ASPECTS.forEach((aspect) => {
        paths.push(`/grimoire/aspects/${PLANETS[i]}/${aspect}/${PLANETS[j]}`);
      });
    }
  }

  return paths;
}

function priorityForAspectPath(path: string) {
  const segmentCount = path.split('/').filter(Boolean).length;

  if (segmentCount === 2) {
    return '0.8';
  }

  if (segmentCount <= 4) {
    return '0.7';
  }

  return '0.6';
}

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const currentYear = new Date().getFullYear();
  const stableMonthStamp = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

  const urls: SitemapUrl[] = getCanonicalAspectPaths().map((path) => ({
    loc: `${baseUrl}${path}`,
    lastmod: stableMonthStamp,
    changefreq:
      path.split('/').filter(Boolean).length <= 4 ? 'monthly' : 'yearly',
    priority: priorityForAspectPath(path),
  }));

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
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
