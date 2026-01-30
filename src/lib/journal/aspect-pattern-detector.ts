import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type AspectPattern = {
  type:
    | 'natal_grand_trine'
    | 'natal_t_square'
    | 'natal_stellium'
    | 'natal_yod'
    | 'natal_grand_cross'
    | 'natal_grand_conjunction';
  planets: string[];
  signs?: string[];
  houses?: number[];
  element?: string;
  description: string;
  confidence: number;
};

type Aspect = {
  planet1: string;
  planet2: string;
  type:
    | 'conjunction'
    | 'opposition'
    | 'trine'
    | 'square'
    | 'sextile'
    | 'quincunx';
  orb: number;
};

const MAJOR_BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Ascendant',
  'Descendant',
  'Midheaven',
  'North Node',
  'South Node',
];

const ELEMENT_MAP: Record<string, string> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water',
};

/**
 * Calculate aspect between two planets
 */
function calculateAspect(
  long1: number,
  long2: number,
): { type: Aspect['type']; orb: number } | null {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) diff = 360 - diff;

  const aspects = [
    { type: 'conjunction' as const, angle: 0, orb: 8 },
    { type: 'opposition' as const, angle: 180, orb: 8 },
    { type: 'trine' as const, angle: 120, orb: 8 },
    { type: 'square' as const, angle: 90, orb: 8 },
    { type: 'sextile' as const, angle: 60, orb: 8 }, // Widened from 6° to 8°
    { type: 'quincunx' as const, angle: 150, orb: 5 }, // Widened from 3° to 5°
  ];

  for (const aspect of aspects) {
    const deviation = Math.abs(diff - aspect.angle);
    if (deviation <= aspect.orb) {
      return { type: aspect.type, orb: deviation };
    }
  }

  return null;
}

/**
 * Build aspect list from birth chart
 */
function buildAspectList(birthChart: BirthChartData[]): Aspect[] {
  const aspects: Aspect[] = [];
  const validBodies = birthChart.filter(
    (p) => p.eclipticLongitude !== undefined && MAJOR_BODIES.includes(p.body),
  );

  for (let i = 0; i < validBodies.length; i++) {
    for (let j = i + 1; j < validBodies.length; j++) {
      const p1 = validBodies[i];
      const p2 = validBodies[j];
      const aspect = calculateAspect(
        p1.eclipticLongitude,
        p2.eclipticLongitude,
      );

      if (aspect) {
        aspects.push({
          planet1: p1.body,
          planet2: p2.body,
          type: aspect.type,
          orb: aspect.orb,
        });
      }
    }
  }

  return aspects;
}

/**
 * Detect Yod patterns (Finger of God)
 */
function detectYods(
  aspects: Aspect[],
  birthChart: BirthChartData[],
): AspectPattern[] {
  const yods: AspectPattern[] = [];
  const planets = birthChart
    .filter((p) => MAJOR_BODIES.includes(p.body))
    .map((p) => p.body);

  for (const planet1 of planets) {
    for (const planet2 of planets) {
      if (planet1 >= planet2) continue;

      const sextile = aspects.find(
        (a) =>
          a.type === 'sextile' &&
          ((a.planet1 === planet1 && a.planet2 === planet2) ||
            (a.planet1 === planet2 && a.planet2 === planet1)),
      );

      // Don't skip - check for quincunxes even without sextile (loose Yod)
      for (const apex of planets) {
        if (apex === planet1 || apex === planet2) continue;

        const quincunx1 = aspects.find(
          (a) =>
            a.type === 'quincunx' &&
            ((a.planet1 === planet1 && a.planet2 === apex) ||
              (a.planet1 === apex && a.planet2 === planet1)),
        );

        const quincunx2 = aspects.find(
          (a) =>
            a.type === 'quincunx' &&
            ((a.planet1 === planet2 && a.planet2 === apex) ||
              (a.planet1 === apex && a.planet2 === planet2)),
        );

        if (quincunx1 && quincunx2) {
          // Check if it's a classic Yod (with sextile) or loose Yod (without)
          const hasClassicSextile = !!sextile;
          yods.push({
            type: 'natal_yod',
            planets: [planet1, planet2, apex],
            description: `${planet1} and ${planet2} ${hasClassicSextile ? 'in sextile both ' : ''}form quincunx aspects pointing to ${apex} - karmic configuration`,
            confidence: hasClassicSextile ? 0.9 : 0.8,
          });
        }
      }
    }
  }

  return yods;
}

/**
 * Detect T-Square patterns
 */
function detectTSquares(
  aspects: Aspect[],
  birthChart: BirthChartData[],
): AspectPattern[] {
  const tSquares: AspectPattern[] = [];
  const planets = birthChart
    .filter((p) => MAJOR_BODIES.includes(p.body))
    .map((p) => p.body);
  const oppositions = aspects.filter((a) => a.type === 'opposition');

  for (const opp of oppositions) {
    for (const apex of planets) {
      if (apex === opp.planet1 || apex === opp.planet2) continue;

      const square1 = aspects.find(
        (a) =>
          a.type === 'square' &&
          ((a.planet1 === opp.planet1 && a.planet2 === apex) ||
            (a.planet1 === apex && a.planet2 === opp.planet1)),
      );

      const square2 = aspects.find(
        (a) =>
          a.type === 'square' &&
          ((a.planet1 === opp.planet2 && a.planet2 === apex) ||
            (a.planet1 === apex && a.planet2 === opp.planet2)),
      );

      if (square1 && square2) {
        tSquares.push({
          type: 'natal_t_square',
          planets: [opp.planet1, opp.planet2, apex],
          description: `${opp.planet1} opposes ${opp.planet2}, both square ${apex}`,
          confidence: 0.9,
        });
      }
    }
  }

  return tSquares;
}

