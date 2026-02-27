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

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Moon (R) as ghost backdrop for tarot — mystery, intuition
const TAROT_GLYPH = 'R';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const card = searchParams.get('card') || 'The Star';
    const keywords =
      searchParams.get('keywords') || 'Hope, healing, inspiration';
    const message =
      searchParams.get('message') || 'After the storm, the stars return.';

    const accent = CATEGORY_ACCENT.tarot;
    const { width, height } = IG_SIZES.story;
    const fonts = await loadIGFonts(request, { includeAstronomicon: true });
    const starfield = renderIGStarfield(`story-tarot-${card}`, 120);

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
            'linear-gradient(180deg, #1a0f28 0%, #0d0a14 40%, #0a0a0a 100%)',
          padding: `${IG_STORY_SAFE.top}px ${IG_STORY_SAFE.sidePadding}px ${IG_STORY_SAFE.bottom}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          overflow: 'hidden',
        }}
      >
        {starfield}

        {/* Giant Moon ghost backdrop — Satori-safe centering */}
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
            {TAROT_GLYPH}
          </div>
        </div>

        {/* "DAILY TAROT PULL" header */}
        <div
          style={{
            fontSize: IG_TEXT.story.label + 2,
            color: accent,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 56,
            display: 'flex',
            fontWeight: 600,
            textShadow: `0 0 20px ${accent}60`,
          }}
        >
          Daily Tarot Pull
        </div>

        {/* Card decorative frame — deeper, stronger */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '56px 48px',
            borderRadius: 32,
            border: `2px solid ${accent}60`,
            background: `${accent}10`,
            boxShadow: `0 0 80px ${accent}15, inset 0 0 40px ${accent}06`,
            marginBottom: 48,
            maxWidth: '85%',
          }}
        >
          {/* Card name — hero */}
          <div
            style={{
              fontSize: IG_TEXT.story.title + 8,
              color: accent,
              fontWeight: 700,
              marginBottom: 24,
              display: 'flex',
              textAlign: 'center',
              textShadow: `0 0 50px ${accent}80`,
              lineHeight: 1.1,
            }}
          >
            {card}
          </div>

          {/* Keywords */}
          <div
            style={{
              fontSize: IG_TEXT.story.label,
              color: OG_COLORS.textSecondary,
              letterSpacing: '0.08em',
              marginBottom: 32,
              display: 'flex',
              textAlign: 'center',
            }}
          >
            {keywords}
          </div>

          {/* Divider */}
          <div
            style={{
              width: 80,
              height: 2,
              background: `${accent}60`,
              marginBottom: 32,
              display: 'flex',
            }}
          />

          {/* Message */}
          <div
            style={{
              fontSize: IG_TEXT.story.subtitle + 2,
              color: OG_COLORS.textPrimary,
              textAlign: 'center',
              lineHeight: 1.45,
              fontWeight: 500,
              display: 'flex',
            }}
          >
            {truncateIG(message, 100)}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: IG_TEXT.story.caption,
            color: OG_COLORS.textTertiary,
            display: 'flex',
            letterSpacing: '0.05em',
          }}
        >
          Full tarot guide — link in bio
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
    console.error('[IG Story Tarot] Error:', error);
    return new Response('Failed to generate story tarot image', {
      status: 500,
    });
  }
}
