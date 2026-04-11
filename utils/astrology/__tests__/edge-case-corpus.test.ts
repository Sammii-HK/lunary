import { Observer } from 'astronomy-engine';

import {
  generateBirthChart,
  generateBirthChartWithHouses,
} from '../birthChart';

const ANGLE_CLOSE = 0.05;

function expectAngle(
  actual: number,
  expected: number,
  tolerance = ANGLE_CLOSE,
) {
  const delta = Math.abs(((actual - expected + 180) % 360) - 180);
  expect(delta).toBeLessThanOrEqual(tolerance);
}

function getBody(
  chart: Awaited<ReturnType<typeof generateBirthChart>>,
  body: string,
) {
  const entry = chart.find((planet) => planet.body === body);
  expect(entry).toBeDefined();
  return entry!;
}

describe('Edge-case corpus validation', () => {
  it('keeps a Sun cusp chart on the correct side of the sign boundary', async () => {
    const chart = await generateBirthChart(
      '1994-01-20',
      '01:00',
      undefined,
      'Europe/London',
      new Observer(51.5074, -0.1278, 0),
    );

    const sun = getBody(chart, 'Sun');
    const moon = getBody(chart, 'Moon');
    const mercury = getBody(chart, 'Mercury');
    const mars = getBody(chart, 'Mars');
    const jupiter = getBody(chart, 'Jupiter');
    const ascendant = getBody(chart, 'Ascendant');

    expect(sun.sign).toBe('Capricorn');
    expectAngle(sun.eclipticLongitude, 299.74);
    expect(moon.sign).toBe('Taurus');
    expectAngle(moon.eclipticLongitude, 31.79);
    expect(mercury.sign).toBe('Aquarius');
    expect(mars.sign).toBe('Capricorn');
    expect(jupiter.sign).toBe('Scorpio');
    expect(ascendant.sign).toBe('Scorpio');
    expectAngle(ascendant.eclipticLongitude, 210.95);
  });

  it('keeps a UTC/local date boundary chart on the intended local day', async () => {
    const chart = await generateBirthChart(
      '1995-12-25',
      '03:30',
      undefined,
      'Asia/Tokyo',
      new Observer(35.6762, 139.6503, 0),
    );

    const sun = getBody(chart, 'Sun');
    const ascendant = getBody(chart, 'Ascendant');

    expect(sun.sign).toBe('Capricorn');
    expect(sun.eclipticLongitude).toBeGreaterThan(270);
    expect(sun.eclipticLongitude).toBeLessThan(275);
    expect(ascendant.eclipticLongitude).toBeGreaterThanOrEqual(0);
    expect(ascendant.eclipticLongitude).toBeLessThan(360);
  });

  it('keeps the vernal-equinox chart pinned near 0 Aries', async () => {
    const chart = await generateBirthChart(
      '1990-03-21',
      '23:15',
      undefined,
      'Australia/Sydney',
      new Observer(-33.8688, 151.2093, 0),
    );

    const sun = getBody(chart, 'Sun');
    const ascendant = getBody(chart, 'Ascendant');

    expect(sun.sign).toBe('Aries');
    expect(sun.eclipticLongitude).toBeLessThan(2);
    expect(ascendant.eclipticLongitude).toBeGreaterThanOrEqual(0);
    expect(ascendant.eclipticLongitude).toBeLessThan(360);
  });

  it('keeps the half-hour timezone chart stable', async () => {
    const chart = await generateBirthChart(
      '1985-08-15',
      '06:00',
      undefined,
      'Asia/Kolkata',
      new Observer(19.076, 72.8777, 0),
    );

    const sun = getBody(chart, 'Sun');
    const ascendant = getBody(chart, 'Ascendant');

    expect(sun.sign).toBe('Leo');
    expect(sun.eclipticLongitude).toBeGreaterThan(140);
    expect(sun.eclipticLongitude).toBeLessThan(144);
    expect(ascendant.eclipticLongitude).toBeGreaterThanOrEqual(0);
    expect(ascendant.eclipticLongitude).toBeLessThan(360);
  });

  it('keeps the high-latitude chart numerically stable', async () => {
    const chart = await generateBirthChart(
      '2000-01-01',
      '00:01',
      undefined,
      'America/Anchorage',
      new Observer(61.2181, -149.9003, 0),
    );

    const sun = getBody(chart, 'Sun');
    const ascendant = getBody(chart, 'Ascendant');

    expect(sun.sign).toBe('Capricorn');
    expect(sun.eclipticLongitude).toBeGreaterThan(278);
    expect(sun.eclipticLongitude).toBeLessThan(282);
    expect(ascendant.eclipticLongitude).toBeGreaterThanOrEqual(0);
    expect(ascendant.eclipticLongitude).toBeLessThan(360);
  });

  it('keeps the LMT-era chart aligned to the historical source data', async () => {
    const chart = await generateBirthChart(
      '1907-07-06',
      '15:07',
      undefined,
      'UTC',
      new Observer(19.3437, -99.162, 0),
    );

    const sun = getBody(chart, 'Sun');
    const moon = getBody(chart, 'Moon');
    const ascendant = getBody(chart, 'Ascendant');

    expect(sun.sign).toBe('Cancer');
    expectAngle(sun.eclipticLongitude, 103.37577336117843);
    expect(moon.sign).toBe('Taurus');
    expectAngle(moon.eclipticLongitude, 59.71544937252073);
    expect(ascendant.sign).toBe('Leo');
    expectAngle(ascendant.eclipticLongitude, 143.60101566323885);
  });

  it('keeps a Placidus house chart stable for an extreme latitude case', async () => {
    const chart = await generateBirthChartWithHouses(
      '2000-01-01',
      '00:01',
      undefined,
      'America/Anchorage',
      new Observer(61.2181, -149.9003, 0),
      'placidus',
    );

    expect(chart.houses).toHaveLength(12);
    const ascendant = chart.planets.find(
      (planet) => planet.body === 'Ascendant',
    );
    const midheaven = chart.planets.find(
      (planet) => planet.body === 'Midheaven',
    );
    expect(ascendant?.house).toBe(1);
    expect(midheaven?.house).toBe(10);
  });
});
