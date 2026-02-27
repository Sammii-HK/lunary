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

type RotatingType =
  | 'affirmation'
  | 'ritual_tip'
  | 'sign_of_the_day'
  | 'transit_alert'
  | 'numerology';

const TYPE_CONFIG: Record<
  RotatingType,
  { label: string; accent: string; gradient: string; glyph: string }
> = {
  affirmation: {
    label: 'DAILY AFFIRMATION',
    accent: CATEGORY_ACCENT.lunar,
    gradient: 'linear-gradient(180deg, #0f1428 0%, #0d0a14 40%, #0a0a0a 100%)',
    glyph: 'R', // Moon
  },
  ritual_tip: {
    label: 'RITUAL TIP',
    accent: CATEGORY_ACCENT.spells,
    gradient: 'linear-gradient(180deg, #1a0f28 0%, #0d0a14 40%, #0a0a0a 100%)',
    glyph: 'R', // Moon
  },
  sign_of_the_day: {
    label: 'SIGN OF THE DAY',
    accent: CATEGORY_ACCENT.zodiac,
    gradient: 'linear-gradient(180deg, #1a1028 0%, #0d0a14 40%, #0a0a0a 100%)',
    glyph: 'Q', // Sun
  },
  transit_alert: {
    label: 'TRANSIT ALERT',
    accent: CATEGORY_ACCENT.planetary,
    gradient: 'linear-gradient(180deg, #0f1a28 0%, #0a0d14 40%, #0a0a0a 100%)',
    glyph: 'S', // Mercury (most transit-associated)
  },
  numerology: {
    label: 'NUMEROLOGY',
    accent: CATEGORY_ACCENT.numerology,
    gradient: 'linear-gradient(180deg, #1a1028 0%, #0d0a14 40%, #0a0a0a 100%)',
    glyph: 'V', // Jupiter — expansion, spiritual numbers
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
    const { searchParams } = new URL(request.url);

    const rawType = searchParams.get('type') || 'affirmation';
    const type: RotatingType = VALID_TYPES.has(rawType)
      ? (rawType as RotatingType)
      : 'affirmation';

    const mainText = searchParams.get('main') || '';
    const secondary = searchParams.get('secondary') || '';
    const extra = searchParams.get('extra') || '';
    const labelOverride = searchParams.get('label') || '';

    const config = TYPE_CONFIG[type];
    const displayLabel = labelOverride || config.label;
    const { width, height } = IG_SIZES.story;
    const fonts = await loadIGFonts(request, { includeAstronomicon: true });
    const starfield = renderIGStarfield(
      `rotating-${type}-${mainText.slice(0, 12)}`,
      120,
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
              color: config.accent,
              opacity: 0.06,
              display: 'flex',
              lineHeight: 1,
            }}
          >
            {config.glyph}
          </div>
        </div>

        {/* Label header — more impactful */}
        <div
          style={{
            fontSize: IG_TEXT.story.label + 2,
            color: config.accent,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 72,
            display: 'flex',
            fontWeight: 600,
            textShadow: `0 0 20px ${config.accent}60`,
          }}
        >
          {displayLabel}
        </div>

        {/* Main text — hero */}
        <div
          style={{
            fontSize: IG_TEXT.story.subtitle + 4,
            color: OG_COLORS.textPrimary,
            textAlign: 'center',
            lineHeight: 1.45,
            maxWidth: '88%',
            display: 'flex',
            fontWeight: 600,
            marginBottom: 48,
          }}
        >
          {truncateIG(mainText, 160)}
        </div>

        {/* Secondary text */}
        {secondary ? (
          <div
            style={{
              fontSize: IG_TEXT.story.label + 2,
              color: config.accent,
              letterSpacing: '0.06em',
              marginBottom: 24,
              display: 'flex',
              textAlign: 'center',
              fontWeight: 700,
              textShadow: `0 0 30px ${config.accent}60`,
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
    console.error('[IG Story Rotating] Error:', error);
    return new Response('Failed to generate rotating story image', {
      status: 500,
    });
  }
}
