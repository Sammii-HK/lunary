import { describe, it, expect } from '@jest/globals';
import {
  getJulianDay,
  normalizeDegrees,
  getEarthHeliocentricEcliptic,
} from '../../../utils/astrology/birthChart';
import {
  getZodiacSign,
  formatDegree,
} from '../../../utils/astrology/astrology';

/**
 * Core Astronomical Calculation Tests
 *
 * Tests verify the mathematical accuracy of core astronomical functions
 * used in birth chart generation.
 */

describe('Julian Day Calculations', () => {
  it('calculates correct Julian Day for J2000.0 epoch', () => {
    // J2000.0 = January 1, 2000, 12:00 TT = JD 2451545.0
    const date = new Date('2000-01-01T12:00:00Z');
    const jd = getJulianDay(date);

    // Should be very close to 2451545.0 (within 1 day for timezone differences)
    expect(jd).toBeGreaterThan(2451544);
    expect(jd).toBeLessThan(2451546);
  });

  it('calculates correct Julian Day for Unix epoch', () => {
    // Unix epoch: January 1, 1970, 00:00:00 UTC = JD 2440587.5
    const date = new Date('1970-01-01T00:00:00Z');
    const jd = getJulianDay(date);

    expect(jd).toBeGreaterThan(2440587);
    expect(jd).toBeLessThan(2440588);
  });

  it('increments JD correctly for sequential days', () => {
    const date1 = new Date('2000-01-01T12:00:00Z');
    const date2 = new Date('2000-01-02T12:00:00Z');

    const jd1 = getJulianDay(date1);
    const jd2 = getJulianDay(date2);

    // Should differ by exactly 1 day
    expect(jd2 - jd1).toBeCloseTo(1, 2);
  });

  it('handles fractional days correctly', () => {
    const noon = new Date('2000-01-01T12:00:00Z');
    const midnight = new Date('2000-01-01T00:00:00Z');

    const jdNoon = getJulianDay(noon);
    const jdMidnight = getJulianDay(midnight);

    // Should differ by 0.5 days (12 hours)
    expect(Math.abs(jdNoon - jdMidnight)).toBeCloseTo(0.5, 1);
  });
});

describe('Degree Normalization', () => {
  it('keeps values in range 0-360', () => {
    expect(normalizeDegrees(0)).toBe(0);
    expect(normalizeDegrees(180)).toBe(180);
    expect(normalizeDegrees(359)).toBe(359);
  });

  it('wraps values over 360', () => {
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(361)).toBe(1);
    expect(normalizeDegrees(720)).toBe(0);
    expect(normalizeDegrees(725)).toBe(5);
  });

  it('wraps negative values correctly', () => {
    expect(normalizeDegrees(-1)).toBe(359);
    expect(normalizeDegrees(-180)).toBe(180);
    expect(normalizeDegrees(-360)).toBe(0);
    expect(normalizeDegrees(-361)).toBe(359);
  });

  it('handles large positive values', () => {
    expect(normalizeDegrees(1080)).toBe(0); // 3 full rotations
    expect(normalizeDegrees(1085)).toBe(5);
  });

  it('handles large negative values', () => {
    expect(normalizeDegrees(-1080)).toBe(0); // -3 full rotations
    expect(normalizeDegrees(-1085)).toBe(355);
  });
});

describe('Earth Heliocentric Position', () => {
  it('returns valid rectangular coordinates for any date', () => {
    const date = new Date('2000-01-01T12:00:00Z');
    const coords = getEarthHeliocentricEcliptic(date);

    expect(coords).toHaveProperty('x');
    expect(coords).toHaveProperty('y');
    expect(coords).toHaveProperty('z');

    // Earth's distance from Sun is approximately 1 AU
    const distance = Math.sqrt(coords.x ** 2 + coords.y ** 2 + coords.z ** 2);
    expect(distance).toBeGreaterThan(0.98);
    expect(distance).toBeLessThan(1.02);
  });

  it('shows Earth moving over time', () => {
    const date1 = new Date('2000-01-01T12:00:00Z');
    const date2 = new Date('2000-02-01T12:00:00Z');

    const coords1 = getEarthHeliocentricEcliptic(date1);
    const coords2 = getEarthHeliocentricEcliptic(date2);

    // Earth should move significantly in 30 days
    const posDiff = Math.sqrt(
      (coords2.x - coords1.x) ** 2 +
        (coords2.y - coords1.y) ** 2 +
        (coords2.z - coords1.z) ** 2,
    );

    expect(posDiff).toBeGreaterThan(0.1); // Significant movement
    expect(posDiff).toBeLessThan(2); // But not too far
  });

  it('maintains approximately constant distance from Sun', () => {
    const dates = [
      new Date('2000-01-01T12:00:00Z'),
      new Date('2000-04-01T12:00:00Z'),
      new Date('2000-07-01T12:00:00Z'),
      new Date('2000-10-01T12:00:00Z'),
    ];

    const distances = dates.map((date) => {
      const coords = getEarthHeliocentricEcliptic(date);
      return Math.sqrt(coords.x ** 2 + coords.y ** 2 + coords.z ** 2);
    });

    // All distances should be within ±0.02 AU (Earth's orbital eccentricity)
    distances.forEach((dist) => {
      expect(dist).toBeGreaterThan(0.98);
      expect(dist).toBeLessThan(1.02);
    });
  });
});

