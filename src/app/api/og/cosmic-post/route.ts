import { NextRequest, NextResponse } from 'next/server';
import {
  Observer,
  AstroTime,
  Body,
  GeoVector,
  Ecliptic,
  Illumination,
} from 'astronomy-engine';

// Default observer location (London, UK)
const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

// Get zodiac sign from longitude
function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const index = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return signs[index];
}

// Get descriptive qualities for zodiac signs
function getSignDescription(sign: string): string {
  const descriptions: { [key: string]: string } = {
    'Aries': 'initiating and pioneering',
    'Taurus': 'grounding and stabilizing', 
    'Gemini': 'communicating and adapting',
    'Cancer': 'nurturing and protective',
    'Leo': 'creative and expressive',
    'Virgo': 'practical and analytical',
    'Libra': 'harmonizing and diplomatic',
    'Scorpio': 'transforming and intense',
    'Sagittarius': 'expanding and philosophical',
    'Capricorn': 'structuring and ambitious',
    'Aquarius': 'innovative and independent',
    'Pisces': 'intuitive and compassionate'
  };
  return descriptions[sign] || 'cosmic';
}

// Get REAL planetary positions using astronomy-engine
function getRealPlanetaryPositions(date: Date, observer: Observer = DEFAULT_OBSERVER) {
  const astroTime = new AstroTime(date);
  const astroTimePast = new AstroTime(new Date(date.getTime() - 24 * 60 * 60 * 1000));
  
  const planets = [
    { body: Body.Sun, name: 'Sun' },
    { body: Body.Moon, name: 'Moon' },
    { body: Body.Mercury, name: 'Mercury' },
    { body: Body.Venus, name: 'Venus' },
    { body: Body.Mars, name: 'Mars' },
    { body: Body.Jupiter, name: 'Jupiter' },
    { body: Body.Saturn, name: 'Saturn' },
    { body: Body.Uranus, name: 'Uranus' },
    { body: Body.Neptune, name: 'Neptune' }
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
      retrograde
    };
  });

  return positions;
}

// Calculate accurate moon phase using astronomy-engine
function getAccurateMoonPhase(date: Date): { name: string; energy: string; priority: number; emoji: string; illumination: number; age: number; isSignificant: boolean } {
  const astroTime = new AstroTime(date);
  const moonIllumination = Illumination(Body.Moon, astroTime);
  
  const moonAge = moonIllumination.phase_angle / 360 * 29.530588853;
  const illuminationPercent = moonIllumination.phase_fraction * 100;
  
  // Determine moon phase with tight tolerances for major phases
  if (moonAge < 0.5) {
    return { name: 'New Moon', energy: 'New Beginnings', priority: 10, emoji: '🌑', illumination: illuminationPercent, age: moonAge, isSignificant: true };
  } else if (moonAge >= 7.2 && moonAge <= 7.6) {
    return { name: 'First Quarter', energy: 'Action & Decision', priority: 10, emoji: '🌓', illumination: illuminationPercent, age: moonAge, isSignificant: true };
  } else if (moonAge >= 14.5 && moonAge <= 15.5) {
    const month = date.getMonth() + 1;
    const moonNames: { [key: number]: string } = {
      1: 'Wolf Moon', 2: 'Snow Moon', 3: 'Worm Moon', 4: 'Pink Moon',
      5: 'Flower Moon', 6: 'Strawberry Moon', 7: 'Buck Moon', 8: 'Sturgeon Moon',
      9: 'Harvest Moon', 10: 'Hunter Moon', 11: 'Beaver Moon', 12: 'Cold Moon'
    };
    const moonName = moonNames[month] || 'Full Moon';
    return { name: moonName, energy: 'Peak Power', priority: 10, emoji: '🌕', illumination: illuminationPercent, age: moonAge, isSignificant: true };
  } else if (moonAge >= 22.0 && moonAge <= 22.4) {
    return { name: 'Third Quarter', energy: 'Release & Letting Go', priority: 10, emoji: '🌗', illumination: illuminationPercent, age: moonAge, isSignificant: true };
  } else {
    // Non-significant phases
    if (moonAge < 7.2) {
      return { name: 'Waxing Crescent', energy: 'Growing Energy', priority: 2, emoji: '🌒', illumination: illuminationPercent, age: moonAge, isSignificant: false };
    } else if (moonAge < 14.5) {
      return { name: 'Waxing Gibbous', energy: 'Building Power', priority: 2, emoji: '🌔', illumination: illuminationPercent, age: moonAge, isSignificant: false };
    } else if (moonAge < 22.0) {
      return { name: 'Waning Gibbous', energy: 'Gratitude & Wisdom', priority: 2, emoji: '🌖', illumination: illuminationPercent, age: moonAge, isSignificant: false };
    } else {
      return { name: 'Waning Crescent', energy: 'Rest & Reflection', priority: 2, emoji: '🌘', illumination: illuminationPercent, age: moonAge, isSignificant: false };
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
        priority = (planetA === 'Jupiter' && planetB === 'Saturn') || (planetA === 'Saturn' && planetB === 'Jupiter') ? 9 : 7;
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
          orb
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
        sign: data.sign
      });
    }
  });
  
  return ingresses.sort((a, b) => b.priority - a.priority);
}

