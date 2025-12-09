import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  loadGoogleFont,
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  generateDayGuidanceSummary,
  calculateRealAspects,
  checkSeasonalEvents,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';
export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    targetDate = new Date(todayStr + 'T12:00:00Z');
  }

  const formattedDate = targetDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '/');

  // Generate horoscope content directly (no HTTP fetch)
  let horoscopeSnippet: string;
  try {
    const positions = getRealPlanetaryPositions(targetDate);
    const moonPhase = getAccurateMoonPhase(targetDate);
    const aspects = calculateRealAspects(positions);
    const seasonalEvents = checkSeasonalEvents(positions);

    // Build events for guidance
    const allEvents: any[] = [];
    if (moonPhase.isSignificant) {
      allEvents.push({
        name: moonPhase.name,
        energy: moonPhase.energy,
        priority: 10,
        type: 'moon',
      });
    }
    allEvents.push(...aspects.slice(0, 2));
    allEvents.push(...seasonalEvents);
    if (allEvents.length === 0) {
      allEvents.push({
        name: 'Cosmic Flow',
        energy: 'Universal Harmony',
        priority: 1,
        type: 'general',
      });
    }

    horoscopeSnippet = generateDayGuidanceSummary(
      allEvents.slice(0, 3),
      positions,
      moonPhase,
    );
  } catch (error) {
    console.error('Error generating horoscope:', error);
    horoscopeSnippet =
      "Trust your inner wisdom and embrace today's cosmic possibilities";
  }

  // Use cosmic-style backgrounds
  const dayVariation =
    Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24)) % 5;
  const themes = [
    'linear-gradient(135deg, #1a1a2e, #0a0a1a)',
    'linear-gradient(135deg, #2d3561, #1a1a2e)',
    'linear-gradient(135deg, #34495e, #2c3e50)',
    'linear-gradient(135deg, #2c3e50, #1e2a3a)',
    'linear-gradient(135deg, #1e3c72, #1a2332)',
  ];

  // Load Roboto Mono font
  const robotoFont = await loadGoogleFont(request);

  return new ImageResponse(
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
      {/* Chakra at top */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '40px',
          paddingTop: '100px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: '400',
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.1em',
            opacity: 0.7,
          }}
        >
          Daily Guidance
        </div>
      </div>

      {/* Crystal name in middle - large for mobile */}
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
        <div
          style={{
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
        <div
          style={{
            fontSize: '24px',
            color: 'white',
            textAlign: 'center',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}
        ></div>
      </div>

      {/* Date */}
      <div
        style={{
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

      {/* Footer - exactly same as cosmic */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: '300',
          color: 'white',
          letterSpacing: '1px',
          marginBottom: '40px',
        }}
      >
        lunary.app
      </div>
    </div>,
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
