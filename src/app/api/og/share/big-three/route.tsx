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
  SHARE_TITLE_GLOW,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import { zodiacSymbol } from '@/constants/symbols';

export const runtime = 'edge';

const SIGN_GRADIENTS: Record<
  string,
  { from: string; via: string; to: string }
> = {
  Aries: { from: '#DC2626', via: '#EA580C', to: '#EAB308' },
  Taurus: { from: '#65A30D', via: '#059669', to: '#0D9488' },
  Gemini: { from: '#EAB308', via: '#F59E0B', to: '#F97316' },
  Cancer: { from: '#818CF8', via: '#A78BFA', to: '#C084FC' },
  Leo: { from: '#F59E0B', via: '#F97316', to: '#DC2626' },
  Virgo: { from: '#059669', via: '#10B981', to: '#34D399' },
  Libra: { from: '#EC4899', via: '#F472B6', to: '#FBCFE8' },
  Scorpio: { from: '#7C3AED', via: '#8B5CF6', to: '#A78BFA' },
  Sagittarius: { from: '#DC2626', via: '#EA580C', to: '#F97316' },
  Capricorn: { from: '#374151', via: '#4B5563', to: '#9CA3AF' },
  Aquarius: { from: '#2563EB', via: '#3B82F6', to: '#60A5FA' },
  Pisces: { from: '#06B6D4', via: '#22D3EE', to: '#67E8F9' },
};

const DEFAULT_GRADIENT = { from: '#8458D8', via: '#7B7BE8', to: '#C77DFF' };