// Check for seasonal events using real solar position
function checkSeasonalEvents(positions: any): Array<any> {
  const sunLongitude = positions.Sun.longitude;
  const events: Array<any> = [];
  
  // Exact seasonal markers (within 1 degree)
  if (Math.abs(sunLongitude - 0) < 1 || Math.abs(sunLongitude - 360) < 1) {
    events.push({
      name: 'Spring Equinox',
      energy: 'Balance & New Growth',
      priority: 8,
      type: 'seasonal'
    });
  } else if (Math.abs(sunLongitude - 90) < 1) {
    events.push({
      name: 'Summer Solstice',
      energy: 'Maximum Solar Power',
      priority: 8,
      type: 'seasonal'
    });
  } else if (Math.abs(sunLongitude - 180) < 1) {
    events.push({
      name: 'Autumn Equinox',
      energy: 'Harvest & Reflection',
      priority: 8,
      type: 'seasonal'
    });
  } else if (Math.abs(sunLongitude - 270) < 1) {
    events.push({
      name: 'Winter Solstice',
      energy: 'Inner Light & Renewal',
      priority: 8,
      type: 'seasonal'
    });
  }
  
  return events;
}

// Generate astrological meaning for the primary event
function generateAstrologicalMeaning(primaryEvent: any, positions: any): string {
  const eventName = primaryEvent.name;

  // MOON PHASE EVENTS (Priority 1)
  if (primaryEvent.type === 'moon') {
    const moonSign = positions.Moon.sign;
    const sunSign = positions.Sun.sign;
    const moonSignDesc = getSignDescription(moonSign);
    const sunSignDesc = getSignDescription(sunSign);
    
    if (eventName.includes('New')) {
      return `🌑 New Moon: Sun in ${sunSign} conjunct Moon in ${moonSign} - conscious will aligns with unconscious needs through ${sunSignDesc} and ${moonSignDesc} energies. Perfect for setting intentions that honor both identity and emotions.`;
    }
    if (eventName.includes('Full') || eventName.includes('Wolf') || eventName.includes('Snow') || eventName.includes('Worm') || eventName.includes('Pink') || eventName.includes('Flower') || eventName.includes('Strawberry') || eventName.includes('Buck') || eventName.includes('Sturgeon') || eventName.includes('Harvest') || eventName.includes('Hunter') || eventName.includes('Beaver') || eventName.includes('Cold')) {
      return `🌕 ${eventName}: Sun in ${sunSign} opposite Moon in ${moonSign} - conscious will balances unconscious needs through ${sunSignDesc} versus ${moonSignDesc} energies. This opposition creates awareness and culmination.`;
    }
    if (eventName.includes('Quarter')) {
      return `${eventName.includes('First') ? '🌓' : '🌗'} ${eventName}: Sun in ${sunSign} square Moon in ${moonSign} - dynamic tension between ${sunSignDesc} identity and ${moonSignDesc} emotional needs creates motivation for growth and action.`;
    }
  }

  // ASPECT EVENTS (Priority 2)
  if (primaryEvent.aspect) {
    const planetA = primaryEvent.planetA;
    const planetB = primaryEvent.planetB;
    const signA = primaryEvent.signA;
    const signB = primaryEvent.signB;
    const aspect = primaryEvent.aspect;
    
    // For conjunctions, use the sign where they meet
    const aspectSign = aspect === 'conjunction' ? signA : signA;
    const signDesc = getSignDescription(aspectSign);
    
    const planetMeanings: { [key: string]: string } = {
      'Sun': 'identity', 'Moon': 'emotions', 'Mercury': 'mind', 'Venus': 'love',
      'Mars': 'action', 'Jupiter': 'expansion', 'Saturn': 'structure',
      'Uranus': 'innovation', 'Neptune': 'dreams'
    };
    
    const aspectMeanings: { [key: string]: string } = {
      'conjunction': 'unite energies',
      'sextile': 'create opportunities',
      'square': 'generate dynamic tension',
      'trine': 'flow harmoniously',
      'opposition': 'seek balance'
    };
    
    const planetAMeaning = planetMeanings[planetA] || planetA.toLowerCase();
    const planetBMeaning = planetMeanings[planetB] || planetB.toLowerCase();
    const aspectMeaning = aspectMeanings[aspect] || 'interact';
    
    if (aspect === 'conjunction' && (planetA === 'Jupiter' && planetB === 'Saturn' || planetA === 'Saturn' && planetB === 'Jupiter')) {
      return `♃♄ Jupiter (expansion) conjunct Saturn (structure) in ${aspectSign} - the "Great Conjunction" blends growth with discipline through ${signDesc} energy. This rare aspect reshapes how we build our future foundations.`;
    }
    
    return `${planetA} (${planetAMeaning}) ${aspect} ${planetB} (${planetBMeaning}) in ${aspectSign} - ${signDesc} energy shapes how these planetary themes ${aspectMeaning} for personal growth and expression.`;
  }

  // SIGN INGRESS EVENTS (Priority 3)
  if (primaryEvent.type === 'ingress') {
    const planet = primaryEvent.planet;
    const sign = primaryEvent.sign;
    const signDesc = getSignDescription(sign);
    
    const planetMeanings: { [key: string]: string } = {
      'Sun': 'core identity and life purpose',
      'Moon': 'emotional needs and instincts',
      'Mercury': 'communication and thinking patterns',
      'Venus': 'love, beauty, and values',
      'Mars': 'action, drive, and ambition',
      'Jupiter': 'growth, wisdom, and opportunities',
      'Saturn': 'structure, discipline, and long-term goals',
      'Uranus': 'innovation, freedom, and sudden changes',
      'Neptune': 'dreams, intuition, and spiritual connection'
    };
    
    const planetMeaning = planetMeanings[planet] || `${planet.toLowerCase()} energy`;
    return `${planet} enters ${sign} - ${planetMeaning} now expresses through ${signDesc} themes, bringing new approaches to how you handle ${planetMeaning.split(' and ')[0]}.`;
  }

  // SEASONAL EVENTS (Priority 4)
  if (primaryEvent.type === 'seasonal') {
    if (eventName.includes('Spring Equinox')) {
      return `🌸 Spring Equinox in Aries brings cardinal fire energy - initiating new cycles, fresh starts, and pioneering ventures. This marks the astrological new year when the Sun enters the first sign of the zodiac.`;
    }
    if (eventName.includes('Summer Solstice')) {
      return `☀️ Summer Solstice in Cancer brings cardinal water energy - nurturing growth, emotional security, and home foundations. The Sun reaches its peak power in the sign of the mother archetype.`;
    }
    if (eventName.includes('Autumn Equinox')) {
      return `🍂 Autumn Equinox in Libra brings cardinal air energy - seeking balance, harmony, and partnership. The Sun enters the sign of justice and relationships at this equilibrium point.`;
    }
    if (eventName.includes('Winter Solstice')) {
      return `❄️ Winter Solstice in Capricorn brings cardinal earth energy - building structures, achieving goals, and mastering challenges. The Sun enters the sign of the wise elder and mountain climber.`;
    }
  }

  // COSMIC FLOW (Fallback)
  return `Today's cosmic configuration emphasizes ${positions.Sun.sign} solar energy (${getSignDescription(positions.Sun.sign)}) while ${positions.Moon.sign} Moon adds ${getSignDescription(positions.Moon.sign)} emotional undertones to the day's experiences.`;
}

