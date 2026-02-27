import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getMoonPhaseIcon, OG_COLORS } from '@/lib/share/og-utils';
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
} from '@/lib/instagram/design-system';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Moon Astronomicon character
const MOON_GLYPH = 'R';
const MOON_ACCENT = '#818CF8';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase') || 'Waxing Crescent';
    const energy =
      searchParams.get('energy') || 'Trust the process unfolding around you';
    const dateStr =
      searchParams.get('date') || new Date().toISOString().split('T')[0];

    const date = new Date(dateStr);
    const dateText = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const moonIconUrl = getMoonPhaseIcon(phase);
    const { width, height } = IG_SIZES.story;
    const fonts = await loadIGFonts(request, { includeAstronomicon: true });
    const starfield = renderIGStarfield(`story-moon-${dateStr}`, 120);

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
            'linear-gradient(180deg, #0f1428 0%, #0d0a14 40%, #0a0a0a 100%)',
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
              color: MOON_ACCENT,
              opacity: 0.06,
              display: 'flex',
              lineHeight: 1,
            }}
          >
            {MOON_GLYPH}
          </div>
        </div>

        {/* Date label */}
        <div
          style={{
            fontSize: IG_TEXT.story.label,
            color: OG_COLORS.textTertiary,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 56,
            display: 'flex',
          }}
        >
          {dateText}
        </div>

        {/* Moon phase icon — bigger */}
        <img
          src={moonIconUrl}
          width={320}
          height={320}
          style={{
            marginBottom: 48,
            opacity: 0.95,
            filter: `drop-shadow(0 0 40px ${MOON_ACCENT}80)`,
          }}
          alt=''
        />

        {/* Moon phase name — hero with glow */}
        <div
          style={{
            fontSize: IG_TEXT.story.title + 8,
            color: MOON_ACCENT,
            letterSpacing: '0.06em',
            marginBottom: 40,
            display: 'flex',
            fontWeight: 700,
            textShadow: `0 0 50px ${MOON_ACCENT}80`,
          }}
        >
          {phase}
        </div>

        {/* Energy description */}
        <div
          style={{
            fontSize: IG_TEXT.story.subtitle + 2,
            color: OG_COLORS.textPrimary,
            textAlign: 'center',
            lineHeight: 1.45,
            maxWidth: '88%',
            display: 'flex',
            fontWeight: 500,
            marginBottom: 64,
          }}
        >
          {truncateIG(energy, 100)}
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
          Link in bio for your full moon reading
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
    console.error('[IG Story Daily] Error:', error);
    return new Response('Failed to generate story image', { status: 500 });
  }
}
