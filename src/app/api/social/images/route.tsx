import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const BRAND_COLORS = {
  purple600: '#9333ea',
  purple500: '#a855f7',
  purple400: '#c084fc',
  purple300: '#d8b4fe',
  pink600: '#db2777',
  pink500: '#ec4899',
  zinc900: '#18181b',
  zinc800: '#27272a',
  zinc700: '#3f3f46',
  zinc400: '#a1a1aa',
  zinc300: '#d4d4d8',
  white: '#ffffff',
};

const FORMATS = {
  landscape: { width: 1200, height: 630, label: 'Twitter/LinkedIn/Facebook' },
  square: { width: 1080, height: 1080, label: 'Instagram Feed' },
  portrait: { width: 1080, height: 1350, label: 'Instagram Feed (4:5)' },
  story: { width: 1080, height: 1920, label: 'Stories/TikTok/Reels' },
} as const;

type Format = keyof typeof FORMATS;

function getResponsiveSizes(format: Format) {
  const isStory = format === 'story';
  const isSquare = format === 'square';
  const isPortrait = format === 'portrait';

  return {
    titleSize: isStory ? 64 : isSquare ? 52 : isPortrait ? 48 : 44,
    subtitleSize: isStory ? 32 : isSquare ? 28 : 24,
    weekSize: isStory ? 26 : isSquare ? 22 : 20,
    emojiSize: isStory ? 100 : isSquare ? 80 : 70,
    brandSize: isStory ? 24 : 20,
    padding: isStory ? 80 : 60,
    brandMargin: isStory ? 80 : 50,
  };
}

function getWeekDates(weekOffset: number): string {
  const now = new Date();
  const targetDate = new Date(
    now.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
  );

  const dayOfWeek = targetDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(
    targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
  );
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

function getMoonEmoji(weekOffset: number): string {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  const now = new Date();
  const targetDate = new Date(
    now.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
  );
  const dayOfYear = Math.floor(
    (targetDate.getTime() -
      new Date(targetDate.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return phases[dayOfYear % 8];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Weekly Cosmic Forecast';
  const subtitle = searchParams.get('subtitle') || '';
  const weekOffsetParam = searchParams.get('week') || '0';
  const weekOffset = parseInt(weekOffsetParam, 10);
  const weekRange = getWeekDates(weekOffset);
  const format = (searchParams.get('format') || 'landscape') as Format;
  const moonPhase = searchParams.get('moon') || getMoonEmoji(weekOffset);

  const dimensions = FORMATS[format] || FORMATS.landscape;
  const sizes = getResponsiveSizes(format);

  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(145deg, ${BRAND_COLORS.zinc900} 0%, #1a1025 50%, ${BRAND_COLORS.zinc900} 100%)`,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: sizes.padding,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background: `radial-gradient(circle, ${BRAND_COLORS.purple600}25 0%, transparent 70%)`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            right: '-20%',
            width: '70%',
            height: '70%',
            background: `radial-gradient(circle, ${BRAND_COLORS.pink600}20 0%, transparent 70%)`,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '30%',
            height: '30%',
            background: `radial-gradient(circle, ${BRAND_COLORS.purple500}15 0%, transparent 60%)`,
            display: 'flex',
          }}
        />

        {/* Stars decoration */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            opacity: 0.4,
          }}
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${10 + ((i * 17) % 80)}%`,
                left: `${5 + ((i * 23) % 90)}%`,
                width: i % 3 === 0 ? 4 : 2,
                height: i % 3 === 0 ? 4 : 2,
                background: BRAND_COLORS.purple300,
                borderRadius: '50%',
                display: 'flex',
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 10,
            maxWidth: '90%',
          }}
        >
          {/* Moon emoji */}
          <div
            style={{
              fontSize: sizes.emojiSize,
              marginBottom: 24,
              display: 'flex',
              filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))',
            }}
          >
            {moonPhase}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: sizes.titleSize,
              fontWeight: 700,
              color: BRAND_COLORS.white,
              lineHeight: 1.15,
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: sizes.subtitleSize,
                color: BRAND_COLORS.purple300,
                marginBottom: 16,
                display: 'flex',
                fontWeight: 500,
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Week range */}
          {weekRange && (
            <div
              style={{
                fontSize: sizes.weekSize,
                color: BRAND_COLORS.zinc400,
                marginTop: 8,
                display: 'flex',
                letterSpacing: '0.05em',
              }}
            >
              {weekRange}
            </div>
          )}

          {/* Brand pill */}
          <div
            style={{
              marginTop: sizes.brandMargin,
              padding: '14px 32px',
              background: `linear-gradient(135deg, ${BRAND_COLORS.purple600} 0%, ${BRAND_COLORS.pink600} 100%)`,
              borderRadius: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: `0 4px 20px ${BRAND_COLORS.purple600}40`,
            }}
          >
            <div
              style={{
                fontSize: sizes.brandSize,
                fontWeight: 700,
                color: BRAND_COLORS.white,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              ✨ LUNARY
            </div>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: format === 'story' ? 60 : 30,
            fontSize: 16,
            color: BRAND_COLORS.zinc400,
            display: 'flex',
            letterSpacing: '0.02em',
          }}
        >
          lunary.app
        </div>
      </div>
    ),
    {
      width: dimensions.width,
      height: dimensions.height,
    },
  );
}
