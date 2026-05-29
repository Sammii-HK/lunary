import { Observer } from 'astronomy-engine';

import {
  generateBirthChart,
  generateBirthChartWithHouses,
  type BirthChartData,
  type HouseSystem,
} from '../birthChart';
import { ZODIAC_SIGNS, getZodiacSign } from '../astrology';

/**
 * Structural invariants for the core natal-chart engine.
 *
 * These tests deliberately avoid asserting absolute ephemeris values
 * (the reference-matrix / reference-validation suites already pin those for
 * specific dates). Instead they assert relationships, bounds and determinism
 * that MUST hold for ANY birth input — the kind of corruption that would
 * silently poison every reading if it regressed.
 */

// Geographically spread observers, including polar / extreme latitudes that
// stress the Ascendant / house maths. `polar: true` marks latitudes inside the
// region where quadrant house systems (Placidus/Koch/Porphyry) become
// mathematically degenerate — see the polar-degeneracy test below.
const OBSERVERS: Array<{ name: string; observer: Observer; polar?: boolean }> =
  [
    { name: 'New York', observer: new Observer(40.7128, -74.006, 10) },
    { name: 'London', observer: new Observer(51.5074, -0.1278, 5) },
    { name: 'Sydney', observer: new Observer(-33.8688, 151.2093, 5) },
    {
      name: 'Reykjavik (high north)',
      observer: new Observer(64.1265, -21.8174, 0),
    },
    { name: 'equator/prime-meridian', observer: new Observer(0, 0, 0) },
    {
      name: 'near North Pole',
      observer: new Observer(78.0, 15.0, 0),
      polar: true,
    },
    {
      name: 'near South Pole',
      observer: new Observer(-77.85, 166.6, 0),
      polar: true,
    },
  ];

// Quadrant-based systems lose their clean tiling of the ecliptic inside the
// polar circle (the well-known polar house problem). The "covers the circle
// exactly once" invariant only holds for them outside that region.
const QUADRANT_SYSTEMS: HouseSystem[] = ['placidus', 'koch', 'porphyry'];

// Date matrix spanning leap day, year boundaries, far past and far future.
const DATES: Array<{ name: string; date: string; time: string }> = [
  { name: 'leap day', date: '2000-02-29', time: '12:00' },
  { name: "new year's eve", date: '1999-12-31', time: '23:59' },
  { name: "new year's day", date: '2000-01-01', time: '00:00' },
  { name: 'far past', date: '1900-01-15', time: '06:30' },
  { name: 'far future', date: '2099-11-20', time: '18:45' },
  { name: 'vernal equinox', date: '2024-03-20', time: '03:06' },
  { name: 'mid-year', date: '1985-07-04', time: '14:20' },
];

const HOUSE_SYSTEMS: HouseSystem[] = [
  'whole-sign',
  'placidus',
  'koch',
  'porphyry',
  'alcabitius',
];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Asserts every numeric field on a body is a real, in-range number. */
function expectBodyWellFormed(body: BirthChartData) {
  expect(isFiniteNumber(body.eclipticLongitude)).toBe(true);
  expect(body.eclipticLongitude).toBeGreaterThanOrEqual(0);
  expect(body.eclipticLongitude).toBeLessThan(360);

  expect(isFiniteNumber(body.degree)).toBe(true);
  expect(body.degree).toBeGreaterThanOrEqual(0);
  expect(body.degree).toBeLessThan(30);

  expect(isFiniteNumber(body.minute)).toBe(true);
  expect(body.minute).toBeGreaterThanOrEqual(0);
  expect(body.minute).toBeLessThan(60);

  expect(typeof body.retrograde).toBe('boolean');

  expect(typeof body.sign).toBe('string');
  expect(ZODIAC_SIGNS).toContain(body.sign);
}

