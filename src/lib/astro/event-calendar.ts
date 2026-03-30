/**
 * Event Calendar -- central dependency for cosmic event detection and scoring.
 *
 * Answers: "What astronomical events are happening on a given date,
 * and how significant are they?"
 *
 * Uses astronomy-engine (MIT, VSOP87) for all calculations.
 * Never hardcodes transit dates -- looks up slow-planet-sign-changes.json
 * or computes from real planetary positions.
 */

import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
  checkSeasonalEvents,
  checkSignIngress,
  checkRetrogradeEvents,
  checkActiveRetrogrades,
} from '@utils/astrology/astronomical-data';
import { getUpcomingEclipses } from '@utils/astrology/eclipseTracker';
import { wheelOfTheYearSabbats, type Sabbat } from '@/constants/sabbats';
import slowPlanetData from '@/data/slow-planet-sign-changes.json';
import { Observer } from 'astronomy-engine';
import {
  getMoonIdentity,
  MOON_MODIFIERS,
  type MoonIdentity,
  type MoonModifier,
} from '@/lib/moon/identities';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EventRarity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CalendarEvent {
  /** Unique identifier, e.g. 'neptune-aries-ingress-2026-01-26' */
  id: string;
  /** Human-readable name, e.g. 'Neptune returns to Aries' */
  name: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  rarity: EventRarity;
  /** 0-100 significance score */
  score: number;
  /** Full orbital period in years (all 12 signs) */
  orbitalPeriodYears?: number;
  /** Approximate time spent in each sign */
  yearsPerSign?: number;
  /** When the planet was last in this sign, e.g. '1861-1875' */
  lastInThisSign?: string;
  /** What happened during the previous visit */
  historicalContext?: string;
  /** Multiplier applied when multiple significant events converge: 1.0, 1.5 or 2.0 */
  convergenceMultiplier: number;
  /** Pre-built content hooks */
  hookSuggestions: string[];
  /** Rich sabbat data from constants/sabbats.ts when applicable */
  sabbatData?: Sabbat;
  /** Content category for downstream routing */
  category: string;
  /** Pre-built rarity framing string */
  rarityFrame: string;
  /** Discriminated event type */
  eventType:
    | 'ingress'
    | 'retrograde_station'
    | 'sabbat'
    | 'equinox'
    | 'solstice'
    | 'eclipse'
    | 'aspect'
    | 'moon_phase'
    | 'milestone'
    | 'active_retrograde'
    | 'moon_sign_change'
    | 'stellium'
    | 'countdown';
  /** Planet name when applicable */
  planet?: string;
  /** Zodiac sign when applicable */
  sign?: string;
  /** Rich moon identity (themes, keywords, energy, ritual focus) for moon_phase events */
  moonIdentity?: MoonIdentity;
  /** Special moon modifiers (supermoon, blue moon, eclipse overlay) */
  moonModifiers?: MoonModifier[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

/** Orbital period in years for each planet (full cycle through all 12 signs) */
const ORBITAL_PERIOD_YEARS: Record<string, number> = {
  Moon: 27.3 / 365.25,
  Sun: 1,
  Mercury: 88 / 365.25,
  Venus: 225 / 365.25,
  Mars: 687 / 365.25,
  Jupiter: 11.86,
  Saturn: 29.46,
  Uranus: 84.01,
  Neptune: 164.8,
  Pluto: 247.9,
};

/** Which planets count as outer / slow for scoring purposes */
const OUTER_PLANETS = new Set([
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
]);

/** Short descriptions of what each planet rules — used in aspect bodies */
const PLANET_RULES_SHORT: Record<string, string> = {
  Sun: 'identity and purpose',
  Moon: 'emotions and instincts',
  Mercury: 'communication and thinking',
  Venus: 'love and values',
  Mars: 'action and drive',
  Jupiter: 'growth and expansion',
  Saturn: 'discipline and boundaries',
  Uranus: 'disruption and freedom',
  Neptune: 'dreams and intuition',
  Pluto: 'transformation and power',
};

/**
 * Essential dignities for all planets.
 *
 * Maps each planet to the signs where it is in domicile (rules), exalted,
 * detriment (opposite domicile) and fall (opposite exaltation). Used by
 * getRetrogradeSignContext() to dynamically determine dignity for any
 * planet/sign combination, and exported for use elsewhere in the codebase.
 */
export const PLANETARY_DIGNITIES: Record<
  string,
  {
    rules: string[];
    exalted: string[];
    detriment: string[];
    fall: string[];
  }
> = {
  Sun: {
    rules: ['Leo'],
    exalted: ['Aries'],
    detriment: ['Aquarius'],
    fall: ['Libra'],
  },
  Moon: {
    rules: ['Cancer'],
    exalted: ['Taurus'],
    detriment: ['Capricorn'],
    fall: ['Scorpio'],
  },
  Mercury: {
    rules: ['Gemini', 'Virgo'],
    exalted: ['Virgo'],
    detriment: ['Sagittarius', 'Pisces'],
    fall: ['Pisces'],
  },
  Venus: {
    rules: ['Taurus', 'Libra'],
    exalted: ['Pisces'],
    detriment: ['Scorpio', 'Aries'],
    fall: ['Virgo'],
  },
  Mars: {
    rules: ['Aries', 'Scorpio'],
    exalted: ['Capricorn'],
    detriment: ['Libra', 'Taurus'],
    fall: ['Cancer'],
  },
  Jupiter: {
    rules: ['Sagittarius', 'Pisces'],
    exalted: ['Cancer'],
    detriment: ['Gemini', 'Virgo'],
    fall: ['Capricorn'],
  },
  Saturn: {
    rules: ['Capricorn', 'Aquarius'],
    exalted: ['Libra'],
    detriment: ['Cancer', 'Leo'],
    fall: ['Aries'],
  },
  Uranus: {
    rules: ['Aquarius'],
    exalted: ['Scorpio'],
    detriment: ['Leo'],
    fall: ['Taurus'],
  },
  Neptune: {
    rules: ['Pisces'],
    exalted: ['Cancer'],
    detriment: ['Virgo'],
    fall: ['Capricorn'],
  },
  Pluto: {
    rules: ['Scorpio'],
    exalted: ['Aries'],
    detriment: ['Taurus'],
    fall: ['Libra'],
  },
};

// ---------------------------------------------------------------------------
// Historical Context Map
// ---------------------------------------------------------------------------

const HISTORICAL_CONTEXT: Record<
  string,
  {
    previousPeriods: string[];
    events: Record<string, string[]>;
    theme: string;
  }
> = {
  'neptune-aries': {
    previousPeriods: ['1861-1875', '1697-1712', '1533-1547'],
    events: {
      '1861-1875': [
        'US Civil War',
        'Italian Unification',
        'Photography revolution',
        'Spiritualism movement',
      ],
      '1697-1712': [
        'Act of Union 1707 (Great Britain formed)',
        'Enlightenment beginning',
      ],
      '1533-1547': [
        'Henry VIII splits from Rome',
        'Copernicus heliocentric model',
      ],
    },
    theme:
      'Struggle over who defines identity -- personal, national, spiritual',
  },
  'neptune-taurus': {
    previousPeriods: ['1875-1889', '1712-1726'],
    events: {
      '1875-1889': [
        'Gilded Age wealth explosion',
        'Telephone invented',
        'Edison and electric light',
      ],
      '1712-1726': [
        'South Sea Bubble financial crisis',
        'Baroque to Rococo art transition',
      ],
    },
    theme: 'Idealism meets materialism -- redefining what has lasting value',
  },
  'pluto-aquarius': {
    previousPeriods: ['1778-1798', '1532-1553'],
    events: {
      '1778-1798': [
        'American Revolution',
        'French Revolution',
        'Industrial Revolution begins',
      ],
      '1532-1553': [
        'Protestant Reformation spreads',
        'Scientific method emerges',
      ],
    },
    theme:
      'Power returns to the collective -- revolutions in governance and technology',
  },
  'pluto-capricorn': {
    previousPeriods: ['1762-1778', '1516-1532'],
    events: {
      '1762-1778': [
        'American colonies agitate for independence',
        'Captain Cook voyages',
        'Adam Smith writes Wealth of Nations',
      ],
      '1516-1532': ['Martin Luther 95 Theses', 'Magellan circumnavigation'],
    },
    theme: 'Existing power structures tested and transformed from within',
  },
  'uranus-gemini': {
    previousPeriods: ['1942-1949', '1858-1866'],
    events: {
      '1942-1949': [
        'WWII technology revolution',
        'First computer (ENIAC)',
        'Nuclear age begins',
        'Transistor invented',
      ],
      '1858-1866': [
        'Transatlantic telegraph',
        'Theory of Evolution published',
        'Internal combustion engine',
      ],
    },
    theme:
      'Revolutionary breakthroughs in communication and information technology',
  },
  'uranus-taurus': {
    previousPeriods: ['1934-1942', '1850-1858'],
    events: {
      '1934-1942': [
        'Great Depression aftermath',
        'New Deal economic restructuring',
        'WWII begins',
      ],
      '1850-1858': [
        'Gold Rush transforms economies',
        'Crimean War',
        'Telegraph networks expand',
      ],
    },
    theme: 'Radical disruption of financial systems and material security',
  },
  'uranus-cancer': {
    previousPeriods: ['1949-1956', '1866-1872'],
    events: {
      '1949-1956': [
        'Baby boom transforms family structure',
        'Korean War',
        'Television enters every home',
        'DNA structure discovered',
      ],
      '1866-1872': [
        'Reconstruction era',
        'Suez Canal opens',
        'Franco-Prussian War',
      ],
    },
    theme: 'Revolution in home, family, and emotional security',
  },
  'saturn-aries': {
    previousPeriods: ['1996-1999', '1967-1969', '1937-1940'],
    events: {
      '1996-1999': ['Dot-com boom', 'Euro currency created', 'Kosovo crisis'],
      '1967-1969': [
        'Moon landing',
        'Civil rights movement peak',
        'Counterculture revolution',
      ],
      '1937-1940': ['WWII begins', 'Nuclear fission discovered'],
    },
    theme: 'Testing new structures of identity and leadership under pressure',
  },
  'saturn-taurus': {
    previousPeriods: ['1998-2001', '1969-1972', '1940-1942'],
    events: {
      '1998-2001': ['Dot-com crash begins', 'Euro launched', 'Y2K preparation'],
      '1969-1972': [
        'Nixon shock ends gold standard',
        'OPEC oil crisis begins',
        'Environmental movement gains traction',
      ],
      '1940-1942': ['Wartime rationing', 'Lend-Lease Act'],
    },
    theme: 'Restructuring material security -- what is truly worth building',
  },
  'saturn-gemini': {
    previousPeriods: ['2001-2003', '1971-1974', '1942-1944'],
    events: {
      '2001-2003': [
        '9/11 and information warfare',
        'Social media early rise',
        'Iraq War begins',
      ],
      '1971-1974': [
        'Watergate scandal',
        'Pentagon Papers',
        'Information transparency demands',
      ],
      '1942-1944': ['Enigma code-breaking', 'D-Day planning and intelligence'],
    },
    theme: 'Accountability in communication, media, and information systems',
  },
  'saturn-cancer': {
    previousPeriods: ['2003-2005', '1974-1977', '1944-1946'],
    events: {
      '2003-2005': [
        'Housing bubble inflates',
        'Tsunami 2004',
        'Hurricane Katrina',
      ],
      '1974-1977': [
        'Stagflation and economic insecurity',
        'Punk movement begins',
      ],
      '1944-1946': ['WWII ends', 'UN founded', 'Post-war rebuilding'],
    },
    theme:
      'Lessons about emotional and domestic security -- what feels like home',
  },
  'saturn-pisces': {
    previousPeriods: ['1994-1996', '1964-1967', '1935-1937'],
    events: {
      '1994-1996': [
        'Rwanda genocide',
        'Internet goes mainstream',
        'Oklahoma City bombing',
      ],
      '1964-1967': [
        'Civil Rights Act',
        'Vietnam escalation',
        'Psychedelic era begins',
      ],
      '1935-1937': ['Dust Bowl devastation', 'Spanish Civil War begins'],
    },
    theme:
      'Structure meets dissolution -- discipline applied to spirituality and compassion',
  },
  'jupiter-cancer': {
    previousPeriods: ['2013-2014', '2001-2002', '1989-1990'],
    events: {
      '2013-2014': ['Pope Francis elected', 'Edward Snowden revelations'],
      '2001-2002': ['Post-9/11 patriotism surge', 'Focus on homeland security'],
      '1989-1990': [
        'Berlin Wall falls',
        'Reunification of families across borders',
      ],
    },
    theme: 'Expansion through nurturing, home, and emotional connection',
  },
  'jupiter-leo': {
    previousPeriods: ['2014-2015', '2002-2003', '1990-1991'],
    events: {
      '2014-2015': [
        'Social media influencer culture explodes',
        'Ice Bucket Challenge viral moment',
      ],
      '2002-2003': ['Reality TV boom', 'Creative entrepreneurship rises'],
      '1990-1991': [
        'Gulf War media coverage transforms news',
        'Grunge and alternative culture peaks',
      ],
    },
    theme:
      'Expansion through creative self-expression, performance, and visibility',
  },
};

// ---------------------------------------------------------------------------
// Fixed sabbat dates (month, day) for cross-quarter sabbats
// ---------------------------------------------------------------------------

interface FixedSabbatDate {
  month: number; // 1-based
  day: number;
  name: string;
}

const FIXED_SABBAT_DATES: FixedSabbatDate[] = [
  { month: 2, day: 1, name: 'Imbolc' },
  { month: 5, day: 1, name: 'Beltane' },
  { month: 8, day: 1, name: 'Lammas' },
  { month: 10, day: 31, name: 'Samhain' },
];

/** Maps seasonal event names to sabbat names */
const SEASONAL_TO_SABBAT: Record<string, string> = {
  'Spring Equinox': 'Ostara',
  'Summer Solstice': 'Litha',
  'Autumn Equinox': 'Mabon',
  'Winter Solstice': 'Yule',
};

/** Maps seasonal event names to event types */
const SEASONAL_EVENT_TYPE: Record<string, 'equinox' | 'solstice'> = {
  'Spring Equinox': 'equinox',
  'Summer Solstice': 'solstice',
  'Autumn Equinox': 'equinox',
  'Winter Solstice': 'solstice',
};

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

/**
 * Determine rarity and base score from the planet's orbital period.
 *
 * CRITICAL (90-100): Outer planet sign returns (Neptune ~165yr, Pluto ~248yr,
 *   Uranus ~84yr), rare conjunctions, eclipses
 * HIGH (60-80): Sabbats, equinoxes/solstices, Saturn sign return (~29yr),
 *   retrograde stations of outer planets
 * MEDIUM (30-50): Full/new moons, inner planet ingresses, Jupiter sign
 *   return (~12yr), inner planet retrograde stations
 * LOW (10-20): Moon sign changes, daily aspects, lunar quarters
 */
function scoreFromOrbitalPeriod(
  planet: string,
  eventType: string,
): { rarity: EventRarity; score: number } {
  const period = ORBITAL_PERIOD_YEARS[planet];

  // Eclipses are always CRITICAL
  if (eventType === 'eclipse') {
    return { rarity: 'CRITICAL', score: 92 };
  }

  // Sabbats / equinox / solstice
  if (['sabbat', 'equinox', 'solstice'].includes(eventType)) {
    return { rarity: 'HIGH', score: 75 };
  }

  // Moon phases (full/new moons are high-engagement content anchors)
  if (eventType === 'moon_phase') {
    return { rarity: 'HIGH', score: 55 };
  }

  // Moon sign changes
  if (eventType === 'moon_sign_change' || planet === 'Moon') {
    return { rarity: 'LOW', score: 15 };
  }

  // Stelliums
  if (eventType === 'stellium') {
    return { rarity: 'MEDIUM', score: 45 };
  }

  if (!period) {
    return { rarity: 'LOW', score: 20 };
  }

  // Ingress scoring by orbital period
  if (eventType === 'ingress') {
    if (period >= 80) return { rarity: 'CRITICAL', score: 95 }; // Neptune, Pluto, Uranus
    if (period >= 25) return { rarity: 'HIGH', score: 72 }; // Saturn
    if (period >= 10) return { rarity: 'MEDIUM', score: 45 }; // Jupiter
    if (period >= 1) return { rarity: 'MEDIUM', score: 35 }; // Mars, Sun
    return { rarity: 'LOW', score: 18 }; // Mercury, Venus, Moon
  }

  // Retrograde stations
  if (eventType === 'retrograde_station' || eventType === 'active_retrograde') {
    if (period >= 25) return { rarity: 'HIGH', score: 70 };
    if (period >= 1) return { rarity: 'HIGH', score: 62 }; // Mars retrograde is notable
    return { rarity: 'MEDIUM', score: 45 }; // Mercury, Venus
  }

  // Transit milestones
  if (eventType === 'milestone') {
    if (period >= 25) return { rarity: 'MEDIUM', score: 40 };
    return { rarity: 'LOW', score: 20 };
  }

  // Aspects
  if (eventType === 'aspect') {
    return { rarity: 'MEDIUM', score: 35 };
  }

  return { rarity: 'LOW', score: 15 };
}

// ---------------------------------------------------------------------------
// Rarity frame builder
// ---------------------------------------------------------------------------

function buildRarityFrame(
  planet: string,
  sign: string,
  eventType: string,
  lastPeriod?: string,
): string {
  const period = ORBITAL_PERIOD_YEARS[planet];

  if (eventType === 'eclipse') {
    return 'eclipses mark pivotal turning points that unfold over 6 months';
  }

  if (['sabbat', 'equinox', 'solstice'].includes(eventType)) {
    return 'a seasonal turning point on the Wheel of the Year';
  }

  if (!period || !sign) return '';

  const yearsPerSign = Math.round((period / 12) * 10) / 10;
  const approxPeriod = Math.round(period);

  if (eventType === 'ingress' && period >= 25) {
    const lastStr = lastPeriod ? ` (last: ${lastPeriod})` : '';
    return `for the first time in ~${approxPeriod} years${lastStr}`;
  }

  if (eventType === 'ingress' && period >= 10) {
    return `a shift that happens every ~${approxPeriod} years, spending ~${yearsPerSign} years per sign`;
  }

  if (eventType === 'retrograde_station') {
    return `${planet} stations retrograde approximately every ${Math.round((period * 12) / (period >= 1 ? 1 : 12))} months`;
  }

  return '';
}

// ---------------------------------------------------------------------------
// Retrograde sign context
// ---------------------------------------------------------------------------

/** Sign-specific context for retrograde events — WHY this sign matters */
const RETROGRADE_SIGN_CONTEXT: Record<
  string,
  Record<string, { meaning: string; dignity?: string }>
> = {
  Mercury: {
    Pisces: {
      meaning:
        'Mercury is in its detriment AND fall in Pisces — the hardest sign for Mercury. Communication becomes intuitive rather than logical. Boundaries between memory and imagination blur. Old feelings resurface as if they are happening now.',
      dignity: 'detriment + fall',
    },
    Virgo: {
      meaning:
        'Mercury retrogrades in its own sign. Details that were overlooked demand attention. Systems and routines need revision.',
      dignity: 'domicile',
    },
    Gemini: {
      meaning:
        'Mercury retrogrades in its own sign. Conversations revisit old ground. Ideas you dismissed may deserve a second look.',
      dignity: 'domicile',
    },
    Aries: {
      meaning:
        'Mercury retrograde in Aries slows impulsive decisions. Words spoken in haste come back. Patience replaces speed.',
    },
    Taurus: {
      meaning:
        'Mercury retrograde in Taurus revisits financial decisions and values. What you thought was settled may need renegotiation.',
    },
    Cancer: {
      meaning:
        'Mercury retrograde in Cancer brings family conversations and emotional processing back to the surface.',
    },
    Leo: {
      meaning:
        'Mercury retrograde in Leo revisits creative projects and matters of the heart. Self-expression needs refinement.',
    },
    Scorpio: {
      meaning:
        'Mercury retrograde in Scorpio uncovers hidden information. Secrets surface. Deep conversations demand honesty.',
    },
    Sagittarius: {
      meaning:
        'Mercury retrograde in Sagittarius is in its detriment. Big-picture thinking needs grounding. Travel plans may shift.',
      dignity: 'detriment',
    },
    Capricorn: {
      meaning:
        'Mercury retrograde in Capricorn revisits career plans and professional commitments. Structure needs reassessment.',
    },
    Aquarius: {
      meaning:
        'Mercury retrograde in Aquarius challenges group dynamics and future plans. Innovation needs a pause for reflection.',
    },
    Libra: {
      meaning:
        'Mercury retrograde in Libra revisits relationship conversations. Agreements need clarification. Balance requires honesty.',
    },
  },
};

function getRetrogradeSignContext(
  planet: string,
  sign: string,
): { hooks: string[]; rarityFrame: string; meaning: string } {
  // Prefer hand-written Mercury context when available
  const ctx = RETROGRADE_SIGN_CONTEXT[planet]?.[sign];

  // Determine dignity from PLANETARY_DIGNITIES table (works for any planet)
  let dignity = ctx?.dignity || '';
  if (!dignity) {
    const pd = PLANETARY_DIGNITIES[planet];
    if (pd) {
      const isDetriment = pd.detriment.includes(sign);
      const isFall = pd.fall.includes(sign);
      const isDomicile = pd.rules.includes(sign);
      const isExalted = pd.exalted.includes(sign);

      if (isDetriment && isFall) dignity = 'detriment + fall';
      else if (isDetriment) dignity = 'detriment';
      else if (isFall) dignity = 'fall';
      else if (isDomicile) dignity = 'domicile';
      else if (isExalted) dignity = 'exalted';
    }
  }

  const dignityNote = dignity ? ` (${dignity})` : '';

  // Use hand-written meaning when available, generate from dignity otherwise
  let meaning = ctx?.meaning || '';
  if (!meaning) {
    if (dignity === 'detriment + fall') {
      meaning = `${planet} is in its detriment AND fall in ${sign} -- the hardest sign for ${planet}. Its energy is deeply challenged, making this retrograde particularly intense.`;
    } else if (dignity === 'detriment') {
      meaning = `${planet} retrograde in ${sign} (detriment) struggles to express its energy naturally. Themes ruled by ${planet} feel friction and demand conscious effort.`;
    } else if (dignity === 'fall') {
      meaning = `${planet} retrograde in ${sign} (fall) weakens ${planet}'s usual confidence. What normally comes easily now requires deliberate attention.`;
    } else if (dignity === 'domicile') {
      meaning = `${planet} retrogrades in its own sign of ${sign}. It is powerful here but turned inward -- a deep internal audit of ${planet}-ruled themes.`;
    } else if (dignity === 'exalted') {
      meaning = `${planet} retrograde in ${sign} (exalted) turns elevated energy inward. High potential meets forced reflection.`;
    } else {
      meaning = `${planet} retrograde in ${sign} invites reflection on ${sign}-ruled themes.`;
    }
  }

  const hooks: string[] = [];

  if (dignity === 'detriment + fall') {
    hooks.push(
      `${planet} retrograde in its worst sign. ${sign} makes this one brutal.`,
      `${planet} in ${sign} (${dignity}) AND retrograde. Double difficulty.`,
    );
  } else if (dignity === 'detriment' || dignity === 'fall') {
    hooks.push(
      `${planet} retrograde in ${sign} (${dignity}). This one has teeth.`,
      `${planet} struggles in ${sign}. Add retrograde and it gets harder.`,
    );
  } else if (dignity === 'domicile' || dignity === 'exalted') {
    hooks.push(
      `${planet} retrograde in ${sign} (${dignity}). Powerful but turned inward.`,
      `${planet} retrogrades in its strongest sign. Intense internal audit.`,
    );
  } else {
    hooks.push(
      `${planet} retrograde in ${sign}. The review period continues.`,
      `${planet} is still retrograde in ${sign}. Notice what keeps resurfacing.`,
    );
  }

  return {
    hooks,
    rarityFrame: `${planet} retrograde in ${sign}${dignityNote}`,
    meaning,
  };
}

// Hook suggestions generator
// ---------------------------------------------------------------------------

function generateHookSuggestions(
  event: Partial<CalendarEvent>,
  historicalCtx?: (typeof HISTORICAL_CONTEXT)[string],
): string[] {
  const hooks: string[] = [];
  const { planet, sign, rarity, eventType, name } = event;

  if (rarity === 'CRITICAL' && eventType === 'ingress' && planet && sign) {
    const period = ORBITAL_PERIOD_YEARS[planet];
    const approxPeriod = period ? `~${Math.round(period)}` : 'many';
    const lastPeriod = historicalCtx?.previousPeriods?.[0];

    hooks.push(
      `${planet} returns to ${sign} for the first time since ${lastPeriod || 'centuries ago'}. Here is what happened every time.`,
    );
    hooks.push(
      `${planet} enters ${sign}. This only happens once every ${approxPeriod} years.`,
    );
    if (historicalCtx?.theme) {
      hooks.push(
        `The last time ${planet} was in ${sign}: ${historicalCtx.previousPeriods[0]}. Theme: ${historicalCtx.theme}.`,
      );
    }
    hooks.push(
      `${planet} in ${sign} rewrites the rules. Here is what to expect.`,
    );
    hooks.push(`Once-in-a-lifetime transit: ${planet} enters ${sign} today.`);
  } else if (
    rarity === 'HIGH' &&
    eventType === 'retrograde_station' &&
    planet
  ) {
    hooks.push(`${planet} stations retrograde. Here is what actually changes.`);
    hooks.push(
      `${planet} retrograde is not what you think. Here is the real story.`,
    );
    hooks.push(
      `${planet} retrograde starts today. What it means for the next few weeks.`,
    );
  } else if (['sabbat', 'equinox', 'solstice'].includes(eventType || '')) {
    hooks.push(`${name} is here. The Wheel of the Year turns.`);
    hooks.push(
      `${name} marks a turning point. Here is how to work with the energy.`,
    );
    hooks.push(`The energy shifts today: ${name}. What it means for you.`);
  } else if (eventType === 'eclipse') {
    hooks.push(`${name}. Eclipses accelerate what was already in motion.`);
    hooks.push(`${name} today. What it is activating in your chart.`);
    hooks.push(`Eclipse season is here. Pay attention to what surfaces.`);
  } else if (eventType === 'moon_phase') {
    hooks.push(`${name} tonight. Here is what it is illuminating.`);
    hooks.push(`${name} energy is building. Work with it, not against it.`);
  } else if (eventType === 'ingress' && planet && sign) {
    hooks.push(`${planet} enters ${sign}. The energy shifts.`);
    hooks.push(`${planet} in ${sign} changes the game for the next few weeks.`);
  } else {
    hooks.push(`${name || 'Cosmic shift'} today. Here is what to know.`);
  }

  return hooks;
}

/**
 * Generate rich hook suggestions using moon identity data.
 * These replace the generic moon_phase hooks with themed, named moon copy.
 */
function generateMoonIdentityHooks(
  displayName: string,
  identity: MoonIdentity,
  moonSign: string,
  modifiers: MoonModifier[],
): string[] {
  const hooks: string[] = [];
  const themesStr = identity.themes.slice(0, 2).join(' and ');

  hooks.push(`${displayName} tonight. This is the moon of ${themesStr}.`);
  hooks.push(identity.energy);
  hooks.push(`${identity.name} in ${moonSign}. ${identity.ritualFocus}`);

  if (modifiers.length > 0) {
    for (const mod of modifiers) {
      hooks.push(`${mod.label}: ${mod.extraEnergy}`);
    }
  }

  return hooks;
}

// ---------------------------------------------------------------------------
// Convergence multiplier
// ---------------------------------------------------------------------------

/**
 * When multiple HIGH+ events land on the same day, amplify all scores.
 * 2 HIGH events = 1.5x, 3+ HIGH events = 2.0x
 */
function calculateConvergenceMultiplier(events: CalendarEvent[]): number {
  const highCount = events.filter(
    (e) => e.rarity === 'CRITICAL' || e.rarity === 'HIGH',
  ).length;
  if (highCount >= 3) return 2.0;
  if (highCount >= 2) return 1.5;
  return 1.0;
}

// ---------------------------------------------------------------------------
// Sabbat detection
// ---------------------------------------------------------------------------

/**
 * Detect sabbats for a given date using a 3-day detection window
 * (day before, day of, day after).
 *
 * Maps equinoxes/solstices to sabbat names and checks fixed cross-quarter dates.
 */
function detectSabbats(dateStr: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const targetDate = new Date(dateStr);
  const targetMonth = targetDate.getUTCMonth() + 1; // 1-based
  const targetDay = targetDate.getUTCDate();

  // Check fixed-date cross-quarter sabbats (3-day window)
  for (const fixed of FIXED_SABBAT_DATES) {
    if (isWithinWindow(targetMonth, targetDay, fixed.month, fixed.day, 1)) {
      const sabbatData = wheelOfTheYearSabbats.find(
        (s) => s.name === fixed.name,
      );
      if (sabbatData) {
        events.push(buildSabbatEvent(sabbatData, dateStr, 'sabbat'));
      }
    }
  }

  // Astronomical sabbats (equinoxes/solstices) are detected by checkSeasonalEvents
  // via planetary positions -- handled in getEventCalendarForDate.

  return events;
}

/**
 * Check whether (month, day) falls within +/- windowDays of (targetMonth, targetDay).
 */
function isWithinWindow(
  checkMonth: number,
  checkDay: number,
  targetMonth: number,
  targetDay: number,
  windowDays: number,
): boolean {
  // Convert to day-of-year approximation for comparison
  const checkDOY = checkMonth * 31 + checkDay;
  const targetDOY = targetMonth * 31 + targetDay;
  return Math.abs(checkDOY - targetDOY) <= windowDays;
}

/**
 * Check whether a sabbat falls on a given date (fixed-date sabbats only).
 * Astronomical sabbats (equinoxes/solstices) are checked separately via
 * checkSeasonalEvents on future planetary positions.
 */
function doesSabbatMatchDate(sabbat: Sabbat, dateStr: string): boolean {
  const fixed = FIXED_SABBAT_DATES.find((f) => f.name === sabbat.name);
  if (!fixed) return false; // Astronomical sabbat — checked separately
  const d = new Date(dateStr);
  return d.getUTCMonth() + 1 === fixed.month && d.getUTCDate() === fixed.day;
}

function buildSabbatEvent(
  sabbat: Sabbat,
  dateStr: string,
  eventType: 'sabbat' | 'equinox' | 'solstice',
): CalendarEvent {
  const { rarity, score } = scoreFromOrbitalPeriod('Sun', eventType);
  return {
    id: `sabbat-${sabbat.name.toLowerCase()}-${dateStr}`,
    name: sabbat.name,
    date: dateStr,
    rarity,
    score,
    convergenceMultiplier: 1.0,
    hookSuggestions: generateHookSuggestions({
      name: sabbat.name,
      rarity,
      eventType,
    }),
    sabbatData: sabbat,
    category: 'sabbat',
    rarityFrame: buildRarityFrame('Sun', '', eventType),
    eventType,
    sign: sabbat.element,
  };
}

// ---------------------------------------------------------------------------
// Slow planet sign change lookup
// ---------------------------------------------------------------------------

type SlowPlanetSegments = typeof slowPlanetData.segments;

/**
 * Find the actual ingress date for a planet entering a sign, from the
 * pre-computed slow-planet-sign-changes.json. Returns the most recent
 * start date for the planet in that sign, or null if not found.
 */
function findActualIngressDate(planet: string, sign: string): Date | null {
  const segments = (slowPlanetData as any).segments;
  const planetData = segments[planet];
  if (!planetData) return null;
  const signPeriods = planetData[sign];
  if (!signPeriods || !Array.isArray(signPeriods)) return null;

  // Find the most recent period that has already started
  const now = Date.now();
  let closest: Date | null = null;
  for (const period of signPeriods) {
    const start = new Date(period.start);
    if (start.getTime() <= now) {
      if (!closest || start.getTime() > closest.getTime()) {
        closest = start;
      }
    }
  }
  return closest;
}

/**
 * Look up slow-planet-sign-changes.json for sign changes within a given
 * date window. Returns ingress events for outer/slow planets.
 */
function lookupSlowPlanetChanges(
  dateStr: string,
  windowDays: number = 1,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const targetDate = new Date(dateStr);
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  const segments = slowPlanetData.segments as SlowPlanetSegments;

  for (const [planet, signs] of Object.entries(segments)) {
    for (const [sign, periods] of Object.entries(
      signs as Record<string, Array<{ start: string; end: string }>>,
    )) {
      for (const period of periods) {
        const startDate = new Date(period.start);
        const diff = Math.abs(startDate.getTime() - targetDate.getTime());

        if (diff <= windowMs) {
          const contextKey = `${planet.toLowerCase()}-${sign.toLowerCase()}`;
          const historicalCtx = HISTORICAL_CONTEXT[contextKey];
          const orbitalPeriod = ORBITAL_PERIOD_YEARS[planet];
          const yearsPerSign = orbitalPeriod
            ? Math.round((orbitalPeriod / 12) * 10) / 10
            : undefined;
          const lastPeriod = historicalCtx?.previousPeriods?.[0];

          const { rarity, score } = scoreFromOrbitalPeriod(planet, 'ingress');

          events.push({
            id: `${planet.toLowerCase()}-${sign.toLowerCase()}-ingress-${dateStr}`,
            name: `${planet} enters ${sign}`,
            date: dateStr,
            rarity,
            score,
            orbitalPeriodYears: orbitalPeriod,
            yearsPerSign,
            lastInThisSign: lastPeriod,
            historicalContext: historicalCtx?.theme,
            convergenceMultiplier: 1.0,
            hookSuggestions: generateHookSuggestions(
              {
                planet,
                sign,
                rarity,
                eventType: 'ingress',
                name: `${planet} enters ${sign}`,
              },
              historicalCtx,
            ),
            category: 'transit',
            rarityFrame: buildRarityFrame(planet, sign, 'ingress', lastPeriod),
            eventType: 'ingress',
            planet,
            sign,
          });
        }
      }
    }
  }

  return events;
}

// ---------------------------------------------------------------------------
// Core export: getEventCalendarForDate
// ---------------------------------------------------------------------------

/**
 * Returns all astronomical events for a given date, sorted by score descending.
 *
 * Combines:
 * - Seasonal events (equinoxes, solstices) via checkSeasonalEvents
 * - Sign ingresses via checkSignIngress
 * - Retrograde stations via checkRetrogradeEvents
 * - Active retrogrades via checkActiveRetrogrades
 * - Slow planet sign changes from pre-computed JSON
 * - Sabbat detection (fixed and astronomical)
 * - Eclipse detection
 * - Moon phase events
 * - Notable aspects
 * - Stelliums
 *
 * Applies convergence multiplier when 2+ HIGH events land on same day.
 */
export async function getEventCalendarForDate(
  dateStr: string,
): Promise<CalendarEvent[]> {
  const date = new Date(dateStr);
  date.setUTCHours(12, 0, 0, 0); // Normalise to noon UTC

  const positions = getRealPlanetaryPositions(date, DEFAULT_OBSERVER);
  const moonPhase = getAccurateMoonPhase(date);
  const aspects = calculateRealAspects(positions);

  const events: CalendarEvent[] = [];
  const seenIds = new Set<string>();

  const addEvent = (event: CalendarEvent) => {
    if (!seenIds.has(event.id)) {
      seenIds.add(event.id);
      events.push(event);
    }
  };

  // --- 1. Seasonal events (equinox / solstice) ---------------------------
  const seasonalEvents = checkSeasonalEvents(positions);
  for (const se of seasonalEvents) {
    const sabbatName = SEASONAL_TO_SABBAT[se.name];
    const eventType = SEASONAL_EVENT_TYPE[se.name] || 'equinox';
    const sabbatData = sabbatName
      ? wheelOfTheYearSabbats.find((s) => s.name === sabbatName)
      : undefined;

    const { rarity, score } = scoreFromOrbitalPeriod('Sun', eventType);

    addEvent({
      id: `seasonal-${se.name.toLowerCase().replace(/\s+/g, '-')}-${dateStr}`,
      name: sabbatName ? `${sabbatName} (${se.name})` : se.name,
      date: dateStr,
      rarity,
      score,
      convergenceMultiplier: 1.0,
      hookSuggestions: generateHookSuggestions({
        name: sabbatName ? `${sabbatName} (${se.name})` : se.name,
        rarity,
        eventType,
      }),
      sabbatData,
      category: 'sabbat',
      rarityFrame: buildRarityFrame('Sun', '', eventType),
      eventType,
    });
  }

  // --- 2. Fixed-date sabbats (cross-quarter days) -------------------------
  const sabbatEvents = detectSabbats(dateStr);
  for (const se of sabbatEvents) {
    addEvent(se);
  }

  // --- 3. Sign ingresses from live positions ------------------------------
  // checkSignIngress flags any planet within 0-2° of a sign boundary.
  // For slow planets, this is misleading — Neptune at 1.6° Aries on March 20
  // entered Aries on Jan 26, not "today". Cross-reference the JSON to filter
  // out stale ingresses and represent them as active transits instead.
  const ingresses = checkSignIngress(positions, date);
  for (const ing of ingresses) {
    const planet = ing.planet as string;
    const sign = ing.sign as string;

    // Skip if we already have this from slow planet data
    const slowId = `${planet.toLowerCase()}-${sign.toLowerCase()}-ingress-${dateStr}`;
    if (seenIds.has(slowId)) continue;

    // For slow/outer planets, verify the actual ingress date is within 7 days
    const orbPeriod = ORBITAL_PERIOD_YEARS[planet];
    if (orbPeriod && orbPeriod >= 10) {
      const actualIngress = findActualIngressDate(planet, sign);
      if (actualIngress) {
        const daysSinceIngress = Math.round(
          (date.getTime() - actualIngress.getTime()) / (24 * 60 * 60 * 1000),
        );
        if (daysSinceIngress > 7) {
          // Not a recent ingress — skip the "enters" event.
          // The planet's presence is captured via stellium/aspect detection.
          continue;
        }
      }
    }

    const contextKey = `${planet.toLowerCase()}-${sign.toLowerCase()}`;
    const historicalCtx = HISTORICAL_CONTEXT[contextKey];
    const orbitalPeriod = ORBITAL_PERIOD_YEARS[planet];
    const yearsPerSign = orbitalPeriod
      ? Math.round((orbitalPeriod / 12) * 10) / 10
      : undefined;
    const lastPeriod = historicalCtx?.previousPeriods?.[0];

    const { rarity, score } = scoreFromOrbitalPeriod(planet, 'ingress');

    addEvent({
      id: `ingress-${planet.toLowerCase()}-${sign.toLowerCase()}-${dateStr}`,
      name: `${planet} enters ${sign}`,
      date: dateStr,
      rarity,
      score,
      orbitalPeriodYears: orbitalPeriod,
      yearsPerSign,
      lastInThisSign: lastPeriod,
      historicalContext: historicalCtx?.theme,
      convergenceMultiplier: 1.0,
      hookSuggestions: generateHookSuggestions(
        {
          planet,
          sign,
          rarity,
          eventType: 'ingress',
          name: `${planet} enters ${sign}`,
        },
        historicalCtx,
      ),
      category: 'transit',
      rarityFrame: buildRarityFrame(planet, sign, 'ingress', lastPeriod),
      eventType: 'ingress',
      planet,
      sign,
    });
  }

  // --- 4. Slow planet sign changes from pre-computed JSON -----------------
  const slowChanges = lookupSlowPlanetChanges(dateStr, 1);
  for (const sc of slowChanges) {
    addEvent(sc);
  }

  // --- 5. Retrograde stations ---------------------------------------------
  const retrogradeEvents = checkRetrogradeEvents(positions);
  for (const re of retrogradeEvents) {
    const planet = re.planet as string;
    const sign = re.sign as string;
    const isStart = re.type === 'retrograde_start';
    const stationType = isStart ? 'retrograde' : 'direct';

    const { rarity, score } = scoreFromOrbitalPeriod(
      planet,
      'retrograde_station',
    );

    addEvent({
      id: `retrograde-${stationType}-${planet.toLowerCase()}-${dateStr}`,
      name: isStart
        ? `${planet} stations retrograde in ${sign}`
        : `${planet} stations direct in ${sign}`,
      date: dateStr,
      rarity,
      score,
      orbitalPeriodYears: ORBITAL_PERIOD_YEARS[planet],
      convergenceMultiplier: 1.0,
      hookSuggestions: generateHookSuggestions({
        planet,
        sign,
        rarity,
        eventType: 'retrograde_station',
        name: isStart
          ? `${planet} Retrograde Begins`
          : `${planet} Stations Direct`,
      }),
      category: 'retrograde',
      rarityFrame: buildRarityFrame(planet, sign, 'retrograde_station'),
      eventType: 'retrograde_station',
      planet,
      sign,
    });
  }

  // --- 6. Active retrogrades (ongoing, not just station days) -------------
  const activeRetrogrades = checkActiveRetrogrades(positions);
  for (const ar of activeRetrogrades) {
    const planet = ar.planet as string;
    const sign = ar.sign as string;

    // Mercury retrograde gets a bump
    const isMercury = planet === 'Mercury';
    const { rarity, score: baseScore } = scoreFromOrbitalPeriod(
      planet,
      'active_retrograde',
    );
    const score = isMercury ? Math.min(baseScore + 10, 80) : baseScore;

    // Sign-specific context for retrogrades
    const signContext = getRetrogradeSignContext(planet, sign);

    addEvent({
      id: `active-retrograde-${planet.toLowerCase()}-${dateStr}`,
      name: `${planet} Retrograde in ${sign}`,
      date: dateStr,
      rarity: isMercury ? 'HIGH' : rarity,
      score,
      orbitalPeriodYears: ORBITAL_PERIOD_YEARS[planet],
      convergenceMultiplier: 1.0,
      hookSuggestions: signContext.hooks,
      category: 'retrograde',
      rarityFrame: signContext.rarityFrame,
      historicalContext: signContext.meaning,
      eventType: 'active_retrograde',
      planet,
      sign,
    });
  }

  // --- 7. Eclipses --------------------------------------------------------
  try {
    const eclipses = getUpcomingEclipses(
      new Date(date.getTime() - 24 * 60 * 60 * 1000),
      1,
    );
    for (const eclipse of eclipses) {
      const eclipseDate = eclipse.date;
      const eclipseDateStr = eclipseDate.toISOString().split('T')[0];

      // Only include if the eclipse is on the target date (within 1 day)
      const diffMs = Math.abs(eclipseDate.getTime() - date.getTime());
      if (diffMs > 24 * 60 * 60 * 1000) continue;

      const { rarity, score } = scoreFromOrbitalPeriod('Moon', 'eclipse');

      addEvent({
        id: `eclipse-${eclipse.type}-${eclipseDateStr}`,
        name: eclipse.description,
        date: dateStr,
        rarity,
        score,
        convergenceMultiplier: 1.0,
        hookSuggestions: generateHookSuggestions({
          name: eclipse.description,
          rarity,
          eventType: 'eclipse',
        }),
        category: 'eclipse',
        rarityFrame: buildRarityFrame('Moon', eclipse.sign, 'eclipse'),
        eventType: 'eclipse',
        sign: eclipse.sign,
      });
    }
  } catch {
    // Eclipse calculation can throw on edge cases -- degrade gracefully
  }

  // --- 8. Moon phase events -----------------------------------------------
  if (moonPhase.isSignificant) {
    const moonSign = positions.Moon?.sign || '';
    const { rarity, score } = scoreFromOrbitalPeriod('Moon', 'moon_phase');

    const isFullOrNew =
      moonPhase.name.includes('Full') ||
      moonPhase.name.includes('New') ||
      moonPhase.name === 'New Moon';

    // Look up rich identity data for this moon
    const monthNum = date.getUTCMonth() + 1;
    const moonType = moonPhase.name.includes('Full') ? 'full' : 'new';
    const identity = isFullOrNew
      ? getMoonIdentity(monthNum, moonType as 'full' | 'new')
      : undefined;

    // Build the display name using traditional moon names
    const traditionalName = identity?.name;
    const displayName =
      traditionalName && moonType === 'full'
        ? `${traditionalName} (Full Moon) in ${moonSign}`
        : moonType === 'new' && isFullOrNew
          ? `New Moon in ${moonSign}`
          : `${moonPhase.name} in ${moonSign}`;

    // Collect modifiers
    const modifiers: MoonModifier[] = [];
    if (moonPhase.isSuperMoon) modifiers.push(MOON_MODIFIERS.supermoon);

    // Supermoon boost: +20, capped at 85
    const boostedScore = moonPhase.isSuperMoon
      ? Math.min(score + 20, 85)
      : score;

    // Build identity-aware hook suggestions
    const hooks = identity
      ? generateMoonIdentityHooks(displayName, identity, moonSign, modifiers)
      : generateHookSuggestions({
          name: displayName,
          rarity: isFullOrNew ? 'HIGH' : rarity,
          eventType: 'moon_phase',
        });

    const rarityFrame =
      modifiers.length > 0
        ? modifiers.map((m) => m.extraEnergy).join(' ')
        : identity
          ? identity.energy
          : 'a key lunar phase marking a turning point in the monthly cycle';

    addEvent({
      id: `moon-phase-${moonPhase.name.toLowerCase().replace(/\s+/g, '-')}-${dateStr}`,
      name: displayName,
      date: dateStr,
      rarity: isFullOrNew ? 'HIGH' : rarity,
      score: boostedScore,
      convergenceMultiplier: 1.0,
      hookSuggestions: hooks,
      category: 'moon',
      rarityFrame,
      eventType: 'moon_phase',
      planet: 'Moon',
      sign: moonSign,
      moonIdentity: identity,
      moonModifiers: modifiers.length > 0 ? modifiers : undefined,
    });
  }

  // --- 8b. Blue moon: second full moon in the same calendar month ----------
  if (moonPhase.isSignificant && moonPhase.name.includes('Full')) {
    const monthStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    );
    const scanEnd = new Date(date.getTime() - 2 * 86400000); // stop 2 days before today
    let prevFullMoonFound = false;
    if (scanEnd > monthStart) {
      const scanDate = new Date(monthStart);
      while (scanDate <= scanEnd) {
        const prevPhase = getAccurateMoonPhase(scanDate);
        if (prevPhase.illumination >= 97) {
          prevFullMoonFound = true;
          break;
        }
        scanDate.setUTCDate(scanDate.getUTCDate() + 1);
      }
    }
    if (prevFullMoonFound) {
      const moonSign = positions.Moon?.sign || '';
      const blueMoonMod = MOON_MODIFIERS.blueMoon;
      addEvent({
        id: `blue-moon-${dateStr}`,
        name: `Blue Moon in ${moonSign}`,
        date: dateStr,
        rarity: 'CRITICAL',
        score: 82,
        convergenceMultiplier: 1.5,
        hookSuggestions: [
          `Blue Moon in ${moonSign} tonight. The second full moon this month.`,
          `Once in a blue moon, literally. ${moonSign} energy peaks twice this month.`,
          blueMoonMod.extraEnergy,
          `Blue Moon. What did you set at the last full moon? Time to check in.`,
        ],
        category: 'moon',
        rarityFrame:
          'a Blue Moon, the second full moon in a calendar month, happens roughly every 2.5 years',
        eventType: 'moon_phase',
        planet: 'Moon',
        sign: moonSign,
        moonModifiers: [blueMoonMod],
      });
    }
  }

  // --- 8c. Void of course: moon has no applying aspects before sign change --
  {
    const moonLonNorm = ((positions.Moon?.longitude ?? 0) + 360) % 360;
    const moonSignIndex = Math.floor(moonLonNorm / 30);
    const nextSignBoundary = (moonSignIndex + 1) * 30;
    const ASPECT_ANGLES = [0, 60, 90, 120, 180] as const;
    const ORB = 8;
    const PLANET_NAMES = [
      'Sun',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
    ] as const;

    let hasApplyingAspect = false;
    outer: for (const planet of PLANET_NAMES) {
      const pLon = ((positions[planet]?.longitude ?? -1000) + 360) % 360;
      if (pLon < 0) continue;
      for (const angle of ASPECT_ANGLES) {
        const targets =
          angle === 0
            ? [pLon]
            : angle === 180
              ? [(pLon + 180) % 360]
              : [(pLon + angle) % 360, (pLon - angle + 360) % 360];
        for (const t of targets) {
          if (t > moonLonNorm - ORB && t < nextSignBoundary) {
            hasApplyingAspect = true;
            break outer;
          }
        }
      }
    }

    if (!hasApplyingAspect) {
      const moonSign = positions.Moon?.sign || '';
      const remainingDeg = nextSignBoundary - moonLonNorm;
      const hoursRemaining = Math.round(remainingDeg / 0.549); // moon ~0.549°/hr
      addEvent({
        id: `moon-void-of-course-${dateStr}`,
        name: `Moon Void of Course in ${moonSign}`,
        date: dateStr,
        rarity: 'LOW',
        score: 20,
        convergenceMultiplier: 1.0,
        hookSuggestions: [
          `Moon void of course in ${moonSign} for ~${hoursRemaining}h. Rest, do not start new things.`,
          `Void of course moon. Avoid signing contracts or making major decisions right now.`,
          `Moon VOC: cosmic pause before the next sign. Rest and let things settle.`,
        ],
        category: 'moon',
        rarityFrame:
          'the Moon is between its last major aspect and the next sign — a natural pause before renewal',
        eventType: 'moon_sign_change',
        planet: 'Moon',
        sign: moonSign,
      });
    }
  }

  // --- 9. Moon sign change ------------------------------------------------
  {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayPositions = getRealPlanetaryPositions(
      yesterday,
      DEFAULT_OBSERVER,
    );
    const moonSign = positions.Moon?.sign;
    const yesterdayMoonSign = yesterdayPositions.Moon?.sign;

    if (moonSign && yesterdayMoonSign && moonSign !== yesterdayMoonSign) {
      addEvent({
        id: `moon-sign-change-${moonSign.toLowerCase()}-${dateStr}`,
        name: `Moon enters ${moonSign}`,
        date: dateStr,
        rarity: 'LOW',
        score: 15,
        convergenceMultiplier: 1.0,
        hookSuggestions: [
          `The Moon moves into ${moonSign} today. The emotional tone shifts.`,
          `Moon in ${moonSign}. Notice how your instincts feel different.`,
        ],
        category: 'moon',
        rarityFrame: 'the Moon changes sign every ~2.5 days',
        eventType: 'moon_sign_change',
        planet: 'Moon',
        sign: moonSign,
      });
    }
  }

  // --- 10. Notable aspects (tight, within 2 degrees) ----------------------
  const tightAspects = aspects.filter(
    (a: any) =>
      a.separation <= 2 &&
      ['conjunction', 'opposition', 'square', 'trine'].includes(a.aspect),
  );

  for (const aspect of tightAspects.slice(0, 3)) {
    const pA = aspect.planetA as string;
    const pB = aspect.planetB as string;
    const aspectName = aspect.aspect as string;

    // Boost for outer-outer conjunctions
    const bothOuter = OUTER_PLANETS.has(pA) && OUTER_PLANETS.has(pB);
    const oneOuter = OUTER_PLANETS.has(pA) || OUTER_PLANETS.has(pB);

    let aspectScore = 35;
    let aspectRarity: EventRarity = 'MEDIUM';

    if (bothOuter && aspectName === 'conjunction') {
      aspectScore = 88;
      aspectRarity = 'CRITICAL';
    } else if (bothOuter) {
      aspectScore = 65;
      aspectRarity = 'HIGH';
    } else if (oneOuter) {
      aspectScore = 45;
      aspectRarity = 'MEDIUM';
    }

    // Tighter orbs get higher scores
    aspectScore += Math.round((2 - (aspect.separation as number)) * 5);

    // Build substantive context for aspects
    const rulesA = PLANET_RULES_SHORT[pA] || pA;
    const rulesB = PLANET_RULES_SHORT[pB] || pB;
    const signA = positions[pA]?.sign || '';
    const signB = positions[pB]?.sign || '';
    const signNote =
      signA && signB && signA !== signB
        ? ` ${pA} in ${signA}, ${pB} in ${signB}.`
        : signA
          ? ` Both in ${signA}.`
          : '';

    const aspectMeanings: Record<string, string> = {
      conjunction: `${pA} (${rulesA}) and ${pB} (${rulesB}) merge into a single pulse.${signNote} Both domains activate at once -- whatever one triggers, the other amplifies.`,
      opposition: `${pA} (${rulesA}) and ${pB} (${rulesB}) pull in opposite directions.${signNote} The tension is the point. Neither side can be ignored.`,
      square: `${pA} (${rulesA}) squares ${pB} (${rulesB}).${signNote} Friction that forces a decision. Something has to give.`,
      trine: `${pA} (${rulesA}) trines ${pB} (${rulesB}).${signNote} Flow and support between these areas. Use it while it lasts.`,
    };
    const aspectContext =
      aspectMeanings[aspectName] ||
      `${pA} (${rulesA}) and ${pB} (${rulesB}) form a significant alignment.${signNote}`;

    const hookCandidates: string[] = [];
    if (bothOuter) {
      hookCandidates.push(
        `${pA} ${aspectName} ${pB} is exact. This alignment is rare.`,
        `Rare aspect: ${pA} meets ${pB} by ${aspectName} today.`,
      );
    } else {
      hookCandidates.push(
        `${pA} ${aspectName} ${pB} is exact today`,
        `${pA} and ${pB} form an exact ${aspectName} right now`,
      );
    }

    addEvent({
      id: `aspect-${pA.toLowerCase()}-${aspectName}-${pB.toLowerCase()}-${dateStr}`,
      name: `${pA} ${aspectName} ${pB}`,
      date: dateStr,
      rarity: aspectRarity,
      score: aspectScore,
      convergenceMultiplier: 1.0,
      hookSuggestions: hookCandidates,
      category: 'aspect',
      rarityFrame: bothOuter
        ? `a rare alignment between two slow-moving planets`
        : `exact within ${Math.round((aspect.separation as number) * 10) / 10}°`,
      historicalContext: aspectContext,
      eventType: 'aspect',
      planet: pA,
      sign: positions[pA]?.sign,
    });
  }

  // --- 11. Stelliums (3+ planets in same sign) ----------------------------
  {
    const signCounts: Record<string, string[]> = {};
    for (const [planet, pos] of Object.entries(positions) as [string, any][]) {
      if (!pos?.sign || planet === 'Moon') continue;
      if (!signCounts[pos.sign]) signCounts[pos.sign] = [];
      signCounts[pos.sign].push(planet);
    }

    for (const [sign, planets] of Object.entries(signCounts)) {
      if (planets.length >= 3) {
        const score = 42 + planets.length * 3;
        addEvent({
          id: `stellium-${sign.toLowerCase()}-${dateStr}`,
          name: `${planets.length}-planet stellium in ${sign}`,
          date: dateStr,
          rarity: 'MEDIUM',
          score: Math.min(score, 60),
          convergenceMultiplier: 1.0,
          hookSuggestions: [
            `${planets.join(', ')} are all in ${sign} right now. That is a lot of ${sign} energy.`,
            `A stellium in ${sign} concentrates cosmic attention in one area.`,
          ],
          category: 'aspect',
          rarityFrame: `${planets.length} planets concentrated in a single sign`,
          eventType: 'stellium',
          sign,
        });
      }
    }
  }

  // --- 12. Lookahead: upcoming CRITICAL/HIGH events within 7 days ----------
  // Adds countdown-style events ("Ostara is tomorrow", "3 days until...")
  // so daily crons can generate build-up content.
  {
    const lookaheadDays = 7;
    for (let d = 1; d <= lookaheadDays; d++) {
      const futureDate = new Date(date);
      futureDate.setUTCDate(futureDate.getUTCDate() + d);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      // Check slow planet sign changes
      const slowSegments = (slowPlanetData as any).segments;
      for (const [planet, signs] of Object.entries(slowSegments) as [
        string,
        any,
      ][]) {
        for (const [sign, segments] of Object.entries(signs) as [
          string,
          any,
        ][]) {
          for (const seg of segments) {
            const segStart = new Date(seg.start);
            const segStartStr = segStart.toISOString().split('T')[0];
            if (segStartStr !== futureDateStr) continue;

            const { rarity, score } = scoreFromOrbitalPeriod(planet, 'ingress');
            if (rarity !== 'CRITICAL' && rarity !== 'HIGH') continue;

            const contextKey = `${planet.toLowerCase()}-${sign.toLowerCase()}`;
            const historicalCtx = HISTORICAL_CONTEXT[contextKey];
            const orbitalPeriod = ORBITAL_PERIOD_YEARS[planet];
            const lastPeriod = historicalCtx?.previousPeriods?.[0];
            const daysLabel = d === 1 ? 'tomorrow' : `in ${d} days`;

            addEvent({
              id: `countdown-${planet.toLowerCase()}-${sign.toLowerCase()}-in-${d}d-${dateStr}`,
              name: `${planet} enters ${sign} ${daysLabel}`,
              date: dateStr, // The date THIS content is for
              rarity: d <= 3 ? rarity : 'HIGH', // Downgrade if > 3 days out
              score: Math.round(score * (d <= 1 ? 0.9 : d <= 3 ? 0.7 : 0.5)),
              orbitalPeriodYears: orbitalPeriod,
              yearsPerSign: orbitalPeriod
                ? Math.round((orbitalPeriod / 12) * 10) / 10
                : undefined,
              lastInThisSign: lastPeriod,
              historicalContext: historicalCtx?.theme,
              convergenceMultiplier: 1.0,
              hookSuggestions: [
                d === 1
                  ? `${planet} enters ${sign} tomorrow${lastPeriod ? ` for the first time since ${lastPeriod}` : ''}. Are you ready?`
                  : `${d} days until ${planet} enters ${sign}.${lastPeriod ? ` Last time: ${lastPeriod}.` : ''}`,
                `The countdown is on. ${planet} in ${sign} arrives ${daysLabel}.`,
              ],
              category: 'transit_alert',
              rarityFrame: buildRarityFrame(planet, sign, 'ingress'),
              eventType: 'countdown',
              planet,
              sign,
            });
          }
        }
      }

      // Check sabbats in lookahead window
      for (const sabbat of wheelOfTheYearSabbats) {
        const sabbatMatch = doesSabbatMatchDate(sabbat, futureDateStr);
        if (!sabbatMatch) continue;

        const daysLabel = d === 1 ? 'tomorrow' : `in ${d} days`;
        const sabbatScore = d <= 1 ? 68 : d <= 3 ? 55 : 40;

        addEvent({
          id: `countdown-sabbat-${sabbat.name.toLowerCase()}-in-${d}d-${dateStr}`,
          name: `${sabbat.name} is ${daysLabel}`,
          date: dateStr,
          rarity: d <= 3 ? 'HIGH' : 'MEDIUM',
          score: sabbatScore,
          convergenceMultiplier: 1.0,
          hookSuggestions: [
            d === 1
              ? `${sabbat.name} is tomorrow. ${sabbat.description?.split('.')[0] || 'A turning point in the wheel of the year'}.`
              : `${d} days until ${sabbat.name}. Time to prepare.`,
            `The wheel turns. ${sabbat.name} arrives ${daysLabel}.`,
          ],
          sabbatData: sabbat,
          category: 'sabbat',
          rarityFrame: `${sabbat.name}, a sacred turning point in the wheel of the year`,
          eventType: 'countdown',
          sign: undefined,
        });
      }

      // Check seasonal events (equinoxes/solstices) via astronomy-engine
      const futurePositions = getRealPlanetaryPositions(
        futureDate,
        DEFAULT_OBSERVER,
      );
      const futureSeasonal = checkSeasonalEvents(futurePositions);
      for (const se of futureSeasonal) {
        const sabbatName = SEASONAL_TO_SABBAT[se.name];
        const daysLabel = d === 1 ? 'tomorrow' : `in ${d} days`;

        // Skip if already added via sabbat detection
        const existingId = `countdown-sabbat-${sabbatName?.toLowerCase()}-in-${d}d-${dateStr}`;
        if (seenIds.has(existingId)) continue;

        const equinoxScore = d <= 1 ? 72 : d <= 3 ? 60 : 45;

        addEvent({
          id: `countdown-seasonal-${se.name.toLowerCase().replace(/\s+/g, '-')}-in-${d}d-${dateStr}`,
          name: sabbatName
            ? `${sabbatName} (${se.name}) is ${daysLabel}`
            : `${se.name} is ${daysLabel}`,
          date: dateStr,
          rarity: d <= 1 ? 'HIGH' : 'MEDIUM',
          score: equinoxScore,
          convergenceMultiplier: 1.0,
          hookSuggestions: [
            `The ${se.name.toLowerCase()} arrives ${daysLabel}. A shift is coming.`,
            sabbatName
              ? `${sabbatName} lands ${daysLabel}. The wheel of the year turns.`
              : `${se.name} ${daysLabel}. Light and dark rebalance.`,
          ],
          sabbatData: sabbatName
            ? wheelOfTheYearSabbats.find((s) => s.name === sabbatName)
            : undefined,
          category: 'sabbat',
          rarityFrame: sabbatName
            ? `${sabbatName}, marking the ${se.name.toLowerCase()}`
            : se.name,
          eventType: 'countdown',
        });
      }
    }
  }

  // --- Apply convergence multiplier to all events -------------------------
  const multiplier = calculateConvergenceMultiplier(events);
  if (multiplier > 1.0) {
    for (const event of events) {
      // Don't multiply countdown events — they're previews, not convergence
      if (event.eventType === 'countdown') continue;
      event.convergenceMultiplier = multiplier;
      event.score = Math.min(Math.round(event.score * multiplier), 100);
    }
  }

  // Regenerate hook suggestions for convergent days
  if (multiplier >= 1.5) {
    const highEvents = events.filter(
      (e) =>
        (e.rarity === 'CRITICAL' || e.rarity === 'HIGH') &&
        e.eventType !== 'countdown',
    );
    if (highEvents.length >= 2) {
      const convergenceHook = `${highEvents.length} major shifts align on one day. ${highEvents.map((e) => e.name).join(' + ')}.`;
      for (const event of highEvents) {
        event.hookSuggestions.push(convergenceHook);
      }
    }
  }

  // Sort by score descending
  events.sort((a, b) => b.score - a.score);

  return events;
}

// ---------------------------------------------------------------------------
// Core export: getUpcomingEvents
// ---------------------------------------------------------------------------

/**
 * Returns all events in a forward-looking window, sorted by date then score.
 *
 * Uses slow-planet-sign-changes.json for forward-looking sign changes
 * and fixed sabbat dates for lookahead. For each day in the window,
 * calls getEventCalendarForDate to get the full picture.
 *
 * @param days - Number of days to look ahead (default: 30)
 */
export async function getUpcomingEvents(
  days: number = 30,
): Promise<CalendarEvent[]> {
  const allEvents: CalendarEvent[] = [];
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  // First, gather known future events from pre-computed data
  // to avoid calling getEventCalendarForDate for every single day.

  const seenIds = new Set<string>();

  // 1. Slow planet sign changes in the window
  const windowEnd = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

  const segments = slowPlanetData.segments;
  for (const [planet, signs] of Object.entries(segments)) {
    for (const [sign, periods] of Object.entries(
      signs as Record<string, Array<{ start: string; end: string }>>,
    )) {
      for (const period of periods) {
        const startDate = new Date(period.start);
        if (startDate >= today && startDate <= windowEnd) {
          const eventDateStr = startDate.toISOString().split('T')[0];
          const contextKey = `${planet.toLowerCase()}-${sign.toLowerCase()}`;
          const historicalCtx = HISTORICAL_CONTEXT[contextKey];
          const orbitalPeriod = ORBITAL_PERIOD_YEARS[planet];
          const yearsPerSign = orbitalPeriod
            ? Math.round((orbitalPeriod / 12) * 10) / 10
            : undefined;
          const lastPeriod = historicalCtx?.previousPeriods?.[0];
          const { rarity, score } = scoreFromOrbitalPeriod(planet, 'ingress');

          const id = `${planet.toLowerCase()}-${sign.toLowerCase()}-ingress-${eventDateStr}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            allEvents.push({
              id,
              name: `${planet} enters ${sign}`,
              date: eventDateStr,
              rarity,
              score,
              orbitalPeriodYears: orbitalPeriod,
              yearsPerSign,
              lastInThisSign: lastPeriod,
              historicalContext: historicalCtx?.theme,
              convergenceMultiplier: 1.0,
              hookSuggestions: generateHookSuggestions(
                {
                  planet,
                  sign,
                  rarity,
                  eventType: 'ingress',
                  name: `${planet} enters ${sign}`,
                },
                historicalCtx,
              ),
              category: 'transit',
              rarityFrame: buildRarityFrame(
                planet,
                sign,
                'ingress',
                lastPeriod,
              ),
              eventType: 'ingress',
              planet,
              sign,
            });
          }
        }
      }
    }
  }

  // 2. Fixed sabbats in the window
  for (const fixed of FIXED_SABBAT_DATES) {
    const currentYear = today.getFullYear();
    // Check this year and next year
    for (const year of [currentYear, currentYear + 1]) {
      const sabbatDate = new Date(
        Date.UTC(year, fixed.month - 1, fixed.day, 12),
      );
      if (sabbatDate >= today && sabbatDate <= windowEnd) {
        const eventDateStr = sabbatDate.toISOString().split('T')[0];
        const sabbatData = wheelOfTheYearSabbats.find(
          (s) => s.name === fixed.name,
        );
        if (sabbatData) {
          const id = `sabbat-${fixed.name.toLowerCase()}-${eventDateStr}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            allEvents.push(
              buildSabbatEvent(sabbatData, eventDateStr, 'sabbat'),
            );
          }
        }
      }
    }
  }

  // 3. Eclipses in the window
  try {
    const eclipses = getUpcomingEclipses(today, Math.ceil(days / 30) + 1);
    for (const eclipse of eclipses) {
      if (eclipse.date >= today && eclipse.date <= windowEnd) {
        const eventDateStr = eclipse.date.toISOString().split('T')[0];
        const { rarity, score } = scoreFromOrbitalPeriod('Moon', 'eclipse');
        const id = `eclipse-${eclipse.type}-${eventDateStr}`;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          allEvents.push({
            id,
            name: eclipse.description,
            date: eventDateStr,
            rarity,
            score,
            convergenceMultiplier: 1.0,
            hookSuggestions: generateHookSuggestions({
              name: eclipse.description,
              rarity,
              eventType: 'eclipse',
            }),
            category: 'eclipse',
            rarityFrame: buildRarityFrame('Moon', eclipse.sign, 'eclipse'),
            eventType: 'eclipse',
            sign: eclipse.sign,
          });
        }
      }
    }
  } catch {
    // Eclipse calc can throw on edge cases
  }

  // 4. Get today's full picture (includes retrogrades, moon phase, aspects)
  const todayStr = today.toISOString().split('T')[0];
  const todayEvents = await getEventCalendarForDate(todayStr);
  for (const event of todayEvents) {
    if (!seenIds.has(event.id)) {
      seenIds.add(event.id);
      allEvents.push(event);
    }
  }

  // Sort by date ascending, then score descending within each day
  allEvents.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return b.score - a.score;
  });

  return allEvents;
}

