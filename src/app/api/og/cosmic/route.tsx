import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  aries,
  taurus,
  gemini,
  cancer,
  virgo,
  leo,
  sagittarius,
  capricorn,
  aquarius,
  pisces,
  libra,
  scorpio,
} from '@/app/icons';

// Server-side zodiac calculation
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

// Approximate planetary positions (for display purposes)
function getApproximatePlanetaryData(date: Date) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  // Starting positions for 2024-2025 (approximate)
  const year = date.getFullYear();
  const baseYear = 2024;
  const yearOffset = year - baseYear;

  // Simple approximations for display (not astronomically precise)
  return {
    sun: {
      longitude: (dayOfYear * 0.986) % 360, // ~1° per day
      sign: getZodiacSign((dayOfYear * 0.986) % 360),
    },
    moon: {
      longitude: (dayOfYear * 13.176) % 360, // ~13° per day
      sign: getZodiacSign((dayOfYear * 13.176) % 360),
    },
    mercury: {
      longitude: (45 + dayOfYear * 1.4 + yearOffset * 360) % 360, // Fast orbit
      sign: getZodiacSign((45 + dayOfYear * 1.4 + yearOffset * 360) % 360),
    },
    venus: {
      longitude: (120 + dayOfYear * 0.7 + yearOffset * 225) % 360, // ~225° per year
      sign: getZodiacSign((120 + dayOfYear * 0.7 + yearOffset * 225) % 360),
    },
    mars: {
      longitude: (210 + dayOfYear * 0.5 + yearOffset * 190) % 360, // ~190° per year
      sign: getZodiacSign((210 + dayOfYear * 0.5 + yearOffset * 190) % 360),
    },
    jupiter: {
      longitude: (45 + dayOfYear * 0.08 + yearOffset * 30) % 360, // ~30° per year
      sign: getZodiacSign((45 + dayOfYear * 0.08 + yearOffset * 30) % 360),
    },
    saturn: {
      longitude: (330 + dayOfYear * 0.033 + yearOffset * 12) % 360, // ~12° per year
      sign: getZodiacSign((330 + dayOfYear * 0.033 + yearOffset * 12) % 360),
    },
    uranus: {
      longitude: (60 + dayOfYear * 0.012 + yearOffset * 4.3) % 360, // ~4.3° per year
      sign: getZodiacSign((60 + dayOfYear * 0.012 + yearOffset * 4.3) % 360),
    },
    neptune: {
      longitude: (350 + dayOfYear * 0.006 + yearOffset * 2.2) % 360, // ~2.2° per year
      sign: getZodiacSign((350 + dayOfYear * 0.006 + yearOffset * 2.2) % 360),
    },
  };
}

