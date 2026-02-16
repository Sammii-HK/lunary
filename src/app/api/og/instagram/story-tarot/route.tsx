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

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const { searchParams } = requestUrl;
    const card = searchParams.get('card') || 'The Star';
    const keywords =
      searchParams.get('keywords') || 'Hope, healing, inspiration';
    const message =
      searchParams.get('message') || 'After the storm, the stars return.';

    const accent = CATEGORY_ACCENT.tarot;
    const { width, height } = IG_SIZES.story;
    const fonts = await loadIGFonts(request);
    const stars = generateStarfield(`story-tarot-${card}`, 90);

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
              opacity: star.opacity * 0.3,
            }}
          />
        ))}

        {/* "DAILY TAROT PULL" header */}
        <div
          style={{
            fontSize: IG_TEXT.story.caption,
            color: OG_COLORS.textTertiary,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 64,
            display: 'flex',
          }}
        >
          Daily Tarot Pull
        </div>

        {/* Card decorative frame */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 40px',
            borderRadius: 24,
            border: `2px solid ${accent}40`,
            background: `${accent}08`,
            marginBottom: 48,
            maxWidth: '85%',
          }}
        >
          {/* Card name */}
          <div
            style={{
              fontSize: IG_TEXT.story.title,
              color: accent,
              fontWeight: 700,
              marginBottom: 24,
              display: 'flex',
              textAlign: 'center',
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
              width: 60,
              height: 2,
              background: `${accent}50`,
              marginBottom: 32,
              display: 'flex',
            }}
          />

          {/* Message */}
          <div
            style={{
              fontSize: IG_TEXT.story.subtitle,
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
    console.error('[IG Story Tarot] Error:', error);
    return new Response('Failed to generate story tarot image', {
      status: 500,
    });
  }
}