describe('Birth chart structural invariants', () => {
  const matrix = DATES.flatMap((d) =>
    OBSERVERS.map((o) => ({
      label: `${d.name} @ ${o.name}`,
      date: d.date,
      time: d.time,
      observer: o.observer,
    })),
  );

  // Why: a single NaN/undefined/out-of-range longitude, or a sign that does
  // not match its 30deg bucket, would corrupt the displayed chart and every
  // downstream interpretation. This must hold for every body, every date,
  // every location.
  it.each(matrix)(
    'produces well-formed planets with consistent sign buckets — $label',
    async ({ date, time, observer }) => {
      const planets = await generateBirthChart(
        date,
        time,
        undefined,
        'UTC',
        observer,
      );

      expect(planets.length).toBeGreaterThan(0);

      for (const body of planets) {
        expectBodyWellFormed(body);

        // Sign must match the 30deg bucket of its own longitude.
        expect(body.sign).toBe(getZodiacSign(body.eclipticLongitude));
        expect(ZODIAC_SIGNS.indexOf(body.sign)).toBe(
          Math.floor(body.eclipticLongitude / 30),
        );
      }

      // The ten classical bodies plus the Ascendant must always be present —
      // they are the backbone every reading relies on.
      const bodyNames = planets.map((p) => p.body);
      for (const required of [
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
      ]) {
        expect(bodyNames).toContain(required);
      }
    },
  );

  // Why: the engine is the source of truth for a saved chart. If the same
  // birth input produced different output on re-render, cached vs live charts
  // would silently disagree. Determinism is non-negotiable.
  it('is deterministic — identical input yields identical output', async () => {
    const observer = new Observer(40.7128, -74.006, 10);
    const first = await generateBirthChartWithHouses(
      '1990-06-15',
      '08:45',
      undefined,
      'UTC',
      observer,
      'placidus',
    );
    const second = await generateBirthChartWithHouses(
      '1990-06-15',
      '08:45',
      undefined,
      'UTC',
      observer,
      'placidus',
    );

    expect(second).toEqual(first);
  });

  // Why: the Ascendant/Descendant and MC/IC are exact opposites by
  // definition. A 180deg drift here mislabels the angular houses.
  it('keeps angular pairs exactly opposite (Asc/Desc, MC/IC)', async () => {
    const chart = await generateBirthChart(
      '1985-04-15',
      '13:30',
      undefined,
      'UTC',
      new Observer(40.7128, -74.006, 10),
    );

    const get = (name: string) =>
      chart.find((b) => b.body === name)?.eclipticLongitude;

    const asc = get('Ascendant');
    const desc = get('Descendant');
    const mc = get('Midheaven');
    const ic = get('Imum Coeli');

    expect(asc).toBeDefined();
    expect(desc).toBeDefined();
    expect(mc).toBeDefined();
    expect(ic).toBeDefined();

    const opposition = (a: number, b: number) =>
      Math.abs(((((a - b) % 360) + 360) % 360) - 180);

    expect(opposition(asc!, desc!)).toBeLessThan(1e-6);
    expect(opposition(mc!, ic!)).toBeLessThan(1e-6);
  });
});