// Generate informative descriptions for each event type
function getEventDescription(eventType: string, planetData: any): string {
  const eventDescriptions = {
    'Venus Rising': `Venus in ${planetData.venus.sign} brings heightened sensitivity to beauty, relationships, and creative expression. This is an ideal time for romantic connections, artistic endeavors, and cultivating harmony in your personal relationships.`,

    'Mars Power': `Mars in ${planetData.mars.sign} activates your drive and determination. This fiery energy supports bold initiatives, physical activities, and asserting your will. Channel this dynamic force toward your most important goals.`,

    'Jupiter Expansion': `Jupiter in ${planetData.jupiter.sign} opens doors to growth, learning, and new opportunities. This expansive energy favors education, travel, spiritual development, and broadening your horizons in meaningful ways.`,

    'Mercury Clarity': `Mercury in ${planetData.mercury.sign} sharpens mental faculties and communication abilities. This is perfect timing for important conversations, writing, learning new skills, and making clear-minded decisions.`,

    'Saturn Focus': `Saturn's disciplined energy helps you build lasting structures and achieve long-term goals. This is a time for commitment, responsibility, and turning your dreams into concrete reality through steady effort.`,

    'Neptune Dreams': `Neptune's mystical influence heightens intuition, creativity, and spiritual awareness. Trust your inner wisdom, pay attention to dreams and synchronicities, and explore your connection to the divine.`,

    'Uranus Innovation': `Uranus in ${planetData.uranus.sign} brings revolutionary energy and sudden insights that can transform your perspective. This innovative planet encourages you to break free from limiting patterns and embrace unexpected opportunities for growth and change.`,

    'Cosmic Flow': `Universal energies create perfect alignment between your intentions and manifestation. This harmonious time supports effortless progress and natural synchronicity in all areas of life.`,

    'New Moon': `The New Moon in ${planetData.moon.sign} marks a powerful time for setting intentions and planting seeds for future growth. Focus your energy on new beginnings and manifestation work while the lunar energy supports fresh starts.`,

    'Full Moon': `The Full Moon in ${planetData.moon.sign} brings peak energy and culmination. This is a time of completion, release, and celebrating the fruition of your efforts. Emotional clarity and revelation are heightened under this illuminating lunar light.`,

    'First Quarter': `The First Quarter Moon in ${planetData.moon.sign} presents a moment of decision and action. Overcome obstacles with determination and make the choices that will propel your goals forward with focused lunar energy.`,

    'Third Quarter': `The Third Quarter Moon in ${planetData.moon.sign} calls for release and letting go. This powerful lunar phase supports breaking free from what no longer serves you and making space for new growth and opportunities.`,

    'Waxing Crescent (Day 1)': `The early Waxing Crescent Moon in ${planetData.moon.sign} supports building momentum on your new intentions. Take the first inspired actions and nurture the seeds you planted during the New Moon with gentle, consistent effort.`,

    'Waxing Crescent (Day 2)': `The growing Waxing Crescent Moon in ${planetData.moon.sign} encourages continued progress on your goals. This is a time for taking small but meaningful steps forward while staying connected to your original intentions.`,

    'Waxing Crescent (Day 3)': `The strengthening Waxing Crescent Moon in ${planetData.moon.sign} builds energy for manifestation. Focus on actions that align with your intentions and trust in the gradual unfolding of your plans.`,

    'Waxing Crescent (Day 4)': `The maturing Waxing Crescent Moon in ${planetData.moon.sign} provides steady energy for growth. Continue nurturing your projects with patience and persistence as lunar energy supports gradual development.`,

    'Waxing Crescent (Day 5)': `The advancing Waxing Crescent Moon in ${planetData.moon.sign} calls for sustained effort toward your goals. This phase supports building foundations and establishing routines that will serve your long-term vision.`,

    'Waxing Crescent (Day 6)': `The late Waxing Crescent Moon in ${planetData.moon.sign} prepares for the upcoming First Quarter energy. Use this time to refine your approach and prepare for the decisions and actions that lie ahead.`,

    'Waxing Crescent (Day 7)': `The final Waxing Crescent Moon in ${planetData.moon.sign} builds toward decision-making energy. Prepare to take more decisive action as the moon approaches its First Quarter phase of determined progress.`,

    'Waxing Gibbous (Day 1)': `The early Waxing Gibbous Moon in ${planetData.moon.sign} calls for refinement and adjustment. Fine-tune your approach and prepare for the culmination that the approaching Full Moon will bring.`,

    'Waxing Gibbous (Day 2)': `The building Waxing Gibbous Moon in ${planetData.moon.sign} supports perfecting your methods and making necessary adjustments. This phase encourages attention to detail as energy builds toward completion.`,

    'Waxing Gibbous (Day 3)': `The intensifying Waxing Gibbous Moon in ${planetData.moon.sign} brings focused energy for final preparations. Polish your projects and align your efforts with the powerful culmination energy approaching.`,

    'Waxing Gibbous (Day 4)': `The late Waxing Gibbous Moon in ${planetData.moon.sign} prepares for peak manifestation energy. Trust in your progress and prepare to celebrate the fruition of your dedicated efforts.`,

    'Waxing Gibbous (Day 5)': `The final Waxing Gibbous Moon in ${planetData.moon.sign} builds anticipation for the Full Moon culmination. Complete final details and prepare to witness the full flowering of your intentions.`,

    'Waning Gibbous (Day 1)': `The early Waning Gibbous Moon in ${planetData.moon.sign} brings gratitude and wisdom from recent culminations. This is a time for appreciating achievements and integrating the lessons learned from your Full Moon experiences.`,

    'Waning Gibbous (Day 2)': `The reflective Waning Gibbous Moon in ${planetData.moon.sign} encourages sharing wisdom and celebrating what has been accomplished. This phase supports teaching others and expressing gratitude for your journey.`,

    'Waning Gibbous (Day 3)': `The generous Waning Gibbous Moon in ${planetData.moon.sign} calls for giving back and sharing your abundance. This is an ideal time for mentoring, charitable acts, and spreading the wisdom you've gained.`,

    'Waning Gibbous (Day 4)': `The wise Waning Gibbous Moon in ${planetData.moon.sign} supports deep reflection and integration of recent experiences. Use this time for journaling, meditation, and processing the insights from your recent achievements.`,

    'Waning Gibbous (Day 5)': `The transitioning Waning Gibbous Moon in ${planetData.moon.sign} prepares for the release energy of the Third Quarter. Begin identifying what needs to be released to make space for your next cycle of growth.`,

    'Waning Gibbous (Day 6)': `The late Waning Gibbous Moon in ${planetData.moon.sign} encourages letting go of what has served its purpose. Prepare for the decisive release energy of the approaching Third Quarter Moon.`,

    'Waning Crescent (Day 1)': `The early Waning Crescent Moon in ${planetData.moon.sign} begins the final phase of rest and reflection. This is a time for deep introspection and preparing for the new cycle that approaches with the coming New Moon.`,

    'Waning Crescent (Day 2)': `The quiet Waning Crescent Moon in ${planetData.moon.sign} calls for solitude and inner contemplation. Use this peaceful energy for meditation, dream work, and connecting with your inner wisdom.`,

    'Waning Crescent (Day 3)': `The gentle Waning Crescent Moon in ${planetData.moon.sign} supports spiritual practices and intuitive development. This is an ideal time for energy healing, divination, and deep spiritual connection.`,

    'Waning Crescent (Day 4)': `The fading Waning Crescent Moon in ${planetData.moon.sign} encourages complete surrender and trust in the cosmic cycle. Release any remaining attachments and prepare for the fresh start of the approaching New Moon.`,

    'Waning Crescent (Day 5)': `The final Waning Crescent Moon in ${planetData.moon.sign} completes the lunar cycle with wisdom and peace. This is the perfect time for forgiveness, final releases, and setting intentions for your upcoming new beginning.`,

    'Spring Equinox': `The Spring Equinox marks perfect balance between light and dark, heralding new growth and fresh beginnings. This potent time of equilibrium supports planting seeds for future manifestations and embracing renewal in all areas of life.`,

    'Summer Solstice': `The Summer Solstice brings maximum solar power and the year's longest day. This peak solar energy amplifies manifestation abilities, creativity, and personal power. It's the perfect time to celebrate achievements and embrace your full potential.`,

    'Autumn Equinox': `The Autumn Equinox brings balance and harvest energy as day and night reach equilibrium. This is a time for gratitude, reflection on growth, and preparing for the introspective months ahead through wisdom and grounding.`,

    'Winter Solstice': `The Winter Solstice marks the return of light after the year's longest night. This sacred turning point celebrates inner illumination, spiritual renewal, and the promise of new cycles beginning through contemplation and hope.`,

    'Perseid Meteors': `The Perseid meteor shower brings swift cosmic inspiration as Earth passes through Comet Swift-Tuttle's debris trail. These brilliant shooting stars ignite intuition, spark creativity, and remind us of our connection to the greater cosmos.`,

    'Geminid Meteors': `The Geminid meteor shower offers the year's most spectacular celestial light show, with up to 120 meteors per hour. These brilliant fragments inspire communication, mental agility, and profound insights into life's dualities.`,

    'Leonid Meteors': `The Leonid meteors streak across the sky with leonine courage and transformative power. These swift celestial messengers inspire bold action, leadership qualities, and the courage to roar your truth into the universe.`,
  };

  return (
    eventDescriptions[eventType as keyof typeof eventDescriptions] ||
    'The cosmic energies support your spiritual growth and conscious evolution today.'
  );
}

