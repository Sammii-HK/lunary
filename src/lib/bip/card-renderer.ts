/**
 * Build in Public — Card Renderer
 *
 * Uses next/og (Satori + resvg-js) to render metric cards as PNG.
 * Fonts are read from public/fonts/ at startup — no system font dependency,
 * no sharp, works reliably in Vercel's Node.js Lambda runtime.
 *
 * Brand: Roboto Mono + Lunary dark cosmic palette.
 * Dimensions: 1200×675 (X/Twitter landscape, 16:9).
 */

import { ImageResponse } from 'next/og';
import React from 'react';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Dimensions & brand
// ---------------------------------------------------------------------------

const W = 1200;
const H = 675;

const C = {
  bg: '#0a0a0a',
  primary: '#8458d8',
  accent: '#c77dff',
  white: '#ffffff',
  secondary: '#b0b0c0',
  muted: '#6b6b80',
  positive: '#4ade80',
  negative: '#f87171',
} as const;

// ---------------------------------------------------------------------------
// Font loading (module-level cache — survives Lambda warm starts)
// ---------------------------------------------------------------------------

let regularFont: Buffer | null = null;
let boldFont: Buffer | null = null;

function getFonts() {
  if (!regularFont) {
    regularFont = fs.readFileSync(
      path.join(process.cwd(), 'public/fonts/RobotoMono-Regular.ttf'),
    );
  }
  if (!boldFont) {
    boldFont = fs.readFileSync(
      path.join(process.cwd(), 'public/fonts/RobotoMono-Bold.ttf'),
    );
  }
  return [
    {
      name: 'Roboto Mono',
      data: regularFont,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'Roboto Mono',
      data: boldFont,
      weight: 700 as const,
      style: 'normal' as const,
    },
  ];
}

// ---------------------------------------------------------------------------
// createElement shorthand + shared helpers
// ---------------------------------------------------------------------------

const h = React.createElement;

function Separator() {
  return h('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: 1,
      background:
        'linear-gradient(90deg, transparent 0%, rgba(42,31,74,0.9) 15%, rgba(132,88,216,0.55) 50%, rgba(42,31,74,0.9) 85%, transparent 100%)',
    },
  });
}