/**
 * Detect Grand Trine patterns
 */
function detectGrandTrines(
  aspects: Aspect[],
  birthChart: BirthChartData[],
): AspectPattern[] {
  const grandTrines: AspectPattern[] = [];
  const planets = birthChart
    .filter((p) => MAJOR_BODIES.includes(p.body))
    .map((p) => p.body);

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const [p1, p2, p3] = [planets[i], planets[j], planets[k]];

        const trine12 = aspects.find(
          (a) =>
            a.type === 'trine' &&
            ((a.planet1 === p1 && a.planet2 === p2) ||
              (a.planet1 === p2 && a.planet2 === p1)),
        );

        const trine23 = aspects.find(
          (a) =>
            a.type === 'trine' &&
            ((a.planet1 === p2 && a.planet2 === p3) ||
              (a.planet1 === p3 && a.planet2 === p2)),
        );

        const trine31 = aspects.find(
          (a) =>
            a.type === 'trine' &&
            ((a.planet1 === p3 && a.planet2 === p1) ||
              (a.planet1 === p1 && a.planet2 === p3)),
        );

        if (trine12 && trine23 && trine31) {
          const planetData = birthChart.filter((p) =>
            [p1, p2, p3].includes(p.body),
          );
          const element = ELEMENT_MAP[planetData[0]?.sign];

          grandTrines.push({
            type: 'natal_grand_trine',
            planets: [p1, p2, p3],
            element,
            description: `${p1}, ${p2}, and ${p3} form harmonious triangle${element ? ` in ${element}` : ''}`,
            confidence: 0.9,
          });
        }
      }
    }
  }

  return grandTrines;
}

/**
 * Detect Grand Conjunction (4+ planets conjunct)
 */
function detectGrandConjunctions(
  aspects: Aspect[],
  birthChart: BirthChartData[],
): AspectPattern[] {
  const conjunctions: AspectPattern[] = [];
  const conjunctionGroups: Set<string>[] = [];

  aspects
    .filter((a) => a.type === 'conjunction')
    .forEach((conj) => {
      let addedToGroup = false;
      for (const group of conjunctionGroups) {
        if (group.has(conj.planet1) || group.has(conj.planet2)) {
          group.add(conj.planet1);
          group.add(conj.planet2);
          addedToGroup = true;
          break;
        }
      }
      if (!addedToGroup) {
        conjunctionGroups.push(new Set([conj.planet1, conj.planet2]));
      }
    });

  conjunctionGroups
    .filter((group) => group.size >= 4)
    .forEach((group) => {
      const planetList = Array.from(group);
      const planetData = birthChart.filter((p) => group.has(p.body));
      const sign = planetData[0]?.sign;

      conjunctions.push({
        type: 'natal_grand_conjunction',
        planets: planetList,
        signs: sign ? [sign] : undefined,
        description: `${planetList.length} planets fused${sign ? ` in ${sign}` : ''} - extraordinary powerhouse`,
        confidence: 0.95,
      });
    });

  return conjunctions;
}

/**
 * Detect Stelliums: 3+ planets in same sign
 */
function detectStelliums(birthChart: BirthChartData[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const majorPlacements = birthChart.filter((p) =>
    MAJOR_BODIES.includes(p.body),
  );

  const bySign: Record<string, BirthChartData[]> = {};
  majorPlacements.forEach((p) => {
    if (!bySign[p.sign]) bySign[p.sign] = [];
    bySign[p.sign].push(p);
  });

  Object.entries(bySign).forEach(([sign, placements]) => {
    if (placements.length >= 3) {
      patterns.push({
        type: 'natal_stellium',
        planets: placements.map((p) => p.body),
        signs: [sign],
        houses: placements.map((p) => p.house || 0).filter((h) => h > 0),
        element: ELEMENT_MAP[sign],
        description: `Stellium of ${placements.length} planets in ${sign}`,
        confidence: 0.95,
      });
    }
  });

  return patterns;
}

/**
 * Detect all natal aspect patterns
 */
export function detectNatalAspectPatterns(
  birthChart: BirthChartData[],
): AspectPattern[] {
  if (!birthChart || birthChart.length === 0) {
    return [];
  }

  const aspects = buildAspectList(birthChart);

  const patterns: AspectPattern[] = [];

  patterns.push(...detectYods(aspects, birthChart));
  patterns.push(...detectTSquares(aspects, birthChart));
  patterns.push(...detectGrandTrines(aspects, birthChart));
  patterns.push(...detectGrandConjunctions(aspects, birthChart));
  patterns.push(...detectStelliums(birthChart));

  return patterns;
}