// Generate astronomical facts
function generateAstronomicalFacts(primaryEvent: any, positions: any, moonPhase: any): string {
  const eventName = primaryEvent.name;

  // MOON PHASE FACTS
  if (primaryEvent.type === 'moon') {
    if (eventName.includes('New')) {
      return `🌑 New Moon in ${positions.Moon.sign}: Luna aligns between Earth and Sun, making lunar surface invisible - ${Math.round(moonPhase.illumination)}% illuminated, age ${Math.round(moonPhase.age)} days`;
    }
    if (eventName.includes('Full') || eventName.includes('Wolf') || eventName.includes('Snow') || eventName.includes('Worm') || eventName.includes('Pink') || eventName.includes('Flower') || eventName.includes('Strawberry') || eventName.includes('Buck') || eventName.includes('Sturgeon') || eventName.includes('Harvest') || eventName.includes('Hunter') || eventName.includes('Beaver') || eventName.includes('Cold')) {
      return `🌕 ${eventName} in ${positions.Moon.sign}: Earth sits between Sun and Luna, fully illuminating lunar surface - ${Math.round(moonPhase.illumination)}% illuminated, age ${Math.round(moonPhase.age)} days`;
    }
    if (eventName.includes('Quarter')) {
      return `${eventName.includes('First') ? '🌓' : '🌗'} ${eventName} in ${positions.Moon.sign}: Moon shows exactly half illuminated at 90° Sun-Moon angle - ${Math.round(moonPhase.illumination)}% illuminated, age ${Math.round(moonPhase.age)} days`;
    }
  }

  // ASPECT FACTS
  if (primaryEvent.aspect) {
    const planetA = primaryEvent.planetA;
    const planetB = primaryEvent.planetB;
    const separation = primaryEvent.separation;
    const aspect = primaryEvent.aspect;
    
    return `${planetA} and ${planetB} form a ${aspect} aspect with ${separation}° separation - ${aspect === 'conjunction' ? 'uniting their energies' : aspect === 'trine' ? 'flowing harmoniously' : aspect === 'square' ? 'creating dynamic tension' : aspect === 'sextile' ? 'offering opportunities' : 'seeking balance'}.`;
  }

  // SIGN INGRESS FACTS
  if (primaryEvent.type === 'ingress') {
    return `${primaryEvent.planet} crosses into ${primaryEvent.sign} at ${Math.round(positions[primaryEvent.planet].longitude % 30)}° - planetary energy shifts to express through new zodiacal themes.`;
  }

  // SEASONAL FACTS
  if (primaryEvent.type === 'seasonal') {
    const sunLongitude = Math.round(positions.Sun.longitude);
    if (eventName.includes('Equinox')) {
      return `🌍 ${eventName}: Sun reaches ${sunLongitude}° longitude, creating equal day/night globally as Earth's axis tilts neither toward nor away from the Sun`;
    }
    if (eventName.includes('Solstice')) {
      return `☀️ ${eventName}: Sun reaches ${sunLongitude}° longitude, marking ${eventName.includes('Summer') ? 'maximum' : 'minimum'} daylight hours in the Northern Hemisphere`;
    }
  }

  // FALLBACK
  return `Current cosmic configuration in ${positions.Sun.sign} creates ${primaryEvent.energy.toLowerCase()} energy through natural celestial rhythms.`;
}

