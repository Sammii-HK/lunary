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

type RotatingType =
  | 'affirmation'
  | 'ritual_tip'
  | 'sign_of_the_day'
  | 'transit_alert'
  | 'numerology';

const TYPE_CONFIG: Record<
  RotatingType,
  { label: string; accent: string; gradient: string }
> = {
  affirmation: {
    label: 'DAILY AFFIRMATION',
    accent: CATEGORY_ACCENT.lunar,
    gradient: 'linear-gradient(180deg, #0f1428 0%, #0d0a14 40%, #0a0a0a 100%)',
  },
  ritual_tip: {
    label: 'RITUAL TIP',
    accent: CATEGORY_ACCENT.spells,
    gradient: 'linear-gradient(180deg, #1a0f28 0%, #0d0a14 40%, #0a0a0a 100%)',
  },
  sign_of_the_day: {
    label: 'SIGN OF THE DAY',
    accent: CATEGORY_ACCENT.zodiac,
    gradient: 'linear-gradient(180deg, #1a1028 0%, #0d0a14 40%, #0a0a0a 100%)',
  },
  transit_alert: {
    label: 'TRANSIT ALERT',
    accent: CATEGORY_ACCENT.planetary,
    gradient: 'linear-gradient(180deg, #0f1a28 0%, #0a0d14 40%, #0a0a0a 100%)',
  },
  numerology: {
    label: 'NUMEROLOGY',
    accent: CATEGORY_ACCENT.numerology,
    gradient: 'linear-gradient(180deg, #1a1028 0%, #0d0a14 40%, #0a0a0a 100%)',
  },
};

const VALID_TYPES = new Set<string>([
  'affirmation',
  'ritual_tip',
  'sign_of_the_day',
  'transit_alert',
  'numerology',
]);

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const { searchParams } = requestUrl;

    const rawType = searchParams.get('type') || 'affirmation';
    const type: RotatingType = VALID_TYPES.has(rawType)
      ? (rawType as RotatingType)
      : 'affirmation';

    const mainText = searchParams.get('main') || '';
    const secondary = searchParams.get('secondary') || '';
    const extra = searchParams.get('extra') || '';
    // Allow label override (used by numerology sub-types: ANGEL NUMBER 444, LIFE PATH 7, etc.)
    const labelOverride = searchParams.get('label') || '';

    const config = TYPE_CONFIG[type];
    const displayLabel = labelOverride || config.label;
    const { width, height } = IG_SIZES.story;
    const fonts = await loadIGFonts(request);
    const stars = generateStarfield(
      `rotating-${type}-${mainText.slice(0, 12)}`,
      90,
    );

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: config.gradient,
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

        {/* Label header */}
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
          {displayLabel}
        </div>

        {/* Moon icon separator */}
        <img
          src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
          width={32}
          height={32}
          style={{ opacity: 0.3, marginBottom: 48 }}
          alt=''
        />

        {/* Main text */}
        <div
          style={{
            fontSize: IG_TEXT.story.subtitle,
            color: OG_COLORS.textPrimary,
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '88%',
            display: 'flex',
            fontWeight: 500,
            marginBottom: 40,
          }}
        >
          {truncateIG(mainText, 160)}
        </div>

        {/* Secondary text */}
        {secondary ? (
          <div
            style={{
              fontSize: IG_TEXT.story.label,
              color: config.accent,
              letterSpacing: '0.08em',
              marginBottom: 24,
              display: 'flex',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {secondary}
          </div>
        ) : null}

        {/* Extra info line */}
        {extra ? (
          <div
            style={{
              fontSize: IG_TEXT.story.caption,
              color: OG_COLORS.textSecondary,
              display: 'flex',
              textAlign: 'center',
              letterSpacing: '0.05em',
            }}
          >
            {extra}
          </div>
        ) : null}

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
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[IG Story Rotating] Error:', error);
    return new Response('Failed to generate rotating story image', {
      status: 500,
    });
  }
}
