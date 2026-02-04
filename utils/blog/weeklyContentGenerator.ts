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
import { getISOWeek, getISOWeekYear, startOfWeek } from 'date-fns';
import {
  crystalDatabase,
  getCrystalsByZodiacSign,
  type Crystal,
} from '../../src/constants/grimoire/crystals';
import { getAspectMeaning } from './aspectInterpretations';
import {
  generateEngagingTitle,
  generateEngagingSubtitle,
  generateNarrativeIntro,
  generateClosingStatement,
} from './titleTemplates';
import { getWeeklyBlogData } from '../../src/lib/blog/weekly-data';

// Normalize any date to the Monday of its week
function getMonday(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

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

export interface RankedDay {
  date: Date;
  strength: 'best' | 'good' | 'favorable';
  whyGood: string;
}

export interface BestDaysGuidance {
  love: { dates: Date[]; reason: string; ranked?: RankedDay[] };
  prosperity: { dates: Date[]; reason: string; ranked?: RankedDay[] };
  healing: { dates: Date[]; reason: string; ranked?: RankedDay[] };
  protection: { dates: Date[]; reason: string; ranked?: RankedDay[] };
  manifestation: { dates: Date[]; reason: string; ranked?: RankedDay[] };
  cleansing: { dates: Date[]; reason: string; ranked?: RankedDay[] };
}

export interface WeeklyCrystalGuide {
  date: Date;
  crystal: string;
  reason: string;
  usage: string;
  chakra: string;
  intention: string;
  affirmation: string;
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
  // Normalize to Monday of the week (handles any day being passed in)
  const weekStart = getMonday(startDate);
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
    // Use ISO week numbering for consistency
    const weekNumber = getISOWeek(weekStart);
    const year = getISOWeekYear(weekStart);

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
        love: { dates: [], reason: '' },
        prosperity: { dates: [], reason: '' },
        healing: { dates: [], reason: '' },
        protection: { dates: [], reason: '' },
        manifestation: { dates: [], reason: '' },
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
      year,
    };
  }

  // Try to use pre-computed data first (much faster: 2 DB queries vs ~56 calculations)
  try {
    const precomputedData = await getWeeklyBlogData(weekStart);
    if (precomputedData) {
      console.log(
        `[generateWeeklyContent] Using pre-computed data for week ${getISOWeek(weekStart)}-${getISOWeekYear(weekStart)}`,
      );
      return precomputedData;
    }
    console.log(
      `[generateWeeklyContent] No pre-computed data available, falling back to full generation`,
    );
  } catch (error) {
    console.warn(
      `[generateWeeklyContent] Error fetching pre-computed data, falling back to full generation:`,
      error,
    );
  }

  // Fall back to full astronomical calculations
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
  const subtitle = generateWeeklySubtitle(
    majorAspects,
    retrogradeChanges,
    planetaryHighlights,
    moonPhases,
  );
  const summary = generateWeeklySummary(
    planetaryHighlights,
    majorAspects,
    moonPhases,
  );

  const weekNumber = getWeekNumber(weekStart);
  const year = getISOWeekYear(weekStart);

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
    year,
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
    { body: Body.Pluto, name: 'Pluto' },
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
  // Use rich aspect interpretations database
  const meaning = getAspectMeaning(planetA, planetB, aspect);
  return meaning.energy;
}

function getAspectGuidance(
  planetA: string,
  planetB: string,
  aspect: string,
): string {
  // Use rich aspect interpretations database
  const meaning = getAspectMeaning(planetA, planetB, aspect);

  // Combine expect and workWith for comprehensive guidance
  const parts: string[] = [];
  if (meaning.expect) {
    parts.push(`Expect: ${meaning.expect}.`);
  }
  if (meaning.workWith) {
    parts.push(`How to work with this: ${meaning.workWith}.`);
  }
  if (meaning.avoid) {
    parts.push(`Avoid: ${meaning.avoid}.`);
  }

  return parts.join(' ') || `Work with this ${aspect} energy consciously.`;
}

