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
  ShareFooter,
  SHARE_BASE_URL,
  getShareSizes,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

interface StreakShareData {
  shareId: string;
  streakDays: number;
  totalReadings: number;
  totalEntries: number;
  totalRituals: number;
  skillLevels?: Array<{ tree: string; level: number }>;
  userName?: string;
}

const MILESTONE_LABELS: Record<number, string> = {
  7: 'One Week of Cosmic Alignment',
  30: '30 Days of Cosmic Alignment',
  60: '60 Days of Cosmic Alignment',
  90: '90 Days of Cosmic Alignment',
  180: 'Half Year of Cosmic Alignment',
  365: 'One Year of Cosmic Alignment',
};

function getMilestoneLabel(days: number): string {
  // Find the closest milestone
  const milestones = [7, 30, 60, 90, 180, 365];
  const closest = milestones.reduce((prev, curr) =>
    Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev,
  );
  return MILESTONE_LABELS[closest] || `${days} Days of Cosmic Alignment`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    const robotoMonoData = await loadRobotoMono(request);

    // URL params take priority over KV lookup
    const urlDays = searchParams.get('streakDays');
    let data: StreakShareData;

    if (urlDays) {
      data = {
        shareId: 'url-params',
        streakDays: parseInt(urlDays),
        totalReadings: parseInt(searchParams.get('totalReadings') || '0'),
        totalEntries: parseInt(searchParams.get('totalEntries') || '0'),
        totalRituals: parseInt(searchParams.get('totalRituals') || '0'),
        userName: searchParams.get('userName') || undefined,
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      const raw = await kvGet(`streak:${shareId}`);
      if (!raw) {
        data = {
          shareId: 'demo',
          streakDays: 30,
          totalReadings: 142,
          totalEntries: 67,
          totalRituals: 30,
          userName: 'Cosmic Explorer',
        };
      } else {
        data = JSON.parse(raw) as StreakShareData;
      }
    }

    const { width, height } = getFormatDimensions(format);
    const sizes = getShareSizes(format);
    const baseUrl = SHARE_BASE_URL;

    const stars = generateStarfield(data.shareId, getStarCount(format));
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

    const milestoneLabel = getMilestoneLabel(data.streakDays);
    const firstName = data.userName?.split(' ')[0] || '';

    // Stat items
    const stats = [
      { label: 'Readings', value: data.totalReadings },
      { label: 'Entries', value: data.totalEntries },
      { label: 'Rituals', value: data.totalRituals },
    ].filter((s) => s.value > 0);

    // Flame circle sizing
    const flameSizeBase = sizes.isLandscape ? 180 : sizes.isStory ? 360 : 300;
    const daysFontSize = sizes.isLandscape ? 64 : sizes.isStory ? 120 : 100;

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${sizes.padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
        }}
      >
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: sizes.isLandscape ? 'flex-start' : 'center',
            marginBottom: sizes.isLandscape ? 16 : 24,
          }}
        >
          {firstName && (
            <div
              style={{
                fontSize: sizes.labelSize,
                color: OG_COLORS.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: 8,
                display: 'flex',
              }}
            >
              {firstName}
            </div>
          )}
          <div
            style={{
              fontSize: sizes.titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: sizes.isLandscape ? 'left' : 'center',
              display: 'flex',
              lineHeight: 1.1,
            }}
          >
            {milestoneLabel}
          </div>
        </div>

        {/* Main content: streak circle + stats */}
        <div
          style={{
            display: 'flex',
            flexDirection: sizes.isLandscape ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: sizes.isLandscape ? 48 : 32,
          }}
        >
          {/* Flame circle */}
          <div
            style={{
              display: 'flex',
              width: flameSizeBase,
              height: flameSizeBase,
              borderRadius: '50%',
              border: '4px solid rgba(251, 146, 60, 0.6)',
              background:
                'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(234, 88, 12, 0.05) 100%)',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: Math.round(daysFontSize * 0.4),
                color: 'rgba(251, 146, 60, 0.8)',
                display: 'flex',
                marginBottom: 4,
              }}
            >
              &#x1F525;
            </div>
            <div
              style={{
                fontSize: daysFontSize,
                fontWeight: 400,
                color: '#fb923c',
                display: 'flex',
                lineHeight: 1,
              }}
            >
              {data.streakDays}
            </div>
            <div
              style={{
                fontSize: sizes.labelSize,
                color: 'rgba(251, 146, 60, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                display: 'flex',
                marginTop: 4,
              }}
            >
              days
            </div>
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: sizes.isLandscape ? 'column' : 'row',
                gap: sizes.isLandscape ? 20 : 32,
              }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: sizes.subtitleSize,
                      color: OG_COLORS.textPrimary,
                      fontWeight: 400,
                      display: 'flex',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: sizes.labelSize,
                      color: OG_COLORS.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'flex',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ShareFooter baseUrl={baseUrl} format={format} />
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
    console.error('[StreakOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
