import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { OG_COLORS } from '@/lib/share/og-utils';
import {
  loadIGFonts,
  truncateIG,
  renderIGStarfield,
  IGBrandTag,
} from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  IG_STORY_SAFE,
  CATEGORY_ACCENT,
} from '@/lib/instagram/design-system';
import type { ThemeCategory } from '@/lib/social/types';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Astronomicon backdrop per category (Q=Sun, R=Moon, T=Venus, V=Jupiter, W=Saturn)
const CATEGORY_GLYPH: Partial<Record<ThemeCategory, string>> = {
  spells: 'R',
  zodiac: 'Q',
  tarot: 'R',
  crystals: 'T',
  numerology: 'V',
  runes: 'W',
  chakras: 'Q',
  sabbat: 'R',
  lunar: 'R',
  planetary: 'Q',
};

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const { searchParams } = requestUrl;
    const question = searchParams.get('question') || 'Crystal or candle?';
    const option1 = searchParams.get('option1') || 'Crystal';
    const option2 = searchParams.get('option2') || 'Candle';
    const category = (searchParams.get('category') ||
      'spells') as ThemeCategory;

    const accent = CATEGORY_ACCENT[category] || CATEGORY_ACCENT.spells;
    const glyph = CATEGORY_GLYPH[category] || 'R';
    const { width, height } = IG_SIZES.story;
    const fonts = await loadIGFonts(request, { includeAstronomicon: true });
    const starfield = renderIGStarfield(
      `story-poll-${question.slice(0, 10)}`,
      120,
    );

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
          overflow: 'hidden',
        }}
      >
        {starfield}

        {/* Ghost glyph backdrop — Satori-safe */}
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
              fontSize: 1800,
              color: accent,
              opacity: 0.06,
              display: 'flex',
              lineHeight: 1,
            }}
          >
            {glyph}
          </div>
        </div>

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
              fontWeight: 600,
            }}
          >
            This or That
          </div>
          <div
            style={{
              fontSize: IG_TEXT.story.subtitle + 4,
              color: OG_COLORS.textPrimary,
              textAlign: 'center',
              lineHeight: 1.3,
              fontWeight: 700,
              display: 'flex',
              maxWidth: '90%',
            }}
          >
            {truncateIG(question, 60)}
          </div>
        </div>

        {/* Split options */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 4,
            padding: `0 ${IG_STORY_SAFE.sidePadding}px`,
            paddingBottom: IG_STORY_SAFE.bottom + 60,
          }}
        >
          {/* Option 1 */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 28,
              background: `${accent}20`,
              border: `2px solid ${accent}60`,
              boxShadow: `inset 0 0 40px ${accent}10`,
            }}
          >
            <span
              style={{
                fontSize: IG_TEXT.story.title + 4,
                color: accent,
                fontWeight: 700,
                display: 'flex',
                textShadow: `0 0 30px ${accent}60`,
              }}
            >
              {option1}
            </span>
          </div>

          {/* "OR" divider pill */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '10px 28px',
                borderRadius: 100,
                background: '#0d0a14',
                border: `1px solid rgba(255,255,255,0.15)`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: IG_TEXT.story.label,
                  color: OG_COLORS.textTertiary,
                  fontWeight: 600,
                  display: 'flex',
                  letterSpacing: '0.15em',
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
              borderRadius: 28,
              background: 'rgba(255,255,255,0.07)',
              border: '2px solid rgba(255,255,255,0.18)',
            }}
          >
            <span
              style={{
                fontSize: IG_TEXT.story.title + 4,
                color: OG_COLORS.textPrimary,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {option2}
            </span>
          </div>
        </div>

        <IGBrandTag baseUrl={SHARE_BASE_URL} isStory />
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
    console.error('[IG Story Poll] Error:', error);
    return new Response('Failed to generate story poll image', { status: 500 });
  }
}
