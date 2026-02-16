import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { BRAND_COLORS } from '@/lib/video/theme-palette';

export const runtime = 'nodejs';

const FORMATS = {
  landscape: {
    width: 1200,
    height: 630,
    label: 'Twitter/X/LinkedIn/Bluesky/Facebook (1.91:1)',
  },
  square: { width: 1080, height: 1080, label: 'Instagram/Threads (1:1)' },
  portrait: { width: 1080, height: 1350, label: 'Instagram Feed (4:5)' },
  story: {
    width: 1080,
    height: 1920,
    label: 'Stories/TikTok/Reels (9:16)',
  },
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

// Validate CSS color values to prevent injection
function sanitizeColor(value: string, fallback: string): string {
  // Allow hex (#fff, #ffffff, #ffffffff), rgb/rgba, hsl/hsla, and named CSS colors
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return value;
  if (/^(rgb|hsl)a?\([0-9.,% ]+\)$/i.test(value)) return value;
  return fallback;
}

// Sanitize text for OG image rendering — strip control chars and limit length
function sanitizeText(value: string, maxLength: number): string {
  return value.replace(/[\r\n\x00-\x1F\x7F]/g, '').slice(0, maxLength);
}

const ALLOWED_FORMATS = new Set<Format>([
  'landscape',
  'square',
  'portrait',
  'story',
  'youtube',
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = sanitizeText(
    searchParams.get('title') || 'Weekly Cosmic Forecast',
    200,
  );
  const rawSubtitle = sanitizeText(searchParams.get('subtitle') || '', 200);

  // Normalize for comparison - remove all non-alphanumeric chars and lowercase
  const normalizeForComparison = (str: string) =>
    str.replace(/[^a-z0-9]/gi, '').toLowerCase();

  // Skip subtitle if it's the same as title (handles formatting differences)
  const subtitle =
    normalizeForComparison(rawSubtitle) === normalizeForComparison(title)
      ? ''
      : rawSubtitle;
  const weekOffsetParam = searchParams.get('week') || '0';
  const weekOffset = parseInt(weekOffsetParam, 10);
  const weekRange = getWeekDates(weekOffset);
  const rawFormat = (searchParams.get('format') || 'landscape') as Format;
  const format = ALLOWED_FORMATS.has(rawFormat)
    ? rawFormat
    : ('landscape' as Format);
  const moonPhasePng = getMoonPhasePng(weekOffset);
  const bg = sanitizeColor(
    searchParams.get('bg') || '',
    BRAND_COLORS.cosmicBlack,
  );
  const fg = sanitizeColor(
    searchParams.get('fg') || '',
    BRAND_COLORS.textPrimary,
  );
  const accent = sanitizeColor(
    searchParams.get('accent') || '',
    BRAND_COLORS.accentDefault,
  );
  const highlight = sanitizeColor(searchParams.get('highlight') || '', accent);
  const lockHue = searchParams.get('lockHue') === '1';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

  const dimensions = FORMATS[format] || FORMATS.landscape;
  const sizes = getResponsiveSizes(format);

  return new ImageResponse(
    <div
      style={{
        background: lockHue
          ? bg
          : `linear-gradient(160deg, ${bg} 0%, ${bg} 55%, ${highlight} 160%)`,
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
              background: accent,
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
            color: fg,
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
              color: accent,
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
              color: fg,
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
            color: accent,
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
