/**
 * Context builder for transit deep-dive blog generation.
 *
 * Assembles all available context about a transit before sending to AI.
 * Reuses existing data sources -- never duplicates calculation logic.
 */

import {
  YEARLY_TRANSITS,
  getTransitsForYear,
  type YearlyTransit,
} from '@/constants/seo/yearly-transits';
import { PLANETARY_DIGNITIES } from '@/lib/astro/event-calendar';
import transitData from '@/data/slow-planet-sign-changes.json';
import { format } from 'date-fns';
import type { TransitGenerationContext } from './types';
import type { EventRarity } from '@/lib/astro/event-calendar';

// Orbital periods (same values as event-calendar.ts, kept local to avoid circular deps)
const ORBITAL_PERIOD_YEARS: Record<string, number> = {
  Jupiter: 11.86,
  Saturn: 29.46,
  Uranus: 84.01,
  Neptune: 164.8,
  Pluto: 247.9,
};

// Historical context (imported from event-calendar would cause circular deps in some setups)
// Re-reference the same data structure
const HISTORICAL_CONTEXT: Record<
  string,
  { previousPeriods: string[]; events: Record<string, string[]>; theme: string }
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
  // Conjunction-specific historical context
  'saturn-neptune-conjunction': {
    previousPeriods: ['1989', '1953', '1917', '1882'],
    events: {
      '1989': [
        'Berlin Wall falls',
        'Tiananmen Square protests',
        'End of Cold War begins',
        'World Wide Web invented',
      ],
      '1953': [
        'Korean War ends',
        'DNA structure discovered',
        'Stalin dies',
        'Television enters mass culture',
      ],
      '1917': [
        'Russian Revolution',
        'US enters World War I',
        'Balfour Declaration',
      ],
      '1882': [
        'Edison opens first power station',
        'Triple Alliance formed',
        'Immigration wave reshapes America',
      ],
    },
    theme:
      'Old orders dissolve, new visions crystallise -- the dreamer and the builder reset civilisation together',
  },
  'saturn-uranus-conjunction': {
    previousPeriods: ['1988', '1942', '1897'],
    events: {
      '1988': [
        'Soviet glasnost peaks',
        'Pan Am Flight 103',
        'First internet worm',
      ],
      '1942': [
        'Manhattan Project begins',
        'Battle of Stalingrad',
        'Radar technology transforms warfare',
      ],
      '1897': ['Klondike Gold Rush', 'Electron discovered', 'Zionism founded'],
    },
    theme:
      'Radical innovation forced into practical structure -- technology reshapes institutions',
  },
  'jupiter-neptune-conjunction': {
    previousPeriods: ['2022', '2009', '1997', '1984'],
    events: {
      '2022': [
        'ChatGPT launches',
        'Post-pandemic spiritual renaissance',
        'Psychedelic therapy legalisation wave',
      ],
      '2009': [
        'Bitcoin whitepaper circulates',
        'Obama inaugurated',
        'Global financial crisis recovery',
      ],
      '1997': [
        'Hong Kong handover',
        'Princess Diana dies',
        'Dolly the sheep cloned',
      ],
      '1984': [
        'Apple Macintosh launched',
        'Band Aid and Live Aid',
        'Bhopal disaster',
      ],
    },
    theme:
      'Collective imagination expands -- spiritual movements, artistic revolutions, and utopian visions gain momentum',
  },
  'jupiter-pluto-conjunction': {
    previousPeriods: ['2020', '2007', '1994', '1981'],
    events: {
      '2020': [
        'COVID-19 pandemic',
        'Global lockdowns',
        'Black Lives Matter movement peaks',
        'US election upheaval',
      ],
      '2007': [
        'iPhone launched',
        'Financial crisis begins',
        'Social media goes mainstream',
      ],
      '1994': [
        'Rwandan genocide',
        'Mandela elected president',
        'Amazon founded',
      ],
      '1981': ['AIDS epidemic identified', 'IBM PC launched', 'MTV debuts'],
    },
    theme:
      'Power amplified to extremes -- pandemics, wealth concentration, mass movements, and technological power shifts',
  },
};

