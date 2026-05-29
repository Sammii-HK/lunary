/**
 * @jest-environment node
 */
import type { BirthChartData } from '../birthChart';
import { calculateSynastry } from '../synastry';
import {
  calculateTransitAspects,
  calculateHouse,
} from '../../../src/lib/astrology/transit-aspects';

/**
 * Structural invariants for the two aspect engines that are wired into
 * production but had no direct unit coverage:
 *   - utils/astrology/synastry.ts        (calculateSynastry) — friends,
 *     synastry API, compatibility breakdown, couples forecast.
 *   - src/lib/astrology/transit-aspects  (calculateTransitAspects /
 *     calculateHouse) — tarot, horoscope previews, daily email.
 *
 * We assert relationships and bounds that must hold for ANY input rather than
 * absolute interpretations: declared orb limits, aspect symmetry, valid house
 * numbers and determinism.
 */

function planet(
  body: string,
  eclipticLongitude: number,
  overrides: Partial<BirthChartData> = {},
): BirthChartData {
  const normalized = ((eclipticLongitude % 360) + 360) % 360;
  const degreesInSign = normalized % 30;
  return {
    body,
    sign: 'Aries',
    eclipticLongitude: normalized,
    degree: Math.floor(degreesInSign),
    minute: Math.floor((degreesInSign - Math.floor(degreesInSign)) * 60),
    retrograde: false,
    ...overrides,
  };
}

// Maximum orb (degrees) per aspect as declared inside calculateSynastry's
// ASPECT_DEFINITIONS. An aspect reported with a wider orb would be a false
// positive that pollutes every compatibility readout.
const SYNASTRY_MAX_ORB: Record<string, number> = {
  conjunction: 8,
  opposition: 8,
  trine: 8,
  square: 8,
  sextile: 6,
};

// Maximum orb per aspect as declared inside calculateTransitAspects.
const TRANSIT_MAX_ORB: Record<string, number> = {
  conjunction: 10,
  opposition: 10,
  trine: 8,
  square: 8,
  sextile: 6,
};

const PERSONAL = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];

// A spread-out chart so several genuine aspects are detected.
const CHART_A: BirthChartData[] = [
  planet('Sun', 10),
  planet('Moon', 130), // trine Sun (120)
  planet('Mercury', 70), // sextile Sun (60)
  planet('Venus', 200),
  planet('Mars', 100), // square Sun (90)
  planet('Jupiter', 280),
];

const CHART_B: BirthChartData[] = [
  planet('Sun', 12), // conjunction A.Sun (2 orb)
  planet('Moon', 192), // opposition A.Sun (180 → 182, 2 orb)
  planet('Mercury', 250),
  planet('Venus', 45),
  planet('Mars', 325),
  planet('Jupiter', 95),
];

describe('Synastry aspect engine invariants (calculateSynastry)', () => {
  const result = calculateSynastry(CHART_A, CHART_B, 'A', 'B');

  it('reports every aspect within its declared orb limit', () => {
    expect(result.aspects.length).toBeGreaterThan(0);
    for (const aspect of result.aspects) {
      const limit = SYNASTRY_MAX_ORB[aspect.aspect];
      expect(limit).toBeDefined();
      expect(Number.isFinite(aspect.orb)).toBe(true);
      expect(aspect.orb).toBeGreaterThanOrEqual(0);
      // Rounding to 1 dp can nudge the orb a hair past the limit.
      expect(aspect.orb).toBeLessThanOrEqual(limit + 0.05);
    }
  });

  // Why: an aspect is a geometric relationship between two points. If A aspects
  // B at angle X, then B aspects A at the same angle. Asymmetry would mean the
  // synastry grid disagrees with itself depending on read direction.
  it('is symmetric — swapping the two charts yields the same aspect set', () => {
    const swapped = calculateSynastry(CHART_B, CHART_A, 'B', 'A');

    const key = (list: typeof result.aspects, forward: boolean) =>
      list
        .map((a) =>
          forward
            ? `${a.personA.planet}|${a.personB.planet}|${a.aspect}|${a.orb}`
            : `${a.personB.planet}|${a.personA.planet}|${a.aspect}|${a.orb}`,
        )
        .sort();

    expect(key(swapped.aspects, false)).toEqual(key(result.aspects, true));
  });

  // Why: orbs are how an aspect grid ranks significance. Tightest-first
  // ordering is relied on by the UI to surface the strongest connections.
  it('returns aspects sorted by tightest orb first', () => {
    for (let i = 1; i < result.aspects.length; i += 1) {
      expect(result.aspects[i].orb).toBeGreaterThanOrEqual(
        result.aspects[i - 1].orb,
      );
    }
  });

  it('produces a compatibility score within [0, 100]', () => {
    expect(Number.isFinite(result.compatibilityScore)).toBe(true);
    expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(result.compatibilityScore).toBeLessThanOrEqual(100);
  });

  it('only aspects personal/social bodies, never angles or outer-only points', () => {
    const allowed = new Set([...PERSONAL, 'Jupiter', 'Saturn']);
    for (const aspect of result.aspects) {
      expect(allowed.has(aspect.personA.planet)).toBe(true);
      expect(allowed.has(aspect.personB.planet)).toBe(true);
    }
  });

  // Why: a saved synastry must not drift between renders.
  it('is deterministic for identical input', () => {
    const again = calculateSynastry(CHART_A, CHART_B, 'A', 'B');
    expect(again).toEqual(result);
  });

  it('handles empty charts without throwing and stays in score bounds', () => {
    const empty = calculateSynastry([], [], 'A', 'B');
    expect(empty.aspects).toEqual([]);
    expect(empty.compatibilityScore).toBeGreaterThanOrEqual(0);
    expect(empty.compatibilityScore).toBeLessThanOrEqual(100);
  });

  it('reports the exact orb for a known 2-degree Sun conjunction', () => {
    const a = [planet('Sun', 15)];
    const b = [planet('Moon', 17)];
    const { aspects } = calculateSynastry(a, b);
    const conj = aspects.find((x) => x.aspect === 'conjunction');
    expect(conj).toBeDefined();
    expect(conj?.orb).toBeCloseTo(2, 5);
  });
});