// Generate practical guidance
function generatePracticalGuidance(primaryEvent: any, positions: any): string {
  const eventName = primaryEvent.name;

  // MOON PHASE GUIDANCE
  if (primaryEvent.type === 'moon') {
    if (eventName.includes('New')) {
      return `Plant seeds of intention for new beginnings. This New Moon supports fresh starts and goal-setting. Write down intentions, start new habits, begin creative projects, or initiate conversations that open new possibilities.`;
    }
    if (eventName.includes('Full')) {
      return `Harness peak lunar energy for completion and manifestation. This Full Moon amplifies emotions and intuition. Finish important projects, celebrate achievements, practice gratitude, or release what no longer serves your highest good.`;
    }
    if (eventName.includes('Quarter')) {
      return `Take decisive action and overcome obstacles. This Quarter Moon provides energy for important decisions. Address challenges directly, make necessary course corrections, or push through resistance with determined effort.`;
    }
  }

  // ASPECT GUIDANCE
  if (primaryEvent.aspect) {
    const aspect = primaryEvent.aspect;
    const planetA = primaryEvent.planetA;
    const planetB = primaryEvent.planetB;
    
    if (aspect === 'conjunction') {
      if ((planetA === 'Venus' && planetB === 'Mars') || (planetA === 'Mars' && planetB === 'Venus')) {
        return `Balance passion with purpose in relationships and creative endeavors. Take initiative in love, start artistic projects, or pursue goals that require both heart and courage.`;
      }
      if ((planetA === 'Mercury' && planetB === 'Venus') || (planetA === 'Venus' && planetB === 'Mercury')) {
        return `Write, create, and communicate with grace today. Perfect timing for important emails, creative projects, or heart-to-heart discussions that require both logic and compassion.`;
      }
      return `Unite the energies of ${planetA} and ${planetB}. Focus on initiatives that combine their themes for integrated personal growth and manifestation.`;
    }
    
    if (aspect === 'trine') {
      return `Work with natural flow and effortless progress. This harmonious energy supports activities that align with your authentic self. Trust your instincts, collaborate with others, and allow opportunities to unfold organically.`;
    }
    
    if (aspect === 'square') {
      return `Channel tension into breakthrough action. This dynamic energy motivates change through constructive challenge. Push through resistance, tackle difficult conversations, or use pressure as fuel for innovative solutions.`;
    }
    
    return `Navigate the ${aspect} energy between ${planetA} and ${planetB} with awareness and intention.`;
  }

  // SEASONAL GUIDANCE
  if (primaryEvent.type === 'seasonal') {
    return `Embrace seasonal transformation and cosmic timing. This celestial turning point supports major life transitions and new chapters. Set intentions aligned with natural cycles, adjust your daily rhythms, or make commitments that honor seasonal energy.`;
  }

  // FALLBACK
  return `Navigate today's cosmic energies with intention and awareness. Pay attention to synchronicities, trust your intuition, and take inspired action that aligns with your authentic path and highest purpose.`;
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
      emoji: moonPhase.emoji
    });
  }
  
  // 2. EXTRAORDINARY PLANETARY EVENTS (Priority 9)
  const extraordinaryAspects = aspects.filter(a => a.priority >= 9);
  allEvents.push(...extraordinaryAspects);
  
  // 3. SIGN INGRESS (Priority 4)
  allEvents.push(...ingresses);
  
  // 4. DAILY ASPECTS (Priority 5-7)
  const dailyAspects = aspects.filter(a => a.priority < 9);
  allEvents.push(...dailyAspects);
  
  // 5. SEASONAL EVENTS (Priority 8)
  allEvents.push(...seasonalEvents);
  
  // 6. If no events, add cosmic flow
  if (allEvents.length === 0) {
    allEvents.push({
      name: 'Cosmic Flow',
      energy: 'Universal Harmony',
      priority: 1,
      type: 'general'
    });
  }
  
  // Sort by priority and select primary event
  allEvents.sort((a, b) => b.priority - a.priority);
  const primaryEvent = allEvents[0];
  
  // Generate content with requested structure
  const highlights = [];
  
  // FIRST: Remove the astrological meaning point (as requested)
  // SECOND: Astronomical facts with constellation info in brackets
  if (primaryEvent.aspect) {
    const planetA = primaryEvent.planetA;
    const planetB = primaryEvent.planetB;
    const signA = primaryEvent.signA;
    const signB = primaryEvent.signB;
    const separation = primaryEvent.separation;
    const aspect = primaryEvent.aspect;
    
    highlights.push(`${planetA} and ${planetB} form a ${aspect} aspect with ${separation}° separation (${planetA} in ${signA}, ${planetB} in ${signB}) - ${aspect === 'conjunction' ? 'uniting their energies' : aspect === 'trine' ? 'flowing harmoniously' : aspect === 'square' ? 'creating dynamic tension' : aspect === 'sextile' ? 'offering opportunities' : 'seeking balance'}.`);
  } else if (primaryEvent.type === 'moon') {
    highlights.push(`${primaryEvent.emoji} ${primaryEvent.name} in ${positions.Moon.sign}: ${primaryEvent.name.includes('New') ? 'Luna aligns between Earth and Sun' : primaryEvent.name.includes('Full') ? 'Earth sits between Sun and Luna' : 'Moon shows half illuminated'} - ${Math.round(moonPhase.illumination)}% illuminated, age ${Math.round(moonPhase.age)} days`);
  } else if (primaryEvent.type === 'seasonal') {
    const sunLongitude = Math.round(positions.Sun.longitude);
    highlights.push(`${primaryEvent.name}: Sun reaches ${sunLongitude}° longitude (Sun in ${positions.Sun.sign}) - ${primaryEvent.name.includes('Equinox') ? 'creating equal day/night globally' : 'marking maximum/minimum daylight hours'}`);
  } else {
    highlights.push(`Current cosmic configuration in ${positions.Sun.sign} creates ${primaryEvent.energy.toLowerCase()} energy through natural celestial rhythms`);
  }
  
  // THIRD & FOURTH: Secondary events with brief constellation info
  const secondaryEvents = allEvents.slice(1, 3);
  secondaryEvents.forEach(event => {
    if (event.type === 'ingress') {
      highlights.push(`${event.planet} enters ${event.sign} - planetary energy shifts to new themes`);
    } else if (event.aspect) {
      highlights.push(`${event.planetA}-${event.planetB} ${event.aspect} in ${event.signA}-${event.signB} - ${event.planetA} and ${event.planetB} ${event.aspect === 'trine' ? 'flow harmoniously' : event.aspect === 'square' ? 'create tension' : event.aspect === 'sextile' ? 'offer opportunities' : 'interact'}`);
    }
  });
  
  // Add moon phase if not primary event
  if (primaryEvent.type !== 'moon') {
    highlights.push(`${moonPhase.emoji} ${moonPhase.name} in ${positions.Moon.sign} - ${Math.round(moonPhase.illumination)}% illuminated`);
  }
  
  const horoscopeSnippet = generatePracticalGuidance(primaryEvent, positions);
  
  const postContent = {
    date: targetDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    primaryEvent: {
      name: primaryEvent.name,
      energy: primaryEvent.energy
    },
    highlights,
    horoscopeSnippet,
    callToAction: "Discover your personalized cosmic guidance at Lunary ✨",
    astronomicalData: {
      planets: Object.fromEntries(
        Object.entries(positions).map(([name, data]: [string, any]) => [
          name.toLowerCase(),
          {
            sign: data.sign,
            longitude: Math.round(data.longitude * 100) / 100,
            retrograde: data.retrograde
          }
        ])
      ),
      moonPhase: {
        name: moonPhase.name,
        illumination: Math.round(moonPhase.illumination),
        age: Math.round(moonPhase.age)
      },
      primaryEvent: {
        type: primaryEvent.type,
        priority: primaryEvent.priority,
        ...(primaryEvent.aspect && {
          aspect: primaryEvent.aspect,
          separation: primaryEvent.separation,
          orb: primaryEvent.orb
        })
      }
    }
  };
  
  return NextResponse.json(postContent);
} 