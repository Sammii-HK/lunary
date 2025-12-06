import { retrogradeInfo, eclipseInfo } from '@/constants/grimoire/seo-data';
import { monthlyMoonPhases } from '../../../utils/moon/monthlyPhases';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { stringToKebabCase } from '../../../utils/string';
import dayjs from 'dayjs';

const baseUrl = 'https://lunary.app';

export async function GET() {
  const now = new Date().toISOString();
  const currentYear = new Date().getFullYear();

  const retrogradeUrls = Object.entries(retrogradeInfo)
    .map(
      ([slug, r]) => `
    <url>
      <loc>${baseUrl}/grimoire/retrogrades/${slug}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`,
    )
    .join('');

  const eclipseUrls = Object.entries(eclipseInfo)
    .map(
      ([slug, e]) => `
    <url>
      <loc>${baseUrl}/grimoire/eclipses/${slug}</loc>
      <lastmod>${now}</lastmod>
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
      <loc>${baseUrl}/grimoire/moon/${slug}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`;
    })
    .join('');

  const fullMoonUrls = Object.values(annualFullMoons)
    .map((moon) => {
      const slug = stringToKebabCase(moon.name);
      return `
    <url>
      <loc>${baseUrl}/grimoire/moon/${slug}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>yearly</changefreq>
      <priority>0.7</priority>
    </url>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/grimoire/moon</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/grimoire/retrogrades</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/grimoire/eclipses</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  ${retrogradeUrls}
  ${eclipseUrls}
  ${fullMoonUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
