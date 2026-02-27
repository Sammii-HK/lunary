import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  loadIGFonts,
  IGBrandTag,
  IGCategoryBadge,
  IGProgressDots,
  truncateIG,
  renderIGStarfield,
  renderMeteors,
} from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  CATEGORY_ACCENT,
  CATEGORY_GRADIENT,
} from '@/lib/instagram/design-system';
import { OG_COLORS } from '@/lib/share/og-utils';
import type { ThemeCategory } from '@/lib/social/types';
import type { CarouselSlideVariant } from '@/lib/instagram/types';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

function getCTABullets(category: ThemeCategory): string[] {
  const bullets: Record<string, string[]> = {
    zodiac: [
      '100% free \u00B7 No ads',
      '2,000+ articles in the grimoire',
      'Personalised to your birth chart',
    ],
    tarot: [
      'Pull your daily tarot card free',
      '78 card meanings with full guides',
      'No ads \u00B7 No sign-up required',
    ],
    crystals: [
      '100+ crystals with healing guides',
      'Chakra connections & pairings',
      'Free forever \u00B7 No ads',
    ],
    numerology: [
      'Calculate your life path number',
      'Angel number meanings & guides',
      'Free \u00B7 No ads \u00B7 No sign-up',
    ],
    spells: [
      '200+ spells in the grimoire',
      'Step-by-step casting guides',
      'Free forever \u00B7 No ads',
    ],
    runes: [
      'Full Elder Futhark guide',
      'Upright & reversed meanings',
      'Free forever \u00B7 No ads',
    ],
    chakras: [
      '7 chakra healing guides',
      'Affirmations & practices',
      'Free forever \u00B7 No ads',
    ],
    sabbat: [
      'Follow the Wheel of the Year',
      'Rituals & traditions for each sabbat',
      'Free forever \u00B7 No ads',
    ],
  };
  return (
    bullets[category] || [
      '100% free \u00B7 No ads',
      '2,000+ articles in the grimoire',
      'Personalised to your birth chart',
    ]
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Grimoire Guide';
    const slideIndex = parseInt(searchParams.get('slideIndex') || '0');
    const totalSlides = parseInt(searchParams.get('totalSlides') || '5');
    const content = searchParams.get('content') || '';
    const subtitle = searchParams.get('subtitle') || '';
    const category = (searchParams.get('category') || 'tarot') as ThemeCategory;
    const variant = (searchParams.get('variant') ||
      'body') as CarouselSlideVariant;
    const symbol = searchParams.get('symbol') || '';

    const accent = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.tarot;
    const gradient = CATEGORY_GRADIENT[category] || CATEGORY_GRADIENT.tarot;
    const { width, height } = IG_SIZES.portrait;

    const fonts = await loadIGFonts(request, {
      includeAstronomicon: true,
      includeRunic: category === 'runes',
    });

    let layoutJsx: React.ReactElement;

    if (variant === 'cover') {
      // Cover slide: Hook text, bold title, category badge, "Swipe" indicator
      // Parse hook from content field (set by carousel-content.ts)
      const hookText = content || '';
      layoutJsx = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: gradient,
            padding: '60px',
            position: 'relative',
            fontFamily: 'Roboto Mono',
            overflow: 'hidden',
          }}
        >
          {renderIGStarfield(`cover-${title}`)}
          {...renderMeteors(`cover-${title}`, accent)}

          {/* Symbol ghost backdrop — huge, Satori-safe centering */}
          {symbol && (
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
                  fontSize: 1200,
                  color: accent,
                  opacity: 0.1,
                  display: 'flex',
                  lineHeight: 1,
                }}
              >
                {symbol}
              </div>
            </div>
          )}

          {/* Category badge */}
          <div style={{ display: 'flex', marginBottom: 40 }}>
            <IGCategoryBadge category={category} />
          </div>

          {/* Hook text — hero */}
          {hookText && (
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle + 8,
                color: OG_COLORS.textPrimary,
                textAlign: 'center',
                lineHeight: 1.25,
                maxWidth: '90%',
                display: 'flex',
                fontWeight: 700,
                marginBottom: 24,
                textShadow: `0 0 40px ${accent}40`,
              }}
            >
              {truncateIG(hookText, 80)}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: hookText ? IG_TEXT.dark.subtitle : IG_TEXT.dark.title,
              color: hookText ? accent : OG_COLORS.textPrimary,
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '85%',
              display: 'flex',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {truncateIG(title, 80)}
          </div>

          {/* Subtitle */}
          {subtitle && !hookText && (
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle,
                color: OG_COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: 1.4,
                maxWidth: '80%',
                marginTop: 20,
                display: 'flex',
              }}
            >
              {truncateIG(subtitle, 100)}
            </div>
          )}

          {/* Swipe indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              position: 'absolute',
              bottom: 100,
            }}
          >
            <span
              style={{
                fontSize: IG_TEXT.dark.label,
                color: OG_COLORS.textTertiary,
                letterSpacing: '0.15em',
                display: 'flex',
              }}
            >
              SWIPE
            </span>
            <span
              style={{
                fontSize: 36,
                color: accent,
                display: 'flex',
              }}
            >
              {'\u2192'}
            </span>
          </div>

          <IGBrandTag baseUrl={SHARE_BASE_URL} />
        </div>
      );
    } else if (variant === 'cta') {
      // CTA slide: Stronger app promotion (Fix 5)
      const ctaBullets = getCTABullets(category);
      layoutJsx = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: gradient,
            padding: '60px',
            position: 'relative',
            fontFamily: 'Roboto Mono',
          }}
        >
          {renderIGStarfield(`cta-${title}`)}
          {...renderMeteors(`cta-${title}`, accent)}

          {/* Progress dots */}
          <div
            style={{
              position: 'absolute',
              top: 48,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <IGProgressDots
              current={slideIndex}
              total={totalSlides}
              accent={accent}
            />
          </div>

          {/* Benefit headline — larger, bolder */}
          <div
            style={{
              fontSize: IG_TEXT.dark.subtitle + 4,
              color: OG_COLORS.textPrimary,
              textAlign: 'center',
              lineHeight: 1.3,
              maxWidth: '85%',
              display: 'flex',
              fontWeight: 600,
              marginBottom: 48,
            }}
          >
            {content || 'Explore your full cosmic profile'}
          </div>

          {/* Feature bullets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginBottom: 48,
              maxWidth: '85%',
            }}
          >
            {ctaBullets.map((bullet, i) => (
              <div
                key={i}
                style={{
                  fontSize: IG_TEXT.dark.caption,
                  color: OG_COLORS.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ color: accent, display: 'flex' }}>
                  {'\u2022'}
                </span>
                <span style={{ display: 'flex' }}>{bullet}</span>
              </div>
            ))}
          </div>

          {/* URL — LARGE in accent colour */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 56px',
              borderRadius: 16,
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
              gap: 12,
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 32,
                color: accent,
                fontWeight: 700,
                letterSpacing: '0.05em',
                display: 'flex',
              }}
            >
              lunary.app
            </span>
          </div>

          {/* Subtle prompt */}
          <div
            style={{
              fontSize: IG_TEXT.dark.caption,
              color: OG_COLORS.textTertiary,
              display: 'flex',
              letterSpacing: '0.05em',
            }}
          >
            Tap the link in bio
          </div>

          <IGBrandTag baseUrl={SHARE_BASE_URL} />
        </div>
      );
    } else {
      // Body slides: Numbered content — reduced text density (Fix 4)
      // Parse content for structured display (pills, key facts)
      const isStructured = content.includes('\n') || content.includes(', ');
      const contentLines = content.split('\n').filter(Boolean);
      const isPills =
        subtitle === 'Strengths' ||
        subtitle === 'Keywords' ||
        (isStructured && contentLines.length === 1 && content.includes(', '));
      const isElementSlide = subtitle === 'Element & Ruler';

      layoutJsx = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: gradient,
            padding: '60px',
            position: 'relative',
            fontFamily: 'Roboto Mono',
            overflow: 'hidden',
          }}
        >
          {renderIGStarfield(`body-${title}-${slideIndex}`)}
          {...renderMeteors(`body-${title}-${slideIndex}`, accent)}

          {/* Symbol ghost backdrop (zodiac/rune slides) — huge, Satori-safe centering */}
          {symbol && (
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
                  opacity: 0.08,
                  display: 'flex',
                  lineHeight: 1,
                }}
              >
                {symbol}
              </div>
            </div>
          )}

          {/* Top bar: title + progress dots */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  fontSize: IG_TEXT.dark.caption,
                  color: accent,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'flex',
                }}
              >
                {truncateIG(title, 50)}
              </div>
              <div
                style={{
                  fontSize: IG_TEXT.dark.footer,
                  color: OG_COLORS.textTertiary,
                  display: 'flex',
                }}
              >
                {slideIndex + 1}/{totalSlides}
              </div>
            </div>

            <IGProgressDots
              current={slideIndex}
              total={totalSlides}
              accent={accent}
            />
          </div>

          {/* Subtitle / section label — larger */}
          {subtitle && (
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle + 4,
                color: OG_COLORS.textPrimary,
                lineHeight: 1.3,
                marginBottom: 32,
                display: 'flex',
                fontWeight: 700,
              }}
            >
              {truncateIG(subtitle, 80)}
            </div>
          )}

          {/* Content — structured display based on slide type */}
          {/* paddingBottom shifts content above true centre for better optical weight */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              gap: 20,
              paddingBottom: '80px',
            }}
          >
            {isPills ? (
              /* Keyword cards layout — rounded squares matching app design */
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 20,
                }}
              >
                {content
                  .split(', ')
                  .slice(0, 6)
                  .map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '20px 28px',
                        borderRadius: 16,
                        background: `${accent}15`,
                        border: `1px solid ${accent}35`,
                        display: 'flex',
                      }}
                    >
                      <span
                        style={{
                          fontSize: IG_TEXT.dark.body,
                          color: accent,
                          fontWeight: 500,
                          display: 'flex',
                        }}
                      >
                        {item.trim()}
                      </span>
                    </div>
                  ))}
              </div>
            ) : isElementSlide ? (
              /* Element & Ruler: visual layout, not paragraph */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                }}
              >
                {contentLines.map((line, i) => {
                  const [label, value] = line.split(': ').map((s) => s.trim());
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: IG_TEXT.dark.caption,
                          color: OG_COLORS.textTertiary,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          display: 'flex',
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: IG_TEXT.dark.subtitle + 4,
                          color: accent,
                          fontWeight: 600,
                          display: 'flex',
                        }}
                      >
                        {value || label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : contentLines.length > 1 ? (
              /* Multi-line: label + body blocks with clear separation */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 36,
                }}
              >
                {contentLines.slice(0, 3).map((line, i) => {
                  const colonIdx = line.indexOf(': ');
                  const label = colonIdx !== -1 ? line.slice(0, colonIdx) : '';
                  const value =
                    colonIdx !== -1 ? line.slice(colonIdx + 2) : line;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {label ? (
                        <div
                          style={{
                            fontSize: IG_TEXT.dark.body,
                            color: accent,
                            fontWeight: 700,
                            display: 'flex',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {label}
                        </div>
                      ) : null}
                      <div
                        style={{
                          fontSize: IG_TEXT.dark.body - 2,
                          color: OG_COLORS.textSecondary,
                          lineHeight: 1.6,
                          display: 'flex',
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single paragraph: show key fact large, rest smaller */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <div
                  style={{
                    fontSize: IG_TEXT.dark.body + 2,
                    color: OG_COLORS.textPrimary,
                    lineHeight: 1.5,
                    display: 'flex',
                    fontWeight: 500,
                  }}
                >
                  {content}
                </div>
              </div>
            )}
          </div>

          <IGBrandTag baseUrl={SHARE_BASE_URL} />
        </div>
      );
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
    console.error('[IG Carousel] Error:', error);
    return new Response('Failed to generate carousel image', { status: 500 });
  }
}
