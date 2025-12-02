import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  getPlanetSymbol,
  getZodiacSymbol,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';

let astronomiconFont: Buffer | null = null;
let robotoFont: Buffer | null = null;
let logoData: Buffer | null = null;

function loadAssets() {
  if (!astronomiconFont) {
    try {
      const fontPath = join(
        process.cwd(),
        'public',
        'fonts',
        'Astronomicon.ttf',
      );
      astronomiconFont = readFileSync(fontPath);
    } catch (error) {
      console.error('Failed to load Astronomicon font:', error);
    }
  }
  if (!robotoFont) {
    try {
      const fontPath = join(
        process.cwd(),
        'public',
        'fonts',
        'RobotoMono-Regular.ttf',
      );
      robotoFont = readFileSync(fontPath);
    } catch (error) {
      console.error('Failed to load Roboto Mono font:', error);
    }
  }
  if (!logoData) {
    try {
      const logoPath = join(process.cwd(), 'public', 'logo.png');
      logoData = readFileSync(logoPath);
    } catch (error) {
      console.error('Failed to load logo:', error);
    }
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    loadAssets();

    const logoSrc = logoData
      ? `data:image/png;base64,${logoData.toString('base64')}`
      : null;

    const { searchParams } = new URL(request.url);

    const userName = searchParams.get('name') || '';
    const tarotCard = searchParams.get('tarot') || 'The Star';
    const tarotKeywords =
      searchParams.get('tarotKeywords') || 'Hope • Inspiration • Renewal';
    const crystal = searchParams.get('crystal') || 'Clear Quartz';
    const insight = searchParams.get('insight') || '';
    const isPersonalized = searchParams.get('personalized') === 'true';

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
    });

    const positions = getRealPlanetaryPositions(today);
    const moonPhase = getAccurateMoonPhase(today);

    const planets = [
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
    const retrogradeCount = planets.filter(
      (p) => positions[p]?.retrograde,
    ).length;

    const title = userName
      ? `${userName}'s Lunary Insight`
      : 'Your Lunary Insight for Today';

    const fonts: {
      name: string;
      data: Buffer;
      style: 'normal';
      weight?: 400 | 700;
    }[] = [];

    if (astronomiconFont) {
      fonts.push({
        name: 'Astronomicon',
        data: astronomiconFont,
        style: 'normal',
        weight: 400,
      });
    }
    if (robotoFont) {
      fonts.push({
        name: 'Roboto Mono',
        data: robotoFont,
        style: 'normal',
      });
    }

    // Inline SVG icons (Lucide-style)
    const SparklesIcon = (
      <svg
        width='28'
        height='28'
        viewBox='0 0 24 24'
        fill='none'
        stroke='rgba(216, 180, 254, 0.8)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' />
        <path d='M5 3v4' />
        <path d='M19 17v4' />
        <path d='M3 5h4' />
        <path d='M17 19h4' />
      </svg>
    );

    const LayersIcon = (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='rgba(216, 180, 254, 0.8)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' />
        <path d='m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65' />
        <path d='m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65' />
      </svg>
    );

    const GemIcon = (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='rgba(216, 180, 254, 0.8)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M6 3h12l4 6-10 13L2 9Z' />
        <path d='M11 3 8 9l4 13 4-13-3-6' />
        <path d='M2 9h20' />
      </svg>
    );

    // Match mobile view - tighter spacing to fit in view
    const response = new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#09090b',
            fontFamily: robotoFont ? 'Roboto Mono' : 'system-ui',
            color: 'white',
            padding: '48px 40px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                fontSize: '44px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#e4e4e7', display: 'flex' }}>
                Good morning,{' '}
              </span>
              <span
                style={{
                  color: 'rgba(216, 180, 254, 0.8)',
                  display: 'flex',
                }}
              >
                {userName || 'friend'}
              </span>
            </div>
            <div
              style={{
                fontSize: '28px',
                color: '#71717a',
                marginTop: '6px',
                display: 'flex',
              }}
            >
              {dateStr}
            </div>
          </div>

          {/* Moon Phase Card - compact */}
          <div
            style={{
              display: 'flex',
              border: '1px solid #27272a',
              borderRadius: '14px',
              padding: '20px 28px',
              marginBottom: '12px',
              background: '#18181b',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '36px', display: 'flex' }}>
              {moonPhase.emoji}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '28px',
                  color: '#e4e4e7',
                  fontWeight: 500,
                  display: 'flex',
                }}
              >
                {moonPhase.name}
              </span>
              <span
                style={{
                  fontSize: '24px',
                  color: '#71717a',
                  display: 'flex',
                }}
              >
                in {positions.Moon?.sign || 'Aries'}
              </span>
            </div>
          </div>

          {/* Sky Now Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '14px',
              padding: '20px 28px',
              marginBottom: '12px',
              background: '#18181b',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              {SparklesIcon}
              <span
                style={{ fontSize: '24px', color: '#e4e4e7', display: 'flex' }}
              >
                Sky Now
              </span>
              {retrogradeCount > 0 && (
                <span
                  style={{
                    fontSize: '18px',
                    color: '#f87171',
                    background: 'rgba(248, 113, 113, 0.15)',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                  }}
                >
                  {retrogradeCount} Retrograde
                </span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {planets.map((planet) => {
                const pos = positions[planet];
                const isRetrograde = pos?.retrograde;
                return (
                  <div
                    key={planet}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: astronomiconFont
                          ? 'Astronomicon'
                          : 'system-ui',
                        fontSize: '32px',
                        color: isRetrograde ? '#f87171' : '#e4e4e7',
                        display: 'flex',
                      }}
                    >
                      {getPlanetSymbol(planet)}
                    </span>
                    <span
                      style={{
                        fontFamily: astronomiconFont
                          ? 'Astronomicon'
                          : 'system-ui',
                        fontSize: '20px',
                        color: '#52525b',
                        marginTop: '4px',
                        display: 'flex',
                      }}
                    >
                      {getZodiacSymbol(pos?.sign || 'Aries')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Day Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '14px',
              padding: '20px 28px',
              marginBottom: '12px',
              background: '#18181b',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
              }}
            >
              {SparklesIcon}
              <span
                style={{
                  fontSize: '24px',
                  color: '#e4e4e7',
                  display: 'flex',
                }}
              >
                Your Day
              </span>
              {isPersonalized && (
                <span
                  style={{
                    fontSize: '16px',
                    color: 'rgba(216, 180, 254, 0.8)',
                    background: 'rgba(192, 132, 252, 0.15)',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                  }}
                >
                  Personal
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#a1a1aa',
                lineHeight: 1.5,
                display: 'flex',
              }}
            >
              {insight
                ? insight.substring(0, 200) +
                  (insight.length > 200 ? '...' : '')
                : 'Your cosmic insight for today awaits.'}
            </div>
          </div>

          {/* Bottom row: Daily Card + Crystal side by side */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Daily Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                border: '1px solid #27272a',
                borderRadius: '14px',
                padding: '20px 24px',
                background: '#18181b',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                {LayersIcon}
                <span
                  style={{
                    fontSize: '20px',
                    color: '#e4e4e7',
                    display: 'flex',
                  }}
                >
                  Daily Card
                </span>
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: 'rgba(216, 180, 254, 0.8)',
                  marginBottom: '6px',
                  display: 'flex',
                }}
              >
                {tarotCard}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#71717a',
                  display: 'flex',
                }}
              >
                {tarotKeywords}
              </div>
            </div>

            {/* Crystal Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                border: '1px solid #27272a',
                borderRadius: '14px',
                padding: '20px 24px',
                background: '#18181b',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                {GemIcon}
                <span
                  style={{
                    fontSize: '20px',
                    color: '#e4e4e7',
                    display: 'flex',
                  }}
                >
                  Crystal
                </span>
                {isPersonalized && (
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'rgba(216, 180, 254, 0.8)',
                      background: 'rgba(192, 132, 252, 0.15)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      display: 'flex',
                    }}
                  >
                    For you
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: 'rgba(216, 180, 254, 0.8)',
                  display: 'flex',
                }}
              >
                {crystal}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt=''
                  width={44}
                  height={44}
                  style={{ display: 'flex' }}
                />
              )}
              <div
                style={{
                  fontSize: '28px',
                  color: 'rgba(216, 180, 254, 0.8)',
                  display: 'flex',
                }}
              >
                lunary.app
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1350,
        fonts,
      },
    );

    const headers = new Headers(response.headers);
    headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=1800, max-age=3600',
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Daily insight OG image generation failed:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate image',
        details: String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
