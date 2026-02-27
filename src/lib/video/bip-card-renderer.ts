/**
 * Build in Public — Card Renderer
 *
 * SVG → sharp → PNG card generator for BIP posts.
 * Dimensions: 1200×675 (X/Twitter landscape, 16:9).
 * Brand: dark Lunary aesthetic (cosmicBlack bg, lunarGold accents).
 *
 * Templates: metricsCard, milestoneCard, featureLaunchCard
 */

import sharp from 'sharp';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Dimensions & brand constants
// ---------------------------------------------------------------------------

const WIDTH = 1200;
const HEIGHT = 675;

const COLORS = {
  bg: '#0a0a0f',
  gold: '#d4af37',
  white: '#ffffff',
  secondary: '#b0b0c0',
  muted: '#6b6b80',
  border: '#1e1e2e',
  positive: '#4ade80',
  negative: '#f87171',
} as const;

const FONT_SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const WATERMARK = '@sammiihk';

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function background(): string {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.bg}"/>
    <defs>
      <radialGradient id="glow1" cx="10%" cy="20%" r="40%">
        <stop offset="0%" stop-color="${COLORS.gold}" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="${COLORS.gold}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="90%" cy="80%" r="35%">
        <stop offset="0%" stop-color="#9b59b6" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="#9b59b6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow1)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>
    <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="8" ry="8"
          fill="none" stroke="${COLORS.gold}" stroke-width="1" opacity="0.3"/>
  `;
}

function header(label: string, rightLabel?: string): string {
  const right = rightLabel
    ? `<text x="${WIDTH - 50}" y="70" text-anchor="end" font-family="${FONT_SANS}" font-size="22" fill="${COLORS.muted}">${escapeXml(rightLabel)}</text>`
    : '';
  return `
    <text x="50" y="70" font-family="${FONT_SANS}" font-size="22" font-weight="600" fill="${COLORS.gold}">${escapeXml(label)}</text>
    ${right}
    <line x1="50" y1="86" x2="${WIDTH - 50}" y2="86" stroke="${COLORS.border}" stroke-width="1"/>
  `;
}

function watermark(): string {
  return `<text x="${WIDTH - 50}" y="${HEIGHT - 30}" text-anchor="end" font-family="${FONT_SANS}" font-size="20" fill="${COLORS.muted}" opacity="0.6">${WATERMARK}</text>`;
}

function deltaLabel(pct: number): string {
  if (pct === 0) return '';
  const sign = pct > 0 ? '↑' : '↓';
  const color = pct > 0 ? COLORS.positive : COLORS.negative;
  return `<tspan fill="${color}">${sign}${Math.abs(pct)}%</tspan>`;
}

function divider(y: number): string {
  return `<line x1="50" y1="${y}" x2="${WIDTH - 50}" y2="${y}" stroke="${COLORS.border}" stroke-width="1" opacity="0.6"/>`;
}

// ---------------------------------------------------------------------------
// Metrics card
// ---------------------------------------------------------------------------

export interface MetricsCardOptions {
  weekLabel: string;
  mau: number;
  mauDelta: number;
  mrr: number;
  mrrDelta: number;
  impressionsPerDay: number;
  impressionsDelta: number;
  newSignups: number;
}

function buildMetricsSvg(opts: MetricsCardOptions): string {
  // Auto-detect hero stat: biggest absolute % delta
  const deltas = [
    {
      label: 'impressions/day',
      value: opts.impressionsPerDay,
      delta: opts.impressionsDelta,
      fmt: formatImpressions,
    },
    {
      label: 'MAU',
      value: opts.mau,
      delta: opts.mauDelta,
      fmt: (v: number) => String(v),
    },
    { label: 'MRR', value: opts.mrr, delta: opts.mrrDelta, fmt: formatMrr },
  ];
  const hero = deltas.reduce((a, b) =>
    Math.abs(a.delta) >= Math.abs(b.delta) ? a : b,
  );

  const heroValueStr = hero.fmt(hero.value);
  const heroFontSize = heroValueStr.length > 8 ? 72 : 90;

  // Secondary stats (the other two)
  const secondary = deltas.filter((d) => d !== hero);

  const heroSection = `
    <text x="${WIDTH / 2}" y="240" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="${heroFontSize}" font-weight="700" fill="${COLORS.white}">${escapeXml(heroValueStr)}</text>
    <text x="${WIDTH / 2}" y="290" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="26" fill="${COLORS.secondary}">${escapeXml(hero.label)}</text>
    <text x="${WIDTH / 2}" y="330" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="24" fill="${hero.delta >= 0 ? COLORS.positive : COLORS.negative}">
      ${hero.delta !== 0 ? (hero.delta > 0 ? '↑' : '↓') + Math.abs(hero.delta) + '% this week' : 'no change this week'}
    </text>
  `;

  const secY = 410;
  const col1X = WIDTH / 4;
  const col2X = (WIDTH * 3) / 4;

  const secondarySection = `
    ${divider(370)}
    <text x="${col1X}" y="${secY}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="48" font-weight="700" fill="${COLORS.white}">${escapeXml(secondary[0].fmt(secondary[0].value))}</text>
    <text x="${col1X}" y="${secY + 36}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="20" fill="${COLORS.secondary}">${escapeXml(secondary[0].label)}</text>
    <text x="${col1X}" y="${secY + 62}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="20" fill="${secondary[0].delta >= 0 ? COLORS.positive : COLORS.negative}">
      ${secondary[0].delta !== 0 ? (secondary[0].delta > 0 ? '↑' : '↓') + Math.abs(secondary[0].delta) + '%' : ''}
    </text>

    <line x1="${WIDTH / 2}" y1="${secY - 24}" x2="${WIDTH / 2}" y2="${secY + 76}" stroke="${COLORS.border}" stroke-width="1"/>

    <text x="${col2X}" y="${secY}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="48" font-weight="700" fill="${COLORS.white}">${escapeXml(secondary[1].fmt(secondary[1].value))}</text>
    <text x="${col2X}" y="${secY + 36}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="20" fill="${COLORS.secondary}">${escapeXml(secondary[1].label)}</text>
    <text x="${col2X}" y="${secY + 62}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="20" fill="${secondary[1].delta >= 0 ? COLORS.positive : COLORS.negative}">
      ${secondary[1].delta !== 0 ? (secondary[1].delta > 0 ? '↑' : '↓') + Math.abs(secondary[1].delta) + '%' : ''}
    </text>

    ${divider(510)}
    <text x="${WIDTH / 2}" y="546" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="22" fill="${COLORS.muted}">${opts.newSignups} new signup${opts.newSignups !== 1 ? 's' : ''} this week</text>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${background()}
    ${header('lunary.app', opts.weekLabel)}
    ${heroSection}
    ${secondarySection}
    ${watermark()}
  </svg>`;
}

// ---------------------------------------------------------------------------
// Milestone card
// ---------------------------------------------------------------------------

export interface MilestoneCardOptions {
  metric: 'mau' | 'mrr' | 'impressionsPerDay';
  value: number;
  threshold: number;
  context?: string; // e.g. "started at 100/day in November"
  multiplier?: string; // e.g. "123x in 3 months"
}

function buildMilestoneSvg(opts: MilestoneCardOptions): string {
  const metricLabels: Record<string, string> = {
    mau: 'monthly active users',
    mrr: 'monthly recurring revenue',
    impressionsPerDay: 'impressions per day',
  };

  const valueStr =
    opts.metric === 'mrr'
      ? formatMrr(opts.value)
      : opts.metric === 'impressionsPerDay'
        ? formatImpressions(opts.value)
        : String(opts.value);

  const valueFontSize = valueStr.length > 8 ? 80 : 110;
  const metricLabel = metricLabels[opts.metric] ?? opts.metric;

  const contextY = 420;
  const contextSection = opts.context
    ? `
    ${divider(390)}
    <text x="${WIDTH / 2}" y="${contextY}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="24" fill="${COLORS.secondary}">${escapeXml(opts.context)}</text>
    ${
      opts.multiplier
        ? `<text x="${WIDTH / 2}" y="${contextY + 42}" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="32" font-weight="600" fill="${COLORS.gold}">${escapeXml(opts.multiplier)}</text>`
        : ''
    }
  `
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${background()}
    ${header('lunary.app')}
    <text x="${WIDTH / 2}" y="230" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="${valueFontSize}" font-weight="700" fill="${COLORS.white}">${escapeXml(valueStr)}</text>
    <text x="${WIDTH / 2}" y="290" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="28" fill="${COLORS.secondary}">${escapeXml(metricLabel)}</text>
    <line x1="${WIDTH / 2 - 100}" y1="322" x2="${WIDTH / 2 + 100}" y2="322" stroke="${COLORS.gold}" stroke-width="1.5" opacity="0.6"/>
    ${contextSection}
    ${watermark()}
  </svg>`;
}