/**
 * Get ephemeris data for a planet in a sign from pre-computed JSON.
 * Same logic as getTransitEphemeris in the transit page, extracted here.
 */
function getEphemeris(planet: string, sign: string) {
  const segments = (
    transitData.segments as Record<
      string,
      Record<string, { start: string; end: string }[]>
    >
  )[planet];
  if (!segments?.[sign]) return null;

  const segs = segments[sign].map((s) => ({
    start: new Date(s.start),
    end: new Date(s.end),
  }));

  const msPerDay = 86400000;
  const totalDays = Math.ceil(
    segs.reduce(
      (sum, s) => sum + (s.end.getTime() - s.start.getTime()) / msPerDay,
      0,
    ),
  );

  return {
    segments: segs.map((s) => ({
      start: format(s.start, 'yyyy-MM-dd'),
      end: format(s.end, 'yyyy-MM-dd'),
    })),
    totalDays,
    firstEntry: segs[0].start,
    finalExit: segs[segs.length - 1].end,
    hasRetrograde: segs.length > 1,
  };
}

/**
 * Find the previous time a planet was in a sign.
 * Same logic as getPreviousTransit in the transit page.
 */
function getPreviousTransitDates(planet: string, sign: string) {
  const allSigns = (
    transitData.segments as Record<
      string,
      Record<string, { start: string; end: string }[]>
    >
  )[planet];
  if (!allSigns?.[sign]) return null;

  const currentSegs = allSigns[sign];
  if (currentSegs.length === 0) return null;

  const groups: { start: Date; end: Date }[][] = [];
  let currentGroup: { start: Date; end: Date }[] = [];

  for (const seg of currentSegs) {
    const s = { start: new Date(seg.start), end: new Date(seg.end) };
    if (
      currentGroup.length === 0 ||
      s.start.getTime() - currentGroup[currentGroup.length - 1].end.getTime() <
        2 * 365 * 86400000
    ) {
      currentGroup.push(s);
    } else {
      groups.push(currentGroup);
      currentGroup = [s];
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  if (groups.length >= 2) {
    const prev = groups[0];
    return {
      start: format(prev[0].start, 'MMMM yyyy'),
      end: format(prev[prev.length - 1].end, 'MMMM yyyy'),
    };
  }

  return null;
}

/**
 * Determine the planetary dignity for a planet in a sign.
 */
function getDignity(planet: string, sign: string): string | null {
  const dignities = PLANETARY_DIGNITIES[planet];
  if (!dignities) return null;

  if (dignities.rules.includes(sign)) return 'domicile (rules this sign)';
  if (dignities.exalted.includes(sign)) return 'exalted (strongest expression)';
  if (dignities.detriment.includes(sign))
    return 'detriment (challenged expression)';
  if (dignities.fall.includes(sign)) return 'fall (weakest expression)';
  return null;
}

/**
 * Assign a rarity score to a transit based on planet type.
 */
function getRarity(planet: string): EventRarity {
  const period = ORBITAL_PERIOD_YEARS[planet];
  if (!period) return 'LOW';
  if (period >= 80) return 'CRITICAL';
  if (period >= 25) return 'HIGH';
  if (period >= 10) return 'MEDIUM';
  return 'LOW';
}

/**
 * Build the full generation context for a transit.
 */
export function buildGenerationContext(
  transit: YearlyTransit,
): TransitGenerationContext {
  const sign = transit.signs[0];
  const isConjunction = transit.transitType
    .toLowerCase()
    .includes('conjunction');

  // For conjunctions, try conjunction-specific key first (e.g. 'saturn-neptune-conjunction')
  // then fall back to planet-sign key
  const conjunctionKey = isConjunction
    ? transit.transitType
        .replace(' Conjunction', '')
        .toLowerCase()
        .replace(/\s+/g, '-') + '-conjunction'
    : null;
  const planetSignKey = `${transit.planet.toLowerCase()}-${sign.toLowerCase()}`;
  const historicalCtx =
    (conjunctionKey && HISTORICAL_CONTEXT[conjunctionKey]) ||
    HISTORICAL_CONTEXT[planetSignKey];
  const ephemeris = getEphemeris(transit.planet, sign);
  const previousTransit = getPreviousTransitDates(transit.planet, sign);
  const orbitalPeriod = ORBITAL_PERIOD_YEARS[transit.planet] || null;
  const yearsPerSign = orbitalPeriod
    ? Math.round((orbitalPeriod / 12) * 10) / 10
    : null;
  const dignity = getDignity(transit.planet, sign);
  const rarity = getRarity(transit.planet);

  // Get related transits from the same year (excluding self)
  const related = getTransitsForYear(transit.year)
    .filter((t) => t.id !== transit.id)
    .map((t) => ({
      id: t.id,
      title: t.title,
      planet: t.planet,
      sign: t.signs[0],
    }));

  return {
    planet: transit.planet,
    sign,
    year: transit.year,
    transitType: transit.transitType,
    transitId: transit.id,

    startDate: ephemeris
      ? format(ephemeris.firstEntry, 'MMMM d, yyyy')
      : transit.startDate
        ? format(transit.startDate, 'MMMM d, yyyy')
        : null,
    endDate: ephemeris
      ? format(ephemeris.finalExit, 'MMMM d, yyyy')
      : transit.endDate
        ? format(transit.endDate, 'MMMM d, yyyy')
        : null,
    totalDays: ephemeris?.totalDays ?? null,
    hasRetrograde: ephemeris?.hasRetrograde ?? false,
    segments: ephemeris?.segments ?? [],

    description: transit.description,
    themes: transit.themes,
    doList: transit.doList,
    avoidList: transit.avoidList,
    tone: transit.tone,

    rarity,
    orbitalPeriodYears: orbitalPeriod,
    yearsPerSign,

    previousPeriods: historicalCtx?.previousPeriods ?? [],
    historicalEvents: historicalCtx?.events ?? {},
    historicalTheme: historicalCtx?.theme ?? null,
    previousTransitDates: previousTransit,

    dignity,
    relatedTransits: related,
  };
}

/**
 * Build context from a planet/sign/year combo (for dynamic transits
 * that might not be in YEARLY_TRANSITS).
 */
export function buildContextFromSlug(
  planet: string,
  sign: string,
  year: number,
): TransitGenerationContext | null {
  // First check if it exists in YEARLY_TRANSITS
  const existing = YEARLY_TRANSITS.find(
    (t) =>
      t.planet.toLowerCase() === planet.toLowerCase() &&
      t.signs.some((s) => s.toLowerCase() === sign.toLowerCase()) &&
      t.year === year,
  );

  if (existing) {
    return buildGenerationContext(existing);
  }

  // Build a synthetic transit from ephemeris data
  const ephemeris = getEphemeris(planet, sign);
  if (!ephemeris) return null;

  const capitalPlanet = planet.charAt(0).toUpperCase() + planet.slice(1);
  const capitalSign = sign.charAt(0).toUpperCase() + sign.slice(1);

  const syntheticTransit: YearlyTransit = {
    id: `${planet.toLowerCase()}-${sign.toLowerCase()}-${year}`,
    year,
    planet: capitalPlanet,
    transitType: `${capitalPlanet} Ingress`,
    title: `${capitalPlanet} in ${capitalSign} ${year}`,
    dates: `${format(ephemeris.firstEntry, 'MMMM d, yyyy')} - ${format(ephemeris.finalExit, 'MMMM d, yyyy')}`,
    signs: [capitalSign],
    description: `${capitalPlanet} enters ${capitalSign}, shifting collective energy toward new themes.`,
    themes: ['change', 'growth', 'transformation'],
    doList: [
      'align with the new energy',
      'reflect on what this shift means for you',
    ],
    avoidList: ['resisting change', 'clinging to old patterns'],
    tone: `${capitalPlanet} shifts into ${capitalSign}, bringing fresh energy.`,
    startDate: ephemeris.firstEntry,
    endDate: ephemeris.finalExit,
  };

  return buildGenerationContext(syntheticTransit);
}
