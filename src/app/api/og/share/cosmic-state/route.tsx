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
  SHARE_BASE_URL,
  SHARE_BORDERS,
  SHARE_CARDS,
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

    // Load fonts
    const robotoMonoData = await loadRobotoMono(request);

    // Check for URL params first (for real-time data)
    const urlName = searchParams.get('name');
    const urlMoonPhase = searchParams.get('moonPhase');
    const urlZodiacSeason = searchParams.get('zodiacSeason');
    const urlInsight = searchParams.get('insight');
    const urlTransitHeadline = searchParams.get('transitHeadline');
    const urlTransitDesc = searchParams.get('transitDesc');

    let data: CosmicStateShareRecord;

    // If URL params provided, use them directly
    if (urlMoonPhase || urlZodiacSeason || urlInsight) {
      const getMoonIcon = (phase: string) => {
        const phaseMap: Record<string, string> = {
          'New Moon': 'new-moon',
          'Waxing Crescent': 'waxing-cresent-moon',
          'First Quarter': 'first-quarter',
          'Waxing Gibbous': 'waxing-gibbous-moon',
          'Full Moon': 'full-moon',
          'Waning Gibbous': 'waning-gibbous-moon',
          'Last Quarter': 'last-quarter',
          'Waning Crescent': 'waning-cresent-moon',
        };
        return phaseMap[phase] || 'full-moon';
      };

      data = {
        shareId: 'url-params',
        createdAt: new Date().toISOString(),
        name: urlName || undefined,
        moonPhase: {
          name: urlMoonPhase || 'Full Moon',
          icon: {
            src: `/icons/moon-phases/${getMoonIcon(urlMoonPhase || 'Full Moon')}.png`,
            alt: urlMoonPhase || 'Full Moon',
          },
        },
        zodiacSeason: urlZodiacSeason || 'Aquarius',
        insight:
          urlInsight || 'The cosmic currents support growth and new beginnings',
        transit: urlTransitHeadline
          ? {
              headline: urlTransitHeadline,
              description: urlTransitDesc || '',
            }
          : undefined,
        date: new Date().toISOString().split('T')[0],
      };
    } else if (shareId) {
      // Fetch share data from KV or use demo data
      const raw = await kvGet(`cosmic-state:${shareId}`);

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
    } else {
      return new Response('Missing shareId or URL params', { status: 400 });
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = SHARE_BASE_URL;

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 80 : 60;
    const titleSize = isLandscape ? 44 : isStory ? 80 : 66;
    const dateSize = isLandscape ? 20 : isStory ? 32 : 24;
    const phaseSize = isLandscape ? 38 : isStory ? 64 : 52;
    const labelSize = isLandscape ? 20 : isStory ? 34 : 28;
    const insightSize = isLandscape ? 22 : isStory ? 36 : 30;
    const moonIconSize = isLandscape ? 190 : isStory ? 380 : 270;

    const truncate = truncateText;

    // Format-specific character limits
    const insightLimit = isLandscape ? 140 : isStory ? 300 : 220;
    const transitHeadlineLimit = isLandscape ? 60 : isStory ? 100 : 80;
    const transitDescLimit = isLandscape ? 100 : isStory ? 140 : 120;

    // Generate unique starfield based on shareId
    const stars = generateStarfield(data.shareId, getStarCount(format));

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
      // Landscape Layout - Two column
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
            justifyContent: 'space-between',
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
              display: 'flex',
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {firstName ? `${firstName}'s` : "Today's"} Cosmic State
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 24,
            flex: 1,
          }}
        >
          {/* Left: Moon Phase */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              background: SHARE_CARDS.primary,
              border: SHARE_BORDERS.card,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              width: '38%',
              gap: 10,
            }}
          >
            <img
              src={`${baseUrl}${moonIconPath}`}
              width={moonIconSize}
              height={moonIconSize}
              alt={data.moonPhase.name}
            />
            <div
              style={{
                fontSize: phaseSize,
                fontWeight: 400,
                color: OG_COLORS.primaryViolet,
                letterSpacing: '0.05em',
                textAlign: 'center',
                display: 'flex',
              }}
            >
              {data.moonPhase.name}
            </div>
            <div
              style={{
                fontSize: labelSize - 4,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 300,
                textAlign: 'center',
                display: 'flex',
              }}
            >
              {data.zodiacSeason} Season
            </div>
          </div>

          {/* Right: Insight + Transit */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 24px',
                background: SHARE_CARDS.primary,
                border: SHARE_BORDERS.card,
                borderRadius: 16,
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: OG_COLORS.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  marginBottom: 10,
                  display: 'flex',
                }}
              >
                Cosmic Insight
              </div>
              <div
                style={{
                  fontSize: insightSize,
                  color: OG_COLORS.textPrimary,
                  lineHeight: 1.5,
                  display: 'flex',
                }}
              >
                {truncate(data.insight, insightLimit)}
              </div>
            </div>

            {data.transit && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '18px 22px',
                  background: SHARE_CARDS.primary,
                  border: `1px solid ${OG_COLORS.galaxyHaze}50`,
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    fontSize: insightSize - 2,
                    color: OG_COLORS.galaxyHaze,
                    fontWeight: 400,
                    marginBottom: 6,
                    display: 'flex',
                  }}
                >
                  {truncate(data.transit.headline, transitHeadlineLimit)}
                </div>
                <div
                  style={{
                    fontSize: insightSize - 6,
                    color: OG_COLORS.textSecondary,
                    lineHeight: 1.4,
                    display: 'flex',
                  }}
                >
                  {truncate(data.transit.description, transitDescLimit)}
                </div>
              </div>
            )}
          </div>
        </div>

        <ShareFooter format={format} />
      </div>
    ) : isStory ? (
      // Story Layout - Large moon, vertical stacking
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

        {/* Radial glow behind moon */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(167,139,250,0.15) 0%, transparent 65%)',
            transform: 'translateX(-50%)',
            display: 'flex',
          }}
        />

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
            {firstName ? `${firstName}'s` : "Today's"} Cosmic State
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              marginTop: 14,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Large Moon Icon */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <img
            src={`${baseUrl}${moonIconPath}`}
            width={moonIconSize}
            height={moonIconSize}
            style={{ marginBottom: 28 }}
            alt={data.moonPhase.name}
          />
          <div
            style={{
              fontSize: phaseSize,
              fontWeight: 400,
              color: OG_COLORS.primaryViolet,
              letterSpacing: '0.05em',
              textAlign: 'center',
              marginBottom: 14,
              display: 'flex',
            }}
          >
            {data.moonPhase.name}
          </div>
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 300,
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {data.zodiacSeason} Season
          </div>
        </div>

        {/* Cards — flex:1 wrapper distributes space evenly */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 24,
          }}
        >
          {/* Insight Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 44px',
              background: SHARE_CARDS.primary,
              border: SHARE_BORDERS.card,
              borderRadius: 24,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: OG_COLORS.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: 18,
                display: 'flex',
              }}
            >
              Cosmic Insight
            </div>
            <div
              style={{
                fontSize: insightSize,
                color: OG_COLORS.textPrimary,
                lineHeight: 1.65,
                display: 'flex',
              }}
            >
              {truncate(data.insight, insightLimit)}
            </div>
          </div>

          {data.transit && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '36px 44px',
                background: SHARE_CARDS.primary,
                border: `1px solid ${OG_COLORS.galaxyHaze}50`,
                borderRadius: 24,
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: labelSize,
                  color: OG_COLORS.galaxyHaze,
                  fontWeight: 400,
                  marginBottom: 16,
                  display: 'flex',
                }}
              >
                {truncate(data.transit.headline, transitHeadlineLimit)}
              </div>
              <div
                style={{
                  fontSize: insightSize - 2,
                  color: OG_COLORS.textSecondary,
                  lineHeight: 1.55,
                  display: 'flex',
                }}
              >
                {truncate(data.transit.description, transitDescLimit)}
              </div>
            </div>
          )}
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

        {/* Radial glow behind moon icon */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at center, rgba(167,139,250,0.18) 0%, transparent 65%)',
            transform: 'translateX(-50%)',
            display: 'flex',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 28,
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
            {firstName ? `${firstName}'s` : "Today's"} Cosmic State
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              marginTop: 10,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Moon Phase — hero */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '28px 32px',
            background: SHARE_CARDS.primary,
            border: SHARE_BORDERS.card,
            borderRadius: 24,
            marginBottom: 18,
            alignItems: 'center',
            gap: 14,
          }}
        >
          <img
            src={`${baseUrl}${moonIconPath}`}
            width={moonIconSize}
            height={moonIconSize}
            alt={data.moonPhase.name}
          />
          <div
            style={{
              fontSize: phaseSize,
              fontWeight: 400,
              color: OG_COLORS.primaryViolet,
              letterSpacing: '0.05em',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {data.moonPhase.name}
          </div>
          <div
            style={{
              fontSize: labelSize - 4,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 300,
              textAlign: 'center',
              display: 'flex',
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
            padding: '24px 28px',
            background: SHARE_CARDS.primary,
            border: SHARE_BORDERS.card,
            borderRadius: 20,
            marginBottom: data.transit ? 18 : 0,
            flex: data.transit ? 0 : 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: OG_COLORS.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: 12,
              display: 'flex',
            }}
          >
            Cosmic Insight
          </div>
          <div
            style={{
              fontSize: insightSize,
              color: OG_COLORS.textPrimary,
              lineHeight: 1.55,
              display: 'flex',
            }}
          >
            {truncate(data.insight, insightLimit)}
          </div>
        </div>

        {data.transit && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '22px 28px',
              background: SHARE_CARDS.primary,
              border: `1px solid ${OG_COLORS.galaxyHaze}50`,
              borderRadius: 20,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.galaxyHaze,
                fontWeight: 400,
                marginBottom: 10,
                display: 'flex',
              }}
            >
              {truncate(data.transit.headline, transitHeadlineLimit)}
            </div>
            <div
              style={{
                fontSize: insightSize - 2,
                color: OG_COLORS.textSecondary,
                lineHeight: 1.5,
                display: 'flex',
              }}
            >
              {truncate(data.transit.description, transitDescLimit)}
            </div>
          </div>
        )}

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
    console.error('[CosmicStateOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
