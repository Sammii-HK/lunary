import { Observer, AstroTime, Body, GeoVector, Ecliptic, Illumination, MoonPhase } from 'astronomy-engine';

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

// Get zodiac sign from longitude
export function getZodiacSign(longitude: number): string {
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

// Get REAL planetary positions using astronomy-engine (SAME AS POST ROUTE)
export function getRealPlanetaryPositions(
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

// Calculate real aspects between planets (SAME AS POST ROUTE)
export function calculateRealAspects(positions: any): Array<any> {
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

      if (separation < 8) {
        aspectType = 'conjunction';
        priority =
          (planetA === 'Jupiter' && planetB === 'Saturn') ||
          (planetA === 'Saturn' && planetB === 'Jupiter')
            ? 9
            : 7;
      } else if (Math.abs(separation - 60) < 6) {
        aspectType = 'sextile';
        priority = 5;
      } else if (Math.abs(separation - 90) < 8) {
        aspectType = 'square';
        priority = 6;
      } else if (Math.abs(separation - 120) < 8) {
        aspectType = 'trine';
        priority = 6;
      } else if (Math.abs(separation - 180) < 8) {
        aspectType = 'opposition';
        priority = 6;
      }

      if (aspectType) {
        aspects.push({
          name: `${planetA}-${planetB} ${aspectType}`,
          aspect: aspectType,
          glyph: getAspectGlyph(aspectType),
          planetA: {
            name: planetA,
            symbol: getPlanetSymbol(planetA),
            planet: planetA.toLowerCase(),
            constellation: positions[planetA].sign,
            constellationSymbol: getZodiacSymbol(positions[planetA].sign),
          },
          planetB: {
            name: planetB,
            symbol: getPlanetSymbol(planetB),
            planet: planetB.toLowerCase(),
            constellation: positions[planetB].sign,
            constellationSymbol: getZodiacSymbol(positions[planetB].sign),
          },
          energy: `${planetA} ${aspectType} ${planetB}`,
          priority,
          separation: Math.round(separation * 10) / 10,
        });
      }
    }
  }

  return aspects.sort((a, b) => b.priority - a.priority);
}

// Helper functions for image display
export function getPlanetSymbol(planetName: string): string {
  const symbols: { [key: string]: string } = {
    Sun: 'S',
    Moon: 'R',
    Mercury: 'T',
    Venus: 'Q',
    Mars: 'U',
    Jupiter: 'V',
    Saturn: 'W',
    Uranus: 'X',
    Neptune: 'Y',
  };
  return symbols[planetName] || 'S';
}

export function getZodiacSymbol(sign: string): string {
  const symbols: { [key: string]: string } = {
    Aries: 'A',
    Taurus: 'B',
    Gemini: 'C',
    Cancer: 'D',
    Leo: 'E',
    Virgo: 'F',
    Libra: 'G',
    Scorpio: 'H',
    Sagittarius: 'I',
    Capricorn: 'J',
    Aquarius: 'K',
    Pisces: 'L',
  };
  return symbols[sign] || 'A';
}

export function getAspectGlyph(aspect: string): string {
  const glyphs: { [key: string]: string } = {
    conjunction: '!',
    sextile: '%',
    square: '#',
    trine: '$',
    opposition: '"',
  };
  return glyphs[aspect] || '!';
}

// Calculate accurate moon phase using proper astronomy-engine functions
export function getAccurateMoonPhase(date: Date): {
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

// Check for seasonal events (SAME AS POST ROUTE)
export function checkSeasonalEvents(positions: any): Array<any> {
  const sunLongitude = positions.Sun.longitude;
  const events: Array<any> = [];

  // Exact seasonal markers (within 1 degree)
  if (Math.abs(sunLongitude - 0) < 1 || Math.abs(sunLongitude - 360) < 1) {
    events.push({
      name: 'Spring Equinox',
      energy: 'Balance & New Growth',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '🌸',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 0° - Spring begins',
    });
  } else if (Math.abs(sunLongitude - 90) < 1) {
    events.push({
      name: 'Summer Solstice',
      energy: 'Maximum Solar Power',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '☀️',
      description: 'Longest day of the year',
      detail: 'Solar longitude 90° - Peak solar energy',
    });
  } else if (Math.abs(sunLongitude - 180) < 1) {
    events.push({
      name: 'Autumn Equinox',
      energy: 'Harvest & Reflection',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '🍂',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 180° - Autumn begins',
    });
  } else if (Math.abs(sunLongitude - 270) < 1) {
    events.push({
      name: 'Winter Solstice',
      energy: 'Inner Light & Renewal',
      priority: 9, // Higher priority - just under moon phases
      type: 'seasonal',
      emoji: '❄️',
      description: 'Longest night of the year',
      detail: 'Solar longitude 270° - Return of the light',
    });
  }

  return events;
}

// module-scope cache to avoid refetching
let astroFontP: Promise<ArrayBuffer> | null = null;
let robotoFontP: Promise<ArrayBuffer> | null = null;

// Font loading functions
export async function loadAstronomiconFont(request: Request) {
  if (!astroFontP) {
    const url = new URL('/fonts/Astronomicon.ttf', request.url); // resolves to same-origin /fonts/...
    astroFontP = fetch(url, { cache: 'force-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Astronomicon fetch ${r.status}`);
      return r.arrayBuffer();
    });
  }
  return astroFontP;
}

export async function loadGoogleFont(request: Request) {
  if (!robotoFontP) {
    // const url = new URL(`https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`, request.url);
    const url = new URL(`/fonts/RobotoMono-Regular.ttf`, request.url);
    robotoFontP = fetch(url, { cache: 'force-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Roboto Mono font fetch ${r.status}`);
      return r.arrayBuffer();
    });
  }
  return robotoFontP;
}

// // Check for planets entering new signs (sign ingress)
export function checkSignIngress(positions: any, date: Date): Array<any> {
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


// Get descriptive qualities for zodiac signs
export function getSignDescription(sign: string): string {
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

// Generate flowing horoscope-style guidance for ALL the day's events
export function generateDayGuidanceSummary(
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
