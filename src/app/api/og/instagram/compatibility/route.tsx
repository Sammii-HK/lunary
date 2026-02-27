import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { zodiacSymbol } from '@/constants/symbols';
import {
  loadIGFonts,
  IGBrandTag,
  truncateIG,
  renderIGStarfield,
  renderConstellation,
  renderDepthRings,
  renderMeteors,
} from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  IG_SPACING,
  SIGN_ACCENT,
} from '@/lib/instagram/design-system';
import { OG_COLORS } from '@/lib/share/og-utils';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

function getZodiacGlyph(sign: string): string {
  const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
  return zodiacSymbol[key] || '\u2648';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#34D399'; // emerald
  if (score >= 60) return '#F59E0B'; // amber
  if (score >= 40) return '#FB923C'; // orange
  return '#EF4444'; // red
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sign1 = (searchParams.get('sign1') || 'aries').toLowerCase();
    const sign2 = (searchParams.get('sign2') || 'leo').toLowerCase();
    const score = parseInt(searchParams.get('score') || '85', 10);
    const element1 = searchParams.get('element1') || 'Fire';
    const element2 = searchParams.get('element2') || 'Fire';
    const headline = searchParams.get('headline') || 'Cosmic connection';

    const accent1 = SIGN_ACCENT[sign1] || '#A78BFA';
    const accent2 = SIGN_ACCENT[sign2] || '#C084FC';
    const scoreColor = getScoreColor(score);
    const { width, height } = IG_SIZES.square;

    const fonts = await loadIGFonts(request, { includeAstronomicon: true });
    const starfield = renderIGStarfield(`compat-${sign1}-${sign2}`);
    const depthRings = renderDepthRings(accent1, width, height);

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #2e1440 0%, #1a0d28 50%, #120a1e 100%)',
          padding: `${IG_SPACING.padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          overflow: 'hidden',
        }}
      >
        {starfield}
        {...renderMeteors(`compat-${sign1}-${sign2}`, accent1)}
        {...depthRings}
        {renderConstellation(sign1, accent1, width, height)}
        {renderConstellation(sign2, accent2, width, height)}

        {/* Score as giant ghost backdrop */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 600,
              color: scoreColor,
              opacity: 0.06,
              display: 'flex',
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: '-0.04em',
            }}
          >
            {score}%
          </div>
        </div>

        {/* "COMPATIBILITY" header */}
        <div
          style={{
            fontSize: IG_TEXT.dark.caption,
            color: OG_COLORS.textTertiary,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          Compatibility
        </div>

        {/* Sign pair with glyphs — bigger, no circles */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            marginBottom: 32,
          }}
        >
          {/* Sign 1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: 'Astronomicon',
                fontSize: 120,
                color: accent1,
                display: 'flex',
                textShadow: `0 0 40px ${accent1}60`,
              }}
            >
              {getZodiacGlyph(sign1)}
            </span>
            <span
              style={{
                fontSize: IG_TEXT.dark.label,
                color: accent1,
                display: 'flex',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              {capitalize(sign1)}
            </span>
            <span
              style={{
                fontSize: IG_TEXT.dark.caption - 4,
                color: OG_COLORS.textTertiary,
                display: 'flex',
              }}
            >
              {element1}
            </span>
          </div>

          {/* Score — hero number */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 96,
                color: scoreColor,
                fontWeight: 700,
                display: 'flex',
                lineHeight: 1,
                textShadow: `0 0 50px ${scoreColor}60`,
                letterSpacing: '-0.02em',
              }}
            >
              {score}%
            </span>
          </div>

          {/* Sign 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: 'Astronomicon',
                fontSize: 120,
                color: accent2,
                display: 'flex',
                textShadow: `0 0 40px ${accent2}60`,
              }}
            >
              {getZodiacGlyph(sign2)}
            </span>
            <span
              style={{
                fontSize: IG_TEXT.dark.label,
                color: accent2,
                display: 'flex',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              {capitalize(sign2)}
            </span>
            <span
              style={{
                fontSize: IG_TEXT.dark.caption - 4,
                color: OG_COLORS.textTertiary,
                display: 'flex',
              }}
            >
              {element2}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: IG_TEXT.dark.subtitle + 4,
            color: OG_COLORS.textPrimary,
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: '85%',
            display: 'flex',
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          {truncateIG(headline, 60)}
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: IG_TEXT.dark.caption,
            color: OG_COLORS.textTertiary,
            display: 'flex',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Tag your person
        </div>

        <IGBrandTag baseUrl={SHARE_BASE_URL} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[IG Compatibility] Error:', error);
    return new Response('Failed to generate compatibility image', {
      status: 500,
    });
  }
}
