import { NextRequest } from 'next/server';
import {
  loadGoogleFont,
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  generateDayGuidanceSummary,
  calculateRealAspects,
  checkSeasonalEvents,
} from '../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGFooter,
  createOGResponse,
  formatOGDate,
} from '../../../../../utils/og/base';

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

  const formattedDate = formatOGDate(targetDate);

  let horoscopeSnippet: string;
  try {
    const positions = getRealPlanetaryPositions(targetDate);
    const moonPhase = getAccurateMoonPhase(targetDate);
    const aspects = calculateRealAspects(positions);
    const seasonalEvents = checkSeasonalEvents(positions);

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

  const dayVariation =
    Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24)) % 5;
  const themes = [
    'linear-gradient(135deg, #1a1a2e, #0a0a1a)',
    'linear-gradient(135deg, #2d3561, #1a1a2e)',
    'linear-gradient(135deg, #34495e, #2c3e50)',
    'linear-gradient(135deg, #2c3e50, #1e2a3a)',
    'linear-gradient(135deg, #1e3c72, #1a2332)',
  ];

  const robotoFont = await loadGoogleFont(request);

  return createOGResponse(
    <OGWrapper theme={{ background: themes[dayVariation] }}>
      <OGHeader title='Daily Guidance' fontSize={24} />

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
    </OGWrapper>,
    {
      size: 'square',
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
