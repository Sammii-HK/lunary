/**
 * @jest-environment node
 *
 * VITAL OP #5 - Birth chart calculation (astronomy-engine, deterministic).
 *
 * The codebase already has extensive coverage of generateBirthChartWithHouses
 * (placements, houses, timezones, reference matrix). The PUBLIC async entry
 * point generateBirthChart(...) - the one the app actually calls and the one
 * that does input validation + observer/timezone resolution - is only ever
 * *mocked* in existing tests, never exercised directly. This file fills that
 * adjacent gap.
 *
 * All cases pass an explicit Observer (or rely on the documented default
 * Observer) so there is NO network geocoding and results are deterministic.
 *
 * Anchor input: 15 June 1990, 12:00 UTC. June 15 Sun is unambiguously Gemini.
 */
import { Observer } from 'astronomy-engine';
import { generateBirthChart } from '../../../utils/astrology/birthChart';

const LONDON = new Observer(51.4769, 0.0005, 0);

describe('VITAL #5 generateBirthChart - input validation', () => {
  it('throws on a non YYYY-MM-DD birth date', async () => {
    await expect(
      generateBirthChart('06/15/1990', '12:00', undefined, 'UTC', LONDON),
    ).rejects.toThrow(/Invalid birthDate/);
  });

  it('throws on a malformed birth time', async () => {
    await expect(
      generateBirthChart('1990-06-15', '12-00', undefined, 'UTC', LONDON),
    ).rejects.toThrow(/Invalid birthTime/);
  });

  it('throws on an out-of-range birth time (hour 25)', async () => {
    await expect(
      generateBirthChart('1990-06-15', '25:00', undefined, 'UTC', LONDON),
    ).rejects.toThrow(/Invalid birthTime/);
  });

  it('throws on an out-of-range minute (minute 60)', async () => {
    await expect(
      generateBirthChart('1990-06-15', '12:60', undefined, 'UTC', LONDON),
    ).rejects.toThrow(/Invalid birthTime/);
  });
});

describe('VITAL #5 generateBirthChart - deterministic placements (known input)', () => {
  let chart: Awaited<ReturnType<typeof generateBirthChart>>;

  beforeAll(async () => {
    chart = await generateBirthChart(
      '1990-06-15',
      '12:00',
      undefined,
      'UTC',
      LONDON,
    );
  });

  const find = (body: string) => chart.find((p) => p.body === body);

  it('places the Sun in Gemini', () => {
    const sun = find('Sun');
    expect(sun).toBeDefined();
    expect(sun!.sign).toBe('Gemini');
    // Ecliptic longitude ~84.1 deg (Gemini is 60-90 deg).
    expect(sun!.eclipticLongitude).toBeGreaterThanOrEqual(60);
    expect(sun!.eclipticLongitude).toBeLessThan(90);
  });

  it('places the Moon in Pisces and Mercury in Gemini', () => {
    expect(find('Moon')!.sign).toBe('Pisces');
    expect(find('Mercury')!.sign).toBe('Gemini');
  });

  it('places Saturn in Capricorn (slow outer planet, stable anchor)', () => {
    expect(find('Saturn')!.sign).toBe('Capricorn');
  });

  it('returns the ten classical bodies plus the Ascendant and Midheaven', () => {
    for (const body of [
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
      'Midheaven',
    ]) {
      expect(find(body)).toBeDefined();
    }
  });

  it('gives every body a valid normalised ecliptic longitude and degree-within-sign', () => {
    for (const p of chart) {
      expect(p.eclipticLongitude).toBeGreaterThanOrEqual(0);
      expect(p.eclipticLongitude).toBeLessThan(360);
      expect(p.degree).toBeGreaterThanOrEqual(0);
      expect(p.degree).toBeLessThan(30);
      expect(p.minute).toBeGreaterThanOrEqual(0);
      expect(p.minute).toBeLessThan(60);
    }
  });

  it('is reproducible: identical inputs yield identical Sun longitude', async () => {
    const again = await generateBirthChart(
      '1990-06-15',
      '12:00',
      undefined,
      'UTC',
      LONDON,
    );
    expect(again.find((p) => p.body === 'Sun')!.eclipticLongitude).toBe(
      find('Sun')!.eclipticLongitude,
    );
  });
});

describe('VITAL #5 generateBirthChart - default observer fallback (offline)', () => {
  it('produces a valid chart with no observer and no location (uses default)', async () => {
    // No network: the function falls back to a hardcoded default Observer
    // rather than geocoding. Sun sign is location-independent.
    const chart = await generateBirthChart('1990-06-15', '12:00');
    expect(chart.length).toBeGreaterThan(0);
    expect(chart.find((p) => p.body === 'Sun')!.sign).toBe('Gemini');
  });
});