// Check for major astronomical events
function getSignificantAstronomicalEvents(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const events = [];

  // SEASONAL MARKERS - Equinoxes & Solstices (Priority 10) - 1 day each
  if (month === 3 && day === 20) {
    events.push({
      name: 'Spring Equinox',
      emoji: '🌸',
      energy: 'Balance & New Growth',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 0° - Spring begins',
      priority: 10,
    });
  }
  if (month === 6 && day === 21) {
    events.push({
      name: 'Summer Solstice',
      emoji: '☀️',
      energy: 'Maximum Solar Power',
      description: 'Longest day of the year',
      detail: 'Solar longitude 90° - Peak solar energy',
      priority: 10,
    });
  }
  if (month === 9 && day === 23) {
    events.push({
      name: 'Autumn Equinox',
      emoji: '🍂',
      energy: 'Harvest & Reflection',
      description: 'Day and night in perfect balance',
      detail: 'Solar longitude 180° - Autumn begins',
      priority: 10,
    });
  }
  if (month === 12 && day === 21) {
    events.push({
      name: 'Winter Solstice',
      emoji: '❄️',
      energy: 'Inner Light & Renewal',
      description: 'Longest night of the year',
      detail: 'Solar longitude 270° - Return of the light',
      priority: 10,
    });
  }

  // CROSS-QUARTER DAYS (Priority 9) - 1 day each
  if (month === 2 && day === 4) {
    events.push({
      name: 'Imbolc Cross-Quarter',
      emoji: '🕯️',
      energy: 'Midwinter Light',
      description: 'First stirring of spring',
      detail: 'Midpoint between Winter Solstice and Spring Equinox',
      priority: 9,
    });
  }
  if (month === 5 && day === 6) {
    events.push({
      name: 'Beltane Cross-Quarter',
      emoji: '🌸',
      energy: 'Spring Peak',
      description: 'Peak fertility season',
      detail: 'Midpoint between Spring Equinox and Summer Solstice',
      priority: 9,
    });
  }
  if (month === 8 && day === 7) {
    events.push({
      name: 'Lughnasadh Cross-Quarter',
      emoji: '🌾',
      energy: 'Summer Harvest',
      description: 'First harvest celebration',
      detail: 'Midpoint between Summer Solstice and Autumn Equinox',
      priority: 9,
    });
  }
  if (month === 10 && day === 31) {
    events.push({
      name: 'Samhain Cross-Quarter',
      emoji: '🍂',
      energy: 'Veil Thinning',
      description: 'Boundary between worlds',
      detail: 'Midpoint between Autumn Equinox and Winter Solstice',
      priority: 9,
    });
  }

  return events;
}