async function calculateMoonPhases(
  weekStart: Date,
  weekEnd: Date,
): Promise<MoonPhaseEvent[]> {
  const phases: MoonPhaseEvent[] = [];
  const currentDate = new Date(weekStart);

  // Check every 6 hours for better moon phase detection (was 12 hours, too coarse)
  const checkInterval = 6 * 60 * 60 * 1000;

  let lastMajorPhase: string | null = null;

  // Named moons by month (used for full moon display)
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

  while (currentDate <= weekEnd) {
    // Use MoonPhase which returns phase angle in degrees (0-360)
    // 0° = New Moon, 90° = First Quarter, 180° = Full Moon, 270° = Third Quarter
    const moonPhaseAngle = MoonPhase(currentDate);
    const astroTime = new AstroTime(currentDate);
    const illumination = Illumination(Body.Moon, astroTime);
    const illuminationPercent = illumination.phase_fraction * 100;

    // Determine phase name and if it's significant (same logic as getAccurateMoonPhase)
    let phaseName = '';
    let isMajorPhase = false;

    // Check for exact major phases using phase angle (±5° window)
    const isNewMoon = moonPhaseAngle >= 355 || moonPhaseAngle <= 5;
    const isFirstQuarter = moonPhaseAngle >= 85 && moonPhaseAngle <= 95;
    const isFullMoon = moonPhaseAngle >= 175 && moonPhaseAngle <= 185;
    const isThirdQuarter = moonPhaseAngle >= 265 && moonPhaseAngle <= 275;

    if (isNewMoon) {
      phaseName = 'New Moon';
      isMajorPhase = true;
    } else if (isFirstQuarter) {
      phaseName = 'First Quarter';
      isMajorPhase = true;
    } else if (isFullMoon) {
      // Use named moon for full moons, but keep "Full Moon" in the label
      const month = currentDate.getMonth() + 1;
      const namedMoon = moonNames[month];
      phaseName = namedMoon ? `${namedMoon} (Full Moon)` : 'Full Moon';
      isMajorPhase = true;
    } else if (isThirdQuarter) {
      phaseName = 'Last Quarter';
      isMajorPhase = true;
    } else if (moonPhaseAngle > 5 && moonPhaseAngle < 85) {
      phaseName = 'Waxing Crescent';
    } else if (moonPhaseAngle > 95 && moonPhaseAngle < 175) {
      phaseName = 'Waxing Gibbous';
    } else if (moonPhaseAngle > 185 && moonPhaseAngle < 265) {
      phaseName = 'Waning Gibbous';
    } else {
      phaseName = 'Waning Crescent';
    }

    // Only add if it's a major phase AND we haven't already added this phase
    if (isMajorPhase && phaseName !== lastMajorPhase) {
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

      lastMajorPhase = phaseName;
    }

    currentDate.setTime(currentDate.getTime() + checkInterval);
  }

  return phases;
}

function normalizeMoonPhaseName(phase: string): string {
  const lower = phase.toLowerCase();
  if (lower.includes('new moon')) return 'New Moon';
  if (lower.includes('full moon')) return 'Full Moon';
  if (lower.includes('first quarter')) return 'First Quarter';
  if (lower.includes('last quarter') || lower.includes('third quarter'))
    return 'Last Quarter';
  if (lower.includes('waxing crescent')) return 'Waxing Crescent';
  if (lower.includes('waxing gibbous')) return 'Waxing Gibbous';
  if (lower.includes('waning gibbous')) return 'Waning Gibbous';
  if (lower.includes('waning crescent')) return 'Waning Crescent';
  return phase;
}

function getMoonPhaseEnergy(phase: string, sign: string): string {
  const normalizedPhase = normalizeMoonPhaseName(phase);
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

  return `The ${phase} in ${sign} brings energy for ${phaseEnergies[normalizedPhase] || 'cosmic alignment'}`;
}

function getMoonPhaseGuidance(phase: string, sign: string): string {
  const normalizedPhase = normalizeMoonPhaseName(phase);
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

  return (
    guidance[normalizedPhase] || `Work with the ${phase} energy in ${sign}.`
  );
}

