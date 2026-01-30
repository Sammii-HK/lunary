import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import { getFormatDimensions, OG_COLORS } from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

interface WeeklyPatternShareRecord {
  shareId: string;
  name?: string;
  season: {
    name: string;
    suit: string;
    description: string;
  };
  topCards: Array<{
    name: string;
    count: number;
  }>;
  dominantSuit: {
    suit: string;
    percentage: number;
    count: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  createdAt: string;
}

const SUIT_COLORS: Record<string, string> = {
  Cups: OG_COLORS.primaryViolet,
  Wands: '#EA580C', // Orange
  Swords: '#3B82F6', // Blue
  Pentacles: '#059669', // Green
  'Major Arcana': OG_COLORS.galaxyHaze,
};

const SUIT_SYMBOLS: Record<string, string> = {
  Cups: '♥',
  Wands: '♣',
  Swords: '♠',
  Pentacles: '♦',
  'Major Arcana': '★',
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
    const raw = await kvGet(`weekly-pattern:${shareId}`);

    let data: WeeklyPatternShareRecord;

    if (!raw || shareId === 'demo') {
      // Provide demo/fallback data
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      data = {
        shareId: 'demo',
        createdAt: new Date().toISOString(),
        season: {
          name: 'Season of Reflection',
          suit: 'Cups',
          description: 'A time of emotional depth and intuitive wisdom',
        },
        topCards: [
          { name: 'The Star', count: 3 },
          { name: 'Two of Cups', count: 2 },
          { name: 'Ace of Cups', count: 2 },
        ],
        dominantSuit: {
          suit: 'Cups',
          percentage: 60,
          count: 6,
        },
        dateRange: {
          start: weekAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        },
      };
    } else {
      data = JSON.parse(raw) as WeeklyPatternShareRecord;
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 40 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 40 : isStory ? 56 : 52;
    const subtitleSize = isLandscape ? 18 : isStory ? 24 : 22;
    const cardNameSize = isLandscape ? 16 : isStory ? 22 : 20;
    const labelSize = isLandscape ? 16 : isStory ? 20 : 18;

    const suitColor =
      SUIT_COLORS[data.dominantSuit.suit] || OG_COLORS.primaryViolet;
    const suitSymbol = SUIT_SYMBOLS[data.dominantSuit.suit] || '★';

    // Format date range
    const startDate = new Date(data.dateRange.start);
    const endDate = new Date(data.dateRange.end);
    const dateRangeText = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

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
            marginBottom: isLandscape ? 20 : isStory ? 40 : 32,
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
            {firstName ? `${firstName}'s` : 'My'} Week in Tarot
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 8,
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            {dateRangeText}
          </div>
        </div>

        {/* Season Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: isLandscape ? 20 : 28,
            background: OG_COLORS.cardBg,
            border: `2px solid ${suitColor}`,
            borderRadius: 16,
            marginBottom: isLandscape ? 16 : 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: isLandscape ? 48 : 64,
                color: suitColor,
              }}
            >
              {suitSymbol}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  fontSize: isLandscape ? 28 : isStory ? 38 : 36,
                  fontWeight: 400,
                  color: suitColor,
                  letterSpacing: '0.05em',
                }}
              >
                {data.season.name}
              </div>
              <div
                style={{
                  fontSize: labelSize,
                  color: OG_COLORS.textSecondary,
                  marginTop: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 300,
                }}
              >
                {data.dominantSuit.suit} Dominant •{' '}
                {data.dominantSuit.percentage.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Top Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isLandscape ? 12 : 16,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 300,
            }}
          >
            Top Cards This Week
          </div>
          {data.topCards.map((card, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isLandscape ? 12 : 16,
                background: OG_COLORS.cardBg,
                border: `1px solid ${OG_COLORS.border}`,
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: cardNameSize,
                  color: OG_COLORS.textPrimary,
                  fontWeight: 400,
                }}
              >
                {card.name}
              </div>
              <div
                style={{
                  fontSize: cardNameSize,
                  color: OG_COLORS.textTertiary,
                  fontWeight: 300,
                }}
              >
                ×{card.count}
              </div>
            </div>
          ))}
        </div>

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
            Discover your patterns at lunary.app
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
    console.error('[WeeklyPatternOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
