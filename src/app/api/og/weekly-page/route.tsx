/**
 * OG share card for /app/week-ahead.
 *
 * Strict allow-list on the dominant phase and on display strings (length-
 * capped + sanitised) so this can't be used to forge arbitrary OG content.
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import {
  getFormatDimensions,
  OG_COLORS,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  loadShareFonts,
  ShareFooter,
  SHARE_IMAGE_BORDER,
} from '@/lib/share/og-share-utils';

export const runtime = 'edge';

const ALLOWED_PHASES = new Set([
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
]);

const PHASE_GRADIENTS: Record<
  string,
  { from: string; via: string; to: string }
> = {
  'New Moon': { from: '#0F172A', via: '#1E1B4B', to: '#312E81' },
  'Waxing Crescent': { from: '#1E1B4B', via: '#3730A3', to: '#6366F1' },
  'First Quarter': { from: '#312E81', via: '#7C3AED', to: '#A78BFA' },
  'Waxing Gibbous': { from: '#581C87', via: '#9333EA', to: '#C77DFF' },
  'Full Moon': { from: '#7C3AED', via: '#C77DFF', to: '#FDE68A' },
  'Waning Gibbous': { from: '#4338CA', via: '#7C3AED', to: '#C77DFF' },
  'Last Quarter': { from: '#1E3A8A', via: '#3730A3', to: '#7C3AED' },
  'Waning Crescent': { from: '#0F172A', via: '#1E3A8A', to: '#3730A3' },
};

const DEFAULT_GRADIENT = { from: '#1E1B4B', via: '#7C3AED', to: '#C77DFF' };

// O(n) sanitiser: strips control characters and trims to a hard cap. Avoids
// regex-with-unbounded-quantifiers (no ReDoS risk on adversarial input).
function sanitise(value: string | null, maxLen: number): string {
  if (!value) return '';
  let out = '';
  for (let i = 0; i < value.length && out.length < maxLen; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) continue;
    out += value[i];
  }
  return out;
}

function formatWeekRange(weekStartIso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(weekStartIso);
  if (!match) return 'YOUR WEEK AHEAD';
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  const month = date.toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
  return `WEEK OF ${month.toUpperCase()} ${Number(d)}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const weekStartRaw = searchParams.get('weekStart') ?? '';
    const weekStart = /^\d{4}-\d{2}-\d{2}$/.test(weekStartRaw)
      ? weekStartRaw
      : '';
    const headline = sanitise(searchParams.get('headline'), 120);
    const topAspect = sanitise(searchParams.get('topAspect'), 80);
    const phaseRaw = searchParams.get('phase') ?? '';
    const phase = ALLOWED_PHASES.has(phaseRaw) ? phaseRaw : 'Full Moon';
    const handle = sanitise(searchParams.get('handle'), 24);

    const format = 'square' as const;
    const { width, height } = getFormatDimensions(format);

    const gradient = PHASE_GRADIENTS[phase] ?? DEFAULT_GRADIENT;
    const stars = generateStarfield(
      `week-${weekStart}-${phase}`,
      getStarCount(format),
    );

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: 60,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              background: '#fff',
              opacity: star.opacity,
            }}
          />
        ))}

        {/* Phase-tinted aurora */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 70% 30%, ${gradient.via}40 0%, transparent 55%), linear-gradient(135deg, ${gradient.from}30 0%, transparent 50%, ${gradient.to}25 100%)`,
            display: 'flex',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: OG_COLORS.textTertiary,
              letterSpacing: '0.2em',
              display: 'flex',
            }}
          >
            {handle ? `${handle.toUpperCase()} ` : ''}
            {handle ? '\u00B7 ' : ''}
            {formatWeekRange(weekStart)}
          </span>
          <span
            style={{
              fontSize: 13,
              color: OG_COLORS.textTertiary,
              letterSpacing: '0.18em',
              display: 'flex',
            }}
          >
            {'LUNARY \u00B7 WEEK AHEAD'}
          </span>
        </div>

        {/* Hero - phase disc + headline */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 36,
            zIndex: 1,
            marginTop: 28,
          }}
        >
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${gradient.to} 0%, ${gradient.via} 55%, ${gradient.from} 100%)`,
              boxShadow: `0 0 80px ${gradient.via}80`,
              flexShrink: 0,
              display: 'flex',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              gap: 14,
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: OG_COLORS.textTertiary,
                letterSpacing: '0.18em',
                display: 'flex',
              }}
            >
              {phase.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 40,
                color: OG_COLORS.textPrimary,
                lineHeight: 1.15,
                letterSpacing: '0.01em',
                display: 'flex',
              }}
            >
              {headline || 'Your week ahead'}
            </span>
            {topAspect && (
              <span
                style={{
                  fontSize: 22,
                  color: gradient.to,
                  letterSpacing: '0.02em',
                  display: 'flex',
                  marginTop: 6,
                }}
              >
                {topAspect}
              </span>
            )}
          </div>
        </div>

        <ShareFooter format={format} />
      </div>
    );

    const fonts = await loadShareFonts(request);
    return new ImageResponse(layoutJsx, { width, height, fonts });
  } catch (error) {
    console.error('[og/weekly-page] Failed to render');
    return new Response('Failed to generate image', { status: 500 });
  }
}