function getMoonPhaseRituals(phase: string): string[] {
  const normalizedPhase = normalizeMoonPhaseName(phase);
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

  return (
    rituals[normalizedPhase] || [
      'Meditation',
      'Journaling',
      'Nature connection',
    ]
  );
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
  // Track ranked days with reasons for each category
  type DayScore = {
    date: Date;
    score: number;
    reasons: string[];
    forecast: DailyForecast;
  };

  const loveScores: DayScore[] = [];
  const prosperityScores: DayScore[] = [];
  const healingScores: DayScore[] = [];
  const protectionScores: DayScore[] = [];
  const manifestationScores: DayScore[] = [];
  const cleansingScores: DayScore[] = [];

  // Score modifiers for different factors
  const PLANET_RULER_BONUS = 3;
  const MOON_SIGN_BONUS = 2;
  const HARMONIOUS_ASPECT_BONUS = 4;
  const CHALLENGING_ASPECT_PENALTY = -1;
  const MOON_PHASE_BONUS = 3;

  // Helper to find aspects on a specific date
  const getAspectsOnDate = (date: Date) =>
    majorAspects.filter((a) => a.date.toDateString() === date.toDateString());

  // Helper to find moon phase on a specific date
  const getMoonPhaseOnDate = (date: Date) =>
    moonPhases.find((m) => m.date.toDateString() === date.toDateString());

  // Analyze each day
  dailyForecasts.forEach((forecast) => {
    const dayAspects = getAspectsOnDate(forecast.date);
    const dayMoonPhase = getMoonPhaseOnDate(forecast.date);

    // === LOVE scoring ===
    let loveScore = 0;
    const loveReasons: string[] = [];

    if (forecast.planetaryRuler === 'Venus') {
      loveScore += PLANET_RULER_BONUS;
      loveReasons.push('Venus rules this day - peak romantic energy');
    }
    if (forecast.moonSign === 'Libra') {
      loveScore += MOON_SIGN_BONUS;
      loveReasons.push('Moon in Libra favors partnership and harmony');
    }
    if (forecast.moonSign === 'Taurus') {
      loveScore += MOON_SIGN_BONUS;
      loveReasons.push('Moon in Taurus enhances sensuality and connection');
    }
    dayAspects.forEach((aspect) => {
      if (aspect.planetA === 'Venus' || aspect.planetB === 'Venus') {
        if (['trine', 'sextile', 'conjunction'].includes(aspect.aspect)) {
          loveScore += HARMONIOUS_ASPECT_BONUS;
          const other =
            aspect.planetA === 'Venus' ? aspect.planetB : aspect.planetA;
          loveReasons.push(
            `Venus ${aspect.aspect} ${other} brings romantic flow`,
          );
        }
      }
      if (
        (aspect.planetA === 'Venus' && aspect.planetB === 'Mars') ||
        (aspect.planetA === 'Mars' && aspect.planetB === 'Venus')
      ) {
        loveScore += 2;
        loveReasons.push(`Venus-Mars ${aspect.aspect} ignites attraction`);
      }
    });

    if (loveScore > 0) {
      loveScores.push({
        date: forecast.date,
        score: loveScore,
        reasons: loveReasons,
        forecast,
      });
    }

    // === PROSPERITY scoring ===
    let prosperityScore = 0;
    const prosperityReasons: string[] = [];

    if (forecast.planetaryRuler === 'Jupiter') {
      prosperityScore += PLANET_RULER_BONUS;
      prosperityReasons.push('Jupiter rules this day - expansion and luck');
    }
    if (forecast.moonSign === 'Sagittarius') {
      prosperityScore += MOON_SIGN_BONUS;
      prosperityReasons.push('Moon in Sagittarius amplifies opportunity');
    }
    if (forecast.moonSign === 'Taurus') {
      prosperityScore += MOON_SIGN_BONUS;
      prosperityReasons.push('Moon in Taurus grounds financial matters');
    }
    dayAspects.forEach((aspect) => {
      if (aspect.planetA === 'Jupiter' || aspect.planetB === 'Jupiter') {
        if (['trine', 'sextile', 'conjunction'].includes(aspect.aspect)) {
          prosperityScore += HARMONIOUS_ASPECT_BONUS;
          const other =
            aspect.planetA === 'Jupiter' ? aspect.planetB : aspect.planetA;
          prosperityReasons.push(
            `Jupiter ${aspect.aspect} ${other} expands abundance`,
          );
        }
      }
    });

    if (prosperityScore > 0) {
      prosperityScores.push({
        date: forecast.date,
        score: prosperityScore,
        reasons: prosperityReasons,
        forecast,
      });
    }

    // === HEALING scoring ===
    let healingScore = 0;
    const healingReasons: string[] = [];

    if (forecast.planetaryRuler === 'Moon') {
      healingScore += PLANET_RULER_BONUS;
      healingReasons.push('Moon rules this day - emotional healing supported');
    }
    if (forecast.moonSign === 'Cancer') {
      healingScore += MOON_SIGN_BONUS;
      healingReasons.push('Moon in Cancer nurtures inner healing');
    }
    if (forecast.moonSign === 'Pisces') {
      healingScore += MOON_SIGN_BONUS;
      healingReasons.push('Moon in Pisces opens spiritual healing');
    }
    if (dayMoonPhase) {
      healingScore += MOON_PHASE_BONUS;
      healingReasons.push(`${dayMoonPhase.phase} amplifies healing rituals`);
    }

    if (healingScore > 0) {
      healingScores.push({
        date: forecast.date,
        score: healingScore,
        reasons: healingReasons,
        forecast,
      });
    }

    // === PROTECTION scoring ===
    let protectionScore = 0;
    const protectionReasons: string[] = [];

    if (forecast.planetaryRuler === 'Mars') {
      protectionScore += PLANET_RULER_BONUS;
      protectionReasons.push('Mars rules this day - defensive strength peaks');
    }
    if (forecast.planetaryRuler === 'Saturn') {
      protectionScore += 2;
      protectionReasons.push("Saturn's energy builds lasting protection");
    }
    if (forecast.moonSign === 'Aries') {
      protectionScore += MOON_SIGN_BONUS;
      protectionReasons.push('Moon in Aries empowers boundaries');
    }
    if (forecast.moonSign === 'Scorpio') {
      protectionScore += MOON_SIGN_BONUS;
      protectionReasons.push('Moon in Scorpio strengthens psychic shields');
    }

    if (protectionScore > 0) {
      protectionScores.push({
        date: forecast.date,
        score: protectionScore,
        reasons: protectionReasons,
        forecast,
      });
    }

    // === MANIFESTATION scoring ===
    let manifestationScore = 0;
    const manifestationReasons: string[] = [];

    if (forecast.planetaryRuler === 'Sun') {
      manifestationScore += PLANET_RULER_BONUS;
      manifestationReasons.push('Sun rules this day - willpower magnified');
    }
    if (dayMoonPhase?.phase.includes('New')) {
      manifestationScore += MOON_PHASE_BONUS + 2;
      manifestationReasons.push(
        'New Moon is the ultimate time for new intentions',
      );
    }
    if (forecast.moonSign === 'Aries') {
      manifestationScore += MOON_SIGN_BONUS;
      manifestationReasons.push('Moon in Aries initiates powerful beginnings');
    }
    if (forecast.moonSign === 'Leo') {
      manifestationScore += MOON_SIGN_BONUS;
      manifestationReasons.push('Moon in Leo amplifies creative vision');
    }

    if (manifestationScore > 0) {
      manifestationScores.push({
        date: forecast.date,
        score: manifestationScore,
        reasons: manifestationReasons,
        forecast,
      });
    }

    // === CLEANSING scoring ===
    let cleansingScore = 0;
    const cleansingReasons: string[] = [];

    if (forecast.planetaryRuler === 'Saturn') {
      cleansingScore += PLANET_RULER_BONUS;
      cleansingReasons.push(
        'Saturn rules this day - release what no longer serves',
      );
    }
    if (dayMoonPhase?.phase.includes('Full')) {
      cleansingScore += MOON_PHASE_BONUS;
      cleansingReasons.push('Full Moon illuminates what needs releasing');
    }
    if (
      dayMoonPhase?.phase.includes('Waning') ||
      dayMoonPhase?.phase.includes('Last')
    ) {
      cleansingScore += MOON_PHASE_BONUS;
      cleansingReasons.push('Waning Moon naturally supports letting go');
    }
    if (forecast.moonSign === 'Scorpio') {
      cleansingScore += MOON_SIGN_BONUS;
      cleansingReasons.push('Moon in Scorpio transforms and purges');
    }
    if (forecast.moonSign === 'Capricorn') {
      cleansingScore += MOON_SIGN_BONUS;
      cleansingReasons.push('Moon in Capricorn clears obstacles to goals');
    }

    if (cleansingScore > 0) {
      cleansingScores.push({
        date: forecast.date,
        score: cleansingScore,
        reasons: cleansingReasons,
        forecast,
      });
    }
  });

  // Helper to convert scores to ranked days
  const toRankedDays = (scores: DayScore[]): RankedDay[] => {
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s, index) => ({
        date: s.date,
        strength:
          index === 0 && s.score >= 5
            ? 'best'
            : s.score >= 4
              ? 'good'
              : 'favorable',
        whyGood: s.reasons[0] || 'Favorable cosmic alignment',
      }));
  };

  // Helper to generate summary reason
  const generateSummaryReason = (
    ranked: RankedDay[],
    category: string,
  ): string => {
    if (ranked.length === 0) {
      return `Look for ${category.toLowerCase()} opportunities throughout the week.`;
    }
    const best = ranked.find((r) => r.strength === 'best');
    if (best) {
      const dayName = best.date.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      return `${dayName} is your power day for ${category.toLowerCase()}. ${best.whyGood}.`;
    }
    return `${ranked.length} favorable days for ${category.toLowerCase()} this week.`;
  };

  // Build results
  const loveRanked = toRankedDays(loveScores);
  const prosperityRanked = toRankedDays(prosperityScores);
  const healingRanked = toRankedDays(healingScores);
  const protectionRanked = toRankedDays(protectionScores);
  const manifestationRanked = toRankedDays(manifestationScores);
  const cleansingRanked = toRankedDays(cleansingScores);

  return {
    love: {
      dates: loveRanked.map((r) => r.date),
      reason: generateSummaryReason(loveRanked, 'Love'),
      ranked: loveRanked,
    },
    prosperity: {
      dates: prosperityRanked.map((r) => r.date),
      reason: generateSummaryReason(prosperityRanked, 'Prosperity'),
      ranked: prosperityRanked,
    },
    healing: {
      dates: healingRanked.map((r) => r.date),
      reason: generateSummaryReason(healingRanked, 'Healing'),
      ranked: healingRanked,
    },
    protection: {
      dates: protectionRanked.map((r) => r.date),
      reason: generateSummaryReason(protectionRanked, 'Protection'),
      ranked: protectionRanked,
    },
    manifestation: {
      dates: manifestationRanked.map((r) => r.date),
      reason: generateSummaryReason(manifestationRanked, 'Manifestation'),
      ranked: manifestationRanked,
    },
    cleansing: {
      dates: cleansingRanked.map((r) => r.date),
      reason: generateSummaryReason(cleansingRanked, 'Cleansing'),
      ranked: cleansingRanked,
    },
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
    return crystalGuide;
  }

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

  // Planet themes for contextual reasons
  const planetThemes: Record<string, { theme: string; action: string }> = {
    Sun: { theme: 'vitality and self-expression', action: 'shine your light' },
    Moon: { theme: 'intuition and emotions', action: 'trust your feelings' },
    Mars: { theme: 'courage and motivation', action: 'take bold action' },
    Mercury: { theme: 'communication and clarity', action: 'speak your truth' },
    Jupiter: { theme: 'abundance and growth', action: 'expand your horizons' },
    Venus: { theme: 'love and harmony', action: 'open your heart' },
    Saturn: {
      theme: 'discipline and mastery',
      action: 'build solid foundations',
    },
  };

  // Varied usage templates
  const usageTemplates = [
    (crystal: string, chakra: string) =>
      `Hold ${crystal} during morning meditation to set your intention for the day.`,
    (crystal: string, chakra: string) =>
      `Place ${crystal} on your ${chakra} chakra while resting to absorb its energy.`,
    (crystal: string, chakra: string) =>
      `Carry ${crystal} in your pocket or bag to maintain its supportive vibration throughout the day.`,
    (crystal: string, chakra: string) =>
      `Keep ${crystal} on your desk or workspace to enhance focus and alignment.`,
    (crystal: string, chakra: string) =>
      `Sleep with ${crystal} under your pillow or on your nightstand for dream work.`,
    (crystal: string, chakra: string) =>
      `Create a small altar with ${crystal} as the centerpiece for today's intentions.`,
    (crystal: string, chakra: string) =>
      `Hold ${crystal} while journaling to deepen your insights and self-reflection.`,
  ];

  // Affirmation templates based on crystal/planet energy
  const generateAffirmation = (
    crystal: Crystal,
    planet: string,
    moonSign: string,
  ): string => {
    const theme = planetThemes[planet]?.theme || 'cosmic alignment';
    const intentions = crystal.intentions || [];

    if (intentions.length > 0) {
      const intention = intentions[0].toLowerCase();
      return `I welcome ${intention} into my life with ease and grace.`;
    }

    // Fallback based on planet
    const affirmations: Record<string, string> = {
      Sun: 'I radiate confidence and embrace my authentic self.',
      Moon: 'I trust my intuition and honor my emotional wisdom.',
      Mars: 'I have the courage to pursue what sets my soul on fire.',
      Mercury: 'My thoughts are clear and my words carry power.',
      Jupiter: 'Abundance flows to me naturally and effortlessly.',
      Venus: 'I am worthy of love and beauty surrounds me.',
      Saturn: 'I build my dreams with patience and persistence.',
    };

    return (
      affirmations[planet] || `I align with the cosmic energy of ${moonSign}.`
    );
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
      const matches = moonCrystals.filter((crystal) =>
        planetCrystals.some((pc) => pc.id === crystal.id),
      );
      return matches.length > 0 ? matches[0] : null;
    } catch (error) {
      console.error('Error finding combination crystal:', error);
      return null;
    }
  };

  // Generate contextual reason based on daily events
  const generateContextualReason = (
    crystal: Crystal,
    forecast: DailyForecast,
    planet: string,
  ): string => {
    const theme = planetThemes[planet];

    // Check for major events
    if (forecast.majorEvents && forecast.majorEvents.length > 0) {
      const event = forecast.majorEvents[0];
      if (event.includes('retrograde')) {
        return `As ${event}, ${crystal.name} helps maintain clarity and perspective during this reflective period.`;
      }
      if (event.includes('enters')) {
        return `With ${event}, ${crystal.name} supports smooth transitions and helps you embrace new energy.`;
      }
      if (event.includes('trine') || event.includes('sextile')) {
        return `Today's harmonious aspects are enhanced by ${crystal.name}, amplifying the flow of positive energy.`;
      }
      if (event.includes('square') || event.includes('opposition')) {
        return `${crystal.name} provides grounding support as you navigate today's dynamic cosmic tensions.`;
      }
    }

    // Default to planet/moon themed reason
    if (theme) {
      return `On this ${forecast.planetaryRuler} day with Moon in ${forecast.moonSign}, ${crystal.name} enhances ${theme.theme} and helps you ${theme.action}.`;
    }

    return `${crystal.name} aligns with today's ${forecast.moonSign} moon energy, supporting your intentions.`;
  };

  dailyForecasts.forEach((forecast, index) => {
    try {
      const planet =
        planetMap[forecast.planetaryRuler] || forecast.planetaryRuler;

      let selectedCrystal: Crystal | null = null;

      // Priority 1: Find crystal matching both moon sign AND planetary ruler
      const combinationCrystal = findCombinationCrystal(
        forecast.moonSign,
        planet,
      );
      if (combinationCrystal && !usedCrystals.has(combinationCrystal.name)) {
        selectedCrystal = combinationCrystal;
      }

      // Priority 2: Find crystal matching moon sign
      if (!selectedCrystal) {
        try {
          const moonCrystals = getCrystalsByZodiacSign(forecast.moonSign);
          for (const crystal of moonCrystals) {
            if (!usedCrystals.has(crystal.name)) {
              selectedCrystal = crystal;
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
            break;
          }
        }
      }

      // Priority 4: Find any unused crystal
      if (!selectedCrystal) {
        for (const crystal of crystalDatabase) {
          if (!usedCrystals.has(crystal.name)) {
            selectedCrystal = crystal;
            break;
          }
        }
      }

      // Fallback: Allow reuse if needed
      if (!selectedCrystal) {
        try {
          const moonCrystals = getCrystalsByZodiacSign(forecast.moonSign);
          if (moonCrystals.length > 0) {
            selectedCrystal = moonCrystals[0];
          } else {
            const idx = crystalGuide.length % crystalDatabase.length;
            selectedCrystal = crystalDatabase[idx];
          }
        } catch (error) {
          const idx = crystalGuide.length % crystalDatabase.length;
          selectedCrystal = crystalDatabase[idx];
        }
      }

      if (!selectedCrystal) {
        const idx = crystalGuide.length % crystalDatabase.length;
        selectedCrystal = crystalDatabase[idx];
      }

      usedCrystals.add(selectedCrystal.name);

      // Get chakra
      const chakra = selectedCrystal.primaryChakra
        ? selectedCrystal.primaryChakra.replace(' Chakra', '')
        : selectedCrystal.chakras && selectedCrystal.chakras.length > 0
          ? selectedCrystal.chakras[0]
          : 'Crown';

      // Get intention
      const intention =
        selectedCrystal.intentions && selectedCrystal.intentions.length > 0
          ? selectedCrystal.intentions[0]
          : `Align with ${forecast.moonSign} moon energy`;

      // Generate contextual reason
      const reason = generateContextualReason(
        selectedCrystal,
        forecast,
        planet,
      );

      // Generate varied usage (cycle through templates)
      const usageTemplate = usageTemplates[index % usageTemplates.length];
      const usage =
        selectedCrystal.workingWith?.meditation ||
        usageTemplate(selectedCrystal.name, chakra);

      // Generate affirmation
      const affirmation = generateAffirmation(
        selectedCrystal,
        planet,
        forecast.moonSign,
      );

      const crystalDate =
        forecast.date instanceof Date ? forecast.date : new Date(forecast.date);

      crystalGuide.push({
        date: crystalDate,
        crystal: selectedCrystal.name,
        reason,
        usage,
        chakra,
        intention,
        affirmation,
      });
    } catch (error) {
      console.error(
        'Error generating crystal guide for forecast:',
        error,
        forecast,
      );
    }
  });

  if (process.env.NODE_ENV === 'development' && crystalGuide.length === 0) {
    console.warn(
      '[Crystal Guide] WARNING: No crystal recommendations generated',
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
  // Find the most significant event
  const majorEvent =
    highlights.find((h) => h.significance === 'extraordinary') ||
    highlights.find((h) => h.significance === 'high') ||
    highlights.find((h) => h.event === 'goes-retrograde') ||
    highlights.find((h) => h.event === 'enters-sign') ||
    null;

  // Determine event type for title generation
  let event: {
    type: 'ingress' | 'retrograde' | 'direct' | 'moon-phase';
    planet?: string;
    sign?: string;
    phaseName?: string;
    moonName?: string;
  } | null = null;

  if (majorEvent && 'planet' in majorEvent) {
    if (majorEvent.event === 'enters-sign') {
      event = {
        type: 'ingress',
        planet: majorEvent.planet,
        sign: majorEvent.details.toSign,
      };
    } else if (majorEvent.event === 'goes-retrograde') {
      event = {
        type: 'retrograde',
        planet: majorEvent.planet,
      };
    } else if (majorEvent.event === 'goes-direct') {
      event = {
        type: 'direct',
        planet: majorEvent.planet,
      };
    }
  } else if (moonPhases.length > 0) {
    const majorMoon = moonPhases.find(
      (m) => m.phase.includes('Full') || m.phase.includes('New'),
    );
    if (majorMoon) {
      // Extract named moon if present (e.g., "Wolf Moon (Full Moon)")
      const namedMatch = majorMoon.phase.match(/^(\w+ Moon)/);
      event = {
        type: 'moon-phase',
        phaseName: majorMoon.phase.includes('Full') ? 'Full Moon' : 'New Moon',
        sign: majorMoon.sign,
        moonName: namedMatch ? namedMatch[1] : undefined,
      };
    }
  }

  return generateEngagingTitle(weekStart, event);
}

function generateWeeklySubtitle(
  majorAspects: MajorAspect[],
  retrogradeChanges: RetrogradeChange[],
  highlights: PlanetaryHighlight[],
  moonPhases: MoonPhaseEvent[],
): string {
  // Count retrogrades
  const retrogradeCount = retrogradeChanges.filter(
    (r) => r.action === 'begins',
  ).length;

  // Find major moon phase
  const majorMoon = moonPhases.find(
    (m) => m.phase.includes('Full') || m.phase.includes('New'),
  );
  const majorMoonPhase = majorMoon
    ? { phase: majorMoon.phase, sign: majorMoon.sign }
    : null;

  // Find top aspect
  const topAspect =
    majorAspects.length > 0
      ? {
          planetA: majorAspects[0].planetA,
          planetB: majorAspects[0].planetB,
          aspect: majorAspects[0].aspect,
        }
      : null;

  // Find top ingress
  const ingressHighlight = highlights.find((h) => h.event === 'enters-sign');
  const topIngress =
    ingressHighlight && ingressHighlight.details.toSign
      ? {
          planet: ingressHighlight.planet,
          sign: ingressHighlight.details.toSign,
        }
      : null;

  return generateEngagingSubtitle(
    retrogradeCount,
    majorMoonPhase,
    topAspect,
    topIngress,
  );
}

function generateWeeklySummary(
  highlights: PlanetaryHighlight[],
  aspects: MajorAspect[],
  moonPhases: MoonPhaseEvent[],
): string {
  // Convert to simple format for narrative generation
  const simpleHighlights = highlights
    .filter((h) => h.event !== 'enters-sign' || h.details?.toSign)
    .slice(0, 3)
    .map((h) => ({
      planet: h.planet,
      event: h.event,
      sign: h.details?.toSign,
    }));

  const simpleMoonPhases = moonPhases.slice(0, 2).map((m) => ({
    phase: m.phase,
    sign: m.sign,
  }));

  const simpleAspects = aspects.slice(0, 2).map((a) => ({
    planetA: a.planetA,
    planetB: a.planetB,
    aspect: a.aspect,
  }));

  // Generate narrative intro
  const narrativeIntro = generateNarrativeIntro(
    simpleHighlights,
    simpleMoonPhases,
    simpleAspects,
  );

  // Determine dominant element for closing statement
  const signElements: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
    Aries: 'fire',
    Leo: 'fire',
    Sagittarius: 'fire',
    Taurus: 'earth',
    Virgo: 'earth',
    Capricorn: 'earth',
    Gemini: 'air',
    Libra: 'air',
    Aquarius: 'air',
    Cancer: 'water',
    Scorpio: 'water',
    Pisces: 'water',
  };

  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  [...simpleHighlights, ...simpleMoonPhases].forEach((item) => {
    const sign = 'sign' in item ? item.sign : undefined;
    if (sign && signElements[sign]) {
      elementCounts[signElements[sign]]++;
    }
  });

  const dominantElement = (
    Object.entries(elementCounts) as [
      'fire' | 'earth' | 'air' | 'water',
      number,
    ][]
  ).reduce(
    (max, [element, count]) => (count > max.count ? { element, count } : max),
    { element: 'mixed' as const, count: 0 },
  ).element as 'fire' | 'earth' | 'air' | 'water' | 'mixed';

  // Generate closing statement
  const closing = generateClosingStatement(
    dominantElement === 'mixed' || elementCounts[dominantElement] < 2
      ? 'mixed'
      : dominantElement,
  );

  // Combine parts
  if (narrativeIntro) {
    return `${narrativeIntro} ${closing}`;
  }

  // Fallback with old logic if narrative generation fails
  const themes = getWeeklyThemes(highlights, aspects);
  if (themes.length > 0) {
    return `This week brings opportunities for ${themes.join(', ')}. ${closing}`;
  }

  return `Navigate this week with awareness and intention. ${closing}`;
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
  // Use ISO week numbering for consistency across the codebase
  return getISOWeek(date);
}