function formatMrr(n: number): string {
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`;
  return `£${n.toFixed(2)}`;
}

function formatImpressions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function heroSize(str: string): number {
  if (str.length <= 5) return 104;
  if (str.length <= 7) return 88;
  return 72;
}

function secSize(str: string): number {
  if (str.length <= 5) return 56;
  if (str.length <= 7) return 46;
  return 38;
}

// Gradient overlay divs — must have display:flex or Satori ignores them
function GradientOverlays() {
  return [
    h('div', {
      key: 'g1',
      style: {
        display: 'flex',
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 70% 60% at -5% -5%, rgba(132,88,216,0.26) 0%, transparent 55%)',
      },
    }),
    h('div', {
      key: 'g2',
      style: {
        display: 'flex',
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 55% 45% at 105% 105%, rgba(199,125,255,0.16) 0%, transparent 50%)',
      },
    }),
  ];
}

function rootStyle(): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    width: W,
    height: H,
    fontFamily: 'Roboto Mono',
    background: '#0a0a0a',
    border: '1px solid rgba(132,88,216,0.28)',
    borderRadius: 16,
    padding: '40px 52px 36px',
    overflow: 'hidden',
    position: 'relative',
  };
}

// ---------------------------------------------------------------------------
// Metrics card
// ---------------------------------------------------------------------------

export interface MetricsCardOptions {
  weekLabel: string;
  mau?: number;
  mauDelta?: number;
  mrr?: number;
  mrrDelta?: number;
  impressionsPerDay: number;
  impressionsDelta: number;
  newSignups: number;
  dau?: number;
  subscriberCount?: number;
}

function buildMetricsElement(opts: MetricsCardOptions): React.ReactElement {
  // Build stats array dynamically — only include metrics that have values
  const allStats: Array<{
    label: string;
    value: number;
    delta: number;
    fmt: (n: number) => string;
  }> = [];

  // Always include impressions if > 0
  if (opts.impressionsPerDay > 0) {
    allStats.push({
      label: 'impressions/day',
      value: opts.impressionsPerDay,
      delta: opts.impressionsDelta,
      fmt: formatImpressions,
    });
  }

  // MRR only when > 0
  if (opts.mrr && opts.mrr > 0) {
    allStats.push({
      label: 'MRR',
      value: opts.mrr,
      delta: opts.mrrDelta ?? 0,
      fmt: formatMrr,
    });
  }

  // Subscribers when present (coupon era)
  if (opts.subscriberCount && opts.subscriberCount > 0) {
    allStats.push({
      label: 'subscribers',
      value: opts.subscriberCount,
      delta: 0,
      fmt: (n: number) => String(n),
    });
  }

  // MAU only when explicitly provided (hidden by default now)
  if (opts.mau && opts.mau > 0) {
    allStats.push({
      label: 'MAU',
      value: opts.mau,
      delta: opts.mauDelta ?? 0,
      fmt: (n: number) => String(n),
    });
  }

  // Ensure we have at least 3 stats for layout (pad with signups/DAU)
  if (allStats.length < 3 && opts.newSignups > 0) {
    allStats.push({
      label: 'signups this week',
      value: opts.newSignups,
      delta: 0,
      fmt: (n: number) => String(n),
    });
  }
  if (allStats.length < 3 && opts.dau && opts.dau > 0) {
    allStats.push({
      label: 'DAU',
      value: opts.dau,
      delta: 0,
      fmt: (n: number) => String(n),
    });
  }

  // Fallback: need at least 1 stat
  const stats =
    allStats.length > 0
      ? allStats
      : [
          {
            label: 'impressions/day',
            value: opts.impressionsPerDay,
            delta: opts.impressionsDelta,
            fmt: formatImpressions,
          },
        ];

  const heroIdx = stats.reduce(
    (maxI, s, i) =>
      Math.abs(s.delta) > Math.abs(stats[maxI].delta) ? i : maxI,
    0,
  );
  const hero = stats[heroIdx];
  const secondary = stats.filter((_, i) => i !== heroIdx).slice(0, 2);

  const heroStr = hero.fmt(hero.value);

  // Footer items: metrics not shown in hero/secondary
  const footerParts: string[] = [];
  if (
    opts.newSignups > 0 &&
    !stats.some((s) => s.label === 'signups this week')
  ) {
    footerParts.push(
      `${opts.newSignups} new signup${opts.newSignups !== 1 ? 's' : ''} this week`,
    );
  }
  if (opts.dau && opts.dau > 0 && !stats.some((s) => s.label === 'DAU')) {
    footerParts.push(`${opts.dau} DAU yesterday`);
  }
  const footerText = footerParts.join('  ·  ');

  return h(
    'div',
    { style: rootStyle() },

    ...GradientOverlays(),

    // Header
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 18,
        },
      },
      h(
        'span',
        {
          style: {
            color: C.primary,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.3px',
          },
        },
        'lunary.app',
      ),
      h(
        'span',
        { style: { color: C.muted, fontSize: 18, fontWeight: 400 } },
        opts.weekLabel,
      ),
    ),

    Separator(),

    // Hero stat
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: 10,
          padding: '0 0 4px',
        },
      },
      h(
        'span',
        {
          style: {
            color: C.white,
            fontSize: heroSize(heroStr),
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-2px',
          },
        },
        heroStr,
      ),
      h(
        'span',
        {
          style: {
            color: C.secondary,
            fontSize: 24,
            fontWeight: 400,
            letterSpacing: '0.5px',
          },
        },
        hero.label,
      ),
      hero.delta !== 0
        ? h(
            'span',
            {
              style: {
                color: hero.delta > 0 ? C.positive : C.negative,
                fontSize: 22,
                fontWeight: 400,
              },
            },
            `${hero.delta > 0 ? '↑' : '↓'}${Math.abs(hero.delta)}% this week`,
          )
        : null,
    ),

    Separator(),

    // Secondary stats (dynamic — 0, 1, or 2 items)
    secondary.length > 0
      ? h(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'row',
              paddingTop: 22,
              paddingBottom: 22,
            },
          },
          ...secondary.flatMap((sec, i) => {
            const secStr = sec.fmt(sec.value);
            const statEl = h(
              'div',
              {
                key: `sec-${i}`,
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  gap: 6,
                },
              },
              h(
                'span',
                {
                  style: {
                    color: C.white,
                    fontSize: secSize(secStr),
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-1px',
                  },
                },
                secStr,
              ),
              h(
                'span',
                {
                  style: {
                    color: C.secondary,
                    fontSize: 18,
                    fontWeight: 400,
                  },
                },
                sec.label,
              ),
              sec.delta !== 0
                ? h(
                    'span',
                    {
                      style: {
                        color: sec.delta > 0 ? C.positive : C.negative,
                        fontSize: 18,
                        fontWeight: 400,
                      },
                    },
                    `${sec.delta > 0 ? '↑' : '↓'}${Math.abs(sec.delta)}%`,
                  )
                : null,
            );

            // Add vertical divider before second stat
            if (i > 0) {
              return [
                h('div', {
                  key: `div-${i}`,
                  style: {
                    width: 1,
                    background:
                      'linear-gradient(180deg, transparent, rgba(132,88,216,0.5), transparent)',
                    margin: '0 8px',
                    alignSelf: 'stretch',
                  },
                }),
                statEl,
              ];
            }
            return [statEl];
          }),
        )
      : null,

    Separator(),

    // Footer
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 14,
        },
      },
      h(
        'span',
        { style: { color: C.muted, fontSize: 17, fontWeight: 400 } },
        footerText,
      ),
      h(
        'span',
        {
          style: {
            color: C.muted,
            fontSize: 17,
            fontWeight: 400,
            opacity: 0.55,
          },
        },
        '@sammiihk',
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Milestone card
// ---------------------------------------------------------------------------

export interface MilestoneCardOptions {
  metric: string;
  value: number;
  threshold: number;
  context?: string;
  multiplier?: string;
}

function buildMilestoneElement(opts: MilestoneCardOptions): React.ReactElement {
  const metricLabels: Record<string, string> = {
    mau: 'monthly active users',
    mrr: 'monthly recurring revenue',
    impressionsPerDay: 'impressions per day',
    clicksPerDay: 'clicks per day',
    totalImpressions28d: 'impressions in 28 days',
    totalClicks28d: 'clicks in 28 days',
    peakImpressionsDay: 'impressions in a single day',
    subscriberCount: 'subscribers',
  };

  const valueStr =
    opts.metric === 'mrr'
      ? formatMrr(opts.value)
      : opts.value.toLocaleString('en-GB');

  const metricLabel = metricLabels[opts.metric] ?? opts.metric;

  return h(
    'div',
    { style: rootStyle() },

    ...GradientOverlays(),

    // Header
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 18,
        },
      },
      h(
        'span',
        {
          style: {
            color: C.primary,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.3px',
          },
        },
        'lunary.app',
      ),
      h(
        'span',
        {
          style: {
            color: C.accent,
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: '1px',
          },
        },
        'milestone',
      ),
    ),

    Separator(),

    // Main content
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: 14,
        },
      },
      h(
        'span',
        {
          style: {
            color: C.white,
            fontSize: heroSize(valueStr),
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-2px',
          },
        },
        valueStr,
      ),
      h(
        'span',
        {
          style: {
            color: C.secondary,
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: '0.5px',
          },
        },
        metricLabel,
      ),
      // gradient accent line
      h('div', {
        style: {
          width: 200,
          height: 2,
          background:
            'linear-gradient(90deg, transparent, rgba(132,88,216,0.8), rgba(199,125,255,0.8), transparent)',
          marginTop: 4,
        },
      }),
      opts.context
        ? h(
            'span',
            {
              style: {
                color: C.muted,
                fontSize: 22,
                fontWeight: 400,
                marginTop: 8,
              },
            },
            opts.context,
          )
        : null,
      opts.multiplier
        ? h(
            'span',
            {
              style: {
                color: C.accent,
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: '-0.5px',
              },
            },
            opts.multiplier,
          )
        : null,
    ),

    // Footer
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: 10,
        },
      },
      h(
        'span',
        {
          style: {
            color: C.muted,
            fontSize: 17,
            fontWeight: 400,
            opacity: 0.55,
          },
        },
        '@sammiihk',
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Feature launch card
// ---------------------------------------------------------------------------

export interface FeatureLaunchCardOptions {
  featureName: string;
  tagline?: string;
  bullets?: string[];
  mau?: number;
  mrr?: number;
}

function buildFeatureLaunchElement(
  opts: FeatureLaunchCardOptions,
): React.ReactElement {
  const nameFontSize =
    opts.featureName.length > 20 ? 56 : opts.featureName.length > 12 ? 72 : 88;

  const statsLine = [
    opts.mau ? `${opts.mau} MAU` : null,
    opts.mrr ? `${formatMrr(opts.mrr)} MRR` : null,
    'free tier',
  ]
    .filter(Boolean)
    .join('  ·  ');

  return h(
    'div',
    { style: rootStyle() },

    ...GradientOverlays(),

    // Header
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 18,
        },
      },
      h(
        'span',
        {
          style: {
            color: C.primary,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.3px',
          },
        },
        'lunary.app',
      ),
      h(
        'span',
        {
          style: {
            color: C.accent,
            fontSize: 16,
            fontWeight: 400,
            letterSpacing: '2px',
          },
        },
        'just shipped',
      ),
    ),

    Separator(),

    // Main content
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: 14,
        },
      },
      h(
        'span',
        {
          style: {
            color: C.white,
            fontSize: nameFontSize,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-1.5px',
            textAlign: 'center',
          },
        },
        opts.featureName,
      ),
      h('div', {
        style: {
          width: 180,
          height: 2,
          background:
            'linear-gradient(90deg, transparent, rgba(132,88,216,0.9), rgba(199,125,255,0.9), transparent)',
        },
      }),
      opts.tagline
        ? h(
            'span',
            {
              style: {
                color: C.secondary,
                fontSize: 24,
                fontWeight: 400,
                textAlign: 'center',
                letterSpacing: '0.3px',
              },
            },
            opts.tagline,
          )
        : null,
      opts.bullets && opts.bullets.length > 0
        ? h(
            'span',
            {
              style: {
                color: C.muted,
                fontSize: 20,
                fontWeight: 400,
                marginTop: 4,
              },
            },
            opts.bullets.join('  ·  '),
          )
        : null,
    ),

    Separator(),

    // Footer
    h(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 14,
        },
      },
      opts.mau || opts.mrr
        ? h(
            'span',
            { style: { color: C.muted, fontSize: 17, fontWeight: 400 } },
            statsLine,
          )
        : h('span', {}),
      h(
        'span',
        {
          style: {
            color: C.muted,
            fontSize: 17,
            fontWeight: 400,
            opacity: 0.55,
          },
        },
        '@sammiihk',
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Render to PNG file
// ---------------------------------------------------------------------------

async function renderToFile(
  element: React.ReactElement,
  outputPath: string,
): Promise<string> {
  const fonts = getFonts();
  let response: ImageResponse;
  try {
    response = new ImageResponse(element, { width: W, height: H, fonts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`IMAGE_RENDER_FAILED: ${msg}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

export async function renderMetricsCard(
  opts: MetricsCardOptions,
  outputPath: string,
): Promise<string> {
  return renderToFile(buildMetricsElement(opts), outputPath);
}

export async function renderMilestoneCard(
  opts: MilestoneCardOptions,
  outputPath: string,
): Promise<string> {
  return renderToFile(buildMilestoneElement(opts), outputPath);
}

export async function renderFeatureLaunchCard(
  opts: FeatureLaunchCardOptions,
  outputPath: string,
): Promise<string> {
  return renderToFile(buildFeatureLaunchElement(opts), outputPath);
}
