/**
 * GET /api/og/roast-hype?mode=&headline=&line1=&line2=&line3=&handle=
 *
 * Renders the "Roast Me / Hype Me" 3-line reading as an Open Graph card.
 * Edge runtime, deterministic, allow-listed inputs (we never let raw user
 * text drive a fetch URL — the long fields are length-clamped + control-char
 * stripped before they ever reach the renderer).
 *
 * Layout sketch:
 *   ┌──────────────────────────────────────────────┐
 *   │ tag (ROAST or HYPE) — sky-adjacent           │
 *   │ Headline (big, glowy)                        │
 *   │                                              │
 *   │ ── line 1                                    │
 *   │ ── line 2                                    │
 *   │ ── line 3                                    │
 *   │                                              │
 *   │ @handle              ShareFooter (CTA)        │
 *   └──────────────────────────────────────────────┘
 *
 * Roast = rose/violet gradient. Hype = gold/pink gradient.
 *
 * Reuses `getFormatDimensions`, `renderStarfield`, `ShareFooter`,
 * `truncateText` from `@/lib/share/*` so we stay visually consistent with
 * the rest of the OG suite.
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import { getFormatDimensions } from '@/lib/share/og-utils';
import {
  ShareFooter,
  getShareSizes,
  renderStarfield,
  truncateText,
} from '@/lib/share/og-share-utils';

export const runtime = 'edge';

const HANDLE_REGEX = /^[a-z0-9-]{3,30}$/;
const ALLOWED_MODES = new Set(['roast', 'hype']);

const HEADLINE_LIMIT = 60;
const LINE_LIMIT = 200;

/** Strip control characters that could break ImageResponse layout / log integrity. */
function clean(input: string | null | undefined, limit: number): string {
  if (!input) return '';
  // Only printable + whitespace (tab/newline are stripped to keep layout sane).
  const stripped = String(input).replace(/[\x00-\x1F\x7F]/g, ' ');
  return truncateText(stripped, limit);
}

interface ModeTheme {
  tag: string;
  background: string;
  vignette: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textMuted: string;
}

const ROAST_THEME: ModeTheme = {
  tag: 'ROAST',
  // Rose / violet — sharp, warm, slightly dangerous.
  background: 'linear-gradient(135deg, #2a0a1e 0%, #14081f 50%, #1a0a2c 100%)',
  vignette:
    'radial-gradient(ellipse at 25% 0%, rgba(238,120,158,0.35) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at 80% 100%, rgba(132,88,216,0.30) 0%, rgba(0,0,0,0) 55%)',
  accent: '#EE789E',
  accentSoft: '#F0A5BD',
  textPrimary: '#FBE9F1',
  textMuted: '#C99CB2',
};

const HYPE_THEME: ModeTheme = {
  tag: 'HYPE',
  // Gold / pink — generous, warm, celebratory.
  background: 'linear-gradient(135deg, #2c1a0a 0%, #1f0f1a 50%, #2c0a26 100%)',
  vignette:
    'radial-gradient(ellipse at 30% 0%, rgba(212,165,116,0.35) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at 80% 100%, rgba(238,120,158,0.30) 0%, rgba(0,0,0,0) 55%)',
  accent: '#D4A574',
  accentSoft: '#F2C99C',
  textPrimary: '#FFF5E8',
  textMuted: '#D7B58F',
};

function themeFor(mode: 'roast' | 'hype'): ModeTheme {
  return mode === 'hype' ? HYPE_THEME : ROAST_THEME;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawMode = (searchParams.get('mode') || '').toLowerCase();
  const mode: 'roast' | 'hype' = ALLOWED_MODES.has(rawMode)
    ? (rawMode as 'roast' | 'hype')
    : 'roast';

  const headline =
    clean(searchParams.get('headline'), HEADLINE_LIMIT) ||
    (mode === 'hype' ? 'You, but in lights.' : 'You, but with footnotes.');
  const line1 = clean(searchParams.get('line1'), LINE_LIMIT);
  const line2 = clean(searchParams.get('line2'), LINE_LIMIT);
  const line3 = clean(searchParams.get('line3'), LINE_LIMIT);

  const rawHandle = (searchParams.get('handle') || '').toLowerCase();
  const handle = HANDLE_REGEX.test(rawHandle) ? rawHandle : null;

  const theme = themeFor(mode);
  const dims = getFormatDimensions('landscape');
  const sizes = getShareSizes('landscape');

  // Stable starfield seed per (mode, handle) so the same reading shares the
  // same sky decoration when rendered twice.
  const seed = `roast-hype-${mode}-${handle ?? 'anon'}`;

  const lines = [line1, line2, line3].filter(Boolean);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.background,
        padding: sizes.padding,
        position: 'relative',
        fontFamily: 'sans-serif',
        color: theme.textPrimary,
      }}
    >
      {/* Starfield + vignette */}
      {renderStarfield(seed, 'landscape')}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: theme.vignette,
        }}
      />

      {/* Header — mode tag + headline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: sizes.labelSize,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: theme.accent,
            display: 'flex',
          }}
        >
          {`${theme.tag} \u00B7 LUNARY`}
        </span>
        <span
          style={{
            fontSize: sizes.titleSize + 6,
            fontWeight: 300,
            marginTop: 8,
            color: theme.textPrimary,
            display: 'flex',
            textShadow: `0 0 24px ${theme.accent}55`,
          }}
        >
          {headline}
        </span>
      </div>

      {/* Three lines */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          marginTop: 28,
          zIndex: 1,
          flex: 1,
        }}
      >
        {lines.map((text, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 16,
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                marginTop: 14,
                borderRadius: 2,
                background: theme.accentSoft,
                display: 'flex',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: sizes.bodySize + 2,
                lineHeight: 1.35,
                color: theme.textPrimary,
                display: 'flex',
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* Footer row: handle on left, ShareFooter (Lunary CTA) centred */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1,
          marginTop: 12,
        }}
      >
        <span
          style={{
            fontSize: sizes.footerTextSize,
            color: theme.textMuted,
            display: 'flex',
          }}
        >
          {handle ? `@${handle}` : 'lunary.app'}
        </span>
        <ShareFooter format='landscape' />
        <span
          style={{
            fontSize: sizes.footerTextSize,
            color: theme.textMuted,
            display: 'flex',
            opacity: 0,
          }}
        >
          {/* Visual balancer so ShareFooter centres in the row. */}
          spacer
        </span>
      </div>
    </div>,
    { width: dims.width, height: dims.height },
  );
}
