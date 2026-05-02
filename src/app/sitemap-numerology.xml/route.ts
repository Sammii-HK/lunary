import { getYearRange } from '@/constants/seo/numerology';
import {
  angelNumbers,
  lifePathNumbers,
} from '@/constants/grimoire/numerology-data';
import {
  mirrorHourKeys,
  doubleHourKeys,
} from '@/constants/grimoire/clock-numbers-data';
import {
  karmicDebtKeys,
  expressionKeys,
  soulUrgeKeys,
} from '@/constants/grimoire/numerology-extended-data';

export async function GET(): Promise<Response> {
  const baseUrl = 'https://lunary.app';
  const currentYear = new Date().getFullYear();
  const years = getYearRange().filter(
    (year) => year >= currentYear - 1 && year <= currentYear + 2,
  );
  const stableMonthStamp = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

  const urls = [
    // Main numerology page
    {
      loc: `${baseUrl}/grimoire/numerology`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.9',
    },
    // Angel numbers
    ...Object.keys(angelNumbers).map((num) => ({
      loc: `${baseUrl}/grimoire/angel-numbers/${num}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    // Life path numbers
    ...Object.keys(lifePathNumbers).map((num) => ({
      loc: `${baseUrl}/grimoire/life-path/${num}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.7',
    })),
    // Expression/Destiny numbers
    ...expressionKeys.map((num) => ({
      loc: `${baseUrl}/grimoire/numerology/expression/${num}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    // Soul urge numbers
    ...soulUrgeKeys.map((num) => ({
      loc: `${baseUrl}/grimoire/numerology/soul-urge/${num}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    // Karmic debt numbers
    ...karmicDebtKeys.map((num) => ({
      loc: `${baseUrl}/grimoire/numerology/karmic-debt/${num}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    // Mirror hours
    ...mirrorHourKeys.map((time) => ({
      loc: `${baseUrl}/grimoire/mirror-hours/${time.replace(':', '-')}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    // Double hours
    ...doubleHourKeys.map((time) => ({
      loc: `${baseUrl}/grimoire/double-hours/${time.replace(':', '-')}`,
      lastmod: stableMonthStamp,
      changefreq: 'monthly',
      priority: '0.6',
    })),
    // Universal year forecasts
    ...years.map((year) => ({
      loc: `${baseUrl}/grimoire/numerology/year/${year}`,
      lastmod: `${year}-01-01`,
      changefreq: 'yearly',
      priority: '0.6',
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
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
