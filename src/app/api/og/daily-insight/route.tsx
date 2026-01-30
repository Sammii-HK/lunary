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
import { getFormatDimensions } from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'nodejs';

let astronomiconFont: Buffer | null = null;
let robotoFont: Buffer | null = null;

function getMoonPhaseSvgPath(phaseName: string): string {
  const lower = phaseName.toLowerCase();

  if (lower.includes('new')) return 'new-moon';
  if (lower.includes('waxing') && lower.includes('crescent'))
    return 'waxing-cresent-moon';
  if (lower.includes('first quarter')) return 'first-quarter';
  if (lower.includes('waxing') && lower.includes('gibbous'))
    return 'waxing-gibbous-moon';
  if (lower.includes('full')) return 'full-moon';
  if (lower.includes('waning') && lower.includes('gibbous'))
    return 'waning-gibbous-moon';
  if (lower.includes('last quarter') || lower.includes('third quarter'))
    return 'last-quarter';
  if (lower.includes('waning') && lower.includes('crescent'))
    return 'waning-cresent-moon';

  return 'full-moon';
}

function loadAssets() {
  if (!astronomiconFont) {
    try {
      astronomiconFont = readFileSync(
        join(process.cwd(), 'public', 'fonts', 'Astronomicon.ttf'),
      );
    } catch (e) {
      console.error('Failed to load Astronomicon font:', e);
    }
  }
  if (!robotoFont) {
    try {
      robotoFont = readFileSync(
        join(process.cwd(), 'public', 'fonts', 'RobotoMono-Regular.ttf'),
      );
    } catch (e) {
      console.error('Failed to load Roboto Mono font:', e);
    }
  }
}

const TelescopeIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='#d8b4fe'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44' />
    <path d='m13.56 11.747 4.332-.924' />
    <path d='m16 21-3.105-6.21' />
    <path d='M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z' />
    <path d='m6.158 8.633 1.114 4.456' />
    <path d='m8 21 3.105-6.21' />
  </svg>
);

const SparklesIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='#d8b4fe'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z' />
    <path d='M20 3v4' />
    <path d='M22 5h-4' />
    <path d='M4 17v2' />
    <path d='M5 18H3' />
  </svg>
);

const LayersIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='#d8b4fe'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z' />
    <path d='m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65' />
    <path d='m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65' />
  </svg>
);

const GemIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='#d8b4fe'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M6 3h12l4 6-10 13L2 9Z' />
    <path d='M11 3 8 9l4 13 4-13-3-6' />
    <path d='M2 9h20' />
  </svg>
);

const LunaryLogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox='0 0 256 256' fill='none'>
    <circle
      cx='128'
      cy='128'
      r='83'
      fill='#FEFFFF'
      stroke='#101827'
      strokeWidth='4'
    />
    <circle cx='99' cy='99' r='10' fill='#D2D5DB' />
    <circle cx='151' cy='141' r='15' fill='#D2D5DB' />
    <circle cx='120' cy='161' r='6' fill='#D2D5DB' />
    <circle cx='161' cy='99' r='8' fill='#D2D5DB' />
  </svg>
);

