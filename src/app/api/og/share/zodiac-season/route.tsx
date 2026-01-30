import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import { getFormatDimensions, OG_COLORS } from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

interface ZodiacSeasonShareRecord {
  shareId: string;
  name?: string;
  sign: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  startDate: string;
  endDate: string;
  themes: string[];
  symbol: string;
  createdAt: string;
}

// Element-based gradient backgrounds
const ELEMENT_GRADIENTS: Record<
  string,
  { from: string; via: string; to: string }
> = {
  Fire: {
    from: '#DC2626',
    via: '#EA580C',
    to: '#EAB308',
  },
  Earth: {
    from: '#166534',
    via: '#059669',
    to: '#14B8A6',
  },
  Air: {
    from: '#2563EB',
    via: '#6366F1',
    to: '#8B5CF6',
  },
  Water: {
    from: '#0891B2',
    via: '#0D9488',
    to: '#1E40AF',
  },
};

// Element colors for text
const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#FCA5A5',
  Earth: '#6EE7B7',
  Air: '#A5B4FC',
  Water: '#7DD3FC',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    if (!shareId) {
      return new Response('Missing shareId', { status: 400 });
    }

    // Fetch share data from KV or use demo data
    const raw = await kvGet(`zodiac-season:${shareId}`);

    let data: ZodiacSeasonShareRecord;

    if (!raw || shareId === 'demo') {
      // Provide demo/fallback data - Aquarius season
      data = {
        shareId: 'demo',
        createdAt: new Date().toISOString(),
        sign: 'Aquarius',
        element: 'Air',
        modality: 'Fixed',
        startDate: '2026-01-20',
        endDate: '2026-02-18',
        themes: ['Innovation', 'Community', 'Progress'],
        symbol: '♒',
      };
    } else {
      data = JSON.parse(raw) as ZodiacSeasonShareRecord;
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 40 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 40 : isStory ? 56 : 52;
    const symbolSize = isLandscape ? 120 : isStory ? 180 : 160;
    const signSize = isLandscape ? 48 : isStory ? 64 : 56;
    const badgeSize = isLandscape ? 18 : isStory ? 24 : 22;
    const themeSize = isLandscape ? 16 : isStory ? 22 : 20;
    const dateSize = isLandscape ? 18 : isStory ? 24 : 22;

    const gradient = ELEMENT_GRADIENTS[data.element];
    const elementColor = ELEMENT_COLORS[data.element];

    // Format dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const dateRangeText = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

    // Create gradient background
    const gradientBg = `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.via} 50%, ${gradient.to} 100%)`;

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
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: gradientBg,
            opacity: 0.15,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            position: 'relative',
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
              {firstName ? `${firstName} Welcomes` : 'Welcome to'}
            </div>
          </div>

          {/* Zodiac Symbol */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
              marginBottom: isLandscape ? 20 : 32,
            }}
          >
            <div
              style={{
                fontSize: symbolSize,
                color: elementColor,
                marginBottom: 16,
                lineHeight: 1,
              }}
            >
              {data.symbol}
            </div>

            <div
              style={{
                fontSize: signSize,
                fontWeight: 400,
                color: elementColor,
                letterSpacing: '0.05em',
                marginBottom: 16,
              }}
            >
              {data.sign} Season
            </div>

            {/* Element & Modality Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: `rgba(${parseInt(elementColor.slice(1, 3), 16)}, ${parseInt(elementColor.slice(3, 5), 16)}, ${parseInt(elementColor.slice(5, 7), 16)}, 0.15)`,
                border: `1px solid ${elementColor}`,
                borderRadius: 9999,
                marginBottom: isLandscape ? 16 : 24,
              }}
            >
              <div
                style={{
                  fontSize: badgeSize,
                  color: elementColor,
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {data.modality} {data.element}
              </div>
            </div>

            {/* Date Range */}
            <div
              style={{
                fontSize: dateSize,
                color: OG_COLORS.textTertiary,
                marginBottom: isLandscape ? 16 : 24,
                letterSpacing: '0.1em',
              }}
            >
              {dateRangeText}
            </div>

            {/* Themes */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'center',
              }}
            >
              {data.themes.map((theme, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: themeSize,
                    color: OG_COLORS.textSecondary,
                    letterSpacing: '0.05em',
                  }}
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: isLandscape ? 16 : 24,
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
              Explore the cosmic weather at lunary.app
            </span>
          </div>
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
    console.error('[ZodiacSeasonOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
