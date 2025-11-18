// Weekly cosmic content generator for blog and newsletter
import {
  Observer,
  AstroTime,
  Body,
  GeoVector,
  Ecliptic,
  Illumination,
  MoonPhase,
} from 'astronomy-engine';
import {
  crystalDatabase,
  getCrystalsByZodiacSign,
  type Crystal,
} from '../../src/constants/grimoire/crystals';

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

export interface WeeklyCosmicData {
  weekStart: Date;
  weekEnd: Date;
  title: string;
  subtitle: string;
  summary: string;

  // Astronomical highlights
  planetaryHighlights: PlanetaryHighlight[];
  retrogradeChanges: RetrogradeChange[];
  signIngresses: SignIngress[];
  majorAspects: MajorAspect[];
  moonPhases: MoonPhaseEvent[];
  seasonalEvents: SeasonalEvent[];

  // Daily breakdowns
  dailyForecasts: DailyForecast[];

  // Practical guidance
  bestDaysFor: BestDaysGuidance;
  crystalRecommendations: WeeklyCrystalGuide[];
  magicalTiming: MagicalTimingGuide;

  // Content metadata
  generatedAt: string;
  weekNumber: number;
  year: number;
}

export interface PlanetaryHighlight {
  planet: string;
  event: 'enters-sign' | 'goes-retrograde' | 'goes-direct' | 'major-aspect';
  date: Date;
  description: string;
  significance: 'low' | 'medium' | 'high' | 'extraordinary';
  details: {
    fromSign?: string;
    toSign?: string;
    aspectWith?: string;
    aspectType?: string;
  };
}

export interface RetrogradeChange {
  planet: string;
  date: Date;
  action: 'begins' | 'ends';
  sign: string;
  duration?: string;
  significance: string;
  guidance: string;
}

export interface SignIngress {
  planet: string;
  date: Date;
  fromSign: string;
  toSign: string;
  significance: string;
  energy: string;
}

export interface MajorAspect {
  planetA: string;
  planetB: string;
  aspect: string;
  date: Date;
  exactTime?: string;
  significance: 'low' | 'medium' | 'high' | 'extraordinary';
  energy: string;
  guidance: string;
}

export interface MoonPhaseEvent {
  phase: string;
  date: Date;
  time: string;
  sign: string;
  energy: string;
  guidance: string;
  ritualSuggestions: string[];
}

export interface SeasonalEvent {
  name: string;
  date: Date;
  type: 'equinox' | 'solstice' | 'cross-quarter';
  significance: string;
  energy: string;
}

export interface DailyForecast {
  date: Date;
  dayOfWeek: string;
  planetaryRuler: string;
  moonSign: string;
  majorEvents: string[];
  energy: string;
  guidance: string;
  avoid: string[];
}

export interface BestDaysGuidance {
  love: { dates: Date[]; reason: string };
  prosperity: { dates: Date[]; reason: string };
  healing: { dates: Date[]; reason: string };
  protection: { dates: Date[]; reason: string };
  manifestation: { dates: Date[]; reason: string };
  cleansing: { dates: Date[]; reason: string };
}

export interface WeeklyCrystalGuide {
  date: Date;
  crystal: string;
  reason: string;
  usage: string;
  chakra: string;
  intention: string;
}

export interface MagicalTimingGuide {
  powerDays: Date[];
  voidOfCourseMoon: Array<{ start: Date; end: Date; guidance: string }>;
  planetaryHours: Array<{ planet: string; bestFor: string[]; dates: Date[] }>;
  eclipses: Array<{ type: string; date: Date; sign: string; guidance: string }>;
}