describe('Transit aspect engine invariants (calculateTransitAspects)', () => {
  const ascendant = planet('Ascendant', 0);
  const natal: BirthChartData[] = [
    ascendant,
    planet('Sun', 10),
    planet('Moon', 100),
    planet('Venus', 200),
  ];
  const transits = [
    { body: 'Mars', sign: 'Aries', eclipticLongitude: 12 }, // conj natal Sun
    { body: 'Jupiter', sign: 'Cancer', eclipticLongitude: 190 }, // opp natal Sun
    { body: 'Saturn', sign: 'Leo', eclipticLongitude: 130 }, // trine natal Sun
  ];

  const aspects = calculateTransitAspects(natal, transits);

  it('reports every transit aspect within its declared orb limit', () => {
    expect(aspects.length).toBeGreaterThan(0);
    for (const aspect of aspects) {
      const limit = TRANSIT_MAX_ORB[aspect.aspectType];
      expect(limit).toBeDefined();
      expect(Number.isFinite(aspect.orbDegrees)).toBe(true);
      expect(aspect.orbDegrees).toBeGreaterThanOrEqual(0);
      expect(aspect.orbDegrees).toBeLessThanOrEqual(limit + 1e-9);
    }
  });

  it('assigns transit and natal house numbers in 1..12', () => {
    for (const aspect of aspects) {
      for (const house of [aspect.house, aspect.natalHouse]) {
        expect(Number.isInteger(house)).toBe(true);
        expect(house).toBeGreaterThanOrEqual(1);
        expect(house).toBeLessThanOrEqual(12);
      }
    }
  });

  it('sorts results by tightest orb first', () => {
    for (let i = 1; i < aspects.length; i += 1) {
      expect(aspects[i].orbDegrees).toBeGreaterThanOrEqual(
        aspects[i - 1].orbDegrees,
      );
    }
  });

  it('is deterministic for identical input', () => {
    expect(calculateTransitAspects(natal, transits)).toEqual(aspects);
  });

  it('returns an empty array for missing chart or transits', () => {
    expect(calculateTransitAspects(null as any, transits)).toEqual([]);
    expect(calculateTransitAspects(natal, null as any)).toEqual([]);
    expect(calculateTransitAspects([], [])).toEqual([]);
  });
});

describe('Whole-sign house helper invariants (calculateHouse)', () => {
  // Why: this pure helper underpins every transit-aspect house tag. It must
  // always return 1..12 and place the Ascendant's own sign in house 1.
  it('always returns a house in 1..12 across the full circle', () => {
    for (let asc = 0; asc < 360; asc += 17) {
      for (let lon = 0; lon < 360; lon += 13) {
        const house = calculateHouse(lon, asc);
        expect(Number.isInteger(house)).toBe(true);
        expect(house).toBeGreaterThanOrEqual(1);
        expect(house).toBeLessThanOrEqual(12);
      }
    }
  });

  it('puts a point in the Ascendant sign in the 1st house', () => {
    // Ascendant at 200deg (Libra). A point at 205deg shares the sign → house 1.
    expect(calculateHouse(205, 200)).toBe(1);
    // The opposite sign sits in the 7th.
    expect(calculateHouse(25, 200)).toBe(7);
  });

  it('advances one house per 30-degree sign step', () => {
    const asc = 0; // Aries rising
    expect(calculateHouse(5, asc)).toBe(1); // Aries
    expect(calculateHouse(35, asc)).toBe(2); // Taurus
    expect(calculateHouse(65, asc)).toBe(3); // Gemini
    expect(calculateHouse(335, asc)).toBe(12); // Pisces
  });
});
