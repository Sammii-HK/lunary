import { NextRequest, NextResponse } from 'next/server';
import {
  Observer,
  AstroTime,
  Body,
  GeoVector,
  Ecliptic,
  Illumination,
  MoonPhase,
} from 'astronomy-engine';
import { getGeneralCrystalRecommendation } from '../../../../../../utils/crystals/generalCrystals';
import { getGeneralTarotReading } from '../../../../../../utils/tarot/generalTarot';
import { getGeneralHoroscope } from '../../../../../../utils/astrology/generalHoroscope';

// Default observer location (London, UK)
const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

// Get zodiac sign from longitude
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return signs[index];
}

// Get descriptive qualities for zodiac signs
function getSignDescription(sign: string): string {
  const descriptions: { [key: string]: string } = {
    Aries: 'initiating and pioneering',
    Taurus: 'grounding and stabilizing',
    Gemini: 'communicating and adapting',
    Cancer: 'nurturing and protective',
    Leo: 'creative and expressive',
    Virgo: 'practical and analytical',
    Libra: 'harmonizing and diplomatic',
    Scorpio: 'transforming and intense',
    Sagittarius: 'expanding and philosophical',
    Capricorn: 'structuring and ambitious',
    Aquarius: 'innovative and independent',
    Pisces: 'intuitive and compassionate',
  };
  return descriptions[sign] || 'cosmic';
}

// Get REAL planetary positions using astronomy-engine
function getRealPlanetaryPositions(
  date: Date,
  observer: Observer = DEFAULT_OBSERVER,
) {
  const astroTime = new AstroTime(date);
  const astroTimePast = new AstroTime(
    new Date(date.getTime() - 24 * 60 * 60 * 1000),
  );

  const planets = [
    { body: Body.Sun, name: 'Sun' },
    { body: Body.Moon, name: 'Moon' },
    { body: Body.Mercury, name: 'Mercury' },
    { body: Body.Venus, name: 'Venus' },
    { body: Body.Mars, name: 'Mars' },
    { body: Body.Jupiter, name: 'Jupiter' },
    { body: Body.Saturn, name: 'Saturn' },
    { body: Body.Uranus, name: 'Uranus' },
    { body: Body.Neptune, name: 'Neptune' },
  ];

  const positions: any = {};

  planets.forEach(({ body, name }) => {
    const vectorNow = GeoVector(body, astroTime, true);
    const vectorPast = GeoVector(body, astroTimePast, true);

    const eclipticNow = Ecliptic(vectorNow);
    const eclipticPast = Ecliptic(vectorPast);

    const longitude = eclipticNow.elon;
    const longitudePast = eclipticPast.elon;

    // Check for retrograde motion (accounting for 0°/360° wraparound)
    let retrograde = false;
    if (Math.abs(longitude - longitudePast) < 180) {
      retrograde = longitude < longitudePast;
    } else {
      retrograde = longitude > longitudePast;
    }

    positions[name] = {
      longitude,
      sign: getZodiacSign(longitude),
      retrograde,
    };
  });

  return positions;
}

