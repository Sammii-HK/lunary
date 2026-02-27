import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { zodiacSymbol } from '@/constants/symbols';
import {
  loadIGFonts,
  truncateIG,
  renderIGStarfield,
  IGBrandTag,
} from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  IG_SPACING,
  MEME_BACKGROUNDS,
  SIGN_ACCENT,
} from '@/lib/instagram/design-system';
import { OG_COLORS } from '@/lib/share/og-utils';
import type { MemeTemplate } from '@/lib/instagram/types';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

const CATEGORY_TINTS: Record<string, string> = {
  zodiac: 'linear-gradient(135deg, #14081a 0%, #0d0a14 50%, #0a0a0a 100%)',
  tarot: 'linear-gradient(135deg, #081420 0%, #0a0d18 50%, #0a0a0a 100%)',
  crystals: 'linear-gradient(135deg, #1a081a 0%, #14081a 50%, #0a0a0a 100%)',
  numerology: 'linear-gradient(135deg, #081a14 0%, #0a140d 50%, #0a0a0a 100%)',
};

function getZodiacGlyph(sign: string): string {
  const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
  return zodiacSymbol[key] || '\u2648';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sign = (searchParams.get('sign') || 'aries').toLowerCase();
    const setup = searchParams.get('setup') || '';
    const punchline = searchParams.get('punchline') || '';
    const template = (searchParams.get('template') ||
      'classic') as MemeTemplate;
    const category = searchParams.get('category') || 'zodiac';

    const signName = sign.charAt(0).toUpperCase() + sign.slice(1);
    const accent = SIGN_ACCENT[sign] || SIGN_ACCENT.aries;
    const bg =
      CATEGORY_TINTS[category] ||
      MEME_BACKGROUNDS[sign] ||
      MEME_BACKGROUNDS.aries;
    const { width, height } = IG_SIZES.portrait;

    const fonts = await loadIGFonts(request, { includeAstronomicon: true });
    const starfield = renderIGStarfield(`meme-${sign}-${setup.slice(0, 10)}`);
    const glyph = getZodiacGlyph(sign);

    // Satori-safe ghost backdrop — reused in all templates
    const glyphBackdrop = (
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
            fontFamily: 'Astronomicon',
            fontSize: 1100,
            color: accent,
            opacity: 0.07,
            display: 'flex',
            lineHeight: 1,
          }}
        >
          {glyph}
        </div>
      </div>
    );

    let layoutJsx: React.ReactElement;

    switch (template) {
      case 'comparison': {
        const [topText, bottomText] = punchline.includes('vs')
          ? punchline.split(/\bvs\b/i).map((s) => s.trim())
          : [setup, punchline];

        layoutJsx = (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: bg,
              fontFamily: 'Roboto Mono',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {starfield}
            {glyphBackdrop}

            {/* Setup - top half */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: `${IG_SPACING.padding}px`,
                borderBottom: `2px solid ${accent}30`,
              }}
            >
              <div
                style={{
                  fontSize: IG_TEXT.dark.subtitle + 4,
                  color: OG_COLORS.textSecondary,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxWidth: '90%',
                }}
              >
                {truncateIG(setup || topText, 120)
                  .split('\n')
                  .map((line, i) => (
                    <div key={i} style={{ display: 'flex' }}>
                      {line}
                    </div>
                  ))}
              </div>
            </div>

            {/* Glyph divider — Satori-safe absolute centering */}
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
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: '#0d0a14',
                  border: `2px solid ${accent}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Astronomicon',
                    fontSize: 52,
                    color: accent,
                    display: 'flex',
                    textShadow: `0 0 20px ${accent}80`,
                  }}
                >
                  {glyph}
                </span>
              </div>
            </div>

            {/* Punchline - bottom half */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: `${IG_SPACING.padding}px`,
              }}
            >
              <div
                style={{
                  fontSize: IG_TEXT.dark.subtitle + 4,
                  color: accent,
                  textAlign: 'center',
                  lineHeight: 1.4,
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxWidth: '90%',
                  textShadow: `0 0 40px ${accent}50`,
                }}
              >
                {truncateIG(punchline || bottomText, 140)
                  .split('\n')
                  .map((line, i) => (
                    <div key={i} style={{ display: 'flex' }}>
                      {line}
                    </div>
                  ))}
              </div>
            </div>
            <IGBrandTag baseUrl={SHARE_BASE_URL} />
          </div>
        );
        break;
      }

      case 'callout':
      case 'hot_take': {
        const fullText = setup || punchline;
        layoutJsx = (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: bg,
              padding: `${IG_SPACING.padding}px`,
              fontFamily: 'Roboto Mono',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {starfield}
            {/* Ghost backdrop — Satori-safe */}
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
                  fontFamily: 'Astronomicon',
                  fontSize: 1100,
                  color: accent,
                  opacity: 0.07,
                  display: 'flex',
                  lineHeight: 1,
                }}
              >
                {glyph}
              </div>
            </div>

            {/* Sign name badge */}
            <div
              style={{
                display: 'flex',
                padding: '12px 32px',
                borderRadius: 100,
                background: `${accent}18`,
                border: `1px solid ${accent}50`,
                marginBottom: 48,
              }}
            >
              <span
                style={{
                  fontSize: IG_TEXT.dark.caption,
                  color: accent,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  fontWeight: 600,
                }}
              >
                {signName}
              </span>
            </div>

            {/* Main text */}
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle + 6,
                color: OG_COLORS.textPrimary,
                textAlign: 'center',
                lineHeight: 1.35,
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                fontWeight: 600,
              }}
            >
              {truncateIG(fullText, 200)
                .split('\n')
                .map((line, i) => (
                  <div key={i} style={{ display: 'flex' }}>
                    {line}
                  </div>
                ))}
            </div>

            <IGBrandTag baseUrl={SHARE_BASE_URL} />
          </div>
        );
        break;
      }

      default: {
        // Classic: ghost backdrop + setup -> glyph hero -> punchline
        layoutJsx = (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: bg,
              padding: `${IG_SPACING.padding}px`,
              fontFamily: 'Roboto Mono',
              position: 'relative',
              gap: 40,
              overflow: 'hidden',
            }}
          >
            {starfield}
            {glyphBackdrop}

            {/* Setup text */}
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle + 4,
                color: OG_COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: 1.3,
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {truncateIG(setup, 120)
                .split('\n')
                .map((line, i) => (
                  <div key={i} style={{ display: 'flex' }}>
                    {line}
                  </div>
                ))}
            </div>

            {/* Zodiac glyph — hero */}
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: 160,
                color: accent,
                display: 'flex',
                textShadow: `0 0 60px ${accent}70`,
                lineHeight: 1,
              }}
            >
              {glyph}
            </div>

            {/* Punchline text */}
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle + 4,
                color: OG_COLORS.textPrimary,
                textAlign: 'center',
                lineHeight: 1.4,
                fontWeight: 700,
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {truncateIG(punchline, 160)
                .split('\n')
                .map((line, i) => (
                  <div key={i} style={{ display: 'flex' }}>
                    {line}
                  </div>
                ))}
            </div>

            <IGBrandTag baseUrl={SHARE_BASE_URL} />
          </div>
        );
        break;
      }
    }

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
    console.error('[IG Meme] Error:', error);
    return new Response('Failed to generate meme image', { status: 500 });
  }
}
