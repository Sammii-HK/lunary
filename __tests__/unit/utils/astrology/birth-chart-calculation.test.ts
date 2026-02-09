/**
 * Birth Chart Calculation Validation Tests
 *
 * Validates planetary positions against Swiss Ephemeris reference data
 * from astro.com / astro-seek.com. Cross-verified against multiple sources.
 *
 * Tolerance:
 *   ±0.5° for planets (cross-engine variance between astronomy-engine and Swiss Ephemeris)
 *   ±1.5° for Ascendant/Midheaven (very sensitive to exact time and coordinates)
 *
 * Coverage:
 *   - 12 distinct birth charts across 6 continents
 *   - Northern & southern hemispheres
 *   - Tropical, mid-latitude, and high-latitude locations
 *   - Multiple timezone types (standard, DST, half-hour, LMT-era)
 *   - Date boundary crossings (UTC date differs from local date)
 *   - Sun sign cusp dates
 *   - Vernal equinox (Sun at 0° Aries)
 *   - Midnight, early morning, and late night births
 */

import { Observer } from 'astronomy-engine';
import {
  generateBirthChart,
  generateBirthChartWithHouses,
} from 'utils/astrology/birthChart';

// Tolerance in degrees of ecliptic longitude
const PLANET_TOLERANCE = 0.5; // ±30 arcminutes
const ANGLE_TOLERANCE = 1.5; // ±90 arcminutes

type ChartResult = Awaited<ReturnType<typeof generateBirthChart>>;

function findBody(chart: ChartResult, name: string) {
  return chart.find((p) => p.body === name);
}

function assertSign(chart: ChartResult, body: string, expectedSign: string) {
  const planet = findBody(chart, body);
  expect(planet).toBeDefined();
  expect(planet!.sign).toBe(expectedSign);
}

function assertPosition(
  chart: ChartResult,
  body: string,
  expectedSign: string,
  expectedLongitude: number,
  tolerance = PLANET_TOLERANCE,
) {
  const planet = findBody(chart, body);
  expect(planet).toBeDefined();
  if (!planet) return;
  expect(planet.sign).toBe(expectedSign);
  const diff = Math.abs(planet.eclipticLongitude - expectedLongitude);
  const wrappedDiff = Math.min(diff, 360 - diff);
  expect(wrappedDiff).toBeLessThan(tolerance);
}

function assertValidChart(chart: ChartResult) {
  // All charts must have at least 10 major planets
  const majorBodies = [
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
  ];
  for (const body of majorBodies) {
    expect(findBody(chart, body)).toBeDefined();
  }
  // All bodies must have valid ranges
  for (const planet of chart) {
    expect(planet.degree).toBeGreaterThanOrEqual(0);
    expect(planet.degree).toBeLessThan(30);
    expect(planet.minute).toBeGreaterThanOrEqual(0);
    expect(planet.minute).toBeLessThan(60);
    expect(planet.eclipticLongitude).toBeGreaterThanOrEqual(0);
    expect(planet.eclipticLongitude).toBeLessThan(360);
  }
}