describe('Zodiac Sign Assignment', () => {
  const testCases = [
    { longitude: 0, expected: 'Aries' },
    { longitude: 15, expected: 'Aries' },
    { longitude: 30, expected: 'Taurus' },
    { longitude: 60, expected: 'Gemini' },
    { longitude: 90, expected: 'Cancer' },
    { longitude: 120, expected: 'Leo' },
    { longitude: 150, expected: 'Virgo' },
    { longitude: 180, expected: 'Libra' },
    { longitude: 210, expected: 'Scorpio' },
    { longitude: 240, expected: 'Sagittarius' },
    { longitude: 270, expected: 'Capricorn' },
    { longitude: 300, expected: 'Aquarius' },
    { longitude: 330, expected: 'Pisces' },
  ];

  testCases.forEach(({ longitude, expected }) => {
    it(`assigns ${expected} for ${longitude}°`, () => {
      expect(getZodiacSign(longitude)).toBe(expected);
    });
  });

  it('handles cusp positions correctly', () => {
    expect(getZodiacSign(29.9)).toBe('Aries');
    expect(getZodiacSign(30.1)).toBe('Taurus');
    expect(getZodiacSign(359.9)).toBe('Pisces');
  });
});

describe('Degree Formatting', () => {
  it('converts ecliptic longitude to sign degrees', () => {
    const testCases = [
      { ecliptic: 0, degree: 0, minute: 0 },
      { ecliptic: 15.5, degree: 15, minute: 30 },
      { ecliptic: 30, degree: 0, minute: 0 },
      { ecliptic: 45, degree: 15, minute: 0 },
      { ecliptic: 90, degree: 0, minute: 0 },
      { ecliptic: 180, degree: 0, minute: 0 },
      { ecliptic: 270, degree: 0, minute: 0 },
    ];

    testCases.forEach(({ ecliptic, degree, minute }) => {
      const result = formatDegree(ecliptic);
      expect(result.degree).toBe(degree);
      expect(result.minute).toBe(minute);
    });
  });

  it('keeps degrees in 0-29 range', () => {
    for (let i = 0; i < 360; i += 5) {
      const result = formatDegree(i);
      expect(result.degree).toBeGreaterThanOrEqual(0);
      expect(result.degree).toBeLessThan(30);
    }
  });

  it('keeps minutes in 0-59 range', () => {
    for (let i = 0; i < 360; i += 0.5) {
      const result = formatDegree(i);
      expect(result.minute).toBeGreaterThanOrEqual(0);
      expect(result.minute).toBeLessThan(60);
    }
  });

  it('handles minute precision correctly', () => {
    // 15.25° = 15°15'
    const result = formatDegree(15.25);
    expect(result.degree).toBe(15);
    expect(result.minute).toBe(15);
  });
});

describe('Integration Tests', () => {
  it('converts full zodiac correctly', () => {
    for (let sign = 0; sign < 12; sign++) {
      const longitude = sign * 30;
      const zodiacSign = getZodiacSign(longitude);
      const { degree, minute } = formatDegree(longitude);

      expect(zodiacSign).toBeDefined();
      expect(degree).toBe(0);
      expect(minute).toBe(0);
    }
  });

  it('Julian Day increases monotonically', () => {
    const dates = [
      new Date('2000-01-01T00:00:00Z'),
      new Date('2000-01-02T00:00:00Z'),
      new Date('2000-01-03T00:00:00Z'),
      new Date('2000-01-04T00:00:00Z'),
    ];

    const jds = dates.map(getJulianDay);

    for (let i = 1; i < jds.length; i++) {
      expect(jds[i]).toBeGreaterThan(jds[i - 1]);
    }
  });
});