// ---------------------------------------------------------------------------
// Core export: getHighestPriorityEvent
// ---------------------------------------------------------------------------

/**
 * Convenience function: returns the single most significant event for a date,
 * or null if nothing noteworthy is happening.
 */
export async function getHighestPriorityEvent(
  dateStr: string,
): Promise<CalendarEvent | null> {
  const events = await getEventCalendarForDate(dateStr);
  return events.length > 0 ? events[0] : null;
}

// ---------------------------------------------------------------------------
// Moon content arc detection
// ---------------------------------------------------------------------------

export type MoonArcPhase = 'teaser' | 'main' | 'reflection';

export interface MoonArcEvent {
  /** Which part of the arc this is */
  arcPhase: MoonArcPhase;
  /** The date of the actual full/new moon (ISO string) */
  moonDate: string;
  /** 'full' or 'new' */
  moonType: 'full' | 'new';
  /** Moon sign at the event */
  moonSign: string;
  /** Rich identity data */
  identity: MoonIdentity;
  /** Special modifiers (supermoon, blue moon, etc.) */
  modifiers: MoonModifier[];
  /** Display name e.g. "Wolf Moon (Full Moon) in Cancer" */
  displayName: string;
}

/**
 * Detect whether a given date falls within a 3-day content arc around a
 * full or new moon: teaser (day before), main (day of), reflection (day after).
 *
 * Returns an array because a date could theoretically be the reflection of
 * one moon and the teaser of another (extremely rare).
 */
