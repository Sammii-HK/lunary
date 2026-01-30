import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import { getFormatDimensions, OG_COLORS } from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

interface CosmicStateShareRecord {
  shareId: string;
  name?: string;
  moonPhase: {
    name: string;
    icon: {
      src: string;
      alt: string;
    };
  };
  zodiacSeason: string;
  insight: string;
  transit?: {
    headline: string;
    description: string;
  };
  date: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    if (!shareId) {
      return new Response('Missing shareId', { status: 400 });
    }

    // Fetch share data from KV or use demo data
    const raw = await kvGet(`cosmic-state:${shareId}`);

    let data: CosmicStateShareRecord;

    if (!raw || shareId === 'demo') {
      // Provide demo/fallback data
      data = {
        shareId: 'demo',
        createdAt: new Date().toISOString(),
        moonPhase: {
          name: 'Waxing Crescent',
          icon: {
            src: '/icons/moon-phases/waxing-cresent-moon.png',
            alt: 'Waxing Crescent Moon',
          },
        },
        zodiacSeason: 'Aquarius',
        insight: 'The cosmic currents support growth and new beginnings',
        date: new Date().toISOString().split('T')[0],
      };
    } else {
      data = JSON.parse(raw) as CosmicStateShareRecord;
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 40 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 40 : isStory ? 56 : 52;
    const dateSize = isLandscape ? 18 : isStory ? 24 : 22;
    const phaseSize = isLandscape ? 32 : isStory ? 44 : 40;
    const labelSize = isLandscape ? 18 : isStory ? 24 : 22;
    const insightSize = isLandscape ? 16 : isStory ? 22 : 20;

    // Format date
    const date = new Date(data.date);
    const dateText = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Get moon phase icon path
    const moonIconPath = data.moonPhase.icon.src.startsWith('/')
      ? data.moonPhase.icon.src
      : `/icons/moon-phases/${data.moonPhase.icon.src}`;

    return new ImageResponse(
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
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: isLandscape ? 24 : isStory ? 40 : 32,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
            }}
          >
            {firstName ? `${firstName}'s` : "Today's"} Cosmic State
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              marginTop: 8,
              letterSpacing: '0.1em',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Moon Phase Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: isLandscape ? 20 : 28,
            background: OG_COLORS.cardBg,
            border: `1px solid ${OG_COLORS.border}`,
            borderRadius: 16,
            marginBottom: isLandscape ? 16 : 24,
            alignItems: 'center',
          }}
        >
          <img
            src={`${baseUrl}${moonIconPath}`}
            width={isLandscape ? 64 : 80}
            height={isLandscape ? 64 : 80}
            style={{ marginBottom: 16 }}
            alt={data.moonPhase.name}
          />
          <div
            style={{
              fontSize: phaseSize,
              fontWeight: 400,
              color: OG_COLORS.primaryViolet,
              letterSpacing: '0.05em',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {data.moonPhase.name}
          </div>
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 300,
              textAlign: 'center',
            }}
          >
            {data.zodiacSeason} Season
          </div>
        </div>

        {/* Insight Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: isLandscape ? 20 : 28,
            background: OG_COLORS.cardBg,
            border: `1px solid ${OG_COLORS.border}`,
            borderRadius: 16,
            marginBottom: data.transit ? (isLandscape ? 16 : 24) : 0,
            flex: data.transit ? 0 : 1,
          }}
        >
          <div
            style={{
              fontSize: insightSize,
              color: OG_COLORS.textPrimary,
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            {data.insight}
          </div>
        </div>

        {/* Transit Card (if present) */}
        {data.transit && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: isLandscape ? 20 : 28,
              background: OG_COLORS.cardBg,
              border: `2px solid ${OG_COLORS.galaxyHaze}`,
              borderRadius: 16,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.galaxyHaze,
                fontWeight: 400,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {data.transit.headline}
            </div>
            <div
              style={{
                fontSize: insightSize,
                color: OG_COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              {data.transit.description}
            </div>
          </div>
        )}

        {/* Footer Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: isLandscape ? 20 : 32,
          }}
        >
          <img
            src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
            width={22}
            height={22}
            style={{ opacity: 0.45 }}
            alt=''
          />
          <span
            style={{
              fontFamily: 'Roboto Mono',
              fontWeight: 300,
              fontSize: 16,
              opacity: 0.4,
              letterSpacing: '0.1em',
              color: OG_COLORS.textPrimary,
            }}
          >
            lunary.app
          </span>
        </div>
      </div>,
      {
        width,
        height,
        fonts: [
          {
            name: 'Roboto Mono',
            data: await fetch(
              new URL('/fonts/RobotoMono-Regular.ttf', request.url),
            ).then((res) => res.arrayBuffer()),
            style: 'normal',
            weight: 400,
          },
        ],
      },
    );
  } catch (error) {
    console.error('[CosmicStateOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
