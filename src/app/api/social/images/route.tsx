import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const BRAND_COLORS = {
  purple600: '#5227a5', // lunary-primary-600
  purple500: '#6730cf', // lunary-primary-500
  purple400: '#855ad8', // lunary-primary-400
  purple300: '#b094e6', // lunary-primary-300
  pink600: '#921cb0', // lunary-highlight-600
  pink500: '#b723dc', // lunary-highlight-500
  zinc900: '#0A0A0A', // lunary-bg
  zinc800: '#050505', // lunary-bg-deep
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
  youtube: { width: 1920, height: 1080, label: 'YouTube (16:9)' },
} as const;

type Format = keyof typeof FORMATS;

function getResponsiveSizes(format: Format) {
  const isStory = format === 'story';
  const isSquare = format === 'square';
  const isPortrait = format === 'portrait';
  const isYouTube = format === 'youtube';

  return {
    titleSize: isYouTube
      ? 96
      : isStory
        ? 64
        : isSquare
          ? 52
          : isPortrait
            ? 48
            : 44,
    subtitleSize: isYouTube ? 48 : isStory ? 32 : isSquare ? 28 : 24,
    weekSize: isYouTube ? 36 : isStory ? 26 : isSquare ? 22 : 20,
    emojiSize: isYouTube ? 140 : isStory ? 100 : isSquare ? 80 : 70,
    brandSize: isYouTube ? 32 : isStory ? 24 : 20,
    padding: isYouTube ? 100 : isStory ? 80 : 60,
    brandMargin: isYouTube ? 100 : isStory ? 80 : 50,
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

function getMoonPhasePng(weekOffset: number): string {
  const phases = [
    'new-moon',
    'waxing-cresent-moon',
    'first-quarter',
    'waxing-gibbous-moon',
    'full-moon',
    'waning-gibbous-moon',
    'last-quarter',
    'waning-cresent-moon',
  ];
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
  const moonPhasePng = getMoonPhasePng(weekOffset);

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const dimensions = FORMATS[format] || FORMATS.landscape;
  const sizes = getResponsiveSizes(format);

  return new ImageResponse(
    <div
      style={{
        background:
          'linear-gradient(160deg, #0a0a0f 0%, #12101a 40%, #0f0d14 70%, #0a0a0f 100%)',
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
      {/* Subtle dark purple glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '60%',
          height: '60%',
          background:
            'radial-gradient(circle, rgba(88, 28, 135, 0.15) 0%, transparent 60%)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '50%',
          height: '50%',
          background:
            'radial-gradient(circle, rgba(88, 28, 135, 0.12) 0%, transparent 60%)',
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
        {/* Moon icon - always use full moon for branding consistency */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${baseUrl}/icons/moon-phases/full-moon.png`}
          alt='Moon phase'
          width={sizes.emojiSize + 40}
          height={sizes.emojiSize + 40}
          style={{
            marginBottom: 24,
            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))',
          }}
        />

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

        {/* Brand text - no pill styling */}
        <div
          style={{
            marginTop: sizes.brandMargin,
            fontSize: sizes.brandSize + 4,
            fontWeight: 700,
            color: BRAND_COLORS.purple300,
            letterSpacing: '0.05em',
            display: 'flex',
          }}
        >
          lunary.app
        </div>
      </div>
    </div>,
    {
      width: dimensions.width,
      height: dimensions.height,
    },
  );
}