// Calculate accurate moon phase using proper astronomy-engine functions
function getAccurateMoonPhase(date: Date): {
  name: string;
  energy: string;
  priority: number;
  emoji: string;
  illumination: number;
  age: number;
  isSignificant: boolean;
} {
  const astroTime = new AstroTime(date);
  const moonIllumination = Illumination(Body.Moon, astroTime);
  const moonPhaseAngle = MoonPhase(date); // This gives us the phase angle in degrees

  const illuminationPercent = moonIllumination.phase_fraction * 100;

  // Convert phase angle to moon age (0-29.53 days)
  // 0° = New Moon, 90° = First Quarter, 180° = Full Moon, 270° = Third Quarter
  const moonAge = (moonPhaseAngle / 360) * 29.530588853;

  // Determine moon phase based on angle with proper tolerances
  if (moonPhaseAngle >= 355 || moonPhaseAngle <= 5) {
    // New Moon: 355° - 5° (around 0°)
    return {
      name: 'New Moon',
      energy: 'New Beginnings',
      priority: 10,
      emoji: '🌑',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else if (moonPhaseAngle >= 85 && moonPhaseAngle <= 95) {
    // First Quarter: 85° - 95° (around 90°)
    return {
      name: 'First Quarter',
      energy: 'Action & Decision',
      priority: 10,
      emoji: '🌓',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else if (moonPhaseAngle >= 175 && moonPhaseAngle <= 185) {
    // Full Moon: 175° - 185° (around 180°)
    const month = date.getMonth() + 1;
    const moonNames: { [key: number]: string } = {
      1: 'Wolf Moon',
      2: 'Snow Moon',
      3: 'Worm Moon',
      4: 'Pink Moon',
      5: 'Flower Moon',
      6: 'Strawberry Moon',
      7: 'Buck Moon',
      8: 'Sturgeon Moon',
      9: 'Harvest Moon',
      10: 'Hunter Moon',
      11: 'Beaver Moon',
      12: 'Cold Moon',
    };
    const moonName = moonNames[month] || 'Full Moon';
    return {
      name: moonName,
      energy: 'Peak Power',
      priority: 10,
      emoji: '🌕',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else if (moonPhaseAngle >= 265 && moonPhaseAngle <= 275) {
    // Third Quarter: 265° - 275° (around 270°)
    return {
      name: 'Third Quarter',
      energy: 'Release & Letting Go',
      priority: 10,
      emoji: '🌗',
      illumination: illuminationPercent,
      age: moonAge,
      isSignificant: true,
    };
  } else {
    // Non-significant phases based on angle ranges
    if (moonPhaseAngle > 5 && moonPhaseAngle < 85) {
      return {
        name: 'Waxing Crescent',
        energy: 'Growing Energy',
        priority: 2,
        emoji: '🌒',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    } else if (moonPhaseAngle > 95 && moonPhaseAngle < 175) {
      return {
        name: 'Waxing Gibbous',
        energy: 'Building Power',
        priority: 2,
        emoji: '🌔',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    } else if (moonPhaseAngle > 185 && moonPhaseAngle < 265) {
      return {
        name: 'Waning Gibbous',
        energy: 'Gratitude & Wisdom',
        priority: 2,
        emoji: '🌖',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    } else {
      return {
        name: 'Waning Crescent',
        energy: 'Rest & Reflection',
        priority: 2,
        emoji: '🌘',
        illumination: illuminationPercent,
        age: moonAge,
        isSignificant: false,
      };
    }
  }
}

// Calculate real aspects between planets using their actual positions
function calculateRealAspects(positions: any): Array<any> {
  const aspects: Array<any> = [];
  const planetNames = Object.keys(positions);

  // Check all planet pairs for aspects
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const planetA = planetNames[i];
      const planetB = planetNames[j];

      const longA = positions[planetA].longitude;
      const longB = positions[planetB].longitude;

      // Calculate angular separation
      let separation = Math.abs(longA - longB);
      if (separation > 180) {
        separation = 360 - separation;
      }

      // Determine aspect type based on separation
      let aspectType = null;
      let priority = 0;
      let orb = 8; // Default orb

      if (separation < 8) {
        aspectType = 'conjunction';
        priority =
          (planetA === 'Jupiter' && planetB === 'Saturn') ||
          (planetA === 'Saturn' && planetB === 'Jupiter')
            ? 9
            : 7;
        orb = 8;
      } else if (Math.abs(separation - 60) < 6) {
        aspectType = 'sextile';
        priority = 5;
        orb = 6;
      } else if (Math.abs(separation - 90) < 8) {
        aspectType = 'square';
        priority = 6;
        orb = 8;
      } else if (Math.abs(separation - 120) < 8) {
        aspectType = 'trine';
        priority = 6;
        orb = 8;
      } else if (Math.abs(separation - 180) < 8) {
        aspectType = 'opposition';
        priority = 6;
        orb = 8;
      }

      if (aspectType) {
        aspects.push({
          name: `${planetA}-${planetB} ${aspectType}`,
          energy: `${planetA} ${aspectType} ${planetB}`,
          priority,
          aspect: aspectType,
          planetA,
          planetB,
          signA: positions[planetA].sign,
          signB: positions[planetB].sign,
          separation: Math.round(separation * 10) / 10,
          orb,
        });
      }
    }
  }

  return aspects.sort((a, b) => b.priority - a.priority);
}

// Check for planets entering new signs (sign ingress)
function checkSignIngress(positions: any, date: Date): Array<any> {
  const ingresses: Array<any> = [];

  // For each planet, check if it's near the beginning of a sign (0-2 degrees)
  Object.entries(positions).forEach(([planet, data]: [string, any]) => {
    const longitude = data.longitude;
    const degreeInSign = longitude % 30;

    // Planet entering new sign if within first 2 degrees
    if (degreeInSign < 2) {
      ingresses.push({
        name: `${planet} enters ${data.sign}`,
        energy: `${planet} energy shifts`,
        priority: 4,
        type: 'ingress',
        planet,
        sign: data.sign,
      });
    }
  });

  return ingresses.sort((a, b) => b.priority - a.priority);
}

// Check for seasonal events using real solar position
function checkSeasonalEvents(positions: any): Array<any> {
  const sunLongitude = positions.Sun.longitude;
  const events: Array<any> = [];

  // Exact seasonal markers (within 1 degree) - HIGH PRIORITY under moon phases
  if (Math.abs(sunLongitude - 0) < 1 || Math.abs(sunLongitude - 360) < 1) {
    events.push({
      name: 'Spring Equinox',
      energy: 'Balance & New Growth',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
    });
  } else if (Math.abs(sunLongitude - 90) < 1) {
    events.push({
      name: 'Summer Solstice',
      energy: 'Maximum Solar Power',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
    });
  } else if (Math.abs(sunLongitude - 180) < 1) {
    events.push({
      name: 'Autumn Equinox',
      energy: 'Harvest & Reflection',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
    });
  } else if (Math.abs(sunLongitude - 270) < 1) {
    events.push({
      name: 'Winter Solstice',
      energy: 'Inner Light & Renewal',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
    });
  }

  return events;
}

// Generate astrological meaning for the primary event

// Generate astronomical facts

// Generate practical guidance

// Generate flowing horoscope-style guidance for ALL the day's events
function generateDayGuidanceSummary(
  topEvents: any[],
  positions: any,
  moonPhase: any,
): string {
  const primaryEvent = topEvents[0];
  const secondaryEvents = topEvents.slice(1, 3);

  // Get current sun and moon signs for context
  const moonSign = positions.Moon.sign;

  // Start with more conversational, engaging guidance
  let guidance = '';

  if (primaryEvent.type === 'moon') {
    if (primaryEvent.name.includes('New')) {
      guidance = `The New Moon in ${moonSign} marks a powerful reset point for manifestation and new beginnings. This lunar phase offers optimal conditions for setting intentions and initiating projects aligned with your deeper purpose.`;
    } else if (
      primaryEvent.name.includes('Full') ||
      (primaryEvent.name.includes('Moon') &&
        !primaryEvent.name.includes('New') &&
        !primaryEvent.name.includes('Quarter'))
    ) {
      // This covers "Full Moon", "Hunter Moon", "Blood Moon", etc.
      guidance = `The ${primaryEvent.name} in ${moonSign} reaches peak illumination, highlighting completion and culmination. This phase brings clarity to what has been accomplished while revealing areas ready for release and transformation.`;
    } else if (primaryEvent.name.includes('Quarter')) {
      guidance = `The ${primaryEvent.name} in ${moonSign} presents a critical decision point in the lunar cycle. This dynamic phase supports decisive action and breakthrough moments that align with your authentic path.`;
    }
  } else if (primaryEvent.aspect) {
    if (primaryEvent.aspect === 'conjunction') {
      if (
        (primaryEvent.planetA === 'Saturn' &&
          primaryEvent.planetB === 'Neptune') ||
        (primaryEvent.planetA === 'Neptune' &&
          primaryEvent.planetB === 'Saturn')
      ) {
        guidance = `Saturn and Neptune form a rare conjunction, merging practical structure with mystical vision. This alignment supports giving tangible form to dreams while remaining receptive to spiritual guidance.`;
      } else if (
        (primaryEvent.planetA === 'Venus' && primaryEvent.planetB === 'Mars') ||
        (primaryEvent.planetA === 'Mars' && primaryEvent.planetB === 'Venus')
      ) {
        guidance = `Venus and Mars unite in conjunction, harmonizing the principles of love and action. This passionate alignment favors creative endeavors, romantic initiatives, and projects requiring both heart and courage.`;
      } else {
        guidance = `${primaryEvent.planetA} and ${primaryEvent.planetB} unite in conjunction, creating integrated opportunities for purposeful growth and aligned action.`;
      }
    } else if (primaryEvent.aspect === 'trine') {
      guidance = `${primaryEvent.planetA} forms a harmonious trine with ${primaryEvent.planetB}, creating effortless flow and natural synchronicity. This supportive aspect encourages trusting instincts and allowing opportunities to unfold organically.`;
    } else if (primaryEvent.aspect === 'square') {
      guidance = `${primaryEvent.planetA} forms a dynamic square with ${primaryEvent.planetB}, generating creative tension that can fuel breakthrough moments. This challenging aspect supports channeling resistance into constructive action and innovative solutions.`;
    }
  } else if (primaryEvent.type === 'seasonal') {
    guidance = `The ${primaryEvent.name} marks a significant turning point in the seasonal cycle. This celestial milestone invites alignment with natural rhythms and conscious engagement with transformative seasonal energies.`;
  } else {
    guidance = `Today's planetary configuration supports conscious evolution and spiritual growth through natural celestial rhythms.`;
  }

  // Add secondary events with informed perspective
  if (secondaryEvents.length > 0) {
    const secondaryGuidance: string[] = [];

    secondaryEvents.forEach((event, index) => {
      if (event.aspect === 'trine') {
        if (
          (event.planetA === 'Sun' && event.planetB === 'Moon') ||
          (event.planetA === 'Moon' && event.planetB === 'Sun')
        ) {
          secondaryGuidance.push('emotional and conscious alignment');
        } else if (
          (event.planetA === 'Moon' && event.planetB === 'Mercury') ||
          (event.planetA === 'Mercury' && event.planetB === 'Moon')
        ) {
          secondaryGuidance.push('enhanced intuitive communication');
        } else {
          secondaryGuidance.push('harmonious planetary flow');
        }
      } else if (event.aspect === 'sextile') {
        secondaryGuidance.push('cooperative planetary opportunities');
      } else if (event.aspect === 'square') {
        secondaryGuidance.push('dynamic growth-oriented tension');
      } else if (event.type === 'ingress') {
        secondaryGuidance.push('significant planetary transitions');
      }
    });

    if (secondaryGuidance.length > 0) {
      guidance += ` Additional cosmic currents include ${secondaryGuidance.join(' and ')}, creating a rich tapestry of astrological influences.`;
    }
  }

  // Add moon phase context if not primary
  if (primaryEvent.type !== 'moon') {
    if (moonPhase.illumination > 80) {
      guidance += ` The waxing lunar energy amplifies intentions and supports decisive action.`;
    } else if (moonPhase.illumination < 20) {
      guidance += ` The waning lunar phase encourages reflection and conscious release.`;
    } else {
      guidance += ` The current lunar phase supports steady progress and mindful development.`;
    }
  }

  return guidance;
}

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
    const signA = primaryEvent.signA;
    const signB = primaryEvent.signB;
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
      `${planetA}-${planetB} ${aspect} in ${signA}-${signB} at ${separation}° - ${aspectAction}`,
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
        `${event.planetA}-${event.planetB} ${event.aspect} in ${event.signA}-${event.signB} at ${event.separation}° - ${aspectDescription} ${primaryEnergy} energy`,
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
      `Tarot: ${getGeneralTarotReading().daily.name}, ${getGeneralTarotReading().guidance.dailyMessage}`,
      ' ',
      // `Horoscope: ${getGeneralHoroscope().reading.slice(0, 250)}...`,
      // ' ',
      'Get personalised daily cosmic guidance at lunary.app.',
    ].join('\n'),
  };

  console.log('postContent.snippet', postContent.snippet);

  return NextResponse.json(postContent);
}
