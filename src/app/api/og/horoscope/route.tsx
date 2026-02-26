import { NextRequest } from 'next/server';
import { loadGoogleFont } from '../../../../../utils/astrology/cosmic-og';
import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGFooter,
  OGStarfield,
  OGGlowOrbs,
  createOGResponse,
  OGImageSize,
  formatOGDate,
} from '../../../../../utils/og/base';

export const runtime = 'nodejs';
export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const signParam = searchParams.get('sign');
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const sizeParam = searchParams.get('size');
  const showDateParam = searchParams.get('showDate');

  const allowedSizes: OGImageSize[] = [
    'square',
    'landscape',
    'portrait',
    'story',
  ];
  const size: OGImageSize = allowedSizes.includes(sizeParam as OGImageSize)
    ? (sizeParam as OGImageSize)
    : 'landscape';

  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    targetDate = new Date(todayStr + 'T12:00:00Z');
  }

  const showDate = showDateParam === 'true' || Boolean(dateParam);
  const formattedDate = showDate ? formatOGDate(targetDate) : undefined;

  let horoscopeSnippet: string;
  const isMonthly = Boolean(signParam && monthParam && yearParam && !dateParam);
  if (isMonthly) {
    horoscopeSnippet =
      'Monthly horoscope preview • Open Lunary for the full reading';
  } else {
    try {
      horoscopeSnippet = getGeneralHoroscope(targetDate).reading;
    } catch (error) {
      console.error('Error generating horoscope:', error);
      horoscopeSnippet =
        "Trust your inner wisdom and embrace today's cosmic possibilities";
    }
  }

  const dayVariation =
    Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24)) % 5;
  const themes = [
    'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
    'linear-gradient(135deg, #2d3561, #1a1a1a)',
    'linear-gradient(135deg, #34495e, #2c3e50)',
    'linear-gradient(135deg, #2c3e50, #1e2a3a)',
    'linear-gradient(135deg, #1f1f1f, #1a1a1a)',
  ];

  let robotoFont: ArrayBuffer | null = null;
  try {
    robotoFont = await loadGoogleFont(request);
  } catch {
    // continue without custom font
  }

  const headlineParts = [
    signParam ? `${signParam} Horoscope` : 'Daily Horoscope',
    yearParam && monthParam ? `${monthParam}/${yearParam}` : null,
  ].filter(Boolean);
  const headline = headlineParts.join(' • ');

  const accentColor = '#818cf8';

  return createOGResponse(
    <OGWrapper theme={{ background: themes[dayVariation] }}>
      <OGStarfield
        seed={signParam || 'horoscope'}
        count={60}
        accentColor={accentColor}
      />
      <OGGlowOrbs accentColor={accentColor} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <OGHeader title={headline} fontSize={24} />

        <OGContentCenter>
          <div
            style={{
              display: 'flex',
              fontSize: '36px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              marginBottom: '40px',
            }}
          >
            {horoscopeSnippet}
          </div>
        </OGContentCenter>

        <OGFooter date={formattedDate} />
      </div>
    </OGWrapper>,
    {
      size,
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
