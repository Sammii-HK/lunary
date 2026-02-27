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
  checkActiveRetrogrades,
} from '../../../../../../utils/astrology/cosmic-og';
import { getGeneralCrystalRecommendation } from '../../../../../../utils/crystals/generalCrystals';
import { getGeneralTarotReading } from '../../../../../../utils/tarot/generalTarot';
import { getGeneralHoroscope } from '../../../../../../utils/astrology/generalHoroscope';

export const runtime = 'nodejs'; // Node.js runtime is faster for CPU-intensive calculations
export const revalidate = 86400; // Cache for 24 hours - cosmic data for a specific date doesn't change

// Request deduplication - prevent duplicate calculations for simultaneous requests
const pendingRequests = new Map<string, Promise<Response>>();

async function generateResponse(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
): Promise<Response> {
  const { date: dateParam } = await params;
  const { searchParams } = new URL(request.url);
  // Support both path parameter and query parameter for backward compatibility
  const dateFromQuery = searchParams.get('date');
  const excludeParam = searchParams.get('exclude');
  const dateToUse = dateParam || dateFromQuery;

  let targetDate: Date;
  if (dateToUse) {
    targetDate = new Date(dateToUse + 'T12:00:00Z');
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
  const retrogradeEvents = checkRetrogradeEvents(positions);
  const retrogradeIngress = checkRetrogradeIngress(positions);
  const activeRetrogrades = checkActiveRetrogrades(positions);

  // Combine events with priority order: moon phases > active retrogrades > extraordinary planetary events > sign ingress > daily aspects > seasonal > cosmic flow
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

  // 2. ACTIVE RETROGRADES (Priority 9-10) — fires every day during retrograde period
  allEvents.push(...retrogradeEvents); // station days (start/end)
  allEvents.push(...activeRetrogrades); // mid-period days

  // 3. EXTRAORDINARY PLANETARY EVENTS (Priority 9)
  const extraordinaryAspects = aspects.filter((a) => a.priority >= 9);
  allEvents.push(...extraordinaryAspects);

  // 4. SIGN INGRESS (Priority 4)
  allEvents.push(...ingresses);

  // 5. DAILY ASPECTS (Priority 5-7)
  const dailyAspects = aspects.filter((a) => a.priority < 9);
  allEvents.push(...dailyAspects);

  // 6. SEASONAL EVENTS (Priority 8)
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

  const excludedNames = new Set(
    (excludeParam ? excludeParam.split(',') : [])
      .map((value) => decodeURIComponent(value).trim().toLowerCase())
      .filter(Boolean),
  );

  const candidateEvents =
    excludedNames.size > 0
      ? allEvents.filter((event) => {
          const name = String(event.name || '')
            .trim()
            .toLowerCase();
          return !excludedNames.has(name);
        })
      : allEvents;

  const prioritizedEvents =
    candidateEvents.length > 0 ? candidateEvents : allEvents;

  // Sort by priority and select primary event
  prioritizedEvents.sort((a, b) => b.priority - a.priority);
  const primaryEvent = prioritizedEvents[0];

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
  const secondaryEvents = prioritizedEvents.slice(1, 3);
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

      const signA = event.planetA?.constellation;
      const signB = event.planetB?.constellation;
      const signAEnergy = getSignDescription(signA);

      highlights.push(
        `${event.planetA?.name}-${event.planetB?.name} ${event.aspect} in ${signA}-${signB} at ${event.separation}° - ${aspectDescription} ${signAEnergy} energy`,
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
    prioritizedEvents.slice(0, 3),
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
    crystalRecommendation: (() => {
      // Get crystal recommendation for the target date (not today!)
      const crystalRec = getGeneralCrystalRecommendation(targetDate);
      return {
        name: crystalRec.name,
        reason: crystalRec.reason,
        properties: crystalRec.properties,
        guidance: crystalRec.guidance,
        moonPhaseAlignment: crystalRec.moonPhaseAlignment,
      };
    })(),
    ingressEvents: ingresses,
    aspectEvents: aspects,
    seasonalEvents: seasonalEvents,
    dailyAspects: dailyAspects,
    retrogradeEvents: retrogradeEvents,
    retrogradeIngress: retrogradeIngress,
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
    snippet: (() => {
      // Use the same crystal recommendation from above (for target date)
      const crystalRec = getGeneralCrystalRecommendation(targetDate);
      return [
        `Daily cosmic highlights: ${highlights?.[0] || ''}`,
        ' ',
        `Crystal: ${crystalRec.guidance}`,
        ' ',
        `Tarot: ${getGeneralTarotReading().guidance.dailyMessage}`,
        ' ',
        `Horoscope: ${getGeneralHoroscope().reading.slice(0, 150)}...`,
        ' ',
        'Get personalised daily cosmic guidance at lunary.app.',
      ].join('\n');
    })(),
    snippetShort: (() => {
      const crystalRec = getGeneralCrystalRecommendation(targetDate);
      const tarotReading = getGeneralTarotReading().guidance.dailyMessage;

      // Create a flowing, cohesive paragraph
      const primaryEvent = highlights?.[0] || 'Daily cosmic guidance';

      // Clean up crystal text - remove repetitive prefixes
      let crystalText = crystalRec.guidance
        .replace(/^The cosmic energies favor /i, '')
        .replace(/^Work with /i, '')
        .replace(/^Today's energies favor /i, '')
        .trim();

      // Clean up tarot text - remove repetitive prefixes
      let tarotText = tarotReading
        .replace(/^Today's cosmic energy through /i, '')
        .replace(/^The universe encourages you to /i, '')
        .trim();

      // Build natural flowing paragraph
      let snippet = `${primaryEvent}. `;
      snippet += `Today's energies favor ${crystalText.toLowerCase()}. `;
      snippet += `Tarot guidance suggests ${tarotText.toLowerCase()}. `;
      snippet += 'Get personalized daily cosmic guidance at lunary.app';

      // Ensure it's 280 characters or less for Twitter
      if (snippet.length > 280) {
        const maxLength = 275;
        let cutPoint = maxLength;

        // Look for sentence endings in reverse order
        const sentenceEnders = ['.', '!', '?'];
        for (let i = maxLength - 1; i >= Math.max(0, maxLength - 50); i--) {
          if (sentenceEnders.includes(snippet[i])) {
            if (i === snippet.length - 1 || snippet[i + 1] === ' ') {
              cutPoint = i + 1;
              break;
            }
          }
        }

        // If no sentence ender found, break at last space
        if (cutPoint === maxLength) {
          const lastSpace = snippet.lastIndexOf(' ', maxLength);
          if (lastSpace > maxLength - 50) {
            cutPoint = lastSpace;
          }
        }

        snippet = snippet.substring(0, cutPoint).trim();
        if (
          !snippet.endsWith('.') &&
          !snippet.endsWith('!') &&
          !snippet.endsWith('?')
        ) {
          snippet += '...';
        }
      }

      return snippet;
    })(),
  };

  return NextResponse.json(postContent, {
    headers: {
      'Cache-Control':
        'public, s-maxage=86400, stale-while-revalidate=43200, max-age=86400',
      'CDN-Cache-Control': 'public, s-maxage=86400',
      'Vercel-CDN-Cache-Control': 'public, s-maxage=86400',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
): Promise<Response> {
  const { date: dateParam } = await params;
  const { searchParams } = new URL(request.url);
  const dateFromQuery = searchParams.get('date');
  const excludeParam = searchParams.get('exclude');
  const dateToUse = dateParam || dateFromQuery;
  const cacheKey = `cosmic-post-${dateToUse || 'today'}-${excludeParam || 'none'}`;

  // Request deduplication - if same date is being processed, reuse the promise
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const promise = generateResponse(request, { params }).finally(() => {
    // Clean up after request completes
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, promise);
  return promise;
}