// Planet data structure with proper separation
const planets = {
  sun: { name: 'Sun', symbol: 'S' },
  moon: { name: 'Moon', symbol: 'R' },
  mercury: { name: 'Mercury', symbol: 'T' },
  venus: { name: 'Venus', symbol: 'Q' },
  mars: { name: 'Mars', symbol: 'U' },
  jupiter: { name: 'Jupiter', symbol: 'V' },
  saturn: { name: 'Saturn', symbol: 'W' },
  uranus: { name: 'Uranus', symbol: 'X' },
  neptune: { name: 'Neptune', symbol: 'Y' },
  pluto: { name: 'Pluto', symbol: 'Z' },
};

// Aspect glyphs
const aspectGlyphs = {
  conjunction: '!', // 0°
  semiSextile: '&', // 30°
  sextile: '%', // 60°
  square: '#', // 90°
  trine: '$', // 120°
  quincunx: "'", // 150°
  opposition: '"', // 180°
};

// Zodiac/Constellation data
const zodiacSigns = {
  aries: { symbol: 'A', name: 'Aries' },
  taurus: { symbol: 'B', name: 'Taurus' },
  gemini: { symbol: 'C', name: 'Gemini' },
  cancer: { symbol: 'D', name: 'Cancer' },
  leo: { symbol: 'E', name: 'Leo' },
  virgo: { symbol: 'F', name: 'Virgo' },
  libra: { symbol: 'G', name: 'Libra' },
  scorpio: { symbol: 'H', name: 'Scorpio' },
  sagittarius: { symbol: 'I', name: 'Sagittarius' },
  capricorn: { symbol: 'J', name: 'Capricorn' },
  aquarius: { symbol: 'K', name: 'Aquarius' },
  pisces: { symbol: 'L', name: 'Pisces' },
};

