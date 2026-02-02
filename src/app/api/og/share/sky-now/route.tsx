import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import {
  getFormatDimensions,
  OG_COLORS,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import { bodiesSymbols, zodiacSymbol } from '@/constants/symbols';

export const runtime = 'edge';

interface PlanetPosition {
  sign: string;
  retrograde?: boolean;
}

interface SkyNowShareRecord {
  shareId: string;
  name?: string;
  positions: Record<string, PlanetPosition>;
  retrogradeCount: number;
  date: string;
  createdAt: string;
}

const PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    // Check for URL parameters for real-time data (Priority 0 Data Flow Fix)
    const urlName = searchParams.get('name');
    const urlPositions = searchParams.get('positions');
    const urlDate = searchParams.get('date');

    let data: SkyNowShareRecord | null = null;

    // If URL params provided, use them directly instead of KV lookup
    if (urlPositions) {
      try {
        const positions = JSON.parse(decodeURIComponent(urlPositions));
        const retrogradeCount = Object.values(positions).filter(
          (p: any) => p.retrograde,
        ).length;
        data = {
          shareId: 'url-params',
          name: urlName || undefined,
          createdAt: new Date().toISOString(),
          positions,
          retrogradeCount,
          date: urlDate || new Date().toISOString().split('T')[0],
        };
      } catch (e) {
        // Fall through to KV/demo if parsing fails
        data = null;
      }
    }

    if (data === null) {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      // Fetch share data from KV or use demo data
      const raw = await kvGet(`sky-now:${shareId}`);

      if (!raw || shareId === 'demo') {
        // Provide demo/fallback data with current planetary positions
        data = {
          shareId: 'demo',
          createdAt: new Date().toISOString(),
          positions: {
            Sun: { sign: 'Aquarius', retrograde: false },
            Moon: { sign: 'Gemini', retrograde: false },
            Mercury: { sign: 'Capricorn', retrograde: false },
            Venus: { sign: 'Pisces', retrograde: false },
            Mars: { sign: 'Cancer', retrograde: false },
            Jupiter: { sign: 'Gemini', retrograde: false },
            Saturn: { sign: 'Pisces', retrograde: false },
            Uranus: { sign: 'Taurus', retrograde: true },
            Neptune: { sign: 'Pisces', retrograde: false },
            Pluto: { sign: 'Aquarius', retrograde: false },
          },
          retrogradeCount: 1,
          date: new Date().toISOString().split('T')[0],
        };
      } else {
        data = JSON.parse(raw) as SkyNowShareRecord;
      }
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 48 : isStory ? 84 : 72;
    const dateSize = isLandscape ? 22 : isStory ? 36 : 28;
    const labelSize = isLandscape ? 22 : isStory ? 36 : 30;
    const planetSymbolSize = isLandscape ? 48 : isStory ? 72 : 60;
    const zodiacSymbolSize = isLandscape ? 38 : isStory ? 56 : 48;
    const planetNameSize = isLandscape ? 20 : isStory ? 28 : 26;

    // Generate unique starfield based on shareId
    const stars = generateStarfield(data.shareId, getStarCount(format));

    // Format date
    const date = new Date(data.date);
    const dateText = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Get planet symbols
    const getPlanetSymbol = (planet: string): string => {
      const symbols: Record<string, string> = {
        Sun: bodiesSymbols.sun,
        Moon: bodiesSymbols.moon,
        Mercury: bodiesSymbols.mercury,
        Venus: bodiesSymbols.venus,
        Mars: bodiesSymbols.mars,
        Jupiter: bodiesSymbols.jupiter,
        Saturn: bodiesSymbols.saturn,
        Uranus: bodiesSymbols.uranus,
        Neptune: bodiesSymbols.neptune,
        Pluto: bodiesSymbols.pluto,
      };
      return symbols[planet] || '?';
    };

    // Get zodiac symbols
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
      return symbols[normalizedSign] || '?';
    };

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

    // Retrograde badge JSX
    const retrogradeBadge =
      data.retrogradeCount > 0 ? (
        <div
          style={{
            background: 'rgba(248, 113, 113, 0.15)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
            borderRadius: 14,
            padding: isLandscape ? '10px 20px' : '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: isLandscape ? 18 : labelSize,
              color: '#f87171',
              fontWeight: 500,
              display: 'flex',
            }}
          >
            {data.retrogradeCount} Planet
            {data.retrogradeCount > 1 ? 's' : ''} Retrograde
          </div>
        </div>
      ) : null;

    // Planet row component
    const renderPlanetRow = (planet: string, compact: boolean = false) => {
      const position = data.positions[planet];
      const isRetrograde = position?.retrograde || false;
      const rowPadding = compact
        ? '10px 14px'
        : isStory
          ? '16px 20px'
          : '14px 18px';
      const symbolSize = compact ? 36 : planetSymbolSize;
      const zodiacSize = compact ? 28 : zodiacSymbolSize;
      const nameSize = compact ? 15 : planetNameSize;

      return (
        <div
          key={planet}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: rowPadding,
            background: isRetrograde
              ? 'rgba(248, 113, 113, 0.08)'
              : 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${isRetrograde ? 'rgba(248, 113, 113, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: compact ? 10 : 16,
            }}
          >
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: symbolSize,
                color: isRetrograde ? '#f87171' : OG_COLORS.textPrimary,
                display: 'flex',
              }}
            >
              {getPlanetSymbol(planet)}
            </div>
            <div
              style={{
                fontSize: nameSize,
                color: OG_COLORS.textSecondary,
                display: 'flex',
              }}
            >
              {planet}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: compact ? 8 : 12,
            }}
          >
            {isRetrograde && (
              <div
                style={{
                  fontSize: compact ? 14 : 18,
                  color: '#f87171',
                  letterSpacing: '0.05em',
                  display: 'flex',
                }}
              >
                ℞
              </div>
            )}
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: zodiacSize,
                color: OG_COLORS.primaryViolet,
                display: 'flex',
              }}
            >
              {position?.sign ? getZodiacSymbol(position.sign) : '?'}
            </div>
            {!compact && (
              <div
                style={{
                  fontSize: nameSize,
                  color: OG_COLORS.textPrimary,
                  display: 'flex',
                }}
              >
                {position?.sign || 'Unknown'}
              </div>
            )}
          </div>
        </div>
      );
    };

    // Layout based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout - 5x2 grid (horizontal emphasis)
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
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 400,
                color: OG_COLORS.textPrimary,
                letterSpacing: '0.05em',
                display: 'flex',
              }}
            >
              {firstName ? `${firstName}'s Sky Now` : 'Sky Now'}
            </div>
            <div
              style={{
                fontSize: dateSize,
                color: OG_COLORS.textTertiary,
                marginTop: 6,
                display: 'flex',
              }}
            >
              {dateText}
            </div>
          </div>
          {retrogradeBadge}
        </div>

        {/* Planet Grid - 5x2 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 16,
            padding: '20px 24px',
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
              display: 'flex',
            }}
          >
            Current Positions
          </div>

          {/* Two rows of 5 planets each */}
          <div style={{ display: 'flex', gap: 10 }}>
            {PLANETS.slice(0, 5).map((planet) => renderPlanetRow(planet, true))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {PLANETS.slice(5, 10).map((planet) =>
              renderPlanetRow(planet, true),
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'center',
            marginTop: 16,
          }}
        >
          <img
            src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
            width={24}
            height={24}
            style={{ opacity: 0.6 }}
            alt=''
          />
          <span
            style={{
              fontSize: 16,
              opacity: 0.6,
              letterSpacing: '0.1em',
              color: OG_COLORS.textPrimary,
              display: 'flex',
            }}
          >
            Join free at lunary.app
          </span>
        </div>
      </div>
    ) : isStory ? (
      // Story Layout - 2x5 grid with generous spacing
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: '120px 60px 200px 60px',
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
            alignItems: 'center',
            marginBottom: 40,
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
            }}
          >
            {firstName ? `${firstName}'s Sky Now` : 'Sky Now'}
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              marginTop: 12,
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Retrograde Badge */}
        {retrogradeBadge && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            {retrogradeBadge}
          </div>
        )}

        {/* Planet Grid - 2x5 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 20,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 24,
            padding: '36px 40px',
            flex: 1,
          }}
        >
          {/* Left column - first 5 planets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              flex: 1,
            }}
          >
            {PLANETS.slice(0, 5).map((planet) => renderPlanetRow(planet))}
          </div>

          {/* Right column - last 5 planets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              flex: 1,
            }}
          >
            {PLANETS.slice(5, 10).map((planet) => renderPlanetRow(planet))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'center',
            marginTop: 'auto',
            paddingTop: 32,
          }}
        >
          <img
            src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
            width={28}
            height={28}
            style={{ opacity: 0.6 }}
            alt=''
          />
          <span
            style={{
              fontSize: 20,
              opacity: 0.6,
              letterSpacing: '0.1em',
              color: OG_COLORS.textPrimary,
              display: 'flex',
            }}
          >
            Join free at lunary.app
          </span>
        </div>
      </div>
    ) : (
      // Square Layout - 2x5 grid
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
            }}
          >
            {firstName ? `${firstName}'s Sky Now` : 'Sky Now'}
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              marginTop: 10,
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Retrograde Badge */}
        {retrogradeBadge && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            {retrogradeBadge}
          </div>
        )}

        {/* Planet Grid - 2x5 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 16,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 20,
            padding: '28px 32px',
            flex: 1,
          }}
        >
          {/* Left column - first 5 planets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flex: 1,
            }}
          >
            {PLANETS.slice(0, 5).map((planet) => renderPlanetRow(planet))}
          </div>

          {/* Right column - last 5 planets */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flex: 1,
            }}
          >
            {PLANETS.slice(5, 10).map((planet) => renderPlanetRow(planet))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'center',
            marginTop: 'auto',
            paddingTop: 28,
          }}
        >
          <img
            src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
            width={24}
            height={24}
            style={{ opacity: 0.6 }}
            alt=''
          />
          <span
            style={{
              fontSize: 16,
              opacity: 0.6,
              letterSpacing: '0.1em',
              color: OG_COLORS.textPrimary,
              display: 'flex',
            }}
          >
            Join free at lunary.app
          </span>
        </div>
      </div>
    );

    return new ImageResponse(layoutJsx, {
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
        {
          name: 'Astronomicon',
          data: await fetch(
            new URL('/fonts/Astronomicon.ttf', request.url),
          ).then((res) => res.arrayBuffer()),
          style: 'normal',
          weight: 400,
        },
      ],
    });
  } catch (error) {
    console.error('[SkyNowOG] Error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
