import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getMoonPhaseIcon,
  OG_COLORS,
  generateStarfield,
} from '@/lib/share/og-utils';
import { loadIGFonts, truncateIG } from '@/lib/instagram/ig-utils';
import {
  IG_SIZES,
  IG_TEXT,
  IG_STORY_SAFE,
} from '@/lib/instagram/design-system';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const { searchParams } = requestUrl;
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
    const fonts = await loadIGFonts(request);
    const stars = generateStarfield(`story-moon-${dateStr}`, 100);

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
              opacity: star.opacity * 0.35,
            }}
          />
        ))}

        {/* Date label */}
        <div
          style={{
            fontSize: IG_TEXT.story.label,
            color: OG_COLORS.textTertiary,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 48,
            display: 'flex',
          }}
        >
          {dateText}
        </div>

        {/* Moon phase icon (large for story) */}
        <img
          src={moonIconUrl}
          width={240}
          height={240}
          style={{ marginBottom: 48, opacity: 0.9 }}
          alt=''
        />

        {/* Moon phase name */}
        <div
          style={{
            fontSize: IG_TEXT.story.title,
            color: '#818CF8',
            letterSpacing: '0.08em',
            marginBottom: 40,
            display: 'flex',
            fontWeight: 600,
          }}
        >
          {phase}
        </div>

        {/* Energy description */}
        <div
          style={{
            fontSize: IG_TEXT.story.subtitle,
            color: OG_COLORS.textPrimary,
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '90%',
            display: 'flex',
            fontWeight: 500,
            marginBottom: 64,
          }}
        >
          {truncateIG(energy, 100)}
        </div>

        {/* CTA in safe zone */}
        <div
          style={{
            fontSize: IG_TEXT.story.caption,
            color: OG_COLORS.textTertiary,
            display: 'flex',
            letterSpacing: '0.05em',
          }}
        >
          Explore more at lunary.app
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
            src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
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
    console.error('[IG Story Daily] Error:', error);
    return new Response('Failed to generate story image', { status: 500 });
  }
}