export function detectMoonContentArc(dateStr: string): MoonArcEvent[] {
  const date = new Date(dateStr);
  date.setUTCHours(12, 0, 0, 0);

  const results: MoonArcEvent[] = [];

  // Check day before (teaser), day of (main), and day after (reflection)
  const offsets: { days: number; arcPhase: MoonArcPhase }[] = [
    { days: 1, arcPhase: 'teaser' }, // tomorrow is a moon = today is teaser
    { days: 0, arcPhase: 'main' }, // today is the moon
    { days: -1, arcPhase: 'reflection' }, // yesterday was a moon = today is reflection
  ];

  for (const { days, arcPhase } of offsets) {
    const checkDate = new Date(date);
    checkDate.setUTCDate(checkDate.getUTCDate() + days);

    const phase = getAccurateMoonPhase(checkDate);
    if (!phase.isSignificant) continue;

    const isFullOrNew =
      phase.name.includes('Full') || phase.name.includes('New');
    if (!isFullOrNew) continue;

    const moonType: 'full' | 'new' = phase.name.includes('Full')
      ? 'full'
      : 'new';
    const monthNum = checkDate.getUTCMonth() + 1;
    const identity = getMoonIdentity(monthNum, moonType);
    if (!identity) continue;

    const checkPositions = getRealPlanetaryPositions(checkDate);
    const moonSign = checkPositions.Moon?.sign || '';

    const modifiers: MoonModifier[] = [];
    if (phase.isSuperMoon) modifiers.push(MOON_MODIFIERS.supermoon);

    const displayName =
      moonType === 'full'
        ? `${identity.name} (Full Moon) in ${moonSign}`
        : `New Moon in ${moonSign}`;

    const moonDateStr = checkDate.toISOString().split('T')[0];

    results.push({
      arcPhase,
      moonDate: moonDateStr,
      moonType,
      moonSign,
      identity,
      modifiers,
      displayName,
    });
  }

  return results;
}
