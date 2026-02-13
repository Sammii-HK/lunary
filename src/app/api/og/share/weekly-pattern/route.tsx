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
  SHARE_BORDERS,
  SHARE_CARDS,
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

const SUIT_KEYWORDS: Record<string, string> = {
  Cups: 'emotion',
  Wands: 'action',
  Swords: 'thought',
  Pentacles: 'material',
  'Major Arcana': 'destiny',
};

function getSuitKeyword(cardName: string): string {
  if (cardName.includes('Cups')) return SUIT_KEYWORDS.Cups;
  if (cardName.includes('Wands')) return SUIT_KEYWORDS.Wands;
  if (cardName.includes('Swords')) return SUIT_KEYWORDS.Swords;
  if (cardName.includes('Pentacles')) return SUIT_KEYWORDS.Pentacles;
  return SUIT_KEYWORDS['Major Arcana'];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    // Load fonts
    const robotoMonoData = await loadRobotoMono(request);

    // Check for URL parameters for real-time data (Priority 0 Data Flow Fix)
    const urlName = searchParams.get('name');
    const urlSeasonName = searchParams.get('seasonName');
    const urlSeasonSuit = searchParams.get('seasonSuit');
    const urlSeasonDesc = searchParams.get('seasonDesc');
    const urlTopCards = searchParams.get('topCards');
    const urlDominantSuit = searchParams.get('dominantSuit');
    const urlDominantPercentage = searchParams.get('dominantPercentage');
    const urlStartDate = searchParams.get('startDate');
    const urlEndDate = searchParams.get('endDate');

    let data: WeeklyPatternShareRecord;

    // If URL params provided, use them directly instead of KV lookup
    if (urlSeasonName || urlSeasonSuit || urlTopCards) {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Parse top cards from JSON or comma-separated format
      let topCards = [
        { name: 'The Star', count: 3 },
        { name: 'Two of Cups', count: 2 },
        { name: 'Ace of Cups', count: 2 },
      ];
      if (urlTopCards) {
        try {
          topCards = JSON.parse(decodeURIComponent(urlTopCards));
        } catch {
          // Keep default if parsing fails
        }
      }

      data = {
        shareId: 'url-params',
        name: urlName || undefined,
        createdAt: new Date().toISOString(),
        season: {
          name: urlSeasonName
            ? decodeURIComponent(urlSeasonName)
            : 'Season of Reflection',
          suit: urlSeasonSuit || 'Cups',
          description: urlSeasonDesc
            ? decodeURIComponent(urlSeasonDesc)
            : 'A time of emotional depth and intuitive wisdom',
        },
        topCards,
        dominantSuit: {
          suit: urlDominantSuit || urlSeasonSuit || 'Cups',
          percentage: urlDominantPercentage
            ? parseFloat(urlDominantPercentage)
            : 60,
          count: 6,
        },
        dateRange: {
          start: urlStartDate || weekAgo.toISOString().split('T')[0],
          end: urlEndDate || today.toISOString().split('T')[0],
        },
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      // Fetch share data from KV or use demo data
      const raw = await kvGet(`weekly-pattern:${shareId}`);

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
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 48 : isStory ? 84 : 72;
    const subtitleSize = isLandscape ? 22 : isStory ? 36 : 32;
    const cardNameSize = isLandscape ? 22 : isStory ? 36 : 32;
    const labelSize = isLandscape ? 20 : isStory ? 32 : 28;
    const seasonTitleSize = isLandscape ? 36 : isStory ? 64 : 56;
    const truncate = truncateText;

    // Limit top cards to prevent overflow (max 3 for landscape/square)
    const maxCards = isStory ? 4 : 3;
    const displayTopCards = data.topCards.slice(0, maxCards);

    const suitColor =
      SUIT_COLORS[data.dominantSuit.suit] || OG_COLORS.primaryViolet;

    const seasonNameLimit = isLandscape ? 30 : 40;

    // Generate unique starfield based on shareId
    const stars = generateStarfield(data.shareId, getStarCount(format));

    // Format date range
    const startDate = new Date(data.dateRange.start);
    const endDate = new Date(data.dateRange.end);
    const dateRangeText = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Starfield JSX
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

    // Layout based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout - Season card left (50%), Top cards right (50%)
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
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 20,
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
              textShadow: SHARE_TITLE_GLOW,
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
              display: 'flex',
            }}
          >
            {dateRangeText}
          </div>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 20,
            flex: 1,
          }}
        >
          {/* Left: Season Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '28px 32px',
              background: SHARE_CARDS.primary,
              border: `2px solid ${suitColor}`,
              borderRadius: 18,
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: suitColor,
                display: 'flex',
                marginBottom: 16,
              }}
            />
            <div
              style={{
                fontSize: seasonTitleSize,
                fontWeight: 400,
                color: suitColor,
                letterSpacing: '0.05em',
                display: 'flex',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {truncate(data.season.name, seasonNameLimit)}
            </div>
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 300,
                display: 'flex',
              }}
            >
              {data.dominantSuit.suit} Dominant •{' '}
              {data.dominantSuit.percentage.toFixed(0)}%
            </div>
          </div>

          {/* Right: Top Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
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
                display: 'flex',
              }}
            >
              Top Cards This Week
            </div>
            {displayTopCards.map((card, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: SHARE_CARDS.primary,
                  border: SHARE_BORDERS.card,
                  borderRadius: 14,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: cardNameSize,
                    color: OG_COLORS.textPrimary,
                    fontWeight: 400,
                    display: 'flex',
                  }}
                >
                  {truncate(card.name, 22)}
                  {getSuitKeyword(card.name)
                    ? ` \u2014 ${getSuitKeyword(card.name)}`
                    : ''}
                </div>
                <div
                  style={{
                    fontSize: cardNameSize,
                    color: OG_COLORS.textTertiary,
                    fontWeight: 300,
                    display: 'flex',
                  }}
                >
                  ×{card.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ShareFooter format={format} />
      </div>
    ) : isStory ? (
      // Story Layout - Large season card with big symbol
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
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {firstName ? `${firstName}'s` : 'My'} Week in Tarot
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

        {/* Large Season Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '36px 44px',
            background: SHARE_CARDS.primary,
            border: `3px solid ${suitColor}`,
            borderRadius: 24,
            marginBottom: 32,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: suitColor,
              display: 'flex',
              marginBottom: 20,
            }}
          />
          <div
            style={{
              fontSize: seasonTitleSize,
              fontWeight: 400,
              color: suitColor,
              letterSpacing: '0.05em',
              display: 'flex',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {truncate(data.season.name, seasonNameLimit)}
          </div>
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 300,
              display: 'flex',
            }}
          >
            {data.dominantSuit.suit} Dominant •{' '}
            {data.dominantSuit.percentage.toFixed(0)}%
          </div>
        </div>

        {/* Top Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
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
              display: 'flex',
            }}
          >
            Top Cards This Week
          </div>
          {displayTopCards.map((card, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px 32px',
                background: SHARE_CARDS.primary,
                border: SHARE_BORDERS.card,
                borderRadius: 18,
              }}
            >
              <div
                style={{
                  fontSize: cardNameSize,
                  color: OG_COLORS.textPrimary,
                  fontWeight: 400,
                  display: 'flex',
                }}
              >
                {truncate(card.name, 22)}
                {getSuitKeyword(card.name)
                  ? ` \u2014 ${getSuitKeyword(card.name)}`
                  : ''}
              </div>
              <div
                style={{
                  fontSize: cardNameSize,
                  color: OG_COLORS.textTertiary,
                  fontWeight: 300,
                  display: 'flex',
                }}
              >
                ×{card.count}
              </div>
            </div>
          ))}
        </div>

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
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 36,
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
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {firstName ? `${firstName}'s` : 'My'} Week in Tarot
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 10,
              letterSpacing: '0.1em',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {dateRangeText}
          </div>
        </div>

        {/* Season Card - Full width, prominent */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 32px',
            background: SHARE_CARDS.primary,
            border: `2px solid ${suitColor}`,
            borderRadius: 20,
            marginBottom: 24,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: suitColor,
              display: 'flex',
              marginBottom: 16,
            }}
          />
          <div
            style={{
              fontSize: seasonTitleSize,
              fontWeight: 400,
              color: suitColor,
              letterSpacing: '0.05em',
              display: 'flex',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {truncate(data.season.name, seasonNameLimit)}
          </div>
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 300,
              display: 'flex',
            }}
          >
            {data.dominantSuit.suit} Dominant •{' '}
            {data.dominantSuit.percentage.toFixed(0)}%
          </div>
        </div>

        {/* Top Cards - Full width list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
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
              display: 'flex',
            }}
          >
            Top Cards This Week
          </div>
          {displayTopCards.map((card, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                background: SHARE_CARDS.primary,
                border: SHARE_BORDERS.card,
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  fontSize: cardNameSize,
                  color: OG_COLORS.textPrimary,
                  fontWeight: 400,
                  display: 'flex',
                }}
              >
                {truncate(card.name, 22)}
                {getSuitKeyword(card.name)
                  ? ` \u2014 ${getSuitKeyword(card.name)}`
                  : ''}
              </div>
              <div
                style={{
                  fontSize: cardNameSize,
                  color: OG_COLORS.textTertiary,
                  fontWeight: 300,
                  display: 'flex',
                }}
              >
                ×{card.count}
              </div>
            </div>
          ))}
        </div>

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
    console.error('[WeeklyPatternOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
