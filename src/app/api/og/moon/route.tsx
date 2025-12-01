import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getAccurateMoonPhase,
  loadGoogleFont,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';
export const revalidate = 86400;

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  // Get base URL for icons
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  // Normalize date to noon UTC for consistent moon phase calculation
  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    targetDate = new Date(todayStr + 'T12:00:00Z');
  }

  // Get actual moon phase data for the date
  const moonPhase = getAccurateMoonPhase(targetDate);

  // Format date for display
  const formattedDate = targetDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '/');

  // Blue lunar backgrounds (not crystal colors)
  const dayVariation = targetDate.getDate() % 5;
  const themes = [
    'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #1a0f1f 0%, #1a1a2e 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #150d1a 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #0a0a12 50%, #0a0a0f 100%)',
  ];

  // Load Roboto Mono font
  const robotoFont = await loadGoogleFont(request);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: themes[dayVariation],
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 40px',
          justifyContent: 'space-between',
        }}
      >
        {/* Illumination at top */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '40px',
            paddingTop: '100px',
            fontSize: '24px',
            fontWeight: '400',
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.1em',
            opacity: 0.7,
          }}
        >
          {Math.round(moonPhase.illumination)}% ILLUMINATED
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            width: '100%',
          }}
        >
          <img
            src={`${baseUrl}/icons/dotty/moon-phases/${getMoonPhaseSvgPath(moonPhase.name)}.png`}
            width={180}
            height={180}
            alt={moonPhase.name}
            style={{ marginBottom: '30px' }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: '64px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              marginBottom: '30px',
            }}
          >
            {moonPhase.name}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              color: 'white',
              textAlign: 'center',
              opacity: 0.7,
              letterSpacing: '0.1em',
            }}
          >
            {moonPhase.energy}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              fontWeight: '300',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Roboto Mono',
              marginBottom: '20px',
            }}
          >
            {formattedDate}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              fontWeight: '300',
              color: 'white',
              letterSpacing: '1px',
              marginBottom: '40px',
            }}
          >
            lunary.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: robotoFont
        ? [
            {
              name: 'Roboto Mono',
              data: robotoFont,
              style: 'normal',
            },
          ]
        : [],
    },
  );
}