// ---------------------------------------------------------------------------
// Feature launch card
// ---------------------------------------------------------------------------

export interface FeatureLaunchCardOptions {
  featureName: string;
  tagline?: string;
  bullets?: string[]; // 2-3 short feature callouts
  mau?: number;
  mrr?: number;
}

function buildFeatureLaunchSvg(opts: FeatureLaunchCardOptions): string {
  const nameFontSize =
    opts.featureName.length > 20 ? 56 : opts.featureName.length > 12 ? 72 : 88;

  const bulletsSection =
    opts.bullets && opts.bullets.length > 0
      ? `
    <text x="${WIDTH / 2}" y="370" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="24" fill="${COLORS.secondary}">${escapeXml(opts.bullets.join(' · '))}</text>
  `
      : '';

  const statsSection =
    opts.mau || opts.mrr
      ? `
    ${divider(420)}
    <text x="${WIDTH / 2}" y="460" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="22" fill="${COLORS.muted}">
      ${opts.mau ? escapeXml(String(opts.mau) + ' MAU') : ''}${opts.mau && opts.mrr ? ' · ' : ''}${opts.mrr ? escapeXml(formatMrr(opts.mrr) + ' MRR') : ''} · free tier
    </text>
  `
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    ${background()}
    ${header('lunary.app')}
    <text x="50" y="155" font-family="${FONT_SANS}" font-size="22" fill="${COLORS.muted}" font-style="italic">just shipped</text>
    <text x="${WIDTH / 2}" y="270" text-anchor="middle"
          font-family="${FONT_SANS}" font-size="${nameFontSize}" font-weight="700" fill="${COLORS.white}">${escapeXml(opts.featureName)}</text>
    <line x1="${WIDTH / 2 - 120}" y1="300" x2="${WIDTH / 2 + 120}" y2="300" stroke="${COLORS.gold}" stroke-width="1.5" opacity="0.7"/>
    ${opts.tagline ? `<text x="${WIDTH / 2}" y="338" text-anchor="middle" font-family="${FONT_SANS}" font-size="26" fill="${COLORS.secondary}">${escapeXml(opts.tagline)}</text>` : ''}
    ${bulletsSection}
    ${statsSection}
    ${watermark()}
  </svg>`;
}

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

function formatMrr(pounds: number): string {
  if (pounds >= 1000) return `£${(pounds / 1000).toFixed(1)}k`;
  return `£${pounds.toFixed(2)}`;
}

function formatImpressions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

// ---------------------------------------------------------------------------
// Public render functions
// ---------------------------------------------------------------------------

async function renderSvgToPng(
  svg: string,
  outputPath: string,
): Promise<string> {
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });

  const svgBuffer = Buffer.from(svg);
  await sharp(svgBuffer).resize(WIDTH, HEIGHT).png().toFile(outputPath);
  return outputPath;
}

export async function renderMetricsCard(
  opts: MetricsCardOptions,
  outputPath: string,
): Promise<string> {
  const svg = buildMetricsSvg(opts);
  return renderSvgToPng(svg, outputPath);
}

export async function renderMilestoneCard(
  opts: MilestoneCardOptions,
  outputPath: string,
): Promise<string> {
  const svg = buildMilestoneSvg(opts);
  return renderSvgToPng(svg, outputPath);
}

export async function renderFeatureLaunchCard(
  opts: FeatureLaunchCardOptions,
  outputPath: string,
): Promise<string> {
  const svg = buildFeatureLaunchSvg(opts);
  return renderSvgToPng(svg, outputPath);
}