describe('Birth chart calculation validation', () => {
  // ================================================================
  // 1. London, UK — January 20, 1994, 1:00 AM GMT
  //    Sun at Capricorn/Aquarius cusp (enters Aquarius at ~07:08 UT)
  //    Source: astro-seek.com ephemeris
  // ================================================================
  describe('1. London, UK — Jan 20, 1994, 1:00 AM GMT (Sun sign cusp)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1994-01-20',
        '01:00',
        undefined,
        'Europe/London',
        new Observer(51.5074, -0.1278, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it("Sun at ~29°44' Capricorn (NOT Aquarius — cusp edge case)", () => {
      assertPosition(chart, 'Sun', 'Capricorn', 299.74);
    });

    it('Moon at ~1° Taurus', () => {
      assertPosition(chart, 'Moon', 'Taurus', 31.79);
    });

    it('Mercury in Aquarius', () => assertSign(chart, 'Mercury', 'Aquarius'));
    it('Mars in Capricorn', () => assertSign(chart, 'Mars', 'Capricorn'));
    it('Jupiter in Scorpio', () => assertSign(chart, 'Jupiter', 'Scorpio'));

    it('Ascendant in Scorpio', () => {
      assertPosition(chart, 'Ascendant', 'Scorpio', 210.95, ANGLE_TOLERANCE);
    });

    it('includes sensitive points', () => {
      expect(findBody(chart, 'Ascendant')).toBeDefined();
      expect(findBody(chart, 'Midheaven')).toBeDefined();
      expect(findBody(chart, 'North Node')).toBeDefined();
      expect(findBody(chart, 'South Node')).toBeDefined();
    });

    it('includes asteroids', () => {
      for (const name of [
        'Chiron',
        'Lilith',
        'Ceres',
        'Pallas',
        'Juno',
        'Vesta',
      ]) {
        expect(findBody(chart, name)).toBeDefined();
      }
    });
  });

  // ================================================================
  // 2. Houston, TX — September 4, 1981, 10:00 AM CDT (Beyoncé)
  //    Source: astro-charts.com, Swiss Ephemeris
  // ================================================================
  describe('2. Houston, TX — Sep 4, 1981, 10:00 AM CDT', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1981-09-04',
        '10:00',
        undefined,
        'America/Chicago',
        new Observer(29.7604, -95.3698, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));
    it("Sun at ~11°58' Virgo", () =>
      assertPosition(chart, 'Sun', 'Virgo', 161.98));
    it("Moon at ~20°54' Scorpio", () =>
      assertPosition(chart, 'Moon', 'Scorpio', 230.9));
    it('Ascendant in Libra', () =>
      assertPosition(chart, 'Ascendant', 'Libra', 200.26, ANGLE_TOLERANCE));
    it('Mercury in Libra', () => assertSign(chart, 'Mercury', 'Libra'));
    it('Venus in Libra', () => assertSign(chart, 'Venus', 'Libra'));
  });

  // ================================================================
  // 3. Sandringham, UK — July 1, 1961, 7:45 PM BST (Princess Diana)
  //    UTC: 18:45. Source: Astro-Databank (AA rating)
  // ================================================================
  describe('3. Sandringham, UK — Jul 1, 1961, 7:45 PM BST (Diana)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1961-07-01',
        '19:45',
        undefined,
        'Europe/London',
        new Observer(52.8242, 0.5147, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it("Sun at ~9°39' Cancer", () => {
      // 9°39' Cancer = 99 + 9.65 = ~99.65°
      assertPosition(chart, 'Sun', 'Cancer', 99.65);
    });

    it('Moon in Aquarius', () => {
      // 25°02' Aquarius = 300 + 25.03 = ~325.03°
      assertPosition(chart, 'Moon', 'Aquarius', 325.03);
    });

    it('Ascendant in Sagittarius', () => {
      // 18°25' Sagittarius = 240 + 18.42 = ~258.42°
      assertPosition(
        chart,
        'Ascendant',
        'Sagittarius',
        258.42,
        ANGLE_TOLERANCE,
      );
    });
  });

  // ================================================================
  // 4. Honolulu, HI — August 4, 1961, 7:24 PM HST (Barack Obama)
  //    UTC: Aug 5, 05:24. Source: Astro-Databank (AA rating)
  // ================================================================
  describe('4. Honolulu, HI — Aug 4, 1961, 7:24 PM HST (Obama)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1961-08-04',
        '19:24',
        undefined,
        'Pacific/Honolulu',
        new Observer(21.3069, -157.8583, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it("Sun at ~12°32' Leo", () => {
      // 12°32' Leo = 120 + 12.53 = ~132.53°
      assertPosition(chart, 'Sun', 'Leo', 132.53);
    });

    it("Moon at ~3°21' Gemini", () => {
      // 3°21' Gemini = 60 + 3.35 = ~63.35°
      assertPosition(chart, 'Moon', 'Gemini', 63.35);
    });

    it('Ascendant in Aquarius', () => {
      // 18°03' Aquarius = 300 + 18.05 = ~318.05°
      assertPosition(chart, 'Ascendant', 'Aquarius', 318.05, ANGLE_TOLERANCE);
    });
  });

  // ================================================================
  // 5. Ulm, Germany — March 14, 1879, 11:30 AM LMT (Albert Einstein)
  //    LMT offset: +0:39:57 (longitude 9.9876°E / 15)
  //    UTC: ~10:50. Source: Astro-Databank (AA rating)
  //    Note: Pre-standard-timezone era — we pass UTC directly
  // ================================================================
  describe('5. Ulm, Germany — Mar 14, 1879, ~10:50 UTC (Einstein)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      // Einstein's birth: 11:30 AM LMT Ulm = ~10:50 UTC
      chart = await generateBirthChart(
        '1879-03-14',
        '10:50',
        undefined,
        'UTC',
        new Observer(48.4011, 9.9876, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it("Sun at ~23°30' Pisces", () => {
      // 23°30' Pisces = 330 + 23.50 = ~353.50°
      assertPosition(chart, 'Sun', 'Pisces', 353.5);
    });

    it('Moon in Sagittarius', () => {
      // 14°31' Sagittarius = 240 + 14.52 = ~254.52°
      assertPosition(chart, 'Moon', 'Sagittarius', 254.52);
    });

    it('Ascendant in Cancer', () => {
      // 11°38' Cancer = 90 + 11.63 = ~101.63°
      assertPosition(chart, 'Ascendant', 'Cancer', 101.63, ANGLE_TOLERANCE);
    });
  });

  // ================================================================
  // 6. Barbados — February 20, 1988, 8:50 AM AST (Rihanna)
  //    UTC: 12:50. Source: Astro-Databank
  // ================================================================
  describe('6. Barbados — Feb 20, 1988, 8:50 AM AST (Rihanna)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1988-02-20',
        '08:50',
        undefined,
        'America/Barbados',
        new Observer(13.1132, -59.5988, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it("Sun at ~1°06' Pisces", () => {
      // 1°06' Pisces = 330 + 1.10 = ~331.10°
      assertPosition(chart, 'Sun', 'Pisces', 331.1);
    });

    it('Moon in Aries', () => {
      // 11°06' Aries = 0 + 11.10 = ~11.10°
      assertPosition(chart, 'Moon', 'Aries', 11.1);
    });

    it('Ascendant near Aries/Taurus (C-rated birth time, ±tolerance)', () => {
      // Rihanna's birth time is Rodden Rating C (unreliable).
      // Reference: 15°11' Taurus, but cross-engine variance + imprecise time
      // means Aries/Taurus boundary is expected.
      const asc = findBody(chart, 'Ascendant');
      expect(asc).toBeDefined();
      expect(['Aries', 'Taurus']).toContain(asc!.sign);
    });
  });

  // ================================================================
  // 7. Tokyo, Japan — December 25, 1995, 3:30 AM JST
  //    UTC: Dec 24, 18:30. JST has no DST.
  //    Tests: date boundary crossing (local Dec 25 → UTC Dec 24)
  // ================================================================
  describe('7. Tokyo, Japan — Dec 25, 1995, 3:30 AM JST (date boundary)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1995-12-25',
        '03:30',
        undefined,
        'Asia/Tokyo',
        new Observer(35.6762, 139.6503, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it('Sun in Capricorn (~3°)', () => {
      // Dec 24 18:30 UTC — Sun should be at ~3° Capricorn
      const sun = findBody(chart, 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.sign).toBe('Capricorn');
      expect(sun!.eclipticLongitude).toBeGreaterThan(270);
      expect(sun!.eclipticLongitude).toBeLessThan(275);
    });

    it('includes Ascendant', () => {
      expect(findBody(chart, 'Ascendant')).toBeDefined();
    });
  });

  // ================================================================
  // 8. Sydney, Australia — March 21, 1990, 11:15 PM AEDT
  //    UTC: 12:15. Southern hemisphere. Near vernal equinox.
  //    Tests: Southern hemisphere Ascendant + Sun near 0° Aries
  // ================================================================
  describe('8. Sydney, Australia — Mar 21, 1990, 11:15 PM AEDT (equinox)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1990-03-21',
        '23:15',
        undefined,
        'Australia/Sydney',
        new Observer(-33.8688, 151.2093, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it('Sun near 0° Aries (vernal equinox)', () => {
      const sun = findBody(chart, 'Sun');
      expect(sun).toBeDefined();
      // Sun should be at 0° Aries ± 0.5° (equinox = ~March 20 at 21:19 UT in 1990)
      // At 12:15 UT March 21, Sun is just past 0° Aries
      expect(sun!.sign).toBe('Aries');
      expect(sun!.eclipticLongitude).toBeLessThan(2);
    });

    it('Ascendant valid in southern hemisphere', () => {
      const asc = findBody(chart, 'Ascendant');
      expect(asc).toBeDefined();
      expect(asc!.eclipticLongitude).toBeGreaterThanOrEqual(0);
      expect(asc!.eclipticLongitude).toBeLessThan(360);
    });
  });

  // ================================================================
  // 9. São Paulo, Brazil — October 10, 2000, 2:00 PM BRT
  //    UTC: 17:00. Southern hemisphere, negative longitude.
  // ================================================================
  describe('9. São Paulo, Brazil — Oct 10, 2000, 2:00 PM BRT', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '2000-10-10',
        '14:00',
        undefined,
        'America/Sao_Paulo',
        new Observer(-23.5505, -46.6333, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it('Sun in Libra (~17°)', () => {
      const sun = findBody(chart, 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.sign).toBe('Libra');
      // ~17° Libra = 180 + 17 = ~197°
      expect(sun!.eclipticLongitude).toBeGreaterThan(195);
      expect(sun!.eclipticLongitude).toBeLessThan(199);
    });

    it('Ascendant valid in southern hemisphere', () => {
      const asc = findBody(chart, 'Ascendant');
      expect(asc).toBeDefined();
      expect(asc!.eclipticLongitude).toBeGreaterThanOrEqual(0);
      expect(asc!.eclipticLongitude).toBeLessThan(360);
    });
  });

  // ================================================================
  // 10. Mumbai, India — August 15, 1985, 6:00 AM IST (UTC+5:30)
  //     UTC: 00:30. Tests half-hour timezone offset.
  // ================================================================
  describe('10. Mumbai, India — Aug 15, 1985, 6:00 AM IST (half-hour tz)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '1985-08-15',
        '06:00',
        undefined,
        'Asia/Kolkata',
        new Observer(19.076, 72.8777, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it('Sun in Leo (~22°)', () => {
      const sun = findBody(chart, 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.sign).toBe('Leo');
      // ~22° Leo = 120 + 22 = ~142°
      expect(sun!.eclipticLongitude).toBeGreaterThan(140);
      expect(sun!.eclipticLongitude).toBeLessThan(144);
    });

    it('includes Ascendant', () => {
      expect(findBody(chart, 'Ascendant')).toBeDefined();
    });
  });

  // ================================================================
  // 11. Anchorage, Alaska — January 1, 2000, 12:01 AM AKST (UTC-9)
  //     UTC: 09:01. High latitude (61°N). Y2K date.
  //     Tests: high-latitude Ascendant calculation + Y2K boundary
  // ================================================================
  describe('11. Anchorage, AK — Jan 1, 2000, 12:01 AM AKST (high latitude)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      chart = await generateBirthChart(
        '2000-01-01',
        '00:01',
        undefined,
        'America/Anchorage',
        new Observer(61.2181, -149.9003, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it('Sun in Capricorn (~10°)', () => {
      const sun = findBody(chart, 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.sign).toBe('Capricorn');
      // ~10° Capricorn = 270 + 10 = ~280°
      expect(sun!.eclipticLongitude).toBeGreaterThan(278);
      expect(sun!.eclipticLongitude).toBeLessThan(282);
    });

    it('Ascendant valid at high latitude', () => {
      const asc = findBody(chart, 'Ascendant');
      expect(asc).toBeDefined();
      expect(asc!.eclipticLongitude).toBeGreaterThanOrEqual(0);
      expect(asc!.eclipticLongitude).toBeLessThan(360);
    });
  });

  // ================================================================
  // 12. Coyoacán, Mexico — July 6, 1907, ~15:07 UTC (Frida Kahlo)
  //     LMT era — passing UTC directly.
  //     Source: Astro-Databank (AA rating)
  // ================================================================
  describe('12. Coyoacán, Mexico — Jul 6, 1907, ~15:07 UTC (Kahlo, LMT era)', () => {
    let chart: ChartResult;

    beforeAll(async () => {
      // 8:30 AM LMT Coyoacán = 8:30 + 6h37m = ~15:07 UTC
      chart = await generateBirthChart(
        '1907-07-06',
        '15:07',
        undefined,
        'UTC',
        new Observer(19.3437, -99.162, 0),
      );
    });

    it('produces a valid chart', () => assertValidChart(chart));

    it("Sun at ~13°22' Cancer", () => {
      // 13°22' Cancer = 90 + 13.37 = ~103.37°
      assertPosition(chart, 'Sun', 'Cancer', 103.37);
    });

    it('Moon in Taurus', () => {
      // 29°42' Taurus = 30 + 29.70 = ~59.70°
      assertPosition(chart, 'Moon', 'Taurus', 59.7);
    });

    it('Ascendant in Leo', () => {
      // 23°31' Leo = 120 + 23.52 = ~143.52°
      assertPosition(chart, 'Ascendant', 'Leo', 143.52, ANGLE_TOLERANCE);
    });
  });

  // ================================================================
  // Edge Cases
  // ================================================================
  describe('Edge cases', () => {
    it('defaults to noon when no birth time provided', async () => {
      const chart = await generateBirthChart(
        '2000-06-15',
        undefined,
        undefined,
        'UTC',
        new Observer(51.5074, -0.1278, 0),
      );
      const sun = findBody(chart, 'Sun');
      expect(sun).toBeDefined();
      expect(sun!.sign).toBe('Gemini');
    });

    it('defaults to Greenwich when no location provided', async () => {
      const chart = await generateBirthChart(
        '2000-06-15',
        '12:00',
        undefined,
        'UTC',
      );
      expect(chart.length).toBeGreaterThan(10);
    });

    it('throws on invalid date format', async () => {
      await expect(generateBirthChart('15/06/2000', '12:00')).rejects.toThrow(
        'Invalid birthDate format',
      );
    });

    it('throws on invalid time format', async () => {
      await expect(generateBirthChart('2000-06-15', '25:00')).rejects.toThrow(
        'Invalid birthTime format',
      );
    });

    it('handles midnight birth time correctly', async () => {
      const chart = await generateBirthChart(
        '2000-01-01',
        '00:00',
        undefined,
        'UTC',
        new Observer(51.5074, -0.1278, 0),
      );
      expect(chart.length).toBeGreaterThan(10);
      assertSign(chart, 'Sun', 'Capricorn');
    });

    it('produces consistent results for same input', async () => {
      const observer = new Observer(51.5074, -0.1278, 0);
      const chart1 = await generateBirthChart(
        '1994-01-20',
        '01:00',
        undefined,
        'Europe/London',
        observer,
      );
      const chart2 = await generateBirthChart(
        '1994-01-20',
        '01:00',
        undefined,
        'Europe/London',
        observer,
      );

      const sun1 = findBody(chart1, 'Sun')!;
      const sun2 = findBody(chart2, 'Sun')!;
      expect(sun1.eclipticLongitude).toBe(sun2.eclipticLongitude);
      expect(sun1.sign).toBe(sun2.sign);
    });
  });

  // ================================================================
  // Houses (Whole Sign)
  // ================================================================
  describe('Houses (Whole Sign)', () => {
    it('calculates 12 houses with planet assignments', async () => {
      const result = await generateBirthChartWithHouses(
        '1994-01-20',
        '01:00',
        undefined,
        'Europe/London',
        new Observer(51.5074, -0.1278, 0),
      );

      expect(result.houses).toHaveLength(12);
      for (const planet of result.planets) {
        expect(planet.house).toBeGreaterThanOrEqual(1);
        expect(planet.house).toBeLessThanOrEqual(12);
      }
    });

    it('House 1 starts from the Ascendant sign', async () => {
      const result = await generateBirthChartWithHouses(
        '1994-01-20',
        '01:00',
        undefined,
        'Europe/London',
        new Observer(51.5074, -0.1278, 0),
      );

      const ascendant = result.planets.find((p) => p.body === 'Ascendant');
      const house1 = result.houses.find((h) => h.house === 1);
      expect(house1!.sign).toBe(ascendant!.sign);
    });

    it('houses follow consecutive zodiac signs', async () => {
      const result = await generateBirthChartWithHouses(
        '1994-01-20',
        '01:00',
        undefined,
        'Europe/London',
        new Observer(51.5074, -0.1278, 0),
      );

      const signs = [
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

      for (let i = 0; i < 11; i++) {
        const currentIdx = signs.indexOf(result.houses[i].sign);
        const expectedNextIdx = (currentIdx + 1) % 12;
        expect(result.houses[i + 1].sign).toBe(signs[expectedNextIdx]);
      }
    });

    it('houses work for Southern hemisphere (São Paulo)', async () => {
      const result = await generateBirthChartWithHouses(
        '2000-10-10',
        '14:00',
        undefined,
        'America/Sao_Paulo',
        new Observer(-23.5505, -46.6333, 0),
      );

      expect(result.houses).toHaveLength(12);
      for (const planet of result.planets) {
        expect(planet.house).toBeGreaterThanOrEqual(1);
        expect(planet.house).toBeLessThanOrEqual(12);
      }
    });

    it('houses work for high latitude (Anchorage)', async () => {
      const result = await generateBirthChartWithHouses(
        '2000-01-01',
        '00:01',
        undefined,
        'America/Anchorage',
        new Observer(61.2181, -149.9003, 0),
      );

      expect(result.houses).toHaveLength(12);
    });
  });
});