// Generate comprehensive weekly content
export async function generateWeeklyContent(
  startDate: Date,
): Promise<WeeklyCosmicData> {
  const weekStart = new Date(startDate);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Skip expensive generation in test mode - return lightweight mock data
  const isTestMode =
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined;

  if (isTestMode) {
    // Calculate week number manually (getWeekNumber is defined later in file)
    const startOfYear = new Date(weekStart.getFullYear(), 0, 1);
    const daysSinceStartOfYear = Math.floor(
      (weekStart.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil(
      (daysSinceStartOfYear + startOfYear.getDay() + 1) / 7,
    );

    return {
      weekStart,
      weekEnd,
      title: `Week ${weekNumber} - Test Mode`,
      subtitle: 'Mock cosmic data for testing',
      summary:
        'This is mock data generated in test mode to avoid expensive computation.',
      planetaryHighlights: [],
      retrogradeChanges: [],
      signIngresses: [],
      majorAspects: [],
      moonPhases: [],
      seasonalEvents: [],
      dailyForecasts: [],
      bestDaysFor: {
        manifestation: { dates: [], reason: '' },
        release: { dates: [], reason: '' },
        connection: { dates: [], reason: '' },
        action: { dates: [], reason: '' },
        rest: { dates: [], reason: '' },
        cleansing: { dates: [], reason: '' },
      },
      crystalRecommendations: [],
      magicalTiming: {
        powerDays: [],
        voidOfCourseMoon: [],
        planetaryHours: [],
        eclipses: [],
      },
      generatedAt: new Date().toISOString(),
      weekNumber,
      year: weekStart.getFullYear(),
    };
  }

  console.log(
    `🗓️ Generating weekly content for ${weekStart.toDateString()} - ${weekEnd.toDateString()}`,
  );

  // Generate all astronomical data for the week (aspects and moon phases needed for daily forecasts)
  const [
    planetaryHighlights,
    retrogradeChanges,
    signIngresses,
    majorAspects,
    moonPhases,
    seasonalEvents,
  ] = await Promise.all([
    generatePlanetaryHighlights(weekStart, weekEnd),
    detectRetrogradeChanges(weekStart, weekEnd),
    detectSignIngresses(weekStart, weekEnd),
    findMajorAspects(weekStart, weekEnd),
    calculateMoonPhases(weekStart, weekEnd),
    checkSeasonalEvents(weekStart, weekEnd),
  ]);

  // Generate daily forecasts with aspects and moon phases for context
  const dailyForecasts = await generateDailyForecasts(
    weekStart,
    weekEnd,
    majorAspects,
    moonPhases,
  );

  // Generate practical guidance
  const bestDaysFor = generateBestDaysGuidance(
    dailyForecasts,
    majorAspects,
    moonPhases,
  );
  const crystalRecommendations = generateWeeklyCrystalGuide(dailyForecasts);
  const magicalTiming = generateMagicalTimingGuide(
    weekStart,
    weekEnd,
    moonPhases,
  );

  // Generate title and summary
  const title = generateWeeklyTitle(weekStart, planetaryHighlights, moonPhases);
  const subtitle = generateWeeklySubtitle(majorAspects, retrogradeChanges);
  const summary = generateWeeklySummary(
    planetaryHighlights,
    majorAspects,
    moonPhases,
  );

  const weekNumber = getWeekNumber(weekStart);

  return {
    weekStart,
    weekEnd,
    title,
    subtitle,
    summary,
    planetaryHighlights,
    retrogradeChanges,
    signIngresses,
    majorAspects,
    moonPhases,
    seasonalEvents,
    dailyForecasts,
    bestDaysFor,
    crystalRecommendations,
    magicalTiming,
    generatedAt: new Date().toISOString(),
    weekNumber,
    year: weekStart.getFullYear(),
  };
}

// Enhanced planetary position tracking with retrograde detection
async function generatePlanetaryHighlights(
  weekStart: Date,
  weekEnd: Date,
): Promise<PlanetaryHighlight[]> {
  const highlights: PlanetaryHighlight[] = [];
  const currentDate = new Date(weekStart);

  while (currentDate <= weekEnd) {
    const positions = getRealPlanetaryPositions(currentDate);
    const nextDayPositions = getRealPlanetaryPositions(
      new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
    );

    // Check each planet for sign changes and retrograde changes
    // Exclude Moon and Sun from sign ingress highlights (Moon moves too fast, Sun is annual)
    Object.entries(positions).forEach(([planet, data]: [string, any]) => {
      const nextData = nextDayPositions[planet];

      // Skip Moon sign changes (too frequent, not significant for weekly highlights)
      if (planet === 'Moon') return;

      // Sign ingress detection (only for slower-moving planets)
      if (data.sign !== nextData.sign) {
        highlights.push({
          planet,
          event: 'enters-sign',
          date: new Date(currentDate),
          description: `${planet} enters ${nextData.sign}`,
          significance: getSignIngressSignificance(planet, nextData.sign),
          details: {
            fromSign: data.sign,
            toSign: nextData.sign,
          },
        });
      }

      // Retrograde change detection
      if (data.retrograde !== nextData.retrograde) {
        highlights.push({
          planet,
          event: nextData.retrograde ? 'goes-retrograde' : 'goes-direct',
          date: new Date(currentDate),
          description: `${planet} ${nextData.retrograde ? 'stations retrograde' : 'stations direct'} in ${nextData.sign}`,
          significance: getRetrogradeSignificance(planet),
          details: {},
        });
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by significance priority: extraordinary > high > medium > low
  const significanceOrder = { extraordinary: 4, high: 3, medium: 2, low: 1 };
  return highlights.sort((a, b) => {
    const sigDiff =
      significanceOrder[b.significance] - significanceOrder[a.significance];
    if (sigDiff !== 0) return sigDiff;
    // If same significance, prioritize retrograde changes over sign ingresses
    if (a.event.includes('retrograde') && !b.event.includes('retrograde'))
      return -1;
    if (b.event.includes('retrograde') && !a.event.includes('retrograde'))
      return 1;
    // Then sort by date
    return a.date.getTime() - b.date.getTime();
  });
}

async function detectRetrogradeChanges(
  weekStart: Date,
  weekEnd: Date,
): Promise<RetrogradeChange[]> {
  const changes: RetrogradeChange[] = [];
  const currentDate = new Date(weekStart);

  while (currentDate <= weekEnd) {
    const todayPositions = getRealPlanetaryPositions(currentDate);
    const tomorrowPositions = getRealPlanetaryPositions(
      new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
    );

    Object.entries(todayPositions).forEach(
      ([planet, todayData]: [string, any]) => {
        const tomorrowData = tomorrowPositions[planet];

        if (todayData.retrograde !== tomorrowData.retrograde) {
          const action = tomorrowData.retrograde ? 'begins' : 'ends';

          changes.push({
            planet,
            date: new Date(currentDate),
            action,
            sign: tomorrowData.sign,
            significance: getRetrogradeMeaning(planet, action),
            guidance: getRetrogradeGuidance(planet, action, tomorrowData.sign),
          });
        }
      },
    );

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return changes;
}

// Helper functions for astronomical calculations
// Cache for planetary positions to avoid expensive recalculations
const positionCache = new Map<string, any>();

function getRealPlanetaryPositions(
  date: Date,
  observer: Observer = DEFAULT_OBSERVER,
) {
  // Round to nearest hour for caching (positions don't change significantly within an hour)
  const cacheKey = `${date.getTime() - (date.getTime() % (60 * 60 * 1000))}`;

  if (positionCache.has(cacheKey)) {
    return positionCache.get(cacheKey);
  }

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

  // Cache the result (limit cache size to prevent memory issues)
  if (positionCache.size > 1000) {
    const firstKey = positionCache.keys().next().value;
    if (firstKey) {
      positionCache.delete(firstKey);
    }
  }
  positionCache.set(cacheKey, positions);

  return positions;
}

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

// Significance assessment functions
function getSignIngressSignificance(
  planet: string,
  sign: string,
): 'low' | 'medium' | 'high' | 'extraordinary' {
  const significanceMap: {
    [key: string]: 'low' | 'medium' | 'high' | 'extraordinary';
  } = {
    Sun: 'medium',
    Moon: 'low',
    Mercury: 'low',
    Venus: 'medium',
    Mars: 'medium',
    Jupiter: 'high',
    Saturn: 'high',
    Uranus: 'extraordinary',
    Neptune: 'extraordinary',
  };

  return significanceMap[planet] || 'low';
}

function getRetrogradeSignificance(
  planet: string,
): 'low' | 'medium' | 'high' | 'extraordinary' {
  const retrogradeSignificance: {
    [key: string]: 'low' | 'medium' | 'high' | 'extraordinary';
  } = {
    Mercury: 'high',
    Venus: 'medium',
    Mars: 'medium',
    Jupiter: 'low',
    Saturn: 'low',
    Uranus: 'low',
    Neptune: 'low',
  };

  return retrogradeSignificance[planet] || 'low';
}

function getRetrogradeMeaning(
  planet: string,
  action: 'begins' | 'ends',
): string {
  const meanings: { [key: string]: { begins: string; ends: string } } = {
    Mercury: {
      begins: 'Communication and technology may face delays',
      ends: 'Clear communication and forward momentum return',
    },
    Venus: {
      begins: 'Time to review relationships and values',
      ends: 'Love and harmony flow more smoothly',
    },
    Mars: {
      begins: 'Energy may feel blocked or redirected inward',
      ends: 'Action and motivation surge forward',
    },
    Jupiter: {
      begins: 'Expansion turns inward for reflection',
      ends: 'Growth and opportunities expand outward',
    },
    Saturn: {
      begins: 'Structures and discipline require review',
      ends: 'Foundations become solid again',
    },
  };

  return (
    meanings[planet]?.[action] ||
    `${planet} ${action === 'begins' ? 'stations retrograde' : 'stations direct'}`
  );
}

function getRetrogradeGuidance(
  planet: string,
  action: 'begins' | 'ends',
  sign: string,
): string {
  const guidance: { [key: string]: { begins: string; ends: string } } = {
    Mercury: {
      begins:
        'Back up important data, double-check communications, and embrace patience with technology. Use this time for reflection and revision.',
      ends: 'Move forward with communication projects, sign contracts, and launch new ventures with confidence.',
    },
    Venus: {
      begins:
        'Reflect on relationships and personal values. Avoid major relationship decisions. Focus on self-love and artistic pursuits.',
      ends: 'Relationships and creative projects can move forward. Time for new partnerships and artistic expression.',
    },
    Mars: {
      begins:
        'Channel energy into inner work and planning. Avoid aggressive actions. Focus on strategy over direct action.',
      ends: 'Take bold action on plans made during retrograde. Energy and motivation are strong for new initiatives.',
    },
  };

  const baseGuidance =
    guidance[planet]?.[action] ||
    `Work with ${planet}'s ${action === 'begins' ? 'inward' : 'outward'} energy in ${sign}.`;
  return `${baseGuidance} The ${sign} influence adds ${getSignEnergy(sign)} to this transition.`;
}

function getSignEnergy(sign: string): string {
  const signEnergies: { [key: string]: string } = {
    Aries: 'pioneering and initiating energy',
    Taurus: 'grounding and stabilizing energy',
    Gemini: 'communicative and adaptable energy',
    Cancer: 'nurturing and emotional depth',
    Leo: 'creative and confident expression',
    Virgo: 'practical and analytical focus',
    Libra: 'harmony and relationship focus',
    Scorpio: 'transformative and intense energy',
    Sagittarius: 'expansive and philosophical perspective',
    Capricorn: 'disciplined and structured approach',
    Aquarius: 'innovative and humanitarian vision',
    Pisces: 'intuitive and spiritual connection',
  };

  return signEnergies[sign] || 'cosmic energy';
}

// Extract sign ingresses from planetary highlights
async function detectSignIngresses(
  weekStart: Date,
  weekEnd: Date,
): Promise<SignIngress[]> {
  const ingresses: SignIngress[] = [];
  const currentDate = new Date(weekStart);

  // Track sign changes for slower-moving planets (excluding Moon and Sun)
  const slowPlanets = [
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
  ];

  while (currentDate <= weekEnd) {
    const positions = getRealPlanetaryPositions(currentDate);
    const nextDayPositions = getRealPlanetaryPositions(
      new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
    );

    slowPlanets.forEach((planet) => {
      const todayData = positions[planet];
      const nextData = nextDayPositions[planet];

      if (todayData && nextData && todayData.sign !== nextData.sign) {
        ingresses.push({
          planet,
          date: new Date(currentDate),
          fromSign: todayData.sign,
          toSign: nextData.sign,
          significance: getSignIngressSignificance(planet, nextData.sign),
          energy: getSignIngressEnergy(planet, todayData.sign, nextData.sign),
        });
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return ingresses;
}

function getSignIngressEnergy(
  planet: string,
  fromSign: string,
  toSign: string,
): string {
  const planetMeanings: { [key: string]: string } = {
    Mercury: 'communication and thinking patterns',
    Venus: 'love, values, and relationships',
    Mars: 'action, energy, and drive',
    Jupiter: 'expansion, growth, and opportunity',
    Saturn: 'structure, discipline, and responsibility',
    Uranus: 'innovation, revolution, and sudden change',
    Neptune: 'intuition, dreams, and spiritual connection',
  };

  return `${planet} shifts ${planetMeanings[planet] || 'energy'} from ${fromSign} to ${toSign}`;
}

async function findMajorAspects(
  weekStart: Date,
  weekEnd: Date,
): Promise<MajorAspect[]> {
  const aspects: MajorAspect[] = [];
  const currentDate = new Date(weekStart);

  // Check every 6 hours for more precise aspect timing
  const checkInterval = 6 * 60 * 60 * 1000; // 6 hours

  while (currentDate <= weekEnd) {
    const positions = getRealPlanetaryPositions(currentDate);
    const planetNames = Object.keys(positions).filter(
      (p) => p !== 'Sun' && p !== 'Moon',
    );

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

        // Determine aspect type and significance
        let aspectType: string | null = null;
        let significance: 'low' | 'medium' | 'high' | 'extraordinary' = 'low';

        if (separation < 8) {
          aspectType = 'conjunction';
          significance =
            (planetA === 'Jupiter' && planetB === 'Saturn') ||
            (planetA === 'Saturn' && planetB === 'Jupiter')
              ? 'extraordinary'
              : 'high';
        } else if (Math.abs(separation - 60) < 6) {
          aspectType = 'sextile';
          significance = 'medium';
        } else if (Math.abs(separation - 90) < 8) {
          aspectType = 'square';
          significance = 'high';
        } else if (Math.abs(separation - 120) < 8) {
          aspectType = 'trine';
          significance = 'high';
        } else if (Math.abs(separation - 180) < 8) {
          aspectType = 'opposition';
          significance = 'high';
        }

        if (aspectType) {
          // Check if we already have this aspect (avoid duplicates)
          const existingAspect = aspects.find(
            (a) =>
              ((a.planetA === planetA && a.planetB === planetB) ||
                (a.planetA === planetB && a.planetB === planetA)) &&
              Math.abs(a.date.getTime() - currentDate.getTime()) <
                24 * 60 * 60 * 1000,
          );

          if (!existingAspect) {
            aspects.push({
              planetA,
              planetB,
              aspect: aspectType,
              date: new Date(currentDate),
              exactTime: currentDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              significance,
              energy: getAspectEnergy(planetA, planetB, aspectType),
              guidance: getAspectGuidance(planetA, planetB, aspectType),
            });
          }
        }
      }
    }

    currentDate.setTime(currentDate.getTime() + checkInterval);
  }

  // Sort by significance and date
  return aspects.sort((a, b) => {
    const sigOrder = { extraordinary: 4, high: 3, medium: 2, low: 1 };
    const sigDiff = sigOrder[b.significance] - sigOrder[a.significance];
    if (sigDiff !== 0) return sigDiff;
    return a.date.getTime() - b.date.getTime();
  });
}

function getAspectEnergy(
  planetA: string,
  planetB: string,
  aspect: string,
): string {
  const aspectEnergies: { [key: string]: string } = {
    conjunction: 'unified and intensified',
    opposition: 'polarized and dynamic',
    trine: 'harmonious and flowing',
    square: 'challenging and transformative',
    sextile: 'supportive and opportunistic',
  };

  return `The ${aspect} between ${planetA} and ${planetB} creates ${aspectEnergies[aspect] || 'cosmic'} energy`;
}

function getAspectGuidance(
  planetA: string,
  planetB: string,
  aspect: string,
): string {
  const guidance: { [key: string]: string } = {
    conjunction: `Work with the combined power of ${planetA} and ${planetB}. This is a time for new beginnings and focused action.`,
    opposition: `Balance the energies of ${planetA} and ${planetB}. Find harmony between opposing forces.`,
    trine: `The harmonious flow between ${planetA} and ${planetB} supports your goals. Trust the process.`,
    square: `The tension between ${planetA} and ${planetB} requires action. Use challenges as catalysts for growth.`,
    sextile: `The supportive connection between ${planetA} and ${planetB} offers opportunities. Take advantage of favorable conditions.`,
  };

  return (
    guidance[aspect] ||
    `Work with the ${aspect} energy between ${planetA} and ${planetB}.`
  );
}

async function calculateMoonPhases(
  weekStart: Date,
  weekEnd: Date,
): Promise<MoonPhaseEvent[]> {
  const phases: MoonPhaseEvent[] = [];
  const currentDate = new Date(weekStart);

  // Check every 12 hours for moon phase changes
  const checkInterval = 12 * 60 * 60 * 1000;

  let lastPhase: number | null = null;

  while (currentDate <= weekEnd) {
    const astroTime = new AstroTime(currentDate);
    const illumination = Illumination(Body.Moon, astroTime);
    const phase = illumination.phase_fraction; // 0-1 range (0 = New Moon, 0.5 = Full Moon, 1 = New Moon)

    // Determine phase name
    let phaseName = '';
    if (phase < 0.03 || phase > 0.97) {
      phaseName = 'New Moon';
    } else if (phase < 0.22) {
      phaseName = 'Waxing Crescent';
    } else if (phase < 0.28) {
      phaseName = 'First Quarter';
    } else if (phase < 0.47) {
      phaseName = 'Waxing Gibbous';
    } else if (phase < 0.53) {
      phaseName = 'Full Moon';
    } else if (phase < 0.72) {
      phaseName = 'Waning Gibbous';
    } else if (phase < 0.78) {
      phaseName = 'Last Quarter';
    } else {
      phaseName = 'Waning Crescent';
    }

    // Check if phase changed significantly (for New Moon, First Quarter, Full Moon, Last Quarter)
    const isMajorPhase =
      phase < 0.05 ||
      (phase > 0.22 && phase < 0.28) ||
      (phase > 0.47 && phase < 0.53) ||
      (phase > 0.72 && phase < 0.78);

    // Track major phases - include first phase if it's a major phase, or if phase changed significantly
    if (
      isMajorPhase &&
      (lastPhase === null || Math.abs(phase - lastPhase) > 0.1)
    ) {
      const positions = getRealPlanetaryPositions(currentDate);
      const moonSign = positions.Moon?.sign || 'Unknown';

      phases.push({
        phase: phaseName,
        date: new Date(currentDate),
        time: currentDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sign: moonSign,
        energy: getMoonPhaseEnergy(phaseName, moonSign),
        guidance: getMoonPhaseGuidance(phaseName, moonSign),
        ritualSuggestions: getMoonPhaseRituals(phaseName),
      });
    }

    lastPhase = phase;
    currentDate.setTime(currentDate.getTime() + checkInterval);
  }

  return phases;
}

function getMoonPhaseEnergy(phase: string, sign: string): string {
  const phaseEnergies: { [key: string]: string } = {
    'New Moon': 'beginnings and intention setting',
    'Waxing Crescent': 'growth and building momentum',
    'First Quarter': 'action and decision-making',
    'Waxing Gibbous': 'refinement and adjustment',
    'Full Moon': 'culmination and release',
    'Waning Gibbous': 'gratitude and sharing',
    'Last Quarter': 'reflection and letting go',
    'Waning Crescent': 'rest and preparation',
  };

  return `The ${phase} in ${sign} brings energy for ${phaseEnergies[phase] || 'cosmic alignment'}`;
}

function getMoonPhaseGuidance(phase: string, sign: string): string {
  const guidance: { [key: string]: string } = {
    'New Moon': `Set intentions aligned with ${sign} energy. Plant seeds for new beginnings.`,
    'Waxing Crescent': `Take action on your New Moon intentions. Build momentum steadily.`,
    'First Quarter': `Make decisions and take bold action. Overcome obstacles with ${sign} determination.`,
    'Waxing Gibbous': `Refine your approach. Make adjustments before the Full Moon.`,
    'Full Moon': `Release what no longer serves you. Celebrate achievements and let go with ${sign} grace.`,
    'Waning Gibbous': `Express gratitude. Share your wisdom and abundance.`,
    'Last Quarter': `Reflect on lessons learned. Release patterns that hold you back.`,
    'Waning Crescent': `Rest and prepare for the next cycle. Trust the process.`,
  };

  return guidance[phase] || `Work with the ${phase} energy in ${sign}.`;
}

function getMoonPhaseRituals(phase: string): string[] {
  const rituals: { [key: string]: string[] } = {
    'New Moon': [
      'Write intentions',
      'Meditation',
      'Candle lighting',
      'Vision board creation',
    ],
    'Waxing Crescent': [
      'Affirmations',
      'Gentle movement',
      'Plant care',
      'Creative projects',
    ],
    'First Quarter': [
      'Action planning',
      'Exercise',
      'Communication',
      'Decision-making',
    ],
    'Waxing Gibbous': [
      'Review goals',
      'Adjust plans',
      'Practice gratitude',
      'Self-care',
    ],
    'Full Moon': [
      'Release ceremony',
      'Full moon meditation',
      'Gratitude practice',
      'Cleansing rituals',
    ],
    'Waning Gibbous': [
      'Sharing wisdom',
      'Teaching others',
      'Gratitude journaling',
      'Community connection',
    ],
    'Last Quarter': [
      'Reflection journaling',
      'Letting go rituals',
      'Forgiveness work',
      'Space clearing',
    ],
    'Waning Crescent': [
      'Rest and restoration',
      'Dream work',
      'Intuitive practices',
      'Preparation',
    ],
  };

  return rituals[phase] || ['Meditation', 'Journaling', 'Nature connection'];
}

async function checkSeasonalEvents(
  weekStart: Date,
  weekEnd: Date,
): Promise<SeasonalEvent[]> {
  const events: SeasonalEvent[] = [];
  const year = weekStart.getFullYear();

  // Calculate approximate dates for seasonal events
  // Spring Equinox: ~March 20
  // Summer Solstice: ~June 21
  // Fall Equinox: ~September 22
  // Winter Solstice: ~December 21

  const springEquinox = new Date(year, 2, 20);
  const summerSolstice = new Date(year, 5, 21);
  const fallEquinox = new Date(year, 8, 22);
  const winterSolstice = new Date(year, 11, 21);

  // Cross-quarter days (midpoints between solstices and equinoxes)
  const imbolc = new Date(year, 1, 2); // ~Feb 2
  const beltane = new Date(year, 4, 1); // ~May 1
  const lughnasadh = new Date(year, 7, 1); // ~Aug 1
  const samhain = new Date(year, 9, 31); // ~Oct 31

  const seasonalDates = [
    { date: springEquinox, name: 'Spring Equinox', type: 'equinox' as const },
    {
      date: summerSolstice,
      name: 'Summer Solstice',
      type: 'solstice' as const,
    },
    { date: fallEquinox, name: 'Fall Equinox', type: 'equinox' as const },
    {
      date: winterSolstice,
      name: 'Winter Solstice',
      type: 'solstice' as const,
    },
    { date: imbolc, name: 'Imbolc', type: 'cross-quarter' as const },
    { date: beltane, name: 'Beltane', type: 'cross-quarter' as const },
    { date: lughnasadh, name: 'Lughnasadh', type: 'cross-quarter' as const },
    { date: samhain, name: 'Samhain', type: 'cross-quarter' as const },
  ];

  seasonalDates.forEach(({ date, name, type }) => {
    // Check if event falls within the week (with 3-day window)
    const eventStart = new Date(date);
    eventStart.setDate(eventStart.getDate() - 3);
    const eventEnd = new Date(date);
    eventEnd.setDate(eventEnd.getDate() + 3);

    if (date >= weekStart && date <= weekEnd) {
      events.push({
        name,
        date: new Date(date),
        type,
        significance: getSeasonalSignificance(name, type),
        energy: getSeasonalEnergy(name, type),
      });
    }
  });

  return events;
}

function getSeasonalSignificance(name: string, type: string): string {
  const significances: { [key: string]: string } = {
    'Spring Equinox': 'Balance and renewal - day and night are equal',
    'Summer Solstice': 'Peak of light and growth - longest day of the year',
    'Fall Equinox': 'Harvest and gratitude - balance returns',
    'Winter Solstice':
      'Deepest darkness and rebirth - shortest day of the year',
    Imbolc: 'First signs of spring - purification and new beginnings',
    Beltane: 'Fertility and abundance - peak of spring energy',
    Lughnasadh: 'First harvest - gratitude and abundance',
    Samhain: 'Thin veil between worlds - honoring ancestors',
  };

  return (
    significances[name] ||
    `${name} marks a significant turning point in the seasonal cycle`
  );
}

function getSeasonalEnergy(name: string, type: string): string {
  const energies: { [key: string]: string } = {
    'Spring Equinox': 'Renewal, balance, and new beginnings',
    'Summer Solstice': 'Expansion, growth, and celebration',
    'Fall Equinox': 'Harvest, gratitude, and preparation',
    'Winter Solstice': 'Reflection, rest, and inner light',
    Imbolc: 'Purification, inspiration, and awakening',
    Beltane: 'Fertility, passion, and creative expression',
    Lughnasadh: 'Abundance, gratitude, and sharing',
    Samhain: 'Transformation, honoring ancestors, and release',
  };

  return energies[name] || 'Seasonal transition energy';
}

async function generateDailyForecasts(
  weekStart: Date,
  weekEnd: Date,
  majorAspects: MajorAspect[] = [],
  moonPhases: MoonPhaseEvent[] = [],
): Promise<DailyForecast[]> {
  const forecasts: DailyForecast[] = [];
  const currentDate = new Date(weekStart);

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  while (currentDate <= weekEnd) {
    const positions = getRealPlanetaryPositions(currentDate);
    const moonSign = positions.Moon?.sign || 'Unknown';
    const dateStr = currentDate.toDateString();

    // Determine planetary ruler based on day of week
    const dayIndex = currentDate.getDay();
    const planetaryRulers: { [key: number]: string } = {
      0: 'Sun', // Sunday
      1: 'Moon', // Monday
      2: 'Mars', // Tuesday
      3: 'Mercury', // Wednesday
      4: 'Jupiter', // Thursday
      5: 'Venus', // Friday
      6: 'Saturn', // Saturday
    };
    const planetaryRuler = planetaryRulers[dayIndex] || 'Sun';

    // Get major events for this day
    const majorEvents: string[] = [];

    // Check for sign ingresses happening today
    const nextDayPositions = getRealPlanetaryPositions(
      new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
    );
    Object.entries(positions).forEach(([planet, data]: [string, any]) => {
      const nextData = nextDayPositions[planet];
      if (data.sign !== nextData.sign && planet !== 'Moon') {
        majorEvents.push(`${planet} enters ${nextData.sign}`);
      }
    });

    // Find aspects happening on this day
    const todayAspects = majorAspects.filter((aspect) => {
      const aspectDate = aspect.date.toDateString();
      return aspectDate === dateStr;
    });

    // Find moon phases happening on this day
    const todayMoonPhases = moonPhases.filter((phase) => {
      const phaseDate = phase.date.toDateString();
      return phaseDate === dateStr;
    });

    // Check for retrograde planets
    const retrogradePlanets = Object.entries(positions)
      .filter(
        ([planet, data]: [string, any]) =>
          data.retrograde && planet !== 'Sun' && planet !== 'Moon',
      )
      .map(([planet]) => planet);

    // Generate energy description with actual aspects and moon phases
    const energy = getDailyEnergy(
      planetaryRuler,
      moonSign,
      majorEvents,
      todayAspects,
      todayMoonPhases,
      retrogradePlanets,
      positions,
    );
    const guidance = getDailyGuidance(
      planetaryRuler,
      moonSign,
      majorEvents,
      todayAspects,
      todayMoonPhases,
      retrogradePlanets,
    );
    const avoid = getDailyAvoid(
      planetaryRuler,
      moonSign,
      todayAspects,
      retrogradePlanets,
    );

    forecasts.push({
      date: new Date(currentDate),
      dayOfWeek: daysOfWeek[dayIndex],
      planetaryRuler,
      moonSign,
      majorEvents,
      energy,
      guidance,
      avoid,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return forecasts;
}

function getDailyEnergy(
  ruler: string,
  moonSign: string,
  events: string[],
  aspects: MajorAspect[] = [],
  moonPhases: MoonPhaseEvent[] = [],
  retrogradePlanets: string[] = [],
  positions: any = {},
): string {
  const rulerEnergies: { [key: string]: string } = {
    Sun: 'confidence and self-expression',
    Moon: 'emotions and intuition',
    Mars: 'action and courage',
    Mercury: 'communication and learning',
    Jupiter: 'expansion and optimism',
    Venus: 'love and harmony',
    Saturn: 'discipline and structure',
  };

  let energy = `${ruler} rules today, bringing ${rulerEnergies[ruler] || 'cosmic energy'}. `;
  energy += `The Moon in ${moonSign} adds ${getSignEnergy(moonSign)}.`;

  // Add moon phase influence
  if (moonPhases.length > 0) {
    const phase = moonPhases[0];
    energy += ` The ${phase.phase} brings ${phase.energy || 'powerful cosmic energy'}.`;
  }

  // Add aspect influences
  if (aspects.length > 0) {
    const aspect = aspects[0];
    energy += ` The ${aspect.aspect} between ${aspect.planetA} and ${aspect.planetB} creates ${aspect.energy || 'dynamic energy'}.`;
  }

  // Add retrograde influences
  if (retrogradePlanets.length > 0) {
    energy += ` ${retrogradePlanets.join(', ')} ${retrogradePlanets.length === 1 ? 'is' : 'are'} retrograde, encouraging reflection and review.`;
  }

  // Add sign ingress events
  if (events.length > 0) {
    energy += ` ${events[0]} influences the day's energy.`;
  }

  return energy;
}

function getDailyGuidance(
  ruler: string,
  moonSign: string,
  events: string[],
  aspects: MajorAspect[] = [],
  moonPhases: MoonPhaseEvent[] = [],
  retrogradePlanets: string[] = [],
): string {
  const guidance: { [key: string]: string } = {
    Sun: 'Focus on your authentic self and personal goals. Shine your light.',
    Moon: 'Honor your emotions and intuition. Nurture yourself and others.',
    Mars: 'Take action on your goals. Channel energy constructively.',
    Mercury: 'Communicate clearly and learn something new. Stay curious.',
    Jupiter: 'Expand your horizons. Seek growth and opportunity.',
    Venus: 'Cultivate beauty, love, and harmony. Appreciate what you have.',
    Saturn: 'Build structure and discipline. Work on long-term goals.',
  };

  let guidanceText =
    guidance[ruler] || `Work with ${ruler}'s energy in ${moonSign}.`;

  // Add moon phase guidance
  if (moonPhases.length > 0 && moonPhases[0].guidance) {
    guidanceText += ` ${moonPhases[0].guidance}`;
  }

  // Add aspect guidance
  if (aspects.length > 0 && aspects[0].guidance) {
    guidanceText += ` ${aspects[0].guidance}`;
  }

  // Add retrograde guidance
  if (retrogradePlanets.length > 0) {
    guidanceText += ` With ${retrogradePlanets.join(' and ')} retrograde, take time to review and reflect rather than rushing forward.`;
  }

  return guidanceText;
}

function getDailyAvoid(
  ruler: string,
  moonSign: string,
  aspects: MajorAspect[] = [],
  retrogradePlanets: string[] = [],
): string[] {
  const avoid: { [key: string]: string[] } = {
    Sun: ['Ego conflicts', 'Overconfidence', 'Neglecting others'],
    Moon: ['Emotional suppression', 'Ignoring feelings', 'Overreacting'],
    Mars: ['Aggression', 'Impulsivity', 'Rushing'],
    Mercury: ['Miscommunication', 'Overthinking', 'Scattered focus'],
    Jupiter: ['Overindulgence', 'Overconfidence', 'Ignoring details'],
    Venus: ['Superficiality', 'Dependency', 'Avoiding conflict'],
    Saturn: ['Rigidity', 'Self-criticism', 'Isolation'],
  };

  let avoidList = [
    ...(avoid[ruler] || ['Negativity', 'Rushing', 'Overcommitment']),
  ];

  // Add aspect-specific cautions
  if (aspects.length > 0) {
    const aspect = aspects[0];
    if (aspect.aspect === 'square' || aspect.aspect === 'opposition') {
      avoidList.push(
        'Forcing outcomes',
        'Ignoring tension',
        'Avoiding necessary challenges',
      );
    }
  }

  // Add retrograde cautions
  if (retrogradePlanets.length > 0) {
    avoidList.push(
      'Rushing new initiatives',
      'Making hasty decisions',
      'Ignoring past patterns',
    );
    if (retrogradePlanets.includes('Mercury')) {
      avoidList.push(
        'Signing contracts',
        'Major purchases',
        'Miscommunication',
      );
    }
    if (retrogradePlanets.includes('Venus')) {
      avoidList.push(
        'Rush relationships',
        'Major beauty changes',
        'Impulsive spending',
      );
    }
  }

  // Remove duplicates and return
  return [...new Set(avoidList)];
}

function generateBestDaysGuidance(
  dailyForecasts: DailyForecast[],
  majorAspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
): BestDaysGuidance {
  const loveDates: Date[] = [];
  const prosperityDates: Date[] = [];
  const healingDates: Date[] = [];
  const protectionDates: Date[] = [];
  const manifestationDates: Date[] = [];
  const cleansingDates: Date[] = [];

  // Analyze daily forecasts for best days
  dailyForecasts.forEach((forecast) => {
    // Love: Venus days, Venus aspects, or Moon in Libra/Taurus
    if (
      forecast.planetaryRuler === 'Venus' ||
      forecast.moonSign === 'Libra' ||
      forecast.moonSign === 'Taurus'
    ) {
      loveDates.push(forecast.date);
    }

    // Prosperity: Jupiter days, Jupiter aspects, or Moon in Sagittarius/Pisces
    if (
      forecast.planetaryRuler === 'Jupiter' ||
      forecast.moonSign === 'Sagittarius' ||
      forecast.moonSign === 'Pisces'
    ) {
      prosperityDates.push(forecast.date);
    }

    // Healing: Moon days, Moon phases, or Moon in Cancer/Pisces
    if (
      forecast.planetaryRuler === 'Moon' ||
      forecast.moonSign === 'Cancer' ||
      forecast.moonSign === 'Pisces' ||
      moonPhases.some(
        (mp) => mp.date.toDateString() === forecast.date.toDateString(),
      )
    ) {
      healingDates.push(forecast.date);
    }

    // Protection: Mars days, Mars aspects, or Moon in Aries/Scorpio
    if (
      forecast.planetaryRuler === 'Mars' ||
      forecast.moonSign === 'Aries' ||
      forecast.moonSign === 'Scorpio'
    ) {
      protectionDates.push(forecast.date);
    }

    // Manifestation: New Moon or Sun days
    if (
      forecast.planetaryRuler === 'Sun' ||
      moonPhases.some(
        (mp) =>
          mp.phase === 'New Moon' &&
          mp.date.toDateString() === forecast.date.toDateString(),
      )
    ) {
      manifestationDates.push(forecast.date);
    }

    // Cleansing: Waning Moon phases or Saturn days
    if (
      forecast.planetaryRuler === 'Saturn' ||
      moonPhases.some(
        (mp) =>
          (mp.phase.includes('Waning') || mp.phase === 'Full Moon') &&
          mp.date.toDateString() === forecast.date.toDateString(),
      )
    ) {
      cleansingDates.push(forecast.date);
    }
  });

  // Check major aspects for additional guidance
  majorAspects.forEach((aspect) => {
    if (aspect.planetA === 'Venus' || aspect.planetB === 'Venus') {
      if (aspect.aspect === 'trine' || aspect.aspect === 'sextile') {
        loveDates.push(aspect.date);
      }
    }
    if (aspect.planetA === 'Jupiter' || aspect.planetB === 'Jupiter') {
      if (aspect.aspect === 'trine' || aspect.aspect === 'sextile') {
        prosperityDates.push(aspect.date);
      }
    }
  });

  // Generate reasons
  const reasons = {
    love:
      loveDates.length > 0
        ? `Venus energy and favorable aspects support romantic connections on ${loveDates.length} day${loveDates.length > 1 ? 's' : ''}`
        : 'Venus aspects favor romantic connections',
    prosperity:
      prosperityDates.length > 0
        ? `Jupiter energy supports abundance work on ${prosperityDates.length} day${prosperityDates.length > 1 ? 's' : ''}`
        : 'Jupiter energy supports abundance work',
    healing:
      healingDates.length > 0
        ? `Moon phases support healing rituals on ${healingDates.length} day${healingDates.length > 1 ? 's' : ''}`
        : 'Moon phases support healing rituals',
    protection:
      protectionDates.length > 0
        ? `Mars energy strengthens protective work on ${protectionDates.length} day${protectionDates.length > 1 ? 's' : ''}`
        : 'Mars energy strengthens protective work',
    manifestation:
      manifestationDates.length > 0
        ? `New moon energy perfect for intention setting on ${manifestationDates.length} day${manifestationDates.length > 1 ? 's' : ''}`
        : 'New moon energy perfect for intention setting',
    cleansing:
      cleansingDates.length > 0
        ? `Waning moon supports release and clearing on ${cleansingDates.length} day${cleansingDates.length > 1 ? 's' : ''}`
        : 'Waning moon supports release and clearing',
  };

  return {
    love: { dates: loveDates, reason: reasons.love },
    prosperity: { dates: prosperityDates, reason: reasons.prosperity },
    healing: { dates: healingDates, reason: reasons.healing },
    protection: { dates: protectionDates, reason: reasons.protection },
    manifestation: { dates: manifestationDates, reason: reasons.manifestation },
    cleansing: { dates: cleansingDates, reason: reasons.cleansing },
  };
}

function generateWeeklyCrystalGuide(
  dailyForecasts: DailyForecast[],
): WeeklyCrystalGuide[] {
  const crystalGuide: WeeklyCrystalGuide[] = [];
  const usedCrystals = new Set<string>();

  // Safety check: ensure crystal database is available
  if (!crystalDatabase || crystalDatabase.length === 0) {
    console.error('Crystal database is empty or unavailable');
    // Return empty array - this will be handled gracefully by the UI
    return crystalGuide;
  }

  console.log(
    `[Crystal Guide] Database has ${crystalDatabase.length} crystals available`,
  );

  // Map planetary rulers to planet names used in crystal database
  const planetMap: { [key: string]: string } = {
    Sun: 'Sun',
    Moon: 'Moon',
    Mars: 'Mars',
    Mercury: 'Mercury',
    Jupiter: 'Jupiter',
    Venus: 'Venus',
    Saturn: 'Saturn',
  };

  // Helper function to get crystals by planet
  const getCrystalsByPlanet = (planet: string): Crystal[] => {
    try {
      return crystalDatabase.filter(
        (crystal) =>
          crystal.planets.includes(planet) ||
          crystal.planets.includes('All Planets'),
      );
    } catch (error) {
      console.error('Error filtering crystals by planet:', error);
      return [];
    }
  };

  // Helper function to find crystal matching both moon sign and planet
  const findCombinationCrystal = (
    moonSign: string,
    planet: string,
  ): Crystal | null => {
    try {
      const moonCrystals = getCrystalsByZodiacSign(moonSign);
      const planetCrystals = getCrystalsByPlanet(planet);

      // Find crystals that match both
      const matches = moonCrystals.filter((crystal) =>
        planetCrystals.some((pc) => pc.id === crystal.id),
      );

      return matches.length > 0 ? matches[0] : null;
    } catch (error) {
      console.error('Error finding combination crystal:', error);
      return null;
    }
  };

  dailyForecasts.forEach((forecast) => {
    try {
      const planet =
        planetMap[forecast.planetaryRuler] || forecast.planetaryRuler;

      let selectedCrystal: Crystal | null = null;
      let reason = '';

      // Priority 1: Find crystal matching both moon sign AND planetary ruler (most specific)
      const combinationCrystal = findCombinationCrystal(
        forecast.moonSign,
        planet,
      );
      if (combinationCrystal && !usedCrystals.has(combinationCrystal.name)) {
        selectedCrystal = combinationCrystal;
        reason = `The ${forecast.planetaryRuler} ruler with Moon in ${forecast.moonSign} resonates with ${combinationCrystal.name}`;
      }

      // Priority 2: Find crystal matching moon sign
      if (!selectedCrystal) {
        try {
          const moonCrystals = getCrystalsByZodiacSign(forecast.moonSign);
          for (const crystal of moonCrystals) {
            if (!usedCrystals.has(crystal.name)) {
              selectedCrystal = crystal;
              reason = `Moon in ${forecast.moonSign} aligns with ${crystal.name}`;
              break;
            }
          }
        } catch (error) {
          console.error('Error getting crystals by zodiac sign:', error);
        }
      }

      // Priority 3: Find crystal matching planetary ruler
      if (!selectedCrystal) {
        const planetCrystals = getCrystalsByPlanet(planet);
        for (const crystal of planetCrystals) {
          if (!usedCrystals.has(crystal.name)) {
            selectedCrystal = crystal;
            reason = `${forecast.planetaryRuler} rules today, resonating with ${crystal.name}`;
            break;
          }
        }
      }

      // Priority 4: Find any unused crystal from database
      if (!selectedCrystal) {
        for (const crystal of crystalDatabase) {
          if (!usedCrystals.has(crystal.name)) {
            selectedCrystal = crystal;
            reason = `${crystal.name} supports today's unique cosmic energy`;
            break;
          }
        }
      }

      // Fallback: Allow reuse if database is small, but prefer moon sign match
      if (!selectedCrystal) {
        try {
          const moonCrystals = getCrystalsByZodiacSign(forecast.moonSign);
          if (moonCrystals.length > 0) {
            // Use first moon sign crystal (may be a repeat, but still relevant)
            selectedCrystal = moonCrystals[0];
            reason = `Moon in ${forecast.moonSign} aligns with ${selectedCrystal.name}`;
          } else {
            // Last resort: use any crystal from database (cycle through if needed)
            const index = crystalGuide.length % crystalDatabase.length;
            selectedCrystal = crystalDatabase[index];
            reason = `${selectedCrystal.name} supports today's cosmic energy`;
          }
        } catch (error) {
          console.error('Error in fallback crystal selection:', error);
          // Ultimate fallback - cycle through database
          const index = crystalGuide.length % crystalDatabase.length;
          selectedCrystal = crystalDatabase[index];
          reason = `${selectedCrystal.name} supports today's cosmic energy`;
        }
      }

      // Ensure we have a crystal - always return one, even if we need to reuse
      if (!selectedCrystal) {
        // Last resort: cycle through database to ensure variety
        const index = crystalGuide.length % crystalDatabase.length;
        selectedCrystal = crystalDatabase[index];
        reason = `${selectedCrystal.name} supports today's cosmic energy`;
      }

      // Track usage - ensure we never reuse a crystal
      usedCrystals.add(selectedCrystal.name);

      // Get primary chakra (use first chakra or primaryChakra if available)
      const chakra = selectedCrystal.primaryChakra
        ? selectedCrystal.primaryChakra.replace(' Chakra', '')
        : selectedCrystal.chakras && selectedCrystal.chakras.length > 0
          ? selectedCrystal.chakras[0]
          : 'Crown';

      // Get intention (use first intention or generate from description)
      const intention =
        selectedCrystal.intentions && selectedCrystal.intentions.length > 0
          ? selectedCrystal.intentions[0]
          : `Work with ${selectedCrystal.name} to align with ${forecast.moonSign} moon energy`;

      // Generate usage from crystal's workingWith properties
      const usage =
        (selectedCrystal.workingWith &&
          selectedCrystal.workingWith.meditation) ||
        `Carry ${selectedCrystal.name} with you, place it on your ${chakra} chakra during meditation, or keep it nearby while working with today's energy.`;

      const crystalDate =
        forecast.date instanceof Date ? forecast.date : new Date(forecast.date);
      crystalGuide.push({
        date: crystalDate,
        crystal: selectedCrystal.name,
        reason,
        usage,
        chakra,
        intention,
      });

      // Removed verbose logging - only log summary at end
    } catch (error) {
      console.error(
        'Error generating crystal guide for forecast:',
        error,
        forecast,
      );
      // Continue to next forecast even if this one fails
    }
  });

  // Only log summary in development or if there's an issue
  if (process.env.NODE_ENV === 'development' && crystalGuide.length === 0) {
    console.warn(
      `[Crystal Guide] WARNING: No crystal recommendations generated`,
    );
  }
  return crystalGuide;
}

function generateMagicalTimingGuide(
  weekStart: Date,
  weekEnd: Date,
  moonPhases: MoonPhaseEvent[],
): MagicalTimingGuide {
  const powerDays: Date[] = [];
  const voidOfCourseMoon: Array<{ start: Date; end: Date; guidance: string }> =
    [];
  const planetaryHours: Array<{
    planet: string;
    bestFor: string[];
    dates: Date[];
  }> = [];
  const eclipses: Array<{
    type: string;
    date: Date;
    sign: string;
    guidance: string;
  }> = [];

  // Power days: New Moon, Full Moon, and days with major aspects
  moonPhases.forEach((mp) => {
    if (mp.phase === 'New Moon' || mp.phase === 'Full Moon') {
      powerDays.push(mp.date);
    }
  });

  // Planetary hours mapping (simplified - actual calculation would be more complex)
  const planetaryHourPlanets = [
    'Sun',
    'Venus',
    'Mercury',
    'Moon',
    'Saturn',
    'Jupiter',
    'Mars',
  ];
  const planetaryHourBestFor: { [key: string]: string[] } = {
    Sun: ['Leadership', 'Confidence', 'Personal power', 'Success'],
    Venus: ['Love', 'Relationships', 'Beauty', 'Harmony'],
    Mercury: ['Communication', 'Learning', 'Writing', 'Networking'],
    Moon: ['Intuition', 'Emotions', 'Nurturing', 'Dream work'],
    Saturn: ['Structure', 'Discipline', 'Long-term goals', 'Protection'],
    Jupiter: ['Expansion', 'Abundance', 'Wisdom', 'Growth'],
    Mars: ['Action', 'Courage', 'Competition', 'Initiative'],
  };

  // For each day, identify key planetary hours (simplified to one per day)
  const currentDate = new Date(weekStart);
  while (currentDate <= weekEnd) {
    const dayOfWeek = currentDate.getDay();
    // Each day is ruled by a planet (Sunday=Sun, Monday=Moon, etc.)
    const dayRuler = [
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Venus',
      'Saturn',
    ][dayOfWeek];

    // Add this day's planetary hour
    const existingHour = planetaryHours.find((h) => h.planet === dayRuler);
    if (existingHour) {
      existingHour.dates.push(new Date(currentDate));
    } else {
      planetaryHours.push({
        planet: dayRuler,
        bestFor: planetaryHourBestFor[dayRuler] || ['General activities'],
        dates: [new Date(currentDate)],
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Void of Course Moon: Simplified - Moon makes no major aspects before changing signs
  // This is a simplified version - actual calculation would check aspects
  const currentDate2 = new Date(weekStart);
  while (currentDate2 <= weekEnd) {
    const positions = getRealPlanetaryPositions(currentDate2);
    const nextDayPositions = getRealPlanetaryPositions(
      new Date(currentDate2.getTime() + 24 * 60 * 60 * 1000),
    );

    // Check if Moon is about to change signs (simplified void of course indicator)
    if (positions.Moon?.sign !== nextDayPositions.Moon?.sign) {
      // Moon is void of course for a few hours before sign change
      const voidStart = new Date(currentDate2);
      voidStart.setHours(18, 0, 0, 0); // 6 PM
      const voidEnd = new Date(currentDate2);
      voidEnd.setDate(voidEnd.getDate() + 1);
      voidEnd.setHours(6, 0, 0, 0); // 6 AM next day

      voidOfCourseMoon.push({
        start: voidStart,
        end: voidEnd,
        guidance: `Moon void of course - avoid starting new projects, focus on completion and reflection instead.`,
      });
    }

    currentDate2.setDate(currentDate2.getDate() + 1);
  }

  // Eclipses: Check for solar/lunar eclipses (simplified - would need actual eclipse calculations)
  // For now, we'll leave this empty as eclipse calculations are complex

  return {
    powerDays,
    voidOfCourseMoon,
    planetaryHours,
    eclipses,
  };
}

function generateWeeklyTitle(
  weekStart: Date,
  highlights: PlanetaryHighlight[],
  moonPhases: MoonPhaseEvent[],
): string {
  const weekOf = weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const year = weekStart.getFullYear();

  // Find the most significant event
  const majorEvent =
    highlights.find((h) => h.significance === 'extraordinary') ||
    highlights.find((h) => h.significance === 'high') ||
    highlights.find((h) => h.event === 'goes-retrograde') ||
    highlights.find((h) => h.event === 'enters-sign') ||
    moonPhases[0];

  if (majorEvent && 'planet' in majorEvent) {
    // Format the event name properly
    let eventText = '';
    if (majorEvent.event === 'enters-sign') {
      const sign = majorEvent.details.toSign || 'sign';
      eventText = `enters ${sign}`;
    } else if (majorEvent.event === 'goes-retrograde') {
      eventText = 'goes retrograde';
    } else if (majorEvent.event === 'goes-direct') {
      eventText = 'goes direct';
    } else {
      eventText = majorEvent.event.replace('-', ' ');
    }
    return `${majorEvent.planet} ${eventText} - Week of ${weekOf}, ${year}`;
  }

  return `Cosmic Currents - Week of ${weekOf}, ${year}`;
}

function generateWeeklySubtitle(
  majorAspects: MajorAspect[],
  retrogradeChanges: RetrogradeChange[],
): string {
  const events = [...majorAspects, ...retrogradeChanges];
  const significantEvents = events.filter(
    (e) =>
      ('significance' in e && e.significance === 'high') ||
      ('planet' in e && ['Mercury', 'Venus', 'Mars'].includes(e.planet)),
  );

  if (significantEvents.length > 0) {
    return `${significantEvents.length} major planetary shifts shape this week's energy`;
  }

  return 'Navigate the week ahead with cosmic wisdom and planetary guidance';
}

function generateWeeklySummary(
  highlights: PlanetaryHighlight[],
  aspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
): string {
  const totalEvents = highlights.length + aspects.length + moonPhases.length;

  return `This week brings ${totalEvents} significant cosmic events that will influence our collective and personal energy. ${
    highlights.length > 0
      ? `Key planetary movements include ${highlights
          .slice(0, 2)
          .map((h) => `${h.planet} ${h.event.replace('-', ' ')}`)
          .join(' and ')}.`
      : ''
  } The week offers opportunities for ${getWeeklyThemes(highlights, aspects).join(', ')}.`;
}

function getWeeklyThemes(
  highlights: PlanetaryHighlight[],
  aspects: MajorAspect[],
): string[] {
  // Analyze events to determine weekly themes
  const themes = new Set<string>();

  highlights.forEach((h) => {
    if (h.planet === 'Venus') themes.add('love and relationships');
    if (h.planet === 'Mars') themes.add('action and courage');
    if (h.planet === 'Jupiter') themes.add('expansion and growth');
    if (h.planet === 'Saturn') themes.add('structure and discipline');
  });

  aspects.forEach((a) => {
    if (a.aspect === 'trine') themes.add('harmony and flow');
    if (a.aspect === 'square') themes.add('challenges and growth');
    if (a.aspect === 'conjunction') themes.add('new beginnings');
  });

  return Array.from(themes).slice(0, 3);
}

function getWeekNumber(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil(days / 7);
}