function generateMainAstronomicalEvent(date: Date, planetaryData: any) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  // Enhanced aspects with proper planet separation
  const aspects = [
    // GREAT CONJUNCTIONS
    {
      name: 'Great Saturn Conjunction',
      aspect: 'great-conjunction',
      glyph: '!',
      planetA: {
        name: 'Saturn',
        symbol: 'W',
        planet: 'saturn',
        constellation: 'Gemini',
        constellationSymbol: 'C',
      },
      planetB: {
        name: 'Neptune',
        symbol: 'Y',
        planet: 'neptune',
        constellation: 'Capricorn',
        constellationSymbol: 'J',
      },
      energy: 'Era-Defining Alignment',
      priority: 10,
    },
    {
      name: 'Jupiter-Uranus Great Conjunction',
      aspect: 'great-conjunction',
      glyph: '!',
      planetA: {
        name: 'Jupiter',
        symbol: 'V',
        planet: 'jupiter',
        constellation: 'Taurus',
        constellationSymbol: 'B',
      },
      planetB: {
        name: 'Uranus',
        symbol: 'X',
        planet: 'uranus',
        constellation: 'Gemini',
        constellationSymbol: 'C',
      },
      energy: 'Revolutionary Expansion',
      priority: 10,
    },

    // REGULAR CONJUNCTIONS
    {
      name: 'Mercury-Venus semi-sextile',
      aspect: 'semi-sextile',
      glyph: '&',
      planetA: {
        name: 'Mercury',
        symbol: 'T',
        planet: 'mercury',
        constellation: 'Leo',
        constellationSymbol: 'E',
      },
      planetB: {
        name: 'Venus',
        symbol: 'Q',
        planet: 'venus',
        constellation: 'Virgo',
        constellationSymbol: 'F',
      },
      energy: 'Mental-Relationship Harmony',
      priority: 7,
    },
    {
      name: 'Venus-Mars conjunction',
      aspect: 'conjunction',
      glyph: '!',
      planetA: {
        name: 'Venus',
        symbol: 'Q',
        planet: 'venus',
        constellation: 'Virgo',
        constellationSymbol: 'F',
      },
      planetB: {
        name: 'Mars',
        symbol: 'U',
        planet: 'mars',
        constellation: 'Cancer',
        constellationSymbol: 'D',
      },
      energy: 'Love & Passion Unite',
      priority: 8,
    },

    // TRINES
    {
      name: 'Sun-Jupiter trine',
      aspect: 'trine',
      glyph: '$',
      planetA: {
        name: 'Sun',
        symbol: 'S',
        planet: 'sun',
        constellation: 'Leo',
        constellationSymbol: 'E',
      },
      planetB: {
        name: 'Jupiter',
        symbol: 'V',
        planet: 'jupiter',
        constellation: 'Sagittarius',
        constellationSymbol: 'I',
      },
      energy: 'Confidence & Luck Flow',
      priority: 7,
    },
  ];

  const sortedAspects = aspects.sort((a, b) => b.priority - a.priority);
  return sortedAspects[dayOfYear % sortedAspects.length];
}