describe('House cusp structural invariants', () => {
  const matrix = DATES.flatMap((d) =>
    OBSERVERS.flatMap((o) =>
      HOUSE_SYSTEMS.map((system) => ({
        label: `${system} — ${d.name} @ ${o.name}`,
        date: d.date,
        time: d.time,
        observer: o.observer,
        system,
        // Quadrant systems are degenerate inside the polar circle, so the
        // strict full-circle coverage check is skipped only for that subset.
        expectFullCircle: !(o.polar && QUADRANT_SYSTEMS.includes(system)),
      })),
    ),
  );

  // Why: a chart wheel must have exactly 12 cusps, each a real in-range
  // longitude tagged with the correct sign. A NaN or out-of-range cusp breaks
  // both the wheel render and house assignment for every planet.
  it.each(matrix)(
    'returns 12 well-formed cusps that cover the full circle — $label',
    async ({ date, time, observer, system, expectFullCircle }) => {
      const { houses } = await generateBirthChartWithHouses(
        date,
        time,
        undefined,
        'UTC',
        observer,
        system,
      );

      expect(houses).toHaveLength(12);

      houses.forEach((cusp, index) => {
        // House numbers must be 1..12 in order.
        expect(cusp.house).toBe(index + 1);

        expect(isFiniteNumber(cusp.eclipticLongitude)).toBe(true);
        expect(cusp.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(cusp.eclipticLongitude).toBeLessThan(360);

        expect(ZODIAC_SIGNS).toContain(cusp.sign);
        // Cusp sign must match its own longitude bucket.
        expect(cusp.sign).toBe(getZodiacSign(cusp.eclipticLongitude));

        expect(cusp.degree).toBeGreaterThanOrEqual(0);
        expect(cusp.degree).toBeLessThan(30);
        expect(cusp.minute).toBeGreaterThanOrEqual(0);
        expect(cusp.minute).toBeLessThan(60);
      });

      // Cover the full circle: stepping cusp-to-cusp (wrapping at 360) must
      // sum to a single full revolution. This catches collapsed/duplicated
      // cusps that would leave gaps or overlaps in the wheel. Quadrant systems
      // inside the polar circle are exempt (see polar-degeneracy test).
      if (expectFullCircle) {
        let totalSpan = 0;
        for (let i = 0; i < 12; i += 1) {
          const start = houses[i].eclipticLongitude;
          const end = houses[(i + 1) % 12].eclipticLongitude;
          totalSpan += (((end - start) % 360) + 360) % 360;
        }
        expect(totalSpan).toBeCloseTo(360, 4);
      }
    },
  );

  // Why: even where quadrant systems are degenerate (inside the polar circle),
  // the engine must still degrade gracefully — never throw, always emit 12
  // in-range cusps, and keep the angular cusps exactly opposite (Asc opposite
  // 7th, MC opposite 4th). This documents the known polar behaviour so a
  // future change that turns it into NaN/out-of-range output is caught.
  it.each(QUADRANT_SYSTEMS)(
    'degrades gracefully at polar latitudes without throwing (%s)',
    async (system) => {
      const { houses } = await generateBirthChartWithHouses(
        '2024-03-20',
        '03:06',
        undefined,
        'UTC',
        new Observer(78.0, 15.0, 0),
        system,
      );

      expect(houses).toHaveLength(12);
      for (const cusp of houses) {
        expect(Number.isFinite(cusp.eclipticLongitude)).toBe(true);
        expect(cusp.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(cusp.eclipticLongitude).toBeLessThan(360);
      }

      const opposition = (a: number, b: number) =>
        Math.abs(((((a - b) % 360) + 360) % 360) - 180);
      // 1st opposite 7th, 10th opposite 4th — the angle axes hold even when
      // intermediate cusps collapse.
      expect(
        opposition(houses[0].eclipticLongitude, houses[6].eclipticLongitude),
      ).toBeLessThan(1e-4);
      expect(
        opposition(houses[9].eclipticLongitude, houses[3].eclipticLongitude),
      ).toBeLessThan(1e-4);
    },
  );

  // Why: whole-sign cusps are exactly the 12 sign boundaries starting from the
  // Ascendant's sign. Each must sit on an exact 30deg multiple. This is a hard
  // mathematical guarantee independent of ephemeris precision.
  it('places every whole-sign cusp on an exact 30-degree boundary', async () => {
    const { houses } = await generateBirthChartWithHouses(
      '1994-01-20',
      '01:00',
      undefined,
      'UTC',
      new Observer(51.5074, -0.1278, 5),
      'whole-sign',
    );

    houses.forEach((cusp) => {
      expect(cusp.eclipticLongitude % 30).toBeCloseTo(0, 9);
      expect(cusp.degree).toBe(0);
      expect(cusp.minute).toBe(0);
    });
  });

  // Why: a planet is always assigned to exactly one of the 12 houses. An
  // out-of-range or missing house number would break house-based readings.
  it.each(HOUSE_SYSTEMS)(
    'assigns every body to a valid house number 1..12 (%s)',
    async (system) => {
      const { planets } = await generateBirthChartWithHouses(
        '1985-04-15',
        '13:30',
        undefined,
        'UTC',
        new Observer(40.7128, -74.006, 10),
        system,
      );

      for (const body of planets) {
        expect(typeof body.house).toBe('number');
        expect(Number.isInteger(body.house)).toBe(true);
        expect(body.house).toBeGreaterThanOrEqual(1);
        expect(body.house).toBeLessThanOrEqual(12);
      }
    },
  );
});

describe('Birth chart date robustness', () => {
  // Why: extreme and boundary dates must never throw or emit out-of-range
  // output. A crash here would take down chart generation for any user born on
  // an awkward date / at a polar latitude.
  const edgeCases = [
    {
      name: 'leap day at polar north',
      date: '2000-02-29',
      time: '00:00',
      observer: new Observer(82.5, 30, 0),
    },
    {
      name: 'year boundary far past',
      date: '1850-12-31',
      time: '23:59',
      observer: new Observer(0, 0, 0),
    },
    {
      name: 'far future polar south',
      date: '2200-06-21',
      time: '12:00',
      observer: new Observer(-80, -120, 0),
    },
    {
      name: 'midnight at equator',
      date: '2010-10-10',
      time: '00:00',
      observer: new Observer(0, 0, 0),
    },
  ];

  it.each(edgeCases)(
    'does not throw and stays in range for $name',
    async ({ date, time, observer }) => {
      const chart = await generateBirthChartWithHouses(
        date,
        time,
        undefined,
        'UTC',
        observer,
        'placidus',
      );

      expect(chart.planets.length).toBeGreaterThan(0);
      expect(chart.houses).toHaveLength(12);

      for (const body of chart.planets) {
        expect(Number.isFinite(body.eclipticLongitude)).toBe(true);
        expect(body.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(body.eclipticLongitude).toBeLessThan(360);
      }
      for (const cusp of chart.houses) {
        expect(Number.isFinite(cusp.eclipticLongitude)).toBe(true);
        expect(cusp.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(cusp.eclipticLongitude).toBeLessThan(360);
      }
    },
  );

  // Why: invalid birth input must fail loudly with a clear error rather than
  // silently producing a garbage chart.
  it('throws on malformed birth date / time input', async () => {
    await expect(
      generateBirthChart('not-a-date', '12:00', undefined, 'UTC'),
    ).rejects.toThrow();
    await expect(
      generateBirthChart('1990-06-15', '99:99', undefined, 'UTC'),
    ).rejects.toThrow();
  });
});
