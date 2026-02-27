import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { zodiacSymbol } from '@/constants/symbols';
import {
  loadIGFonts,
  IGBrandTag,
  renderIGStarfield,
} from '@/lib/instagram/ig-utils';
import { IG_SIZES, IG_TEXT, SIGN_ACCENT } from '@/lib/instagram/design-system';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trait = searchParams.get('trait') || 'patience';
    const rankingsJson = searchParams.get('rankings') || '[]';

    let rankings: Array<{ sign: string; rank: number }>;
    try {
      rankings = JSON.parse(rankingsJson);
    } catch {
      rankings = [];
    }

    if (rankings.length === 0) {
      // Fallback: use all signs in default order
      const signs = [
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces',
      ];
      rankings = signs.map((sign, i) => ({ sign, rank: i + 1 }));
    }

    const { width, height } = IG_SIZES.portrait;
    const fonts = await loadIGFonts(request, { includeAstronomicon: true });
    const starfield = renderIGStarfield(`rank-${trait}`);

    // Accent colour based on first-place sign
    const topSign = rankings[0]?.sign || 'aries';
    const accent = SIGN_ACCENT[topSign] || '#A78BFA';

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #1a1028 0%, #0d0a14 50%, #0a0a0a 100%)',
          padding: '48px 56px',
          position: 'relative',
          fontFamily: 'Roboto Mono',
          overflow: 'hidden',
        }}
      >
        {starfield}

        {/* Top sign's glyph — giant ghost backdrop */}
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
            {getZodiacGlyph(topSign)}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: IG_TEXT.dark.caption,
              color: OG_COLORS.textTertiary,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 6,
              display: 'flex',
            }}
          >
            Signs ranked by
          </div>
          <div
            style={{
              fontSize: 88,
              color: accent,
              fontWeight: 700,
              textTransform: 'capitalize',
              display: 'flex',
              lineHeight: 1,
              textShadow: `0 0 50px ${accent}60`,
              letterSpacing: '-0.02em',
            }}
          >
            {trait}
          </div>
        </div>

        {/* Rankings list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            flex: 1,
          }}
        >
          {rankings.slice(0, 12).map(({ sign, rank }) => {
            const isTop3 = rank <= 3;
            const isBottom3 = rank >= 10;
            const signAccent = SIGN_ACCENT[sign] || '#A78BFA';

            return (
              <div
                key={sign}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '8px 16px',
                  borderRadius: 12,
                  background: isTop3 ? `${signAccent}12` : 'transparent',
                  opacity: isBottom3 ? 0.5 : 1,
                }}
              >
                {/* Rank number */}
                <div
                  style={{
                    fontSize: IG_TEXT.dark.label - 2,
                    color: isTop3 ? signAccent : OG_COLORS.textTertiary,
                    fontWeight: isTop3 ? 700 : 400,
                    width: 36,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {rank}
                </div>

                {/* Zodiac glyph */}
                <div
                  style={{
                    fontFamily: 'Astronomicon',
                    fontSize: 28,
                    color: isTop3 ? signAccent : OG_COLORS.textSecondary,
                    display: 'flex',
                    width: 36,
                    justifyContent: 'center',
                  }}
                >
                  {getZodiacGlyph(sign)}
                </div>

                {/* Sign name */}
                <div
                  style={{
                    fontSize: IG_TEXT.dark.label - 2,
                    color: isTop3
                      ? OG_COLORS.textPrimary
                      : isBottom3
                        ? OG_COLORS.textTertiary
                        : OG_COLORS.textSecondary,
                    fontWeight: isTop3 ? 600 : 400,
                    display: 'flex',
                    flex: 1,
                  }}
                >
                  {capitalize(sign)}
                </div>

                {/* Medal for top 3 */}
                {rank === 1 && (
                  <div
                    style={{ fontSize: 22, display: 'flex', color: '#FFD700' }}
                  >
                    1st
                  </div>
                )}
                {rank === 2 && (
                  <div
                    style={{ fontSize: 20, display: 'flex', color: '#C0C0C0' }}
                  >
                    2nd
                  </div>
                )}
                {rank === 3 && (
                  <div
                    style={{ fontSize: 20, display: 'flex', color: '#CD7F32' }}
                  >
                    3rd
                  </div>
                )}
              </div>
            );
          })}
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
    console.error('[IG Sign Ranking] Error:', error);
    return new Response('Failed to generate sign ranking image', {
      status: 500,
    });
  }
}
