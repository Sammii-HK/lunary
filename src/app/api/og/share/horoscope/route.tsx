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
  loadShareFonts,
  truncateText,
  ShareFooter,
  SHARE_BORDERS,
  SHARE_CARDS,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import { zodiacSymbol } from '@/constants/symbols';

export const runtime = 'edge';

interface HoroscopeShareRecord {
  shareId: string;
  name?: string;
  sunSign: string;
  headline: string;
  overview: string;
  numerologyNumber?: number;
  transitInfo?: {
    planet: string;
    headline: string;
  };
  date: string;
  createdAt: string;
}

// Zodiac sign colors and gradients
const SIGN_GRADIENTS: Record<
  string,
  { from: string; to: string; via: string }
> = {
  Aries: { from: '#DC2626', via: '#EA580C', to: '#EAB308' },
  Taurus: { from: '#65A30D', via: '#059669', to: '#0D9488' },
  Gemini: { from: '#EAB308', via: '#F59E0B', to: '#F97316' },
  Cancer: { from: '#818CF8', via: '#A78BFA', to: '#C084FC' },
  Leo: { from: '#F59E0B', via: '#F97316', to: '#DC2626' },
  Virgo: { from: '#059669', via: '#10B981', to: '#34D399' },
  Libra: { from: '#EC4899', via: '#F472B6', to: '#FBCFE8' },
  Scorpio: { from: '#7C3AED', via: '#8B5CF6', to: '#A78BFA' },
  Sagittarius: { from: '#DC2626', via: '#EA580C', to: '#F97316' },
  Capricorn: { from: '#374151', via: '#4B5563', to: '#6B7280' },
  Aquarius: { from: '#2563EB', via: '#3B82F6', to: '#60A5FA' },
  Pisces: { from: '#06B6D4', via: '#22D3EE', to: '#67E8F9' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    // Check for URL parameters for real-time data (Priority 0 Data Flow Fix)
    const urlName = searchParams.get('name');
    const urlSunSign = searchParams.get('sunSign');
    const urlHeadline = searchParams.get('headline');
    const urlOverview = searchParams.get('overview');
    const urlNumerologyNumber = searchParams.get('numerologyNumber');
    const urlDate = searchParams.get('date');

    let data: HoroscopeShareRecord;

    // If URL params provided, use them directly instead of KV lookup
    if (urlSunSign || urlHeadline || urlOverview) {
      data = {
        shareId: 'url-params',
        name: urlName || undefined,
        createdAt: new Date().toISOString(),
        sunSign: urlSunSign || 'Aquarius',
        headline: urlHeadline
          ? decodeURIComponent(urlHeadline)
          : 'Innovation and connection light your path',
        overview: urlOverview
          ? decodeURIComponent(urlOverview)
          : 'Today brings opportunities for creative breakthroughs and meaningful connections.',
        numerologyNumber: urlNumerologyNumber
          ? parseInt(urlNumerologyNumber)
          : undefined,
        date: urlDate || new Date().toISOString().split('T')[0],
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      // Fetch share data from KV or use demo data
      const raw = await kvGet(`horoscope:${shareId}`);

      if (!raw || shareId === 'demo') {
        // Provide demo/fallback data
        data = {
          shareId: 'demo',
          createdAt: new Date().toISOString(),
          sunSign: 'Aquarius',
          headline: 'Innovation and connection light your path',
          overview:
            'Today brings opportunities for creative breakthroughs and meaningful connections. Your unique perspective is valued.',
          numerologyNumber: 7,
          date: new Date().toISOString().split('T')[0],
        };
      } else {
        data = JSON.parse(raw) as HoroscopeShareRecord;
      }
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 80 : 60;
    const titleSize = isLandscape ? 44 : isStory ? 80 : 64;
    const signSize = isLandscape ? 150 : isStory ? 700 : 260;
    const signNameSize = isLandscape ? 44 : isStory ? 72 : 60;
    const headlineSize = isLandscape ? 32 : isStory ? 56 : 44;
    const overviewSize = isLandscape ? 20 : isStory ? 32 : 26;
    const labelSize = isLandscape ? 16 : isStory ? 26 : 20;

    const truncate = truncateText;

    // Format-specific character limits
    const headlineLimit = isLandscape ? 70 : isStory ? 120 : 100;
    const overviewLimit = isLandscape ? 100 : isStory ? 180 : 130;

    // Generate unique starfield based on shareId
    const stars = generateStarfield(data.shareId, getStarCount(format));

    // Format date
    const date = new Date(data.date);

    // Calculate universal day number from current date
    const calculateUniversalDay = (d: Date): number => {
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      let sum = day + month + year;
      while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = String(sum)
          .split('')
          .reduce((a, b) => a + parseInt(b), 0);
      }
      return sum;
    };

    const universalDay = calculateUniversalDay(date);
    const dateText = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Get zodiac symbol
    const getZodiacSymbol = (sign: string): string => {
      const normalizedSign = sign.toLowerCase();
      const symbols: Record<string, string> = {
        aries: zodiacSymbol.aries,
        taurus: zodiacSymbol.taurus,
        gemini: zodiacSymbol.gemini,
        cancer: zodiacSymbol.cancer,
        leo: zodiacSymbol.leo,
        virgo: zodiacSymbol.virgo,
        libra: zodiacSymbol.libra,
        scorpio: zodiacSymbol.scorpio,
        sagittarius: zodiacSymbol.sagittarius,
        capricorn: zodiacSymbol.capricorn,
        aquarius: zodiacSymbol.aquarius,
        pisces: zodiacSymbol.pisces,
      };
      return symbols[normalizedSign] || '♈';
    };

    const gradient = SIGN_GRADIENTS[data.sunSign] || SIGN_GRADIENTS.Aries;

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

    // Gradient overlay JSX
    const gradientOverlay = (
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(135deg, ${gradient.from}${isStory ? '35' : '20'} 0%, ${gradient.via}${isStory ? '25' : '15'} 50%, ${gradient.to}${isStory ? '35' : '20'} 100%)`,
          opacity: isStory ? 0.65 : 0.4,
        }}
      />
    );

    // Layout based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout - Two column: Symbol + sign left, Message + overview right
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
        {gradientOverlay}
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
            {firstName ? `${firstName}'s Horoscope` : 'Your Horoscope'}
          </div>
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textTertiary,
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
            gap: 32,
            flex: 1,
          }}
        >
          {/* Left: Symbol + Sign + Day numbers */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32%',
              gap: 12,
            }}
          >
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: signSize,
                color: gradient.via,
                display: 'flex',
                lineHeight: 1,
                textShadow: `0 0 60px ${gradient.via}60`,
              }}
            >
              {getZodiacSymbol(data.sunSign)}
            </div>
            <div
              style={{
                fontSize: signNameSize,
                color: OG_COLORS.textPrimary,
                fontWeight: 500,
                display: 'flex',
                letterSpacing: '0.05em',
              }}
            >
              {data.sunSign}
            </div>
            {/* Day Numbers Row */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)`,
                  border: `1px solid ${gradient.via}40`,
                  borderRadius: 10,
                  padding: '6px 12px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: OG_COLORS.textSecondary,
                    display: 'flex',
                  }}
                >
                  Univ.
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: gradient.via,
                    fontWeight: 600,
                    display: 'flex',
                  }}
                >
                  {universalDay}
                </div>
              </div>
              {data.numerologyNumber && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)`,
                    border: `1px solid ${gradient.via}40`,
                    borderRadius: 10,
                    padding: '6px 12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: OG_COLORS.textSecondary,
                      display: 'flex',
                    }}
                  >
                    Pers.
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      color: gradient.via,
                      fontWeight: 600,
                      display: 'flex',
                    }}
                  >
                    {data.numerologyNumber}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Message + Overview */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              flex: 1,
            }}
          >
            {/* Headline */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: SHARE_CARDS.primary,
                border: SHARE_BORDERS.card,
                borderRadius: 16,
                padding: '18px 22px',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: OG_COLORS.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 10,
                  display: 'flex',
                }}
              >
                Today's Message
              </div>
              <div
                style={{
                  fontSize: headlineSize,
                  color: OG_COLORS.textPrimary,
                  lineHeight: 1.35,
                  display: 'flex',
                }}
              >
                {truncate(data.headline, headlineLimit)}
              </div>
            </div>

            {/* Overview */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: SHARE_CARDS.secondary,
                border: SHARE_BORDERS.card,
                borderRadius: 14,
                padding: '14px 18px',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: overviewSize,
                  color: OG_COLORS.textSecondary,
                  lineHeight: 1.55,
                  display: 'flex',
                }}
              >
                {truncate(data.overview, overviewLimit)}
              </div>
            </div>
          </div>
        </div>

        <ShareFooter format={format} />
      </div>
    ) : isStory ? (
      // Story Layout - Giant zodiac symbol, full-width cards
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${padding}px ${padding}px ${padding}px ${padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {gradientOverlay}
        {starfieldJsx}

        {/* Radial glow behind symbol */}
        <div
          style={{
            position: 'absolute',
            top: '22%',
            left: '50%',
            width: 1000,
            height: 1000,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${gradient.via}40 0%, transparent 65%)`,
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
            {firstName ? `${firstName}'s Horoscope` : 'Your Horoscope'}
          </div>
          <div
            style={{
              fontSize: labelSize + 4,
              color: OG_COLORS.textTertiary,
              marginTop: 14,
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Giant Zodiac Symbol — hero fills remaining space */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: 'Astronomicon',
              fontSize: signSize,
              color: gradient.via,
              display: 'flex',
              lineHeight: 1,
              textShadow: `0 0 120px ${gradient.via}80`,
            }}
          >
            {getZodiacSymbol(data.sunSign)}
          </div>
          <div
            style={{
              fontSize: signNameSize,
              color: OG_COLORS.textPrimary,
              fontWeight: 500,
              display: 'flex',
              letterSpacing: '0.08em',
            }}
          >
            {data.sunSign}
          </div>
        </div>

        {/* Message Card - Full width */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${gradient.via}30`,
            borderRadius: 28,
            padding: '36px 44px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: labelSize + 2,
              color: gradient.via,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: 18,
              display: 'flex',
            }}
          >
            Today's Message
          </div>
          <div
            style={{
              fontSize: headlineSize,
              color: OG_COLORS.textPrimary,
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            {truncate(data.headline, headlineLimit)}
          </div>
        </div>

        {/* Day Number Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)`,
              border: `1px solid ${gradient.via}40`,
              borderRadius: 20,
              padding: '16px 32px',
            }}
          >
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.textSecondary,
                display: 'flex',
              }}
            >
              Universal
            </div>
            <div
              style={{
                fontSize: 52,
                color: gradient.via,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {universalDay}
            </div>
          </div>
          {data.numerologyNumber && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)`,
                border: `1px solid ${gradient.via}40`,
                borderRadius: 20,
                padding: '16px 32px',
              }}
            >
              <div
                style={{
                  fontSize: labelSize,
                  color: OG_COLORS.textSecondary,
                  display: 'flex',
                }}
              >
                Personal
              </div>
              <div
                style={{
                  fontSize: 52,
                  color: gradient.via,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {data.numerologyNumber}
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
        {gradientOverlay}
        {starfieldJsx}

        {/* Radial glow behind zodiac symbol */}
        <div
          style={{
            position: 'absolute',
            top: '28%',
            left: '50%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${gradient.via}25 0%, transparent 65%)`,
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
            {firstName ? `${firstName}'s Horoscope` : 'Your Horoscope'}
          </div>
          <div
            style={{
              fontSize: labelSize + 2,
              color: OG_COLORS.textTertiary,
              marginTop: 10,
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Zodiac Symbol — hero element */}
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
              fontFamily: 'Astronomicon',
              fontSize: signSize,
              color: gradient.via,
              display: 'flex',
              marginBottom: 14,
              lineHeight: 1,
              textShadow: `0 0 60px ${gradient.via}70`,
            }}
          >
            {getZodiacSymbol(data.sunSign)}
          </div>
          <div
            style={{
              fontSize: signNameSize,
              color: OG_COLORS.textPrimary,
              fontWeight: 500,
              display: 'flex',
              letterSpacing: '0.06em',
            }}
          >
            {data.sunSign}
          </div>
        </div>

        {/* Message Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${gradient.via}30`,
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: labelSize,
              color: gradient.via,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 12,
              display: 'flex',
            }}
          >
            Today's Message
          </div>
          <div
            style={{
              fontSize: headlineSize,
              color: OG_COLORS.textPrimary,
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            {truncate(data.headline, headlineLimit)}
          </div>
        </div>

        {/* Overview Card — flex fills remaining space */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 18,
            padding: '20px 28px',
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: overviewSize,
              color: OG_COLORS.textSecondary,
              lineHeight: 1.6,
              display: 'flex',
            }}
          >
            {truncate(data.overview, overviewLimit)}
          </div>
        </div>

        {/* Day Number Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)`,
              border: `1px solid ${gradient.via}40`,
              borderRadius: 14,
              padding: '10px 18px',
            }}
          >
            <div
              style={{
                fontSize: labelSize - 2,
                color: OG_COLORS.textSecondary,
                display: 'flex',
              }}
            >
              Universal
            </div>
            <div
              style={{
                fontSize: 30,
                color: gradient.via,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {universalDay}
            </div>
          </div>
          {data.numerologyNumber && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)`,
                border: `1px solid ${gradient.via}40`,
                borderRadius: 14,
                padding: '10px 18px',
              }}
            >
              <div
                style={{
                  fontSize: labelSize - 2,
                  color: OG_COLORS.textSecondary,
                  display: 'flex',
                }}
              >
                Personal
              </div>
              <div
                style={{
                  fontSize: 30,
                  color: gradient.via,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {data.numerologyNumber}
              </div>
            </div>
          )}
        </div>

        <ShareFooter format={format} />
      </div>
    );

    const fonts = await loadShareFonts(request, { includeAstronomicon: true });

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
    });
  } catch (error) {
    console.error('[HoroscopeOG] Error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