function getGlyph(sign: string): string {
  const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
  return zodiacSymbol[key] || sign.charAt(0);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'square') as ShareFormat;
    const name = searchParams.get('name') || '';
    const sunSign = searchParams.get('sun') || 'Scorpio';
    const moonSign = searchParams.get('moon') || 'Cancer';
    const risingSign = searchParams.get('rising') || 'Leo';

    const { width, height } = getFormatDimensions(format);
    const isStory = format === 'story';
    const isLandscape = format === 'landscape';

    const gradient = SIGN_GRADIENTS[sunSign] || DEFAULT_GRADIENT;
    const moonColor = OG_COLORS.galaxyHaze;
    const risingColor = OG_COLORS.cometTrail;
    const firstName = name.trim().split(' ')[0] || '';

    const shareId = `big3-${sunSign}-${moonSign}-${risingSign}`;
    const stars = generateStarfield(shareId, getStarCount(format));
    const starfieldJsx = stars.map((star, i) => (
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
    ));

    // Format-specific sizing
    const padding = isLandscape ? 48 : isStory ? 80 : 60;
    const titleSize = isLandscape ? 36 : isStory ? 72 : 52;
    const subtitleSize = isLandscape ? 13 : isStory ? 24 : 18;
    const signNameSize = isLandscape ? 22 : isStory ? 52 : 32;
    const labelSize = isLandscape ? 12 : isStory ? 22 : 15;
    // Astronomicon glyphs render at ~45% of fontSize due to em-square whitespace
    const sunSymbolSize = isLandscape ? 110 : isStory ? 520 : 240;
    const secondarySymbolSize = isLandscape ? 110 : isStory ? 300 : 200;

    const threeSignsData = [
      { sign: sunSign, label: 'Sun', color: gradient.via, isMain: true },
      { sign: moonSign, label: 'Moon', color: moonColor, isMain: false },
      { sign: risingSign, label: 'Rising', color: risingColor, isMain: false },
    ];

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {starfieldJsx}

        {/* Subtle sun-sign colour tint */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${gradient.from}12 0%, transparent 50%, ${gradient.to}08 100%)`,
            display: 'flex',
          }}
        />

        {isLandscape ? (
          // Landscape: title block | divider | three signs (all in a flex-row taking flex:1)
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              gap: 48,
              alignItems: 'center',
            }}
          >
            {/* Title */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: 240,
                flexShrink: 0,
                gap: 6,
              }}
            >
              {firstName && (
                <div
                  style={{
                    fontSize: subtitleSize,
                    color: OG_COLORS.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    display: 'flex',
                  }}
                >
                  {`${firstName}'s`}
                </div>
              )}
              <div
                style={{
                  fontSize: titleSize,
                  fontWeight: 400,
                  color: OG_COLORS.textPrimary,
                  letterSpacing: '0.05em',
                  display: 'flex',
                  lineHeight: 1.1,
                  textShadow: SHARE_TITLE_GLOW,
                }}
              >
                Big Three
              </div>
              <div
                style={{
                  fontSize: subtitleSize,
                  color: OG_COLORS.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  display: 'flex',
                  marginTop: 4,
                }}
              >
                Cosmic Identity
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 1,
                alignSelf: 'stretch',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                flexShrink: 0,
                marginTop: 8,
                marginBottom: 8,
              }}
            />

            {/* Three signs */}
            <div
              style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              {threeSignsData.map(({ sign, label, color }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: labelSize,
                      color: OG_COLORS.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      display: 'flex',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Astronomicon',
                      fontSize: sunSymbolSize,
                      color,
                      display: 'flex',
                      lineHeight: 1,
                    }}
                  >
                    {getGlyph(sign)}
                  </div>
                  <div
                    style={{
                      fontSize: signNameSize,
                      fontWeight: 400,
                      color: OG_COLORS.textPrimary,
                      display: 'flex',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {sign}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isStory ? (
          // Story: header + large sun hero + moon/rising side-by-side cards
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              {firstName && (
                <div
                  style={{
                    fontSize: labelSize,
                    color: OG_COLORS.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    display: 'flex',
                    marginBottom: 6,
                  }}
                >
                  {firstName}
                </div>
              )}
              <div
                style={{
                  fontSize: titleSize,
                  fontWeight: 400,
                  color: OG_COLORS.textPrimary,
                  letterSpacing: '0.05em',
                  display: 'flex',
                  textShadow: SHARE_TITLE_GLOW,
                }}
              >
                Big Three
              </div>
              <div
                style={{
                  fontSize: subtitleSize,
                  color: OG_COLORS.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  display: 'flex',
                  marginTop: 10,
                }}
              >
                Cosmic Identity
              </div>
            </div>

            {/* Sun — hero section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 2,
                gap: 14,
              }}
            >
              <div
                style={{
                  fontSize: labelSize,
                  color: OG_COLORS.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  display: 'flex',
                }}
              >
                Sun
              </div>
              <div
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: sunSymbolSize,
                  color: gradient.via,
                  display: 'flex',
                  lineHeight: 1,
                }}
              >
                {getGlyph(sunSign)}
              </div>
              <div
                style={{
                  fontSize: signNameSize,
                  fontWeight: 400,
                  color: OG_COLORS.textPrimary,
                  display: 'flex',
                  letterSpacing: '0.08em',
                }}
              >
                {sunSign}
              </div>
            </div>

            {/* Moon + Rising — supporting cards */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 20,
                flex: 1,
              }}
            >
              {[
                { sign: moonSign, label: 'Moon', color: moonColor },
                { sign: risingSign, label: 'Rising', color: risingColor },
              ].map(({ sign, label, color }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    gap: 14,
                    padding: '24px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}30`,
                    borderRadius: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: labelSize,
                      color: OG_COLORS.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      display: 'flex',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Astronomicon',
                      fontSize: secondarySymbolSize,
                      color,
                      display: 'flex',
                      lineHeight: 1,
                    }}
                  >
                    {getGlyph(sign)}
                  </div>
                  <div
                    style={{
                      fontSize: signNameSize - 12,
                      fontWeight: 400,
                      color: OG_COLORS.textPrimary,
                      display: 'flex',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {sign}
                  </div>
                </div>
              ))}
            </div>

            <ShareFooter format={format} />
          </div>
        ) : (
          // Square: header + three equal columns
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  fontSize: titleSize,
                  fontWeight: 400,
                  color: OG_COLORS.textPrimary,
                  letterSpacing: '0.05em',
                  display: 'flex',
                  textShadow: SHARE_TITLE_GLOW,
                }}
              >
                {firstName ? `${firstName}'s Big Three` : 'Big Three'}
              </div>
              <div
                style={{
                  fontSize: subtitleSize,
                  color: OG_COLORS.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  display: 'flex',
                  marginTop: 10,
                }}
              >
                Cosmic Identity
              </div>
            </div>

            {/* Three equal columns */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flex: 1,
                gap: 16,
              }}
            >
              {threeSignsData.map(({ sign, label, color, isMain }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    gap: 14,
                    padding: '24px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}${isMain ? '45' : '25'}`,
                    borderRadius: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: labelSize,
                      color: OG_COLORS.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      display: 'flex',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Astronomicon',
                      fontSize: secondarySymbolSize,
                      color,
                      display: 'flex',
                      lineHeight: 1,
                    }}
                  >
                    {getGlyph(sign)}
                  </div>
                  <div
                    style={{
                      fontSize: signNameSize - 4,
                      fontWeight: 400,
                      color: OG_COLORS.textPrimary,
                      display: 'flex',
                      letterSpacing: '0.06em',
                      textAlign: 'center',
                    }}
                  >
                    {sign}
                  </div>
                </div>
              ))}
            </div>

            <ShareFooter format={format} />
          </div>
        )}

        {/* Landscape footer — placed after the row div so it sits at canvas bottom */}
        {isLandscape && <ShareFooter format={format} />}
      </div>
    );

    const fonts = await loadShareFonts(request, { includeAstronomicon: true });
    return new ImageResponse(layoutJsx, { width, height, fonts });
  } catch (error) {
    console.error('[BigThreeOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
