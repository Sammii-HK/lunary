import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import {
  getFormatDimensions,
  OG_COLORS,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  truncateText,
  ShareFooter,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Roboto Mono font fetch failed with status ${res.status}`,
        );
      }
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

interface RetrogradeBadgeShareRecord {
  shareId: string;
  name?: string;
  planet: string;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'diamond';
  survivalDays: number;
  isCompleted: boolean;
  retrogradeStart?: string;
  retrogradeEnd?: string;
  sign?: string;
  createdAt: string;
}

const BADGE_COLORS: Record<
  string,
  { border: string; text: string; bg: string }
> = {
  bronze: {
    border: '#CD7F32',
    text: '#D4A574',
    bg: 'rgba(205, 127, 50, 0.1)',
  },
  silver: {
    border: '#C0C0C0',
    text: '#D3D3D3',
    bg: 'rgba(192, 192, 192, 0.1)',
  },
  gold: {
    border: '#FFD700',
    text: '#FFC700',
    bg: 'rgba(255, 215, 0, 0.1)',
  },
  diamond: {
    border: '#B9F2FF',
    text: '#E0F7FF',
    bg: 'rgba(185, 242, 255, 0.1)',
  },
};

const BADGE_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',
};

// Badge tier indicators (Roboto Mono safe - no Unicode stars)
const BADGE_ICONS: Record<string, string> = {
  bronze: 'I',
  silver: 'II',
  gold: 'III',
  diamond: 'IV',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    // Load fonts
    const robotoMonoData = await loadRobotoMono(request);

    // Check for URL parameters for real-time data (Priority 0 Data Flow Fix)
    const urlName = searchParams.get('name');
    const urlPlanet = searchParams.get('planet');
    const urlBadgeLevel = searchParams.get('badgeLevel');
    const urlSurvivalDays = searchParams.get('survivalDays');
    const urlIsCompleted = searchParams.get('isCompleted');
    const urlRetroStart = searchParams.get('retrogradeStart');
    const urlRetroEnd = searchParams.get('retrogradeEnd');
    const urlSign = searchParams.get('sign');

    let data: RetrogradeBadgeShareRecord;

    // If URL params provided, use them directly instead of KV lookup
    if (urlPlanet || urlBadgeLevel || urlSurvivalDays) {
      data = {
        shareId: 'url-params',
        name: urlName || undefined,
        createdAt: new Date().toISOString(),
        planet: urlPlanet || 'Mercury',
        badgeLevel:
          (urlBadgeLevel as 'bronze' | 'silver' | 'gold' | 'diamond') ||
          'silver',
        survivalDays: urlSurvivalDays ? parseInt(urlSurvivalDays) : 10,
        isCompleted: urlIsCompleted === 'true',
        retrogradeStart: urlRetroStart || '2026-01-15',
        retrogradeEnd: urlRetroEnd || '2026-02-04',
        sign: urlSign || 'Aquarius',
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      // Fetch share data from KV or use demo data
      const raw = await kvGet(`retrograde-badge:${shareId}`);

      if (!raw || shareId === 'demo') {
        // Provide demo/fallback data - Mercury retrograde in progress
        data = {
          shareId: 'demo',
          createdAt: new Date().toISOString(),
          planet: 'Mercury',
          badgeLevel: 'silver',
          survivalDays: 10,
          isCompleted: false,
          retrogradeStart: '2026-01-15',
          retrogradeEnd: '2026-02-04',
          sign: 'Aquarius',
        };
      } else {
        data = JSON.parse(raw) as RetrogradeBadgeShareRecord;
      }
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 44 : isStory ? 84 : 72;
    const subtitleSize = isLandscape ? 20 : isStory ? 36 : 28;
    const daySize = isLandscape ? 100 : isStory ? 160 : 140;
    const labelSize = isLandscape ? 20 : isStory ? 42 : 32;
    const humorSize = isLandscape ? 16 : isStory ? 32 : 26;
    const mercurySymbolSize = isLandscape ? 48 : isStory ? 80 : 72;

    const badgeColors = BADGE_COLORS[data.badgeLevel];
    const badgeLabel = BADGE_LABELS[data.badgeLevel];
    const badgeIcon = BADGE_ICONS[data.badgeLevel];

    // Dynamic badge circle sizing based on content
    const badgeSizeBase = isLandscape ? 220 : isStory ? 460 : 400;

    // Generate unique starfield based on shareId
    const stars = generateStarfield(data.shareId, getStarCount(format));

    // Format dates
    const startDate = data.retrogradeStart
      ? new Date(data.retrogradeStart)
      : null;
    const endDate = data.retrogradeEnd ? new Date(data.retrogradeEnd) : null;
    const dateRangeText =
      startDate && endDate
        ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : 'Mercury Retrograde';

    const mainText = data.isCompleted
      ? `${firstName ? `${firstName} Survived` : 'I Survived'} Mercury Retrograde`
      : `Day ${data.survivalDays} of Mercury Retrograde`;

    const humorLimit = isLandscape ? 80 : 120;
    const rawHumor = data.isCompleted
      ? 'Mercury went direct. I made it through.'
      : 'Thriving through the chaos';
    const humorLine = truncateText(rawHumor, humorLimit);

    // Progress calculation
    const totalDays =
      startDate && endDate
        ? Math.max(
            1,
            Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          )
        : 0;
    const progressPercent =
      totalDays > 0
        ? Math.min(100, Math.round((data.survivalDays / totalDays) * 100))
        : 0;

    // Starfield component
    const starfieldJsx = stars.map((star, i) => (
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
          opacity: star.opacity,
        }}
      />
    ));

    // Inline JSX directly based on format
    // Progress bar JSX (shared across formats)
    const progressBarJsx =
      totalDays > 0 && !data.isCompleted ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            maxWidth: isLandscape ? 300 : isStory ? 600 : 500,
          }}
        >
          <div
            style={{
              fontSize: isLandscape ? 14 : isStory ? 24 : 20,
              color: OG_COLORS.textTertiary,
              display: 'flex',
            }}
          >
            Day {data.survivalDays} of {totalDays}
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: isLandscape ? 8 : 12,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: `${progressPercent}%`,
                height: '100%',
                borderRadius: 999,
                background: badgeColors.border,
              }}
            />
          </div>
        </div>
      ) : null;

    const layoutJsx = isLandscape ? (
      // Landscape Layout - horizontal layout
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {/* Unique starfield background */}
        {starfieldJsx}

        {/* Main content - horizontal layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 48,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Left: Badge Circle */}
          <div
            style={{
              display: 'flex',
              width: badgeSizeBase,
              height: badgeSizeBase,
              borderRadius: '50%',
              border: `6px solid ${badgeColors.border}`,
              background: badgeColors.bg,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              flexShrink: 0,
              padding: 24,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 400,
                color: badgeColors.text,
                marginBottom: 8,
                display: 'flex',
                letterSpacing: '0.1em',
              }}
            >
              {badgeIcon}
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 400,
                color: badgeColors.text,
                display: 'flex',
              }}
            >
              ☿
            </div>
          </div>

          {/* Right: Text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxWidth: '60%',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 400,
                color: OG_COLORS.textPrimary,
                letterSpacing: '0.05em',
                display: 'flex',
                lineHeight: 1.1,
                textShadow: SHARE_TITLE_GLOW,
              }}
            >
              {mainText}
            </div>
            <div
              style={{
                fontSize: subtitleSize,
                color: OG_COLORS.textTertiary,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              {dateRangeText}
            </div>

            {/* Badge Label */}
            <div
              style={{
                fontSize: labelSize,
                fontWeight: 400,
                color: badgeColors.text,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              {badgeLabel}
            </div>

            {/* Humor Line */}
            <div
              style={{
                fontSize: humorSize,
                color: OG_COLORS.textSecondary,
                fontStyle: 'italic',
                lineHeight: 1.4,
                display: 'flex',
                textAlign: 'left',
              }}
            >
              {humorLine}
            </div>
            {progressBarJsx}
          </div>
        </div>

        {/* Branded Footer */}
        <ShareFooter format={format} />
      </div>
    ) : isStory ? (
      // Story Layout - vertical with large badge
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: OG_COLORS.background,
          padding: '80px 60px 140px 60px',
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {/* Unique starfield background */}
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
              display: 'flex',
              lineHeight: 1.1,
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {mainText}
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 16,
              letterSpacing: '0.1em',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {dateRangeText}
          </div>
        </div>

        {/* Badge Circle - Large and centered */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: badgeSizeBase,
              height: badgeSizeBase,
              borderRadius: '50%',
              border: `8px solid ${badgeColors.border}`,
              background: badgeColors.bg,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              marginBottom: 40,
              padding: 32,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 400,
                color: badgeColors.text,
                marginBottom: 16,
                display: 'flex',
                letterSpacing: '0.1em',
              }}
            >
              {badgeIcon}
            </div>
            <div
              style={{
                fontSize: mercurySymbolSize,
                fontWeight: 400,
                color: badgeColors.text,
                display: 'flex',
              }}
            >
              ☿
            </div>
          </div>

          {/* Badge Label */}
          <div
            style={{
              fontSize: labelSize,
              fontWeight: 400,
              color: badgeColors.text,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: 20,
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {badgeLabel}
          </div>

          {/* Humor Line */}
          <div
            style={{
              fontSize: humorSize,
              color: OG_COLORS.textSecondary,
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: '85%',
              lineHeight: 1.5,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {humorLine}
          </div>
          {progressBarJsx}
        </div>

        {/* Footer Branding */}
        <ShareFooter format={format} />
      </div>
    ) : (
      // Square Layout
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {/* Unique starfield background */}
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
              display: 'flex',
              lineHeight: 1.1,
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {mainText}
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 12,
              letterSpacing: '0.1em',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {dateRangeText}
          </div>
        </div>

        {/* Badge Circle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: badgeSizeBase,
              height: badgeSizeBase,
              borderRadius: '50%',
              border: `6px solid ${badgeColors.border}`,
              background: badgeColors.bg,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              marginBottom: 32,
              padding: 28,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 400,
                color: badgeColors.text,
                marginBottom: 12,
                display: 'flex',
                letterSpacing: '0.1em',
              }}
            >
              {badgeIcon}
            </div>
            <div
              style={{
                fontSize: mercurySymbolSize,
                fontWeight: 400,
                color: badgeColors.text,
                display: 'flex',
              }}
            >
              ☿
            </div>
          </div>

          {/* Badge Label */}
          <div
            style={{
              fontSize: labelSize,
              fontWeight: 400,
              color: badgeColors.text,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 16,
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {badgeLabel}
          </div>

          {/* Humor Line */}
          <div
            style={{
              fontSize: humorSize,
              color: OG_COLORS.textSecondary,
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: '90%',
              lineHeight: 1.4,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {humorLine}
          </div>
          {progressBarJsx}
        </div>

        {/* Footer Branding */}
        <ShareFooter format={format} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts: [
        {
          name: 'Roboto Mono',
          data: robotoMonoData,
          style: 'normal',
          weight: 400,
        },
      ],
    });
  } catch (error) {
    console.error('[RetrogradeBadgeOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