// Font loading functions
async function loadAstronomiconFont() {
  try {
    // Load the local Astronomicon font file using fs
    const fs = require('fs');
    const path = require('path');
    const fontPath = path.join(
      process.cwd(),
      'src',
      'fonts',
      'Astronomicon.ttf',
    );
    const fontData = fs.readFileSync(fontPath);
    return fontData;
  } catch (error) {
    console.error('Failed to load Astronomicon font:', error);
    return null;
  }
}

async function loadGoogleFont(font: string, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype)'\)/,
    );

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status == 200) {
        return await response.arrayBuffer();
      }
    }

    throw new Error('failed to load font data');
  } catch (error) {
    console.error('Failed to load Google font:', error);
    return null;
  }
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

  const planetaryData = getApproximatePlanetaryData(targetDate);
  const astronomicalEvents = getSignificantAstronomicalEvents(targetDate);

  // Calculate moon phase (simplified version for reliability)
  const knownNewMoon = new Date('2024-08-04');
  const daysSinceNew = Math.floor(
    (targetDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24),
  );
  const lunarCycle = 29.530588853;
  const lunarDay = daysSinceNew % lunarCycle;

  let moonPhase;

  if (lunarDay < 1) {
    moonPhase = {
      name: 'New Moon',
      emoji: 'R',
      energy: 'New Beginnings',
      description: 'Lunar reset cycle',
      detail: 'Moon invisible from Earth',
      priority: 1,
    };
  } else if (lunarDay < 7.4) {
    const dayPhase = Math.floor(lunarDay) + 1;
    moonPhase = {
      name: `Waxing Crescent (Day ${dayPhase})`,
      emoji: 'R',
      energy: 'Growing Energy',
      description: 'Building lunar energy',
      detail: `${Math.round((lunarDay / lunarCycle) * 100)}% illuminated`,
      priority: 1,
    };
  } else if (lunarDay < 9.2) {
    moonPhase = {
      name: 'First Quarter',
      emoji: 'R',
      energy: 'Decision Making',
      description: 'Half moon rising',
      detail: '50% illuminated',
      priority: 1,
    };
  } else if (lunarDay < 14.8) {
    const dayPhase = Math.floor(lunarDay - 9) + 1;
    moonPhase = {
      name: `Waxing Gibbous (Day ${dayPhase})`,
      emoji: 'R',
      energy: 'Building Energy',
      description: 'Approaching fullness',
      detail: `${Math.round((lunarDay / lunarCycle) * 100)}% illuminated`,
      priority: 1,
    };
  } else if (lunarDay < 16.2) {
    // Use traditional full moon names
    const month = targetDate.getMonth() + 1;
    let moonName = 'Full Moon';
    let moonEnergy = 'Peak Power';

    if (month === 1) moonName = 'Wolf Moon';
    else if (month === 2) moonName = 'Snow Moon';
    else if (month === 3) moonName = 'Worm Moon';
    else if (month === 4) moonName = 'Pink Moon';
    else if (month === 5) moonName = 'Flower Moon';
    else if (month === 6) moonName = 'Strawberry Moon';
    else if (month === 7) moonName = 'Buck Moon';
    else if (month === 8) moonName = 'Sturgeon Moon';
    else if (month === 9) moonName = 'Harvest Moon';
    else if (month === 10) moonName = 'Hunter Moon';
    else if (month === 11) moonName = 'Beaver Moon';
    else if (month === 12) moonName = 'Cold Moon';

    moonPhase = {
      name: moonName,
      emoji: 'R',
      energy: moonEnergy,
      description: 'Maximum lunar energy',
      detail: '100% illuminated',
      priority: 8,
    };
  } else if (lunarDay < 22) {
    const dayPhase = Math.floor(lunarDay - 16) + 1;
    moonPhase = {
      name: `Waning Gibbous (Day ${dayPhase})`,
      emoji: 'R',
      energy: 'Gratitude & Wisdom',
      description: 'Releasing energy',
      detail: `${Math.round(((lunarCycle - lunarDay) / lunarCycle) * 100)}% illuminated`,
      priority: 1,
    };
  } else if (lunarDay < 24) {
    moonPhase = {
      name: 'Third Quarter',
      emoji: 'R',
      energy: 'Release & Letting Go',
      description: 'Half moon setting',
      detail: '50% illuminated',
      priority: 1,
    };
  } else {
    const dayPhase = Math.floor(lunarDay - 24) + 1;
    moonPhase = {
      name: `Waning Crescent (Day ${dayPhase})`,
      emoji: 'R',
      energy: 'Release & Surrender',
      description: 'Final lunar phase',
      detail: `${Math.round(((lunarCycle - lunarDay) / lunarCycle) * 100)}% illuminated`,
      priority: 1,
    };
  }

  // Determine primary event
  let allEvents = [...astronomicalEvents];

  // Add significant moon phases
  if (lunarDay >= 0 && lunarDay < 0.5) {
    allEvents.push({
      name: 'New Moon',
      emoji: '🌑',
      energy: 'New Beginnings',
      description: 'Lunar reset cycle',
      detail: 'Moon invisible from Earth',
      priority: 5,
    });
  } else if (lunarDay >= 7.3 && lunarDay < 7.8) {
    allEvents.push({
      name: 'First Quarter',
      emoji: '🌓',
      energy: 'Action & Decision',
      description: 'Half moon rising',
      detail: '50% illuminated',
      priority: 5,
    });
  } else if (lunarDay >= 14.7 && lunarDay < 15.2) {
    allEvents.push(moonPhase);
  } else if (lunarDay >= 22.1 && lunarDay < 22.6) {
    allEvents.push({
      name: 'Third Quarter',
      emoji: '🌗',
      energy: 'Release & Letting Go',
      description: 'Half moon setting',
      detail: '50% illuminated',
      priority: 5,
    });
  }

  // Always add main aspect event
  const mainAspect = generateMainAstronomicalEvent(targetDate, planetaryData);
  allEvents.push(mainAspect as any);

  // Sort by priority and select the highest
  allEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const primaryEvent = allEvents[0];

  // Get dynamic visual theme
  const getEventTheme = (event: any) => {
    const dayVariation = daysSinceNew % 5;
    const themes = [
      {
        background: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)',
        accent: '#b19cd9',
      },
      {
        background: 'linear-gradient(135deg, #1a1a2e, #2d3561)',
        accent: '#87ceeb',
      },
      {
        background: 'linear-gradient(135deg, #2c3e50, #34495e)',
        accent: '#dda0dd',
      },
      {
        background: 'linear-gradient(135deg, #1e2a3a, #2c3e50)',
        accent: '#87cefa',
      },
      {
        background: 'linear-gradient(135deg, #1a2332, #1e3c72)',
        accent: '#f0a0a0',
      },
    ];

    return {
      ...themes[dayVariation],
      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
    };
  };

  const theme = getEventTheme(primaryEvent);

  // Format date for display
  const formattedDate = targetDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '/');

  // Check if this is an aspect event
  const isAspectEvent =
    (primaryEvent as any).planetA &&
    (primaryEvent as any).planetB &&
    (primaryEvent as any).aspect;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: theme.background,
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 40px',
          justifyContent: 'space-between',
        }}
      >

        {/* Event Title */}
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
              fontSize: '32px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              fontFamily: 'Roboto Mono',
            }}
          >
            {primaryEvent.name}
          </div>
        </div>

        {isAspectEvent ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'stretch',
              width: '100%',
              flex: 1,
              padding: '0 200px',
            }}
          >
            {/* Three column layout: Planet A | Aspect | Planet B */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '200px',
                width: '100%',
                height: '90%',
              }}
            >
              {/* Planet A Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                {/* Planet A Name */}
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '50px',
                  }}
                >
                  {(primaryEvent as any).planetA.name}
                </div>

                {/* Planet A Symbol */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '180px',
                    height: '180px',
                    // backgroundColor: theme.accent,
                    borderRadius: '20px',
                    marginBottom: '70px',
                  }}>
                  <div
                    style={{
                      fontSize: '222px',
                      color: 'white',
                      lineHeight: '1',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {planets[
                      (
                        primaryEvent as any
                      ).planetA.planet?.toLowerCase() as keyof typeof planets
                    ]?.symbol || (primaryEvent as any).planetA.symbol}
                  </div>
                </div>

                {/* Planet A Constellation */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: '300',
                      color: 'white',
                      fontFamily: 'Roboto Mono',
                      paddingBottom: '10px',
                    }}
                  >
                    {(primaryEvent as any).planetA.constellation}
                  </div>
                  <div
                    style={{
                      fontSize: '72px',
                      color: 'white',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {zodiacSigns[
                      (
                        primaryEvent as any
                      ).planetA.constellation?.toLowerCase() as keyof typeof zodiacSigns
                    ]?.symbol ||
                      (primaryEvent as any).planetA.constellationSymbol}
                  </div>
                </div>
              </div>

              {/* Aspect Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  flex: 1,
                  height: '400px',
                  marginTop: '-78px',
                }}
              >
                {/* Aspect Name */}
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    fontFamily: 'Roboto Mono',
                  }}
                >
                  {(primaryEvent as any).aspect?.replace('-', ' ') ||
                    'Conjunction'}
                </div>

                {/* Aspect Glyph */}
                <div
                  style={{
                    fontSize: '222px',
                    color: 'white',
                    lineHeight: '1',
                    width: '180px',
                    height: '180px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Astronomicon',
                    marginBottom: '150px',
                    marginTop: '75px',
                  }}
                >
                  {aspectGlyphs[
                    (primaryEvent as any).aspect as keyof typeof aspectGlyphs
                  ] || '!'}
                </div>

                {/* Date */}
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    fontFamily: 'Roboto Mono',
                  }}
                >
                  {formattedDate}
                </div>
              </div>

              {/* Planet B Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: 1,
                }}
              >
                {/* Planet B Name */}
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: '300',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '50px',
                  }}
                >
                  {(primaryEvent as any).planetB.name}
                </div>

                {/* Planet B Symbol */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '180px',
                    height: '180px',
                    borderRadius: '20px',
                    marginBottom: '70px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '222px',
                      color: 'white',
                      lineHeight: '1',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {planets[
                      (
                        primaryEvent as any
                      ).planetB.planet?.toLowerCase() as keyof typeof planets
                    ]?.symbol || (primaryEvent as any).planetB.symbol}
                  </div>
                </div>

                {/* Planet B Constellation */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: '300',
                      color: 'white',
                      fontFamily: 'Roboto Mono',
                      paddingBottom: '10px',
                    }}
                  >
                    {(primaryEvent as any).planetB.constellation}
                  </div>
                  <div
                    style={{
                      fontSize: '72px',
                      color: 'white',
                      fontFamily: 'Astronomicon',
                    }}
                  >
                    {zodiacSigns[
                      (
                        primaryEvent as any
                      ).planetB.constellation?.toLowerCase() as keyof typeof zodiacSigns
                    ]?.symbol ||
                      (primaryEvent as any).planetB.constellationSymbol}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Single Event Layout - for moon phases and astronomical events
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '80px',
              justifyContent: 'center',
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: '200px',
                color: 'white',
                lineHeight: '1',
                fontFamily: 'Astronomicon',
              }}
            >
              {planets.moon.symbol}
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                fontFamily: 'Roboto Mono',
              }}
            >
              {formattedDate}
            </div>
          </div>
        )}

        {/* Footer */}
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
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: [
        {
          name: 'Astronomicon',
          data: (await loadAstronomiconFont()) || new ArrayBuffer(0),
          style: 'normal',
        },
        {
          name: 'Roboto Mono',
          data: await loadGoogleFont(
            'Roboto+Mono:wght@300;400;700',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /.:',
          ),
          style: 'normal',
        },
      ],
    },
  );
}
