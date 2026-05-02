import { retrogradeInfo, eclipseInfo } from '@/constants/grimoire/seo-data';
import { monthlyMoonPhases } from '../../../utils/moon/monthlyPhases';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { stringToKebabCase } from '../../../utils/string';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const today = stableMonthStamp;

  const retrogradeUrls = Object.entries(retrogradeInfo)
    .map(
      ([slug]) => `
    <url>
      <loc>${baseUrl}/grimoire/astronomy/retrogrades/${slug}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`,
    )
    .join('');

  const eclipseUrls = Object.entries(eclipseInfo)
    .map(
      ([slug]) => `
    <url>
      <loc>${baseUrl}/grimoire/eclipses/${slug}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`,
    )
    .join('');

  const moonPhaseTypes = Object.keys(monthlyMoonPhases);
  const moonPhaseUrls = moonPhaseTypes
    .map((phaseType) => {
      const slug = stringToKebabCase(phaseType);
      return `
    <url>
      <loc>${baseUrl}/grimoire/moon/phases/${slug}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`;
    })
    .join('');

  const fullMoonUrls = Object.keys(annualFullMoons)
    .map((month) => {
      const slug = stringToKebabCase(month);
      return `
    <url>
      <loc>${baseUrl}/grimoire/moon/full-moons/${slug}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>yearly</changefreq>
      <priority>0.7</priority>
    </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/grimoire/moon</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/grimoire/astronomy/retrogrades</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/grimoire/eclipses</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ${fullMoonUrls}
  ${moonPhaseUrls}
  ${retrogradeUrls}
  ${eclipseUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
