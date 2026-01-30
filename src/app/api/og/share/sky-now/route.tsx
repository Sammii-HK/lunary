import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import { getFormatDimensions, OG_COLORS } from '@/lib/share/og-utils';
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

    if (!shareId) {
      return new Response('Missing shareId', { status: 400 });
    }

    // Fetch share data from KV or use demo data
    const raw = await kvGet(`sky-now:${shareId}`);

    let data: SkyNowShareRecord;

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
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 40 : isStory ? 70 : 60;
    const titleSize = isLandscape ? 36 : isStory ? 64 : 48;
    const dateSize = isLandscape ? 18 : isStory ? 28 : 22;
    const labelSize = isLandscape ? 18 : isStory ? 28 : 20;
    const planetSymbolSize = isLandscape ? 32 : isStory ? 52 : 38;
    const zodiacSymbolSize = isLandscape ? 26 : isStory ? 42 : 30;

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
        {/* Star background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.10) 0 1px, transparent 2px),' +
              'radial-gradient(circle at 70% 60%, rgba(255,255,255,0.08) 0 1px, transparent 2px),' +
              'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.06) 0 1px, transparent 2px)',
            opacity: 0.5,
            display: 'flex',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: isLandscape ? 20 : isStory ? 32 : 28,
            position: 'relative',
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
              marginTop: 8,
              display: 'flex',
            }}
          >
            {dateText}
          </div>
        </div>

        {/* Retrograde Badge */}
        {data.retrogradeCount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: isLandscape ? 20 : 24,
              position: 'relative',
            }}
          >
            <div
              style={{
                background: 'rgba(248, 113, 113, 0.15)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: 12,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: labelSize,
                  color: '#f87171',
                  fontWeight: 500,
                  display: 'flex',
                }}
              >
                {data.retrogradeCount} Planet
                {data.retrogradeCount > 1 ? 's' : ''} Retrograde
              </div>
            </div>
          </div>
        )}

        {/* Planet Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isLandscape ? 12 : 16,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 20,
            padding: isLandscape ? '24px' : isStory ? '36px' : '32px',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
              display: 'flex',
            }}
          >
            Current Positions
          </div>

          {/* Planet rows */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isLandscape ? 10 : 14,
            }}
          >
            {PLANETS.map((planet) => {
              const position = data.positions[planet];
              const isRetrograde = position?.retrograde || false;

              return (
                <div
                  key={planet}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: isLandscape ? '8px 12px' : '12px 16px',
                    background: isRetrograde
                      ? 'rgba(248, 113, 113, 0.08)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isRetrograde ? 'rgba(248, 113, 113, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Astronomicon',
                        fontSize: planetSymbolSize,
                        color: isRetrograde ? '#f87171' : OG_COLORS.textPrimary,
                        display: 'flex',
                      }}
                    >
                      {getPlanetSymbol(planet)}
                    </div>
                    <div
                      style={{
                        fontSize: labelSize,
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
                      gap: 12,
                    }}
                  >
                    {isRetrograde && (
                      <div
                        style={{
                          fontSize: isLandscape ? 14 : 16,
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
                        fontSize: zodiacSymbolSize,
                        color: OG_COLORS.primaryViolet,
                        display: 'flex',
                      }}
                    >
                      {position?.sign ? getZodiacSymbol(position.sign) : '?'}
                    </div>
                    <div
                      style={{
                        fontSize: labelSize,
                        color: OG_COLORS.textPrimary,
                        display: 'flex',
                      }}
                    >
                      {position?.sign || 'Unknown'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: isLandscape ? 24 : 32,
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Lunary.app
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
          {
            name: 'Astronomicon',
            data: await fetch(
              new URL('/fonts/Astronomicon.ttf', request.url),
            ).then((res) => res.arrayBuffer()),
            style: 'normal',
            weight: 400,
          },
        ],
      },
    );
  } catch (error) {
    console.error('[SkyNowOG] Error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