export async function GET(request: NextRequest): Promise<Response> {
  try {
    loadAssets();

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') as ShareFormat) || 'square';
    const { width, height } = getFormatDimensions(format);

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const userName = searchParams.get('name') || '';
    const tarotCard = searchParams.get('tarot') || 'Two of Wands';
    const tarotKeywords =
      searchParams.get('tarotKeywords') ||
      'future planning • progress • decisions';
    const crystal = searchParams.get('crystal') || 'Amethyst';
    const crystalReason =
      searchParams.get('crystalReason') ||
      'Resonates with Sun in Sagittarius. Supports Uranus-Saturn square.';
    const insight =
      searchParams.get('insight') ||
      'Mars in Sagittarius brings adventurous and direct energy to your 11th house, your social life becomes active and you may take leadership in groups.';
    const isPersonalized = searchParams.get('personalized') === 'true';
    const transitDate = searchParams.get('transitDate') || 'DEC 5';
    const transitPlanet = searchParams.get('transitPlanet') || 'Moon';
    const transitTitle =
      searchParams.get('transitTitle') || 'Full Moon → your 5th house';
    const transitDesc =
      searchParams.get('transitDesc') ||
      'Follow your heart, do what brings joy';

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
    });

    const positions = getRealPlanetaryPositions(today);
    const moonPhase = getAccurateMoonPhase(today);

    // Format-aware sizing
    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape
      ? '32px 36px'
      : isStory
        ? '60px 50px'
        : '40px 44px';
    const titleSize = isLandscape ? '36px' : isStory ? '56px' : '48px';
    const dateSize = isLandscape ? '24px' : isStory ? '36px' : '30px';
    const cardPadding = isLandscape
      ? '14px 18px'
      : isStory
        ? '24px 32px'
        : '18px 24px';
    const cardMargin = isLandscape ? '10px' : isStory ? '16px' : '12px';
    const iconSize = isLandscape ? 22 : isStory ? 32 : 28;
    const cardTitleSize = isLandscape ? '26px' : isStory ? '38px' : '32px';
    const cardTextSize = isLandscape ? '20px' : isStory ? '28px' : '24px';
    const largeTextSize = isLandscape ? '26px' : isStory ? '38px' : '32px';

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
    // For landscape, only show 4 key planets in Sky Now card
    const displayPlanets = isLandscape
      ? ['Sun', 'Moon', 'Mercury', 'Venus']
      : PLANETS;
    const retrogradeCount = PLANETS.filter(
      (p) => positions[p]?.retrograde,
    ).length;

    const firstName = userName ? userName.split(' ')[0] : '';

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
      fonts.push({ name: 'Roboto Mono', data: robotoFont, style: 'normal' });
    }

    const titleContent = firstName
      ? `${firstName}'s Lunary Insight`
      : 'Lunary Insight';

    // Inline JSX directly based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout - 3x2 grid
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#09090b',
          fontFamily: 'Roboto Mono, monospace',
          color: 'white',
          padding,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              display: 'flex',
              color: firstName ? '#d8b4fe' : '#e4e4e7',
            }}
          >
            {titleContent}
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: '#a1a1aa',
              marginTop: '6px',
              display: 'flex',
            }}
          >
            {dateStr}
          </div>
        </div>

        {/* 3x2 Grid of cards */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            flex: 1,
          }}
        >
          {/* Row 1: Moon Phase, Sky Now, Crystal */}
          {/* Moon Phase Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#18181b',
              width: 'calc(33.33% - 7px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${baseUrl}/icons/moon-phases/${getMoonPhaseSvgPath(moonPhase.name)}.png`}
                width={28}
                height={28}
                alt={moonPhase.name}
                style={{ display: 'flex' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#fafafa',
                    display: 'flex',
                  }}
                >
                  {moonPhase.name}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#a1a1aa',
                    display: 'flex',
                  }}
                >
                  in {positions.Moon?.sign || 'Aries'}
                </div>
              </div>
            </div>
          </div>

          {/* Sky Now Card - 4 planets only */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#18181b',
              width: 'calc(33.33% - 7px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <TelescopeIcon size={16} />
              <div
                style={{
                  fontSize: '18px',
                  color: '#fafafa',
                  display: 'flex',
                }}
              >
                Sky Now
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {displayPlanets.map((planet) => (
                <div
                  key={planet}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    width: 'calc(50% - 4px)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Astronomicon',
                      fontSize: '20px',
                      color: positions[planet]?.retrograde
                        ? '#f87171'
                        : '#e4e4e7',
                      display: 'flex',
                    }}
                  >
                    {getPlanetSymbol(planet)}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Astronomicon',
                      fontSize: '16px',
                      color: '#a1a1aa',
                      display: 'flex',
                    }}
                  >
                    {getZodiacSymbol(positions[planet]?.sign || 'Aries')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crystal Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#18181b',
              width: 'calc(33.33% - 7px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <GemIcon size={16} />
              <div
                style={{
                  fontSize: '18px',
                  color: '#fafafa',
                  display: 'flex',
                }}
              >
                {crystal}
              </div>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#a1a1aa',
                display: 'flex',
                lineHeight: 1.3,
              }}
            >
              {crystalReason.length > 60
                ? crystalReason.substring(0, 60) + '...'
                : crystalReason}
            </div>
          </div>

          {/* Row 2: Your Day, Daily Card, Transit */}
          {/* Your Day Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#18181b',
              width: 'calc(33.33% - 7px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <SparklesIcon size={16} />
              <div
                style={{
                  fontSize: '18px',
                  color: '#fafafa',
                  display: 'flex',
                }}
              >
                Your Day
              </div>
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#a1a1aa',
                lineHeight: 1.3,
                display: 'flex',
              }}
            >
              {insight.length > 80 ? insight.substring(0, 80) + '...' : insight}
            </div>
          </div>

          {/* Daily Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#18181b',
              width: 'calc(33.33% - 7px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <LayersIcon size={16} />
              <div
                style={{
                  fontSize: '18px',
                  color: '#fafafa',
                  display: 'flex',
                }}
              >
                Daily Card
              </div>
            </div>
            <div
              style={{
                fontSize: '16px',
                color: '#d8b4fe',
                marginBottom: '2px',
                display: 'flex',
              }}
            >
              {tarotCard}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#a1a1aa',
                display: 'flex',
              }}
            >
              {tarotKeywords}
            </div>
          </div>

          {/* Transit Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '10px 12px',
              background: '#18181b',
              width: 'calc(33.33% - 7px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: '20px',
                  color: '#d8b4fe',
                  display: 'flex',
                }}
              >
                {getPlanetSymbol(transitPlanet)}
              </div>
              <div
                style={{ fontSize: '16px', color: '#a1a1aa', display: 'flex' }}
              >
                {transitDate}
              </div>
            </div>
            <div
              style={{
                fontSize: '15px',
                color: '#fafafa',
                marginBottom: '3px',
                display: 'flex',
              }}
            >
              {transitTitle}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#a1a1aa',
                display: 'flex',
              }}
            >
              {transitDesc}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <LunaryLogo size={24} />
          <div
            style={{
              fontSize: '18px',
              color: '#d8b4fe',
              display: 'flex',
            }}
          >
            lunary.app
          </div>
        </div>
      </div>
    ) : (
      // Square/Story Layout
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#09090b',
          fontFamily: 'Roboto Mono, monospace',
          color: 'white',
          padding,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: isLandscape ? '16px' : '24px',
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              display: 'flex',
              color: firstName ? '#d8b4fe' : '#e4e4e7',
            }}
          >
            {titleContent}
          </div>
          <div
            style={{
              fontSize: dateSize,
              color: '#a1a1aa',
              marginTop: '8px',
              display: 'flex',
            }}
          >
            {dateStr}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: cardPadding,
            marginBottom: cardMargin,
            background: '#18181b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${baseUrl}/icons/moon-phases/${getMoonPhaseSvgPath(moonPhase.name)}.png`}
              width={isLandscape ? 36 : 44}
              height={isLandscape ? 36 : 44}
              alt={moonPhase.name}
              style={{ display: 'flex' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: largeTextSize,
                    fontWeight: 600,
                    color: '#fafafa',
                    display: 'flex',
                  }}
                >
                  {moonPhase.name}
                </div>
                <div
                  style={{
                    fontSize: cardTextSize,
                    color: '#a1a1aa',
                    display: 'flex',
                  }}
                >
                  in {positions.Moon?.sign || 'Aries'}
                </div>
              </div>
              <div
                style={{
                  fontSize: cardTextSize,
                  color: '#a1a1aa',
                  marginTop: '4px',
                  display: 'flex',
                }}
              >
                4 days until Full Moon
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: cardPadding,
            marginBottom: cardMargin,
            background: '#18181b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <TelescopeIcon size={iconSize} />
            <div
              style={{
                fontSize: cardTitleSize,
                color: '#fafafa',
                display: 'flex',
              }}
            >
              Sky Now
            </div>
            {retrogradeCount > 0 && (
              <div
                style={{
                  fontSize: '20px',
                  color: '#f87171',
                  background: 'rgba(248, 113, 113, 0.15)',
                  padding: '4px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                {retrogradeCount} Retrograde
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            {displayPlanets.map((planet) => (
              <div
                key={planet}
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: '38px',
                  color: positions[planet]?.retrograde ? '#f87171' : '#e4e4e7',
                  width: '10%',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {getPlanetSymbol(planet)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {displayPlanets.map((planet) => (
              <div
                key={`z-${planet}`}
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: '30px',
                  color: '#a1a1aa',
                  width: '10%',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {getZodiacSymbol(positions[planet]?.sign || 'Aries')}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: cardPadding,
            marginBottom: cardMargin,
            background: '#18181b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px',
            }}
          >
            <SparklesIcon size={iconSize} />
            <div
              style={{
                fontSize: cardTitleSize,
                color: '#fafafa',
                display: 'flex',
              }}
            >
              Your Day
            </div>
            {isPersonalized && (
              <div
                style={{
                  fontSize: '18px',
                  color: '#d8b4fe',
                  background: 'rgba(216, 180, 254, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                Personal
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: cardTextSize,
              color: '#a1a1aa',
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            {insight.length > 180 ? insight.substring(0, 180) + '...' : insight}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: cardPadding,
            marginBottom: cardMargin,
            background: '#18181b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <LayersIcon size={iconSize} />
            <div
              style={{
                fontSize: cardTitleSize,
                color: '#fafafa',
                display: 'flex',
              }}
            >
              Daily Card
            </div>
            {isPersonalized && (
              <div
                style={{
                  fontSize: '18px',
                  color: '#d8b4fe',
                  background: 'rgba(216, 180, 254, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                Personal
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: largeTextSize,
              color: '#d8b4fe',
              marginBottom: '6px',
              display: 'flex',
            }}
          >
            {tarotCard}
          </div>
          <div
            style={{
              fontSize: cardTextSize,
              color: '#a1a1aa',
              display: 'flex',
            }}
          >
            {tarotKeywords}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: cardPadding,
            marginBottom: cardMargin,
            background: '#18181b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: '32px',
                color: '#d8b4fe',
                display: 'flex',
              }}
            >
              {getPlanetSymbol(transitPlanet)}
            </div>
            <div
              style={{ fontSize: '30px', color: '#a1a1aa', display: 'flex' }}
            >
              {transitDate}
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#fbbf24',
                background: 'rgba(251, 191, 36, 0.15)',
                padding: '4px 12px',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              Major
            </div>
          </div>
          <div
            style={{
              fontSize: isLandscape ? '24px' : '28px',
              color: '#fafafa',
              marginBottom: '6px',
              display: 'flex',
            }}
          >
            {transitPlanet === 'Moon'
              ? transitTitle
              : `${transitPlanet} ${transitTitle}`}
          </div>
          <div
            style={{
              fontSize: cardTextSize,
              color: '#a1a1aa',
              display: 'flex',
            }}
          >
            {transitDesc}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: cardPadding,
            background: '#18181b',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            <GemIcon size={iconSize} />
            <div
              style={{
                fontSize: cardTitleSize,
                color: '#fafafa',
                display: 'flex',
              }}
            >
              {crystal}
            </div>
            {isPersonalized && (
              <div
                style={{
                  fontSize: '18px',
                  color: '#d8b4fe',
                  background: 'rgba(216, 180, 254, 0.15)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                For you
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: cardTextSize,
              color: '#a1a1aa',
              display: 'flex',
            }}
          >
            {crystalReason}
          </div>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: isLandscape ? '16px' : '20px',
            gap: '14px',
          }}
        >
          <LunaryLogo size={isLandscape ? 32 : 40} />
          <div
            style={{
              fontSize: largeTextSize,
              color: '#d8b4fe',
              display: 'flex',
            }}
          >
            lunary.app
          </div>
        </div>
      </div>
    );

    const response = new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
    });

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');

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
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
