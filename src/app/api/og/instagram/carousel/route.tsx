import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  loadIGFonts,
  IGBrandTag,
  IGCategoryBadge,
  IGProgressDots,
  truncateIG,
  renderIGStarfield,
} from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  IG_SPACING,
  CATEGORY_ACCENT,
  CATEGORY_GRADIENT,
} from '@/lib/instagram/design-system';
import { OG_COLORS } from '@/lib/share/og-utils';
import type { ThemeCategory } from '@/lib/social/types';
import type { CarouselSlideVariant } from '@/lib/instagram/types';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

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
    const { width, height } = IG_SIZES.square;

    const fonts = await loadIGFonts(request, { includeAstronomicon: true });

    let layoutJsx: React.ReactElement;

    if (variant === 'cover') {
      // Cover slide: Bold title, category badge, "Swipe" indicator
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
            padding: `${IG_SPACING.padding}px`,
            position: 'relative',
            fontFamily: 'Roboto Mono',
          }}
        >
          {renderIGStarfield(`cover-${title}`)}

          {/* Category badge */}
          <div style={{ display: 'flex', marginBottom: 40 }}>
            <IGCategoryBadge category={category} />
          </div>

          {/* Symbol (if provided) */}
          {symbol && (
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: 100,
                color: accent,
                display: 'flex',
                marginBottom: 32,
                opacity: 0.8,
              }}
            >
              {symbol}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: IG_TEXT.dark.title,
              color: OG_COLORS.textPrimary,
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
          {subtitle && (
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
              gap: 12,
              position: 'absolute',
              bottom: 80,
            }}
          >
            <span
              style={{
                fontSize: IG_TEXT.dark.caption,
                color: OG_COLORS.textTertiary,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              SWIPE
            </span>
            <span
              style={{
                fontSize: 28,
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
      // CTA slide: App promotion
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
            padding: `${IG_SPACING.padding}px`,
            position: 'relative',
            fontFamily: 'Roboto Mono',
          }}
        >
          {renderIGStarfield(`cta-${title}`)}

          {/* Progress dots */}
          <div
            style={{
              position: 'absolute',
              top: 40,
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

          {/* CTA content */}
          <div
            style={{
              fontSize: IG_TEXT.dark.subtitle,
              color: OG_COLORS.textPrimary,
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '80%',
              display: 'flex',
              marginBottom: 40,
            }}
          >
            {content || 'Explore your full cosmic profile'}
          </div>

          {/* CTA button - lunary-soft style */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '18px 48px',
              borderRadius: 16,
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: IG_TEXT.dark.label,
                color: accent,
                fontWeight: 600,
                letterSpacing: '0.05em',
                display: 'flex',
              }}
            >
              lunary.app
            </span>
          </div>

          {/* Save reminder */}
          <div
            style={{
              fontSize: IG_TEXT.dark.caption,
              color: OG_COLORS.textTertiary,
              marginTop: 40,
              display: 'flex',
            }}
          >
            Save this for later
          </div>

          <IGBrandTag baseUrl={SHARE_BASE_URL} />
        </div>
      );
    } else {
      // Body slides: Numbered content with consistent header
      layoutJsx = (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: gradient,
            padding: `${IG_SPACING.padding}px`,
            position: 'relative',
            fontFamily: 'Roboto Mono',
          }}
        >
          {renderIGStarfield(`body-${title}-${slideIndex}`)}

          {/* Top bar: title + progress dots */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              marginBottom: 40,
            }}
          >
            {/* Branded header bar */}
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
                {truncateIG(title, 30)}
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

            {/* Progress dots */}
            <IGProgressDots
              current={slideIndex}
              total={totalSlides}
              accent={accent}
            />
          </div>

          {/* Subtitle / section label */}
          {subtitle && (
            <div
              style={{
                fontSize: IG_TEXT.dark.subtitle,
                color: OG_COLORS.textPrimary,
                lineHeight: 1.3,
                marginBottom: 24,
                display: 'flex',
                fontWeight: 600,
              }}
            >
              {truncateIG(subtitle, 60)}
            </div>
          )}

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: IG_TEXT.dark.body,
                color: OG_COLORS.textSecondary,
                lineHeight: 1.6,
                display: 'flex',
                maxWidth: '95%',
              }}
            >
              {truncateIG(content, 300)}
            </div>
          </div>

          <IGBrandTag baseUrl={SHARE_BASE_URL} />
        </div>
      );
    }

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('[IG Carousel] Error:', error);
    return new Response('Failed to generate carousel image', { status: 500 });
  }
}
