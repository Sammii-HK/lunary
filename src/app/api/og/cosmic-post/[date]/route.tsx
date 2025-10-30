import { NextRequest, NextResponse } from 'next/server';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  checkSeasonalEvents,
  calculateRealAspects,
  checkSignIngress,
  getSignDescription,
  generateDayGuidanceSummary,
  checkRetrogradeEvents,
  checkRetrogradeIngress,
} from '../../../../../../utils/astrology/cosmic-og';
import { getGeneralCrystalRecommendation } from '../../../../../../utils/crystals/generalCrystals';
import { getGeneralTarotReading } from '../../../../../../utils/tarot/generalTarot';
import { getGeneralHoroscope } from '../../../../../../utils/astrology/generalHoroscope';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    targetDate = new Date();
  }

  // Get REAL astronomical data
  const positions = getRealPlanetaryPositions(targetDate);
  const moonPhase = getAccurateMoonPhase(targetDate);

  // Find all real astronomical events with correct priority order
  const seasonalEvents = checkSeasonalEvents(positions);
  const aspects = calculateRealAspects(positions);
  const ingresses = checkSignIngress(positions, targetDate);

  // Combine events with priority order: moon phases > extraordinary planetary events > sign ingress > daily aspects > seasonal > cosmic flow
  let allEvents: Array<any> = [];

  // 1. MOON PHASES (Priority 10 - highest)
  if (moonPhase.isSignificant) {
    allEvents.push({
      name: moonPhase.name,
      energy: moonPhase.energy,
      priority: 10,
      type: 'moon',
      emoji: moonPhase.emoji,
    });
  }

  // 2. EXTRAORDINARY PLANETARY EVENTS (Priority 9)
  const extraordinaryAspects = aspects.filter((a) => a.priority >= 9);
  allEvents.push(...extraordinaryAspects);

  // 3. SIGN INGRESS (Priority 4)
  allEvents.push(...ingresses);

  // 4. DAILY ASPECTS (Priority 5-7)
  const dailyAspects = aspects.filter((a) => a.priority < 9);
  allEvents.push(...dailyAspects);

  // 5. SEASONAL EVENTS (Priority 8)
  allEvents.push(...seasonalEvents);

  // 6. If no events, add cosmic flow
  if (allEvents.length === 0) {
    allEvents.push({
      name: 'Cosmic Flow',
      energy: 'Universal Harmony',
      priority: 1,
      type: 'general',
    });
  }

  // Sort by priority and select primary event
  allEvents.sort((a, b) => b.priority - a.priority);
  const primaryEvent = allEvents[0];

  // Generate content with requested structure
  const highlights = [];

  // FIRST: Remove the astrological meaning point (as requested)
  // FIRST: Brief aspect description with constellation info
  if (primaryEvent.aspect) {
    const planetA = primaryEvent.planetA;
    const planetB = primaryEvent.planetB;
    const signA = primaryEvent.planetA.constellation;
    const signB = primaryEvent.planetB.constellation;
    const separation = primaryEvent.separation;
    const aspect = primaryEvent.aspect;

    // Use the same energy-based style as other points
    const signAEnergy = getSignDescription(signA);
    const primaryEnergy = signAEnergy; // Use first sign's energy for consistency

    const aspectAction =
      aspect === 'conjunction'
        ? `unite through ${primaryEnergy} energy`
        : aspect === 'trine'
          ? `flow harmoniously through ${primaryEnergy} energy`
          : aspect === 'square'
            ? `create dynamic tension through ${primaryEnergy} energy`
            : aspect === 'sextile'
              ? `offer opportunities through ${primaryEnergy} energy`
              : `seek balance through ${primaryEnergy} energy`;

    highlights.push(
      `${planetA?.name || planetA}-${planetB?.name || planetB} ${aspect} in ${signA}-${signB} at ${separation}° - ${aspectAction}`,
    );
  } else if (primaryEvent.type === 'moon') {
    // Determine moon phase description based on illumination percentage, not name
    let moonDescription = '';
    const illumination = Math.round(moonPhase.illumination);

    if (illumination < 5) {
      moonDescription = 'Luna aligns between Earth and Sun';
    } else if (illumination > 95) {
      moonDescription = 'Earth sits between Sun and Luna';
    } else if (illumination >= 45 && illumination <= 55) {
      moonDescription = 'Moon shows half illuminated';
    } else if (illumination < 50) {
      moonDescription = 'Moon waxes toward fullness';
    } else {
      moonDescription = 'Moon wanes from fullness';
    }

    highlights.push(
      `${primaryEvent.emoji} ${primaryEvent.name} in ${positions.Moon.sign}: ${moonDescription} - ${illumination}% illuminated, age ${Math.round(moonPhase.age)} days`,
    );
  } else if (primaryEvent.type === 'seasonal') {
    const sunLongitude = Math.round(positions.Sun.longitude);
    highlights.push(
      `${primaryEvent.name}: Sun reaches ${sunLongitude}° longitude (Sun in ${positions.Sun.sign}) - ${primaryEvent.name.includes('Equinox') ? 'creating equal day/night globally' : 'marking maximum/minimum daylight hours'}`,
    );
  } else {
    highlights.push(
      `Current cosmic configuration in ${positions.Sun.sign} creates ${primaryEvent.energy.toLowerCase()} energy through natural celestial rhythms`,
    );
  }

  // THIRD & FOURTH: Secondary events with brief constellation info and angular separations
  const secondaryEvents = allEvents.slice(1, 3);
  secondaryEvents.forEach((event) => {
    if (event.type === 'ingress') {
      highlights.push(
        `${event.planet} enters ${event.sign} - planetary energy shifts to new themes`,
      );
    } else if (event.aspect) {
      const aspectDescription =
        event.aspect === 'conjunction'
          ? 'unite energies'
          : event.aspect === 'trine'
            ? 'flow harmoniously through'
            : event.aspect === 'square'
              ? 'create dynamic tension between'
              : event.aspect === 'sextile'
                ? 'offer cooperative opportunities through'
                : event.aspect === 'opposition'
                  ? 'seek balance between'
                  : 'interact through';

      const signAEnergy = getSignDescription(event.signA);

      // Use the primary energy (first sign's energy) for cleaner flow
      const primaryEnergy = signAEnergy;

      highlights.push(
        `${event.planetA?.name || event.planetA}-${event.planetB?.name || event.planetB} ${event.aspect} in ${event.signA}-${event.signB} at ${event.separation}° - ${aspectDescription} ${primaryEnergy} energy`,
      );
    }
  });

  // Add moon phase if not primary event
  if (primaryEvent.type !== 'moon') {
    highlights.push(
      `${moonPhase.emoji} ${moonPhase.name} in ${positions.Moon.sign} - ${Math.round(moonPhase.illumination)}% illuminated`,
    );
  }

  // Generate guidance that summarizes ALL the day's events
  const horoscopeSnippet = generateDayGuidanceSummary(
    allEvents.slice(0, 3),
    positions,
    moonPhase,
  );

  const postContent = {
    date: targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    primaryEvent: {
      name: primaryEvent.name,
      energy: primaryEvent.energy,
    },
    highlights,
    horoscopeSnippet,
    crystalRecommendation: {
      name: getGeneralCrystalRecommendation().name,
      reason: getGeneralCrystalRecommendation().reason,
      properties: getGeneralCrystalRecommendation().properties,
      guidance: getGeneralCrystalRecommendation().guidance,
      moonPhaseAlignment: getGeneralCrystalRecommendation().moonPhaseAlignment,
    },
    ingressEvents: ingresses,
    aspectEvents: aspects,
    seasonalEvents: seasonalEvents,
    dailyAspects: dailyAspects,
    retrogradeEvents: checkRetrogradeEvents(positions),
    retrogradeIngress: checkRetrogradeIngress(positions),
    tarotReading: {
      name: getGeneralTarotReading().daily.name,
      keywords: getGeneralTarotReading().daily.keywords,
      guidance: getGeneralTarotReading().guidance.dailyMessage,
    },
    callToAction: 'Discover your personalized cosmic guidance at lunary',
    astronomicalData: {
      planets: Object.fromEntries(
        Object.entries(positions).map(([name, data]: [string, any]) => [
          name.toLowerCase(),
          {
            sign: data.sign,
            longitude: Math.round(data.longitude * 100) / 100,
            retrograde: data.retrograde,
          },
        ]),
      ),
      moonPhase: {
        name: moonPhase.name,
        illumination: Math.round(moonPhase.illumination),
        age: Math.round(moonPhase.age),
      },
      primaryEvent: {
        type: primaryEvent.type,
        priority: primaryEvent.priority,
        ...(primaryEvent.aspect && {
          aspect: primaryEvent.aspect,
          separation: primaryEvent.separation,
          orb: primaryEvent.orb,
        }),
      },
    },
    horoscope: {
      date: getGeneralHoroscope().date,
      moonPhase: getGeneralHoroscope().moonPhase,
      reading: getGeneralHoroscope().reading,
      generalAdvice: getGeneralHoroscope().generalAdvice,
    },
    snippet: [
      `Daily cosmic highlights: ${highlights?.[0] || ''}`,
      ' ',
      `Crystal: ${getGeneralCrystalRecommendation().guidance}`,
      ' ',
      `Tarot: ${getGeneralTarotReading().guidance.dailyMessage}`,
      ' ',
      `Horoscope: ${getGeneralHoroscope().reading.slice(0, 150)}...`,
      ' ',
      'Get personalised daily cosmic guidance at lunary.app.',
    ].join('\n'),
    snippetShort: [
      `Daily cosmic highlights: ${highlights?.[0] || ''}`,
      ' ',
      `Crystal: ${getGeneralCrystalRecommendation().guidance}`,
      ' ',
      `Tarot: ${getGeneralTarotReading().guidance.dailyMessage}`,
      ' ',
      'Get personalised daily cosmic guidance at lunary.app',
    ].join('\n'),
  };

  console.log('postContent.snippet', postContent.snippet);

  return NextResponse.json(postContent);
}
