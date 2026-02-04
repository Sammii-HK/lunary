import {
  Observer,
  AstroTime,
  Body,
  SearchLunarEclipse,
  NextLunarEclipse,
  SearchGlobalSolarEclipse,
  NextGlobalSolarEclipse,
  EclipseKind,
  SearchMoonPhase,
  SearchLunarApsis,
  ApsisKind,
  Seasons,
  Elongation,
} from 'astronomy-engine';
import {
  calculateRealAspects,
  getRealPlanetaryPositions,
  getZodiacSign,
} from '../../../utils/astrology/cosmic-og';

// Slow planets that we track for major sign changes
const SLOW_PLANETS = [
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

// Planet descriptions for ingress events
const PLANET_INGRESS_DESCRIPTIONS: Record<string, Record<string, string>> = {
  Jupiter: {
    Aries:
      'Jupiter in Aries expands initiative, leadership, and bold action. Favors entrepreneurs and pioneers.',
    Taurus:
      'Jupiter in Taurus expands wealth, comfort, and material stability. Favors investments and property.',
    Gemini:
      'Jupiter in Gemini expands communication, learning, and networking. Favors writers and teachers.',
    Cancer:
      'Jupiter in Cancer expands home, family, and emotional security. Jupiter is exalted here.',
    Leo: 'Jupiter in Leo expands creativity, self-expression, and confidence. Favors artists and performers.',
    Virgo:
      'Jupiter in Virgo expands health, service, and practical skills. Favors healers and craftspeople.',
    Libra:
      'Jupiter in Libra expands relationships, partnerships, and justice. Favors collaborations.',
    Scorpio:
      'Jupiter in Scorpio expands transformation, intimacy, and shared resources. Favors deep work.',
    Sagittarius:
      'Jupiter in Sagittarius expands travel, philosophy, and higher learning. Jupiter rules here.',
    Capricorn:
      'Jupiter in Capricorn expands ambition, structure, and achievement. Favors long-term goals.',
    Aquarius:
      'Jupiter in Aquarius expands innovation, community, and humanitarian efforts.',
    Pisces:
      'Jupiter in Pisces expands spirituality, compassion, and creativity. Jupiter co-rules here.',
  },
  Saturn: {
    Aries:
      'Saturn in Aries teaches responsible leadership and disciplined action. Learn to lead with maturity.',
    Taurus:
      'Saturn in Taurus teaches financial discipline and sustainable values. Build lasting security.',
    Gemini:
      'Saturn in Gemini teaches structured communication and focused learning. Master your message.',
    Cancer:
      'Saturn in Cancer teaches emotional boundaries and family responsibility. Build secure foundations.',
    Leo: 'Saturn in Leo teaches authentic self-expression and responsible creativity. Lead by example.',
    Virgo:
      'Saturn in Virgo teaches health discipline and service excellence. Perfect your craft.',
    Libra:
      'Saturn in Libra teaches relationship commitment and fair dealings. Saturn is exalted here.',
    Scorpio:
      'Saturn in Scorpio teaches transformation discipline and resource management. Face your shadows.',
    Sagittarius:
      'Saturn in Sagittarius teaches philosophical discipline and ethical growth. Expand wisely.',
    Capricorn:
      'Saturn in Capricorn teaches mastery and achievement. Saturn rules here - time to build.',
    Aquarius:
      'Saturn in Aquarius teaches social responsibility and structured innovation. Saturn co-rules here.',
    Pisces:
      'Saturn in Pisces teaches spiritual discipline and compassionate boundaries. Ground your dreams.',
  },
  Uranus: {
    Aries:
      'Uranus in Aries revolutionizes identity, independence, and personal freedom.',
    Taurus:
      'Uranus in Taurus revolutionizes finances, values, and material structures.',
    Gemini:
      'Uranus in Gemini revolutionizes communication, technology, and information sharing.',
    Cancer:
      'Uranus in Cancer revolutionizes home, family, and emotional expression.',
    Leo: 'Uranus in Leo revolutionizes creativity, self-expression, and entertainment.',
    Virgo:
      'Uranus in Virgo revolutionizes health, work, and service industries.',
    Libra:
      'Uranus in Libra revolutionizes relationships, partnerships, and social justice.',
    Scorpio:
      'Uranus in Scorpio revolutionizes psychology, sexuality, and shared resources.',
    Sagittarius:
      'Uranus in Sagittarius revolutionizes education, travel, and belief systems.',
    Capricorn:
      'Uranus in Capricorn revolutionizes governments, institutions, and career structures.',
    Aquarius:
      'Uranus in Aquarius revolutionizes technology, community, and collective ideals. Uranus rules here.',
    Pisces:
      'Uranus in Pisces revolutionizes spirituality, imagination, and collective consciousness.',
  },
  Neptune: {
    Aries:
      'Neptune in Aries dissolves ego boundaries, inspiring spiritual warriors and visionary pioneers.',
    Taurus:
      'Neptune in Taurus dissolves material attachments, inspiring sustainable and spiritual values.',
    Gemini:
      'Neptune in Gemini dissolves communication barriers, inspiring poetic and intuitive expression.',
    Cancer:
      'Neptune in Cancer dissolves family boundaries, inspiring collective nurturing and homeland ideals.',
    Leo: 'Neptune in Leo dissolves creative blocks, inspiring glamour, film, and celebrity culture.',
    Virgo:
      'Neptune in Virgo dissolves perfectionism, inspiring holistic health and spiritual service.',
    Libra:
      'Neptune in Libra dissolves relationship illusions, inspiring ideal partnerships and peace movements.',
    Scorpio:
      'Neptune in Scorpio dissolves taboos, inspiring psychological and occult exploration.',
    Sagittarius:
      'Neptune in Sagittarius dissolves religious boundaries, inspiring global spirituality.',
    Capricorn:
      'Neptune in Capricorn dissolves rigid structures, inspiring compassionate institutions.',
    Aquarius:
      'Neptune in Aquarius dissolves collective boundaries, inspiring utopian visions and tech dreams.',
    Pisces:
      'Neptune in Pisces dissolves all boundaries, inspiring deep spirituality and artistic transcendence. Neptune rules here.',
  },
  Pluto: {
    Aries:
      'Pluto in Aries transforms identity and personal power. Deep regeneration of self.',
    Taurus:
      'Pluto in Taurus transforms wealth, values, and resources. Deep regeneration of material life.',
    Gemini:
      'Pluto in Gemini transforms communication and information. Deep regeneration of thought.',
    Cancer:
      'Pluto in Cancer transforms family and emotional foundations. Deep regeneration of roots.',
    Leo: 'Pluto in Leo transforms creativity and self-expression. Deep regeneration of the heart.',
    Virgo:
      'Pluto in Virgo transforms health and service. Deep regeneration of daily life.',
    Libra:
      'Pluto in Libra transforms relationships and justice. Deep regeneration of partnerships.',
    Scorpio:
      'Pluto in Scorpio transforms at the deepest level. Pluto rules here - ultimate regeneration.',
    Sagittarius:
      'Pluto in Sagittarius transforms beliefs and global perspectives. Deep regeneration of truth.',
    Capricorn:
      'Pluto in Capricorn transforms power structures and institutions. Deep regeneration of authority.',
    Aquarius:
      'Pluto in Aquarius transforms technology and collective power. Deep regeneration of society.',
    Pisces:
      'Pluto in Pisces transforms spirituality and collective unconscious. Deep regeneration of the soul.',
  },
};

export interface PlanetaryIngress {
  planet: string;
  fromSign: string;
  toSign: string;
  exactDate: string;
  year: number;
  description: string;
  themes: string[];
  isRetrograde: boolean;
}

export interface MoonEvent {
  date: string;
  type:
    | 'supermoon'
    | 'micromoon'
    | 'blue_moon'
    | 'black_moon'
    | 'new_moon'
    | 'full_moon';
  sign: string;
  description: string;
  distanceKm?: number;
}

export interface SeasonalEvent {
  date: string;
  type:
    | 'spring_equinox'
    | 'summer_solstice'
    | 'fall_equinox'
    | 'winter_solstice';
  description: string;
}

export interface PlanetaryElongation {
  date: string;
  planet: 'Mercury' | 'Venus';
  elongation: number;
  visibility: 'morning' | 'evening';
  description: string;
}

/**
 * Calculate equinoxes and solstices for the year
 * Uses astronomy-engine's Seasons function for precise timing
 */
export function calculateSeasonalEvents(year: number): SeasonalEvent[] {
  const seasons = Seasons(year);

  return [
    {
      date: seasons.mar_equinox.date.toISOString().split('T')[0],
      type: 'spring_equinox',
      description:
        'Spring Equinox - Day and night are equal. New beginnings, balance, and fresh starts. The astrological new year begins as Sun enters Aries.',
    },
    {
      date: seasons.jun_solstice.date.toISOString().split('T')[0],
      type: 'summer_solstice',
      description:
        'Summer Solstice - Longest day of the year. Peak solar energy, abundance, and manifestation. Sun enters Cancer.',
    },
    {
      date: seasons.sep_equinox.date.toISOString().split('T')[0],
      type: 'fall_equinox',
      description:
        'Fall Equinox - Day and night equal again. Harvest, gratitude, and balance. Sun enters Libra.',
    },
    {
      date: seasons.dec_solstice.date.toISOString().split('T')[0],
      type: 'winter_solstice',
      description:
        'Winter Solstice - Shortest day, longest night. Return of the light, introspection, rebirth. Sun enters Capricorn.',
    },
  ];
}

/**
 * Calculate Mercury and Venus greatest elongations
 * These are the best times to view these planets
 */
export function calculatePlanetaryElongations(
  year: number,
): PlanetaryElongation[] {
  const elongations: PlanetaryElongation[] = [];
  const startTime = new AstroTime(new Date(year, 0, 1));
  const endDate = new Date(year, 11, 31);

  // Search for Mercury elongations
  let mercuryElong = Elongation(Body.Mercury, startTime);
  while (mercuryElong.time.date < endDate) {
    // Only include significant elongations (> 18°)
    if (mercuryElong.elongation > 18) {
      const visibility = mercuryElong.visibility as 'morning' | 'evening';
      elongations.push({
        date: mercuryElong.time.date.toISOString().split('T')[0],
        planet: 'Mercury',
        elongation: Math.round(mercuryElong.elongation * 10) / 10,
        visibility,
        description: `Mercury at greatest ${visibility} elongation (${Math.round(mercuryElong.elongation)}°). Best time to observe Mercury in the ${visibility} sky.`,
      });
    }

    // Search for next elongation (at least 30 days later)
    const nextSearch = new AstroTime(
      new Date(mercuryElong.time.date.getTime() + 30 * 24 * 60 * 60 * 1000),
    );
    if (nextSearch.date >= endDate) break;
    mercuryElong = Elongation(Body.Mercury, nextSearch);
  }

  // Search for Venus elongations
  let venusElong = Elongation(Body.Venus, startTime);
  while (venusElong.time.date < endDate) {
    // Venus elongations are always significant
    const visibility = venusElong.visibility as 'morning' | 'evening';
    elongations.push({
      date: venusElong.time.date.toISOString().split('T')[0],
      planet: 'Venus',
      elongation: Math.round(venusElong.elongation * 10) / 10,
      visibility,
      description: `Venus at greatest ${visibility} elongation (${Math.round(venusElong.elongation)}°). Venus shines brightest as the ${visibility === 'evening' ? 'Evening Star' : 'Morning Star'}.`,
    });

    // Venus elongations are ~9 months apart, search 250 days later
    const nextSearch = new AstroTime(
      new Date(venusElong.time.date.getTime() + 250 * 24 * 60 * 60 * 1000),
    );
    if (nextSearch.date >= endDate) break;
    venusElong = Elongation(Body.Venus, nextSearch);
  }

  // Sort by date
  elongations.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return elongations;
}

export interface PlanetaryConjunction {
  date: string;
  planet1: string;
  planet2: string;
  separation: number;
  sign: string;
  description: string;
  significance: 'major' | 'notable';
}

// Conjunction pairs to track (slow planets only - these are rare and significant)
const CONJUNCTION_PAIRS: Array<{
  body1: Body;
  body2: Body;
  name1: string;
  name2: string;
  significance: 'major' | 'notable';
  cycleYears: number;
  description: string;
}> = [
  {
    body1: Body.Jupiter,
    body2: Body.Saturn,
    name1: 'Jupiter',
    name2: 'Saturn',
    significance: 'major',
    cycleYears: 20,
    description:
      'Great Conjunction - marks generational shifts in society, politics, and collective values. Happens every ~20 years.',
  },
  {
    body1: Body.Jupiter,
    body2: Body.Uranus,
    name1: 'Jupiter',
    name2: 'Uranus',
    significance: 'major',
    cycleYears: 14,
    description:
      'Breakthrough energy - sudden expansion, innovation, and unexpected opportunities. Revolutionary insights.',
  },
  {
    body1: Body.Jupiter,
    body2: Body.Neptune,
    name1: 'Jupiter',
    name2: 'Neptune',
    significance: 'major',
    cycleYears: 13,
    description:
      'Spiritual expansion - heightened intuition, artistic inspiration, and collective dreams. Idealism peaks.',
  },
  {
    body1: Body.Jupiter,
    body2: Body.Pluto,
    name1: 'Jupiter',
    name2: 'Pluto',
    significance: 'major',
    cycleYears: 12,
    description:
      'Power amplification - transformation of wealth, influence, and hidden truths come to light.',
  },
  {
    body1: Body.Saturn,
    body2: Body.Uranus,
    name1: 'Saturn',
    name2: 'Uranus',
    significance: 'major',
    cycleYears: 45,
    description:
      'Tension between old and new - revolutionary restructuring, breaking down outdated systems.',
  },
  {
    body1: Body.Saturn,
    body2: Body.Neptune,
    name1: 'Saturn',
    name2: 'Neptune',
    significance: 'major',
    cycleYears: 36,
    description:
      'Dreams meet reality - grounding spiritual ideals, dissolving rigid structures, collective disillusionment or awakening.',
  },
  {
    body1: Body.Saturn,
    body2: Body.Pluto,
    name1: 'Saturn',
    name2: 'Pluto',
    significance: 'major',
    cycleYears: 33,
    description:
      'Deep transformation - restructuring power, endings and beginnings, karmic reckonings on a collective level.',
  },
  {
    body1: Body.Uranus,
    body2: Body.Neptune,
    name1: 'Uranus',
    name2: 'Neptune',
    significance: 'notable',
    cycleYears: 171,
    description:
      'Generational awakening - rare spiritual and technological revolution that shapes entire eras.',
  },
  {
    body1: Body.Uranus,
    body2: Body.Pluto,
    name1: 'Uranus',
    name2: 'Pluto',
    significance: 'notable',
    cycleYears: 127,
    description:
      'Revolutionary transformation - rare and intense, reshapes civilization. Last was 1960s.',
  },
  {
    body1: Body.Neptune,
    body2: Body.Pluto,
    name1: 'Neptune',
    name2: 'Pluto',
    significance: 'notable',
    cycleYears: 492,
    description:
      'Ultra-rare spiritual metamorphosis - happens roughly every 500 years. Civilization-level shifts.',
  },
];

/**
 * Calculate major planetary conjunctions for a year
 * Scans day-by-day to find when slow planets are within 5° of each other
 */
export function calculatePlanetaryConjunctions(
  year: number,
  observer: Observer = DEFAULT_OBSERVER,
): PlanetaryConjunction[] {
  const conjunctions: PlanetaryConjunction[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Track which conjunctions we've found to avoid duplicates
  const foundConjunctions = new Set<string>();

  // Scan every 3 days for efficiency (conjunctions are slow-forming)
  let currentDate = new Date(startDate);
  let previousSeparations = new Map<string, number>();

  while (currentDate <= endDate) {
    const positions = getRealPlanetaryPositions(currentDate, observer);

    for (const pair of CONJUNCTION_PAIRS) {
      const pos1 = positions?.[pair.name1];
      const pos2 = positions?.[pair.name2];

      if (!pos1?.longitude || !pos2?.longitude) continue;

      // Calculate separation (handle 360° wraparound)
      let separation = Math.abs(pos1.longitude - pos2.longitude);
      if (separation > 180) separation = 360 - separation;

      const pairKey = `${pair.name1}-${pair.name2}`;
      const prevSep = previousSeparations.get(pairKey);

      // Detect when separation crosses below 5° (conjunction forming)
      // or when it's at minimum (exact conjunction)
      if (separation < 5 && !foundConjunctions.has(`${pairKey}-${year}`)) {
        // Binary search for exact conjunction date
        const exactDate = findExactConjunctionDate(
          pair.name1,
          pair.name2,
          new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000),
          new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          observer,
        );

        // Only add if within this year
        if (exactDate.getFullYear() === year) {
          const exactPositions = getRealPlanetaryPositions(exactDate, observer);
          const sign = exactPositions?.[pair.name1]?.sign || 'Unknown';

          // Calculate exact separation at conjunction
          const p1 = exactPositions?.[pair.name1];
          const p2 = exactPositions?.[pair.name2];
          let exactSep = 0;
          if (p1?.longitude && p2?.longitude) {
            exactSep = Math.abs(p1.longitude - p2.longitude);
            if (exactSep > 180) exactSep = 360 - exactSep;
          }

          conjunctions.push({
            date: exactDate.toISOString().split('T')[0],
            planet1: pair.name1,
            planet2: pair.name2,
            separation: Math.round(exactSep * 10) / 10,
            sign,
            description: `${pair.name1}-${pair.name2} Conjunction in ${sign} - ${pair.description}`,
            significance: pair.significance,
          });

          foundConjunctions.add(`${pairKey}-${year}`);
        }
      }

      previousSeparations.set(pairKey, separation);
    }

    // Move forward 3 days
    currentDate = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  }

  // Sort by date
  conjunctions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return conjunctions;
}

/**
 * Binary search to find exact conjunction date (minimum separation)
 */
function findExactConjunctionDate(
  planet1: string,
  planet2: string,
  startDate: Date,
  endDate: Date,
  observer: Observer,
): Date {
  let bestDate = startDate;
  let minSeparation = 360;

  // Check every 6 hours for precision
  let current = new Date(startDate);
  while (current <= endDate) {
    const positions = getRealPlanetaryPositions(current, observer);
    const pos1 = positions?.[planet1];
    const pos2 = positions?.[planet2];

    if (pos1?.longitude && pos2?.longitude) {
      let separation = Math.abs(pos1.longitude - pos2.longitude);
      if (separation > 180) separation = 360 - separation;

      if (separation < minSeparation) {
        minSeparation = separation;
        bestDate = new Date(current);
      }
    }

    current = new Date(current.getTime() + 6 * 60 * 60 * 1000);
  }

  return bestDate;
}

// Average Moon distance is ~384,400 km
// Supermoon: Full Moon within ~362,000 km (perigee)
// Micromoon: Full Moon beyond ~405,000 km (apogee)
const SUPERMOON_THRESHOLD_KM = 362000;
const MICROMOON_THRESHOLD_KM = 405000;

/**
 * Calculate special moon events: supermoons, micromoons, blue moons, black moons
 * Uses astronomy-engine for precise calculations
 */
export function calculateMoonEvents(
  year: number,
  observer: Observer = DEFAULT_OBSERVER,
): MoonEvent[] {
  const events: MoonEvent[] = [];
  const startTime = new AstroTime(new Date(year, 0, 1));
  const endDate = new Date(year, 11, 31);

  // Track full moons by month for blue moon detection
  const fullMoonsByMonth: Map<number, Date[]> = new Map();
  // Track new moons by month for black moon detection
  const newMoonsByMonth: Map<number, Date[]> = new Map();

  // Find all Full Moons (phase = 180°)
  let fullMoonTime = SearchMoonPhase(180, startTime, 40);
  while (fullMoonTime && fullMoonTime.date < endDate) {
    const moonDate = fullMoonTime.date;
    const month = moonDate.getMonth();

    // Track for blue moon detection
    if (!fullMoonsByMonth.has(month)) {
      fullMoonsByMonth.set(month, []);
    }
    fullMoonsByMonth.get(month)!.push(moonDate);

    // Find nearest lunar apsis to determine if supermoon/micromoon
    const apsis = SearchLunarApsis(new AstroTime(moonDate));
    const daysDiff = Math.abs(
      (apsis.time.date.getTime() - moonDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    // Get Moon's sign
    const positions = getRealPlanetaryPositions(moonDate, observer);
    const moonSign = positions?.Moon?.sign || 'Unknown';
    const dateStr = moonDate.toISOString().split('T')[0];

    // Calculate approximate distance (apsis.dist_km is in AU, convert to km)
    const distanceKm = apsis.dist_au * 149597870.7;

    // Check if supermoon (perigee within 2 days and distance < threshold)
    if (
      apsis.kind === ApsisKind.Pericenter &&
      daysDiff <= 2 &&
      distanceKm < SUPERMOON_THRESHOLD_KM
    ) {
      events.push({
        date: dateStr,
        type: 'supermoon',
        sign: moonSign,
        description: `Supermoon in ${moonSign} - Full Moon at closest approach (${Math.round(distanceKm).toLocaleString()} km). Extra bright and powerful lunar energy.`,
        distanceKm: Math.round(distanceKm),
      });
    }
    // Check if micromoon (apogee within 2 days and distance > threshold)
    else if (
      apsis.kind === ApsisKind.Apocenter &&
      daysDiff <= 2 &&
      distanceKm > MICROMOON_THRESHOLD_KM
    ) {
      events.push({
        date: dateStr,
        type: 'micromoon',
        sign: moonSign,
        description: `Micromoon in ${moonSign} - Full Moon at farthest distance (${Math.round(distanceKm).toLocaleString()} km). Subtle lunar energy.`,
        distanceKm: Math.round(distanceKm),
      });
    } else {
      // Regular full moon
      events.push({
        date: dateStr,
        type: 'full_moon',
        sign: moonSign,
        description: `Full Moon in ${moonSign}`,
      });
    }

    // Get next full moon
    fullMoonTime = SearchMoonPhase(
      180,
      new AstroTime(new Date(moonDate.getTime() + 24 * 60 * 60 * 1000)),
      40,
    );
  }

  // Find all New Moons (phase = 0°)
  let newMoonTime = SearchMoonPhase(0, startTime, 40);
  while (newMoonTime && newMoonTime.date < endDate) {
    const moonDate = newMoonTime.date;
    const month = moonDate.getMonth();

    // Track for black moon detection
    if (!newMoonsByMonth.has(month)) {
      newMoonsByMonth.set(month, []);
    }
    newMoonsByMonth.get(month)!.push(moonDate);

    // Get Sun's sign (New Moon is conjunct Sun)
    const positions = getRealPlanetaryPositions(moonDate, observer);
    const sunSign = positions?.Sun?.sign || 'Unknown';
    const dateStr = moonDate.toISOString().split('T')[0];

    events.push({
      date: dateStr,
      type: 'new_moon',
      sign: sunSign,
      description: `New Moon in ${sunSign}`,
    });

    // Get next new moon
    newMoonTime = SearchMoonPhase(
      0,
      new AstroTime(new Date(moonDate.getTime() + 24 * 60 * 60 * 1000)),
      40,
    );
  }

  // Detect Blue Moons (2nd Full Moon in a month)
  for (const [month, moons] of fullMoonsByMonth) {
    if (moons.length >= 2) {
      const secondMoon = moons[1];
      const dateStr = secondMoon.toISOString().split('T')[0];
      const existing = events.find(
        (e) => e.date === dateStr && e.type === 'full_moon',
      );
      if (existing) {
        existing.type = 'blue_moon';
        existing.description = `Blue Moon in ${existing.sign} - Second Full Moon of the month. Rare lunar event with extra magical significance.`;
      }
    }
  }

  // Detect Black Moons (2nd New Moon in a month)
  for (const [month, moons] of newMoonsByMonth) {
    if (moons.length >= 2) {
      const secondMoon = moons[1];
      const dateStr = secondMoon.toISOString().split('T')[0];
      const existing = events.find(
        (e) => e.date === dateStr && e.type === 'new_moon',
      );
      if (existing) {
        existing.type = 'black_moon';
        existing.description = `Black Moon in ${existing.sign} - Second New Moon of the month. Powerful time for shadow work and new beginnings.`;
      }
    }
  }

  // Sort by date
  events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return events;
}

/**
 * Calculate exact dates when slow planets change signs
 * Uses binary search for precision within a year range
 */
export function calculateSlowPlanetIngresses(
  year: number,
  observer: Observer = DEFAULT_OBSERVER,
): PlanetaryIngress[] {
  const ingresses: PlanetaryIngress[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (const planet of SLOW_PLANETS) {
    let currentDate = new Date(startDate);
    let previousSign: string | null = null;
    let previousRetrograde: boolean | null = null;

    // Sample every day to find sign changes
    while (currentDate <= endDate) {
      const positions = getRealPlanetaryPositions(currentDate, observer);
      const planetData = positions[planet];

      if (planetData) {
        const currentSign = planetData.sign;
        const isRetrograde = planetData.retrograde || false;

        // Detect sign change
        if (previousSign && currentSign !== previousSign) {
          // Binary search for exact date
          const exactDate = findExactIngressDate(
            planet,
            previousSign,
            currentSign,
            new Date(currentDate.getTime() - 24 * 60 * 60 * 1000), // day before
            currentDate,
            observer,
          );

          const description =
            PLANET_INGRESS_DESCRIPTIONS[planet]?.[currentSign] ||
            `${planet} enters ${currentSign}`;

          ingresses.push({
            planet,
            fromSign: previousSign,
            toSign: currentSign,
            exactDate: exactDate.toISOString().split('T')[0],
            year,
            description,
            themes: getIngressThemes(planet, currentSign),
            isRetrograde,
          });
        }

        previousSign = currentSign;
        previousRetrograde = isRetrograde;
      }

      // Move to next day
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  // Sort by date
  ingresses.sort(
    (a, b) => new Date(a.exactDate).getTime() - new Date(b.exactDate).getTime(),
  );

  return ingresses;
}

/**
 * Binary search to find exact ingress date (to within hours)
 */
function findExactIngressDate(
  planet: string,
  fromSign: string,
  toSign: string,
  startDate: Date,
  endDate: Date,
  observer: Observer,
): Date {
  let low = startDate.getTime();
  let high = endDate.getTime();

  // Binary search with 1-hour precision
  while (high - low > 60 * 60 * 1000) {
    const mid = Math.floor((low + high) / 2);
    const midDate = new Date(mid);
    const positions = getRealPlanetaryPositions(midDate, observer);
    const midSign = positions[planet]?.sign;

    if (midSign === fromSign) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return new Date(high);
}

/**
 * Get themes for a planet entering a sign
 */
function getIngressThemes(planet: string, sign: string): string[] {
  const baseThemes: Record<string, string[]> = {
    Jupiter: ['expansion', 'growth', 'opportunity', 'luck'],
    Saturn: ['discipline', 'structure', 'responsibility', 'mastery'],
    Uranus: ['revolution', 'innovation', 'awakening', 'liberation'],
    Neptune: ['spirituality', 'dissolution', 'imagination', 'compassion'],
    Pluto: ['transformation', 'power', 'regeneration', 'depth'],
  };

  const signThemes: Record<string, string[]> = {
    Aries: ['initiative', 'leadership', 'courage'],
    Taurus: ['stability', 'values', 'resources'],
    Gemini: ['communication', 'learning', 'adaptability'],
    Cancer: ['home', 'family', 'emotional security'],
    Leo: ['creativity', 'self-expression', 'confidence'],
    Virgo: ['service', 'health', 'improvement'],
    Libra: ['relationships', 'balance', 'justice'],
    Scorpio: ['transformation', 'intimacy', 'depth'],
    Sagittarius: ['expansion', 'philosophy', 'adventure'],
    Capricorn: ['ambition', 'achievement', 'structure'],
    Aquarius: ['innovation', 'community', 'ideals'],
    Pisces: ['spirituality', 'compassion', 'transcendence'],
  };

  return [...(baseThemes[planet] || []), ...(signThemes[sign] || [])].slice(
    0,
    6,
  );
}

export const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

function getEclipseDescriptionBySign(sign: string, isSolar: boolean): string {
  const signLower = sign.toLowerCase();
  const eclipseType = isSolar ? 'Solar' : 'Lunar';

  const solarDescriptions: Record<string, string> = {
    aries: 'Bold new beginnings and courageous initiatives',
    taurus: 'Grounded foundations and material stability',
    gemini: 'Communication breakthroughs and mental expansion',
    cancer: 'Emotional renewal and nurturing growth',
    leo: 'Creative expression and confident leadership',
    virgo: 'Practical refinement and service to others',
    libra: 'Harmonious partnerships and balanced decisions',
    scorpio: 'Deep transformation and powerful rebirth',
    sagittarius: 'Philosophical expansion and adventurous journeys',
    capricorn: 'Ambitious structures and disciplined achievement',
    aquarius: 'Innovative visions and humanitarian progress',
    pisces: 'Spiritual awakening and intuitive flow',
  };

  const lunarDescriptions: Record<string, string> = {
    aries: 'Releasing impulsive energy and finding balance',
    taurus: 'Letting go of material attachments and finding freedom',
    gemini: 'Releasing scattered thoughts and finding clarity',
    cancer: 'Emotional release and healing deep wounds',
    leo: 'Releasing ego and finding authentic expression',
    virgo: 'Letting go of perfectionism and finding acceptance',
    libra: 'Releasing codependency and finding independence',
    scorpio: 'Deep emotional release and transformation',
    sagittarius: 'Releasing dogmatic beliefs and finding truth',
    capricorn: 'Letting go of rigid structures and finding flexibility',
    aquarius: 'Releasing isolation and finding community',
    pisces: 'Releasing illusions and finding spiritual clarity',
  };

  const descriptions = isSolar ? solarDescriptions : lunarDescriptions;
  const description =
    descriptions[signLower] ||
    (isSolar
      ? 'New beginnings and cosmic alignment'
      : 'Release and completion');

  return `${eclipseType} Eclipse in ${sign} - ${description}`;
}

export interface YearlyForecast {
  year: number;
  majorTransits: Array<{
    date: string;
    startDate: string;
    endDate: string;
    event: string;
    description: string;
    significance: string;
  }>;
  eclipses: Array<{
    date: string;
    startDate: string;
    endDate: string;
    type: 'solar' | 'lunar';
    sign: string;
    description: string;
  }>;
  moonEvents: MoonEvent[];
  seasonalEvents: SeasonalEvent[];
  planetaryElongations: PlanetaryElongation[];
  conjunctions: PlanetaryConjunction[];
  retrogrades: Array<{
    planet: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  keyAspects: Array<{
    date: string;
    startDate: string;
    endDate: string;
    aspect: string;
    planets: string[];
    description: string;
  }>;
  ingresses: PlanetaryIngress[];
  monthlyForecast?: Array<{
    month: number;
    monthName: string;
    majorTransits: Array<{
      date: string;
      startDate: string;
      endDate: string;
      event: string;
      description: string;
      significance: string;
    }>;
    eclipses: Array<{
      date: string;
      startDate: string;
      endDate: string;
      type: 'solar' | 'lunar';
      sign: string;
      description: string;
    }>;
    keyAspects: Array<{
      date: string;
      startDate: string;
      endDate: string;
      aspect: string;
      planets: string[];
      description: string;
    }>;
  }>;
  summary: string;
}

/**
 * Calculate eclipses using astronomy-engine's built-in eclipse search functions.
 * This provides accurate eclipse dates directly from astronomical calculations.
 */
export function calculateEclipses(
  year: number,
  observer: Observer = DEFAULT_OBSERVER,
): YearlyForecast['eclipses'] {
  const eclipses: YearlyForecast['eclipses'] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const startTime = new AstroTime(startDate);
  const endTime = new AstroTime(endDate);

  // Find all lunar eclipses in the year
  let lunarEclipse = SearchLunarEclipse(startTime);
  while (lunarEclipse.peak.date < endDate) {
    // Only include eclipses that are at least partial (not penumbral-only)
    if (
      lunarEclipse.kind === EclipseKind.Partial ||
      lunarEclipse.kind === EclipseKind.Total
    ) {
      const eclipseDate = lunarEclipse.peak.date;
      const dateStr = eclipseDate.toISOString().split('T')[0];

      // Get Moon's sign at eclipse time
      const positions = getRealPlanetaryPositions(eclipseDate, observer);
      const moonSign =
        positions?.Moon?.sign ||
        (positions?.Moon?.longitude !== undefined
          ? getZodiacSign(positions.Moon.longitude)
          : 'Unknown');

      const eclipseType =
        lunarEclipse.kind === EclipseKind.Total ? 'Total' : 'Partial';

      eclipses.push({
        date: dateStr,
        startDate: dateStr,
        endDate: dateStr,
        type: 'lunar',
        sign: moonSign,
        description: `${eclipseType} Lunar Eclipse in ${moonSign} - ${getEclipseDescriptionBySign(moonSign, false)}`,
      });
    }

    // Get next lunar eclipse
    lunarEclipse = NextLunarEclipse(lunarEclipse.peak);
    if (lunarEclipse.peak.date > endDate) break;
  }

  // Find all solar eclipses in the year
  let solarEclipse = SearchGlobalSolarEclipse(startTime);
  while (solarEclipse.peak.date < endDate) {
    // Include all solar eclipses (partial, annular, total)
    if (solarEclipse.kind !== EclipseKind.Penumbral) {
      const eclipseDate = solarEclipse.peak.date;
      const dateStr = eclipseDate.toISOString().split('T')[0];

      // Get Sun's sign at eclipse time (solar eclipses happen at New Moon, so Sun/Moon are in same sign)
      const positions = getRealPlanetaryPositions(eclipseDate, observer);
      const sunSign =
        positions?.Sun?.sign ||
        (positions?.Sun?.longitude !== undefined
          ? getZodiacSign(positions.Sun.longitude)
          : 'Unknown');

      let eclipseType = 'Partial';
      if (solarEclipse.kind === EclipseKind.Total) eclipseType = 'Total';
      else if (solarEclipse.kind === EclipseKind.Annular)
        eclipseType = 'Annular';

      eclipses.push({
        date: dateStr,
        startDate: dateStr,
        endDate: dateStr,
        type: 'solar',
        sign: sunSign,
        description: `${eclipseType} Solar Eclipse in ${sunSign} - ${getEclipseDescriptionBySign(sunSign, true)}`,
      });
    }

    // Get next solar eclipse
    solarEclipse = NextGlobalSolarEclipse(solarEclipse.peak);
    if (solarEclipse.peak.date > endDate) break;
  }

  // Sort by date
  eclipses.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return eclipses;
}

export async function generateYearlyForecast(
  year: number,
  userBirthday?: string,
  observer: Observer = DEFAULT_OBSERVER,
): Promise<YearlyForecast> {
  const startTime = Date.now();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const majorTransits: YearlyForecast['majorTransits'] = [];
  const retrogrades: YearlyForecast['retrogrades'] = [];
  const keyAspects: YearlyForecast['keyAspects'] = [];
  const monthlyData = new Map<
    number,
    {
      majorTransits: YearlyForecast['majorTransits'];
      eclipses: YearlyForecast['eclipses'];
      keyAspects: YearlyForecast['keyAspects'];
    }
  >();

  // Initialize monthly data structure
  for (let month = 0; month < 12; month++) {
    monthlyData.set(month, {
      majorTransits: [],
      eclipses: [],
      keyAspects: [],
    });
  }

  // Track retrograde periods by comparing day-to-day
  const retrogradeStartMap = new Map<
    string,
    { startDate: string; planet: string; startSign: string }
  >();
  const previousPositions = new Map<string, boolean>();

  // Track all aspect periods (conjunction, square, trine, opposition, sextile)
  const aspectStartMap = new Map<
    string,
    {
      startDate: string;
      planetA: string;
      planetB: string;
      aspect: string;
      startSign: string;
    }
  >();
  const previousAspects = new Map<string, boolean>();

  let currentDate = new Date(startDate);

  // Scan day by day to catch all retrograde transitions
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const month = currentDate.getMonth();
    const positions = getRealPlanetaryPositions(currentDate, observer);
    const aspects = calculateRealAspects(positions);

    // Detect retrograde changes by comparing with previous day
    Object.entries(positions).forEach(([planet, data]: [string, any]) => {
      // Skip Sun and Moon (they don't retrograde)
      if (planet === 'Sun' || planet === 'Moon') {
        return;
      }

      const wasRetrograde = previousPositions.get(planet) || false;
      const isRetrograde = data.retrograde || false;

      if (!wasRetrograde && isRetrograde) {
        // Retrograde starts
        retrogradeStartMap.set(planet, {
          startDate: dateStr,
          planet,
          startSign: data.sign,
        });
      } else if (wasRetrograde && !isRetrograde) {
        // Retrograde ends
        const startInfo = retrogradeStartMap.get(planet);
        if (startInfo) {
          const existingRetrograde = retrogrades.find(
            (r) => r.planet === planet && r.startDate === startInfo.startDate,
          );
          if (existingRetrograde) {
            existingRetrograde.endDate = dateStr;
            existingRetrograde.description = `${planet} retrograde period (${startInfo.startSign} → ${data.sign})`;
          } else {
            retrogrades.push({
              planet,
              startDate: startInfo.startDate,
              endDate: dateStr,
              description: `${planet} retrograde period (${startInfo.startSign} → ${data.sign})`,
            });
          }
          retrogradeStartMap.delete(planet);
        }
      }

      previousPositions.set(planet, isRetrograde);
    });

    // Track all aspects with start/end dates (similar to retrogrades)
    const aspectKey = (planetA: string, planetB: string, aspectType: string) =>
      `${[planetA, planetB].sort().join('-')}-${aspectType}`;

    // Build set of currently active aspect keys
    const currentAspectKeys = new Set<string>();
    aspects
      .filter((a) => a.priority >= 6)
      .forEach((aspect) => {
        const planetA = aspect.planetA?.name || '';
        const planetB = aspect.planetB?.name || '';
        const aspectType = aspect.aspect || '';
        const key = aspectKey(planetA, planetB, aspectType);
        currentAspectKeys.add(key);
      });

    // Check for aspects that ended (were active yesterday but not today)
    previousAspects.forEach((wasActive, key) => {
      if (wasActive && !currentAspectKeys.has(key)) {
        // Aspect ended (exited orb)
        const startInfo = aspectStartMap.get(key);
        if (startInfo) {
          const existingAspect = keyAspects.find(
            (a) =>
              a.aspect === startInfo.aspect &&
              a.planets.includes(startInfo.planetA) &&
              a.planets.includes(startInfo.planetB) &&
              a.startDate === startInfo.startDate,
          );
          if (existingAspect) {
            existingAspect.endDate = dateStr;
            // Update corresponding major transit
            const existingTransit = majorTransits.find(
              (t) =>
                t.event === startInfo.aspect &&
                t.startDate === startInfo.startDate &&
                t.description.includes(startInfo.planetA) &&
                t.description.includes(startInfo.planetB),
            );
            if (existingTransit) {
              existingTransit.endDate = dateStr;
            }
          }
          aspectStartMap.delete(key);
        }
      }
    });

    // Process currently active aspects
    aspects
      .filter((a) => a.priority >= 6)
      .forEach((aspect) => {
        const planetA = aspect.planetA?.name || '';
        const planetB = aspect.planetB?.name || '';
        const aspectType = aspect.aspect || '';
        const key = aspectKey(planetA, planetB, aspectType);
        const wasAspect = previousAspects.get(key) || false;

        if (!wasAspect) {
          // Aspect starts (enters orb)
          aspectStartMap.set(key, {
            startDate: dateStr,
            planetA,
            planetB,
            aspect: aspectType,
            startSign: aspect.planetA?.constellation || '',
          });
        }

        // Add to keyAspects if not already added
        const startInfo = aspectStartMap.get(key);
        if (startInfo) {
          const existingAspect = keyAspects.find(
            (a) =>
              a.aspect === aspectType &&
              a.planets.includes(planetA) &&
              a.planets.includes(planetB) &&
              a.startDate === startInfo.startDate,
          );

          if (!existingAspect) {
            const aspectDescription =
              aspect.energy || `${planetA} ${aspectType} ${planetB}`;
            const keyAspect = {
              date: dateStr,
              aspect: aspectType,
              planets: [planetA, planetB],
              description: aspectDescription,
              startDate: startInfo.startDate,
              endDate: '',
            };
            keyAspects.push(keyAspect);
            monthlyData.get(month)!.keyAspects.push(keyAspect);

            if (aspect.priority >= 7) {
              const majorTransit = {
                date: dateStr,
                startDate: startInfo.startDate,
                endDate: '',
                event: aspectType,
                description: aspectDescription,
                significance: `Major ${aspectType} between ${planetA} and ${planetB}`,
              };
              majorTransits.push(majorTransit);
              monthlyData.get(month)!.majorTransits.push(majorTransit);
            }
          }
        }
      });

    // Update previousAspects map for next iteration
    previousAspects.clear();
    currentAspectKeys.forEach((key) => {
      previousAspects.set(key, true);
    });

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  // Handle retrogrades that start but don't end within the year
  for (const [planetKey, startInfo] of retrogradeStartMap.entries()) {
    if (
      !retrogrades.find(
        (r) => r.planet === planetKey && r.startDate === startInfo.startDate,
      )
    ) {
      retrogrades.push({
        planet: planetKey,
        startDate: startInfo.startDate,
        endDate: '',
        description: `${planetKey} retrograde begins in ${startInfo.startSign}`,
      });
    }
  }

  // Handle aspects that start but don't end within the year
  for (const [aspectKey, startInfo] of aspectStartMap.entries()) {
    const existingAspect = keyAspects.find(
      (a) =>
        a.aspect === startInfo.aspect &&
        a.planets.includes(startInfo.planetA) &&
        a.planets.includes(startInfo.planetB) &&
        a.startDate === startInfo.startDate,
    );
    if (!existingAspect) {
      const aspectDescription = `${startInfo.planetA} ${startInfo.aspect} ${startInfo.planetB}`;
      keyAspects.push({
        date: startInfo.startDate,
        aspect: startInfo.aspect,
        planets: [startInfo.planetA, startInfo.planetB],
        description: aspectDescription,
        startDate: startInfo.startDate,
        endDate: '',
      });
    }
  }

  const eclipses = calculateEclipses(year, observer);

  // Calculate slow planet ingresses (sign changes)
  const ingresses = calculateSlowPlanetIngresses(year, observer);

  // Calculate special moon events (supermoons, blue moons, etc.)
  const moonEvents = calculateMoonEvents(year, observer);

  // Calculate seasonal events (equinoxes and solstices)
  const seasonalEvents = calculateSeasonalEvents(year);

  // Calculate planetary elongations (Mercury/Venus visibility)
  const planetaryElongations = calculatePlanetaryElongations(year);

  // Calculate major planetary conjunctions
  const conjunctions = calculatePlanetaryConjunctions(year, observer);

  // Group eclipses by month
  eclipses.forEach((eclipse) => {
    const eclipseDate = new Date(eclipse.date);
    const month = eclipseDate.getMonth();
    monthlyData.get(month)!.eclipses.push(eclipse);
  });

  const deduplicatedMajorTransits = majorTransits.filter(
    (transit, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.date === transit.date &&
          t.event === transit.event &&
          t.description === transit.description,
      ),
  );

  const deduplicatedKeyAspects = keyAspects.filter(
    (aspect, index, self) =>
      index ===
      self.findIndex(
        (a) =>
          a.date === aspect.date &&
          a.aspect === aspect.aspect &&
          a.planets.every((p) => aspect.planets.includes(p)),
      ),
  );

  const limitedMajorTransits = deduplicatedMajorTransits.slice(0, 30);
  const limitedRetrogrades = retrogrades.slice(0, 15);
  const limitedKeyAspects = deduplicatedKeyAspects.slice(0, 30);

  const summary = `Your ${year} cosmic forecast reveals ${limitedMajorTransits.length} major planetary transits, ${ingresses.length} planet sign changes, ${limitedRetrogrades.length} planetary retrogrades, ${eclipses.length} eclipses, and ${limitedKeyAspects.length} significant aspects. This year brings transformative energies and opportunities for growth.`;

  // Build monthly forecast array
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthlyForecast = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      monthName: monthNames[month],
      majorTransits: data.majorTransits.filter(
        (transit, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.date === transit.date &&
              t.event === transit.event &&
              t.description === transit.description,
          ),
      ),
      eclipses: data.eclipses,
      keyAspects: data.keyAspects.filter(
        (aspect, index, self) =>
          index ===
          self.findIndex(
            (a) =>
              a.date === aspect.date &&
              a.aspect === aspect.aspect &&
              a.planets.every((p) => aspect.planets.includes(p)),
          ),
      ),
    }))
    .filter(
      (month) =>
        month.majorTransits.length > 0 ||
        month.eclipses.length > 0 ||
        month.keyAspects.length > 0,
    );

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(
    `[generateYearlyForecast] Generated forecast for ${year} in ${duration}s: ${majorTransits.length} transits, ${retrogrades.length} retrogrades, ${eclipses.length} eclipses, ${keyAspects.length} aspects`,
  );

  return {
    year,
    majorTransits: limitedMajorTransits,
    eclipses,
    moonEvents,
    seasonalEvents,
    planetaryElongations,
    conjunctions,
    retrogrades: limitedRetrogrades,
    keyAspects: limitedKeyAspects,
    ingresses,
    monthlyForecast,
    summary,
  };
}
