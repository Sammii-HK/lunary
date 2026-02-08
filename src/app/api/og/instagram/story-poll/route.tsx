import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { OG_COLORS, generateStarfield } from '@/lib/share/og-utils';
import { loadIGFonts, truncateIG } from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  IG_STORY_SAFE,
  CATEGORY_ACCENT,
} from '@/lib/instagram/design-system';
import type { ThemeCategory } from '@/lib/social/types';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const question = searchParams.get('question') || 'Crystal or candle?';
    const option1 = searchParams.get('option1') || 'Crystal';
    const option2 = searchParams.get('option2') || 'Candle';
    const category = (searchParams.get('category') ||
      'spells') as ThemeCategory;

    const accent = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.spells;
    const { width, height } = IG_SIZES.story;
    const fonts = await loadIGFonts(request);
    const stars = generateStarfield(`story-poll-${question.slice(0, 10)}`, 80);

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(180deg, #1a1028 0%, #0d0a14 40%, #0a0a0a 100%)',
          position: 'relative',
          fontFamily: 'Roboto Mono',
        }}
      >
        {/* Starfield */}
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
              opacity: star.opacity * 0.25,
            }}
          />
        ))}

        {/* Top section: "THIS OR THAT" label + question */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: IG_STORY_SAFE.top + 40,
            paddingLeft: IG_STORY_SAFE.sidePadding,
            paddingRight: IG_STORY_SAFE.sidePadding,
            paddingBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: IG_TEXT.story.caption,
              color: accent,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: 32,
              display: 'flex',
            }}
          >
            This or That
          </div>
          <div
            style={{
              fontSize: IG_TEXT.story.subtitle,
              color: OG_COLORS.textPrimary,
              textAlign: 'center',
              lineHeight: 1.3,
              fontWeight: 600,
              display: 'flex',
              maxWidth: '90%',
            }}
          >
            {truncateIG(question, 60)}
          </div>
        </div>

        {/* Split options - two halves */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 4,
            padding: `0 ${IG_STORY_SAFE.sidePadding}px`,
            paddingBottom: IG_STORY_SAFE.bottom + 20,
          }}
        >
          {/* Option 1 */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 24,
              background: `${accent}15`,
              border: `2px solid ${accent}30`,
            }}
          >
            <span
              style={{
                fontSize: IG_TEXT.story.title,
                color: accent,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {option1}
            </span>
          </div>

          {/* "OR" divider */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '12px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: OG_COLORS.background,
                border: `2px solid ${accent}50`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: IG_TEXT.story.label,
                  color: OG_COLORS.textSecondary,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                OR
              </span>
            </div>
          </div>

          {/* Option 2 */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 24,
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.12)',
            }}
          >
            <span
              style={{
                fontSize: IG_TEXT.story.title,
                color: OG_COLORS.textPrimary,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {option2}
            </span>
          </div>
        </div>

        {/* Brand footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'center',
            position: 'absolute',
            bottom: IG_STORY_SAFE.bottom + 20,
            left: 0,
            right: 0,
          }}
        >
          <img
            src={`${SHARE_BASE_URL}/icons/moon-phases/full-moon.svg`}
            width={18}
            height={18}
            style={{ opacity: 0.4 }}
            alt=''
          />
          <span
            style={{
              fontSize: IG_TEXT.story.footer,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            lunary.app
          </span>
        </div>
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('[IG Story Poll] Error:', error);
    return new Response('Failed to generate story poll image', { status: 500 });
  }
}
