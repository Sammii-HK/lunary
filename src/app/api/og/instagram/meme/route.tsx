import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { zodiacSymbol } from '@/constants/symbols';
import {
  loadIGFonts,
  IGBrandTag,
  truncateIG,
  renderIGStarfield,
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

    const signName = sign.charAt(0).toUpperCase() + sign.slice(1);
    const accent = SIGN_ACCENT[sign] || SIGN_ACCENT.aries;
    const bg = MEME_BACKGROUNDS[sign] || MEME_BACKGROUNDS.aries;
    const { width, height } = IG_SIZES.square;

    const fonts = await loadIGFonts(request, { includeAstronomicon: true });

    const starfield = renderIGStarfield(`meme-${sign}-${setup.slice(0, 10)}`);

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
            }}
          >
            {starfield}
            {/* Setup - top half */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: `${IG_SPACING.padding}px`,
                borderBottom: `2px solid ${accent}25`,
              }}
            >
              <div
                style={{
                  fontSize: IG_TEXT.dark.subtitle,
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
            {/* Zodiac glyph divider */}
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: OG_COLORS.background,
                border: `2px solid ${accent}50`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: 44,
                  color: accent,
                  display: 'flex',
                }}
              >
                {getZodiacGlyph(sign)}
              </span>
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
                  fontSize: IG_TEXT.dark.body,
                  color: accent,
                  textAlign: 'center',
                  lineHeight: 1.4,
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxWidth: '90%',
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
            }}
          >
            {starfield}
            {/* Large watermark glyph */}
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: 300,
                color: accent,
                opacity: 0.06,
                position: 'absolute',
                display: 'flex',
              }}
            >
              {getZodiacGlyph(sign)}
            </div>

            {/* Sign name badge */}
            <div
              style={{
                display: 'flex',
                padding: '10px 28px',
                borderRadius: 100,
                background: `${accent}18`,
                border: `1px solid ${accent}40`,
                marginBottom: 40,
              }}
            >
              <span
                style={{
                  fontSize: IG_TEXT.dark.caption,
                  color: accent,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                {signName}
              </span>
            </div>

            {/* Main text */}
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle,
                color: OG_COLORS.textPrimary,
                textAlign: 'center',
                lineHeight: 1.4,
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
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
        // Classic: Setup top -> zodiac glyph center -> punchline bottom
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
              gap: 32,
            }}
          >
            {starfield}
            {/* Setup text */}
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle,
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

            {/* Zodiac glyph */}
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: 140,
                color: accent,
                display: 'flex',
              }}
            >
              {getZodiacGlyph(sign)}
            </div>

            {/* Punchline text */}
            <div
              style={{
                fontSize: IG_TEXT.dark.body,
                color: OG_COLORS.textPrimary,
                textAlign: 'center',
                lineHeight: 1.4,
                fontWeight: 600,
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
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('[IG Meme] Error:', error);
    return new Response('Failed to generate meme image', { status: 500 });
  }
}
