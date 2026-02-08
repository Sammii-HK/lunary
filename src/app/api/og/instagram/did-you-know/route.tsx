import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  loadIGFonts,
  IGBrandTag,
  IGCategoryBadge,
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

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fact =
      searchParams.get('fact') ||
      'The cosmos holds infinite secrets waiting to be discovered.';
    const category = (searchParams.get('category') || 'tarot') as ThemeCategory;
    const source = searchParams.get('source') || '';

    const accent = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.tarot;
    const gradient = CATEGORY_GRADIENT[category] || CATEGORY_GRADIENT.tarot;
    const { width, height } = IG_SIZES.square;

    const fonts = await loadIGFonts(request);
    const starfield = renderIGStarfield(`dyk-${fact.slice(0, 15)}`);

    const layoutJsx = (
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
        {starfield}

        {/* "DID YOU KNOW?" header badge */}
        <div
          style={{
            display: 'flex',
            padding: '12px 32px',
            borderRadius: 100,
            background: `${accent}20`,
            border: `2px solid ${accent}60`,
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontSize: IG_TEXT.dark.label,
              color: accent,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            Did you know?
          </span>
        </div>

        {/* Fact text - centred, large, readable */}
        <div
          style={{
            fontSize: IG_TEXT.dark.subtitle,
            color: OG_COLORS.textPrimary,
            textAlign: 'center',
            lineHeight: 1.45,
            maxWidth: '88%',
            display: 'flex',
            fontWeight: 500,
          }}
        >
          {truncateIG(fact, 240)}
        </div>

        {/* Category badge at bottom */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            justifyContent: 'center',
          }}
        >
          <IGCategoryBadge category={category} />
        </div>

        <IGBrandTag baseUrl={SHARE_BASE_URL} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('[IG Did You Know] Error:', error);
    return new Response('Failed to generate did-you-know image', {
      status: 500,
    });
  }
}
