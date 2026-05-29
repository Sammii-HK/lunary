/**
 * @jest-environment node
 *
 * VITAL OP #14 - Void-of-course Moon, switch-on surface (#284).
 *
 * Source: src/lib/astro/voc-moon.ts. The in-app VOC indicator must agree with
 * the content layer's event-calendar builder (src/lib/astro/event-calendar.ts,
 * section 8c) or the dashboard and the published "VOC moon" content would
 * disagree. `getVoidOfCourseMoon()` is a pure function over a chart snapshot,
 * so this pins:
 *   1. Algorithm parity: for a battery of chart snapshots the `isVoid` verdict
 *      matches a faithful re-implementation of the event-calendar 8c logic
 *      (same angles [0,60,90,120,180], orb 8, classical bodies, applying window).
 *   2. The documented contract: null on a missing/empty chart or no Moon,
 *      moonSign passthrough, and hoursRemaining derivation (0.549 deg/hr, >= 0).
 *
 * Pure maths, no network/DB.
 */
import { getVoidOfCourseMoon, type VocChartBody } from '@/lib/astro/voc-moon';

const SIGNS = [
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

/**
 * Faithful re-implementation of event-calendar.ts section 8c, operating on the
 * same `{ Body: { longitude } }` map shape the calendar uses. This is the
 * reference oracle the pure function must agree with.
 */
function eventCalendarIsVoid(
  positions: Record<string, { longitude: number } | undefined>,
): boolean {
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
  return !hasApplyingAspect;
}

/** Convert the calendar's position-map shape into the voc-moon chart array. */
function toChart(
  positions: Record<string, { longitude: number } | undefined>,
): VocChartBody[] {
  return Object.entries(positions)
    .filter(([, v]) => v && typeof v.longitude === 'number')
    .map(([body, v]) => ({
      body,
      eclipticLongitude: (v as { longitude: number }).longitude,
      sign: SIGNS[Math.floor((((v!.longitude % 360) + 360) % 360) / 30)],
    }));
}

/**
 * Deterministic pseudo-random chart generator (mulberry32). Produces a wide
 * spread of Moon/planet longitudes including sign-boundary and wrap-around
 * cases, with a fixed seed so the battery is reproducible.
 */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALL_BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
];

describe('VITAL #14 getVoidOfCourseMoon - algorithm parity with event-calendar 8c', () => {
  it('agrees with the event-calendar reference oracle across 500 random charts', () => {
    const rng = makeRng(0xc0ffee);
    let voidCount = 0;
    let notVoidCount = 0;

    for (let i = 0; i < 500; i++) {
      const positions: Record<string, { longitude: number }> = {};
      for (const body of ALL_BODIES) {
        positions[body] = { longitude: rng() * 360 };
      }
      const expected = eventCalendarIsVoid(positions);
      const got = getVoidOfCourseMoon(toChart(positions));
      expect(got).not.toBeNull();
      expect(got!.isVoid).toBe(expected);
      expected ? voidCount++ : notVoidCount++;
    }

    // Sanity: the battery exercises BOTH branches (not a degenerate all-true).
    expect(voidCount).toBeGreaterThan(0);
    expect(notVoidCount).toBeGreaterThan(0);
  });

  it('agrees at every 1-degree Moon position with the rest of the chart fixed', () => {
    // Fix the classical planets, sweep the Moon across the whole zodiac. This
    // stresses the sign-boundary and the applying-aspect window edges.
    const fixed: Record<string, { longitude: number }> = {
      Sun: { longitude: 100 },
      Mercury: { longitude: 115 },
      Venus: { longitude: 80 },
      Mars: { longitude: 200 },
      Jupiter: { longitude: 12 },
      Saturn: { longitude: 330 },
    };

    for (let deg = 0; deg < 360; deg++) {
      const positions = { ...fixed, Moon: { longitude: deg } };
      const expected = eventCalendarIsVoid(positions);
      const got = getVoidOfCourseMoon(toChart(positions));
      expect(got!.isVoid).toBe(expected);
    }
  });

  it('agrees on a Moon sitting exactly on a sign boundary (0 / 30 / 360 wrap)', () => {
    const planets: Record<string, { longitude: number }> = {
      Sun: { longitude: 5 },
      Mercury: { longitude: 350 },
      Venus: { longitude: 45 },
      Mars: { longitude: 175 },
      Jupiter: { longitude: 95 },
      Saturn: { longitude: 250 },
    };
    for (const moonLon of [0, 29.9, 30, 180, 359.9, 360]) {
      const positions = { ...planets, Moon: { longitude: moonLon } };
      const got = getVoidOfCourseMoon(toChart(positions));
      expect(got!.isVoid).toBe(eventCalendarIsVoid(positions));
    }
  });
});

describe('VITAL #14 getVoidOfCourseMoon - contract (null / sign / hours)', () => {
  it('returns null for a missing, null, or empty chart', () => {
    expect(getVoidOfCourseMoon(null)).toBeNull();
    expect(getVoidOfCourseMoon(undefined)).toBeNull();
    expect(getVoidOfCourseMoon([])).toBeNull();
  });

  it('returns null when the chart has no Moon', () => {
    const chart: VocChartBody[] = [
      { body: 'Sun', eclipticLongitude: 10, sign: 'Aries' },
      { body: 'Mars', eclipticLongitude: 100, sign: 'Cancer' },
    ];
    expect(getVoidOfCourseMoon(chart)).toBeNull();
  });

  it('returns null when the Moon longitude is not a number', () => {
    // Cast through a partial because the malformed input is the point of the test.
    const chart = [{ body: 'Moon', sign: 'Leo' } as unknown as VocChartBody];
    expect(getVoidOfCourseMoon(chart)).toBeNull();
  });

  it('passes the Moon sign through, empty string when absent', () => {
    const withSign = getVoidOfCourseMoon([
      { body: 'Moon', eclipticLongitude: 125, sign: 'Leo' },
    ]);
    expect(withSign!.moonSign).toBe('Leo');

    const withoutSign = getVoidOfCourseMoon([
      { body: 'Moon', eclipticLongitude: 125 },
    ]);
    expect(withoutSign!.moonSign).toBe('');
  });

  it('derives hoursRemaining from the gap to the next sign at 0.549 deg/hr', () => {
    // Moon at 120.0 -> next boundary 150 -> 30 deg / 0.549 ~= 54.6 -> round 55.
    const r = getVoidOfCourseMoon([
      { body: 'Moon', eclipticLongitude: 120, sign: 'Leo' },
    ]);
    expect(r!.hoursRemaining).toBe(Math.round(30 / 0.549));

    // Just before a boundary -> a small positive number of hours, never negative.
    const near = getVoidOfCourseMoon([
      { body: 'Moon', eclipticLongitude: 149.5, sign: 'Leo' },
    ]);
    expect(near!.hoursRemaining).toBe(Math.round(0.5 / 0.549));
    expect(near!.hoursRemaining).toBeGreaterThanOrEqual(0);
  });

  it('clamps hoursRemaining to >= 0 even when longitude wraps past 360', () => {
    // 365 normalises to 5 deg (Aries), boundary 30 -> 25 deg remaining.
    const r = getVoidOfCourseMoon([
      { body: 'Moon', eclipticLongitude: 365, sign: 'Aries' },
    ]);
    expect(r!.hoursRemaining).toBeGreaterThanOrEqual(0);
    expect(r!.hoursRemaining).toBe(Math.round(25 / 0.549));
  });
});
