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

    const response = new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#09090b',
          fontFamily: 'Roboto Mono, monospace',
          color: 'white',
          padding: '40px 44px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              display: 'flex',
              color: firstName ? '#d8b4fe' : '#e4e4e7',
            }}
          >
            {titleContent}
          </div>
          <div
            style={{
              fontSize: '30px',
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
            padding: '18px 24px',
            marginBottom: '12px',
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
            <div style={{ fontSize: '44px', display: 'flex' }}>
              {moonPhase.emoji}
            </div>
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
                    fontSize: '36px',
                    fontWeight: 600,
                    color: '#fafafa',
                    display: 'flex',
                  }}
                >
                  {moonPhase.name}
                </div>
                <div
                  style={{
                    fontSize: '30px',
                    color: '#a1a1aa',
                    display: 'flex',
                  }}
                >
                  in {positions.Moon?.sign || 'Aries'}
                </div>
              </div>
              <div
                style={{
                  fontSize: '24px',
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
            padding: '18px 24px',
            marginBottom: '12px',
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
            <TelescopeIcon size={28} />
            <div
              style={{ fontSize: '32px', color: '#fafafa', display: 'flex' }}
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
            {planets.map((planet) => (
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
            {planets.map((planet) => (
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
            padding: '18px 24px',
            marginBottom: '12px',
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
            <SparklesIcon size={28} />
            <div
              style={{ fontSize: '32px', color: '#fafafa', display: 'flex' }}
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
              fontSize: '24px',
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
            padding: '18px 24px',
            marginBottom: '12px',
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
            <LayersIcon size={28} />
            <div
              style={{ fontSize: '32px', color: '#fafafa', display: 'flex' }}
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
              fontSize: '32px',
              color: '#d8b4fe',
              marginBottom: '6px',
              display: 'flex',
            }}
          >
            {tarotCard}
          </div>
          <div style={{ fontSize: '24px', color: '#a1a1aa', display: 'flex' }}>
            {tarotKeywords}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '18px 24px',
            marginBottom: '12px',
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
              fontSize: '28px',
              color: '#fafafa',
              marginBottom: '6px',
              display: 'flex',
            }}
          >
            {transitPlanet === 'Moon'
              ? transitTitle
              : `${transitPlanet} ${transitTitle}`}
          </div>
          <div style={{ fontSize: '24px', color: '#a1a1aa', display: 'flex' }}>
            {transitDesc}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '18px 24px',
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
            <GemIcon size={28} />
            <div
              style={{ fontSize: '32px', color: '#fafafa', display: 'flex' }}
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
          <div style={{ fontSize: '24px', color: '#a1a1aa', display: 'flex' }}>
            {crystalReason}
          </div>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '20px',
            gap: '14px',
          }}
        >
          <LunaryLogo size={40} />
          <div style={{ fontSize: '32px', color: '#d8b4fe', display: 'flex' }}>
            lunary.app
          </div>
        </div>
      </div>,
      {
        width: 1080,
        height: 1350,
        fonts,
      },
    );

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
        details: String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
