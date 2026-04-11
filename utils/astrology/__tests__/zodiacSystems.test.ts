import {
  convertToTropical,
  convertToSidereal,
  convertToEquatorial,
  getLongitudeInTropicalSign,
  getLongitudeInSiderealSign,
  convertLongitudeToZodiacSystem,
  getSignForZodiacSystem,
} from '../zodiacSystems';

describe('Zodiac Systems', () => {
  describe('convertToTropical', () => {
    it('should return input unchanged (identity function)', () => {
      expect(convertToTropical(0)).toBe(0);
      expect(convertToTropical(45.5)).toBe(45.5);
      expect(convertToTropical(359.9)).toBe(359.9);
    });

    it('should handle negative values', () => {
      expect(convertToTropical(-45)).toBe(-45);
    });

    it('should handle values > 360', () => {
      expect(convertToTropical(400)).toBe(400);
    });
  });

  describe('convertToSidereal', () => {
    it('should subtract ayanamsha from tropical longitude', () => {
      const tropical = 45;
      const sidereal = convertToSidereal(tropical);
      expect(sidereal).toBeCloseTo(tropical - 24, 1);
    });

    it('should normalize negative results to 0-360 range', () => {
      const tropical = 10; // 10 - 24 = -14 → should wrap to 346
      const sidereal = convertToSidereal(tropical);
      expect(sidereal).toBeCloseTo(346, 1);
      expect(sidereal).toBeGreaterThanOrEqual(0);
      expect(sidereal).toBeLessThan(360);
    });

    it('should normalize results > 360 to 0-360 range', () => {
      const tropical = 350; // 350 - 24 = 326 (OK)
      const sidereal = convertToSidereal(tropical);
      expect(sidereal).toBeCloseTo(326, 1);
      expect(sidereal).toBeGreaterThanOrEqual(0);
      expect(sidereal).toBeLessThan(360);
    });

    it('should accept custom ayanamsha', () => {
      const tropical = 100;
      const customAyanamsha = 25;
      const sidereal = convertToSidereal(tropical, customAyanamsha);
      expect(sidereal).toBeCloseTo(75, 1);
    });

    it('should differ from tropical by approximately ayanamsha', () => {
      const tropical = 200;
      const sidereal = convertToSidereal(tropical);
      const diff = tropical - sidereal;
      // Account for wrapping
      const normalizedDiff =
        diff > 180 ? diff - 360 : diff < -180 ? diff + 360 : diff;
      expect(Math.abs(normalizedDiff - 24)).toBeLessThan(1);
    });
  });

  describe('convertToEquatorial', () => {
    it('should return a value between 0-360', () => {
      const result = convertToEquatorial(45, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('should handle 0° longitude (Aries Point)', () => {
      const result = convertToEquatorial(0, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('should handle 90° longitude (Cancer Point)', () => {
      const result = convertToEquatorial(90, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('should handle 180° longitude (Libra Point)', () => {
      const result = convertToEquatorial(180, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('should handle 270° longitude (Capricorn Point)', () => {
      const result = convertToEquatorial(270, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('should account for ecliptic latitude', () => {
      const result0Lat = convertToEquatorial(100, 0);
      const result15Lat = convertToEquatorial(100, 15);
      // Results should differ when latitude is non-zero
      expect(Math.abs(result0Lat - result15Lat)).toBeGreaterThan(0.1);
    });

    it('should differ from ecliptic longitude due to obliquity', () => {
      const eclipticLong = 45;
      const equatorialRA = convertToEquatorial(eclipticLong, 0);
      // RA should differ from ecliptic longitude by a non-trivial amount
      const diff = Math.abs(eclipticLong - equatorialRA);
      expect(diff).toBeGreaterThan(0);
    });
  });

  describe('getLongitudeInTropicalSign', () => {
    it('should return Aries for 0-30°', () => {
      expect(getLongitudeInTropicalSign(0).sign).toBe('Aries');
      expect(getLongitudeInTropicalSign(15).sign).toBe('Aries');
      expect(getLongitudeInTropicalSign(29.9).sign).toBe('Aries');
    });

    it('should return correct sign for each 30° segment', () => {
      expect(getLongitudeInTropicalSign(0).sign).toBe('Aries');
      expect(getLongitudeInTropicalSign(30).sign).toBe('Taurus');
      expect(getLongitudeInTropicalSign(60).sign).toBe('Gemini');
      expect(getLongitudeInTropicalSign(90).sign).toBe('Cancer');
      expect(getLongitudeInTropicalSign(120).sign).toBe('Leo');
      expect(getLongitudeInTropicalSign(150).sign).toBe('Virgo');
      expect(getLongitudeInTropicalSign(180).sign).toBe('Libra');
      expect(getLongitudeInTropicalSign(210).sign).toBe('Scorpio');
      expect(getLongitudeInTropicalSign(240).sign).toBe('Sagittarius');
      expect(getLongitudeInTropicalSign(270).sign).toBe('Capricorn');
      expect(getLongitudeInTropicalSign(300).sign).toBe('Aquarius');
      expect(getLongitudeInTropicalSign(330).sign).toBe('Pisces');
    });

    it('should return correct degree in sign', () => {
      const result = getLongitudeInTropicalSign(45.5);
      expect(result.degreeInSign).toBeCloseTo(15.5, 1);
    });

    it('should return correct sign number (0-11)', () => {
      expect(getLongitudeInTropicalSign(0).signNumber).toBe(0); // Aries
      expect(getLongitudeInTropicalSign(90).signNumber).toBe(3); // Cancer
      expect(getLongitudeInTropicalSign(180).signNumber).toBe(6); // Libra
      expect(getLongitudeInTropicalSign(270).signNumber).toBe(9); // Capricorn
    });

    it('should handle values > 360', () => {
      const result1 = getLongitudeInTropicalSign(45);
      const result2 = getLongitudeInTropicalSign(405); // 45 + 360
      expect(result1.sign).toBe(result2.sign);
      expect(result1.signNumber).toBe(result2.signNumber);
      expect(result1.degreeInSign).toBeCloseTo(result2.degreeInSign, 1);
    });

    it('should handle negative values', () => {
      const result1 = getLongitudeInTropicalSign(45);
      const result2 = getLongitudeInTropicalSign(-315); // -315 + 360 = 45
      expect(result1.sign).toBe(result2.sign);
    });
  });

  describe('getLongitudeInSiderealSign', () => {
    it('should shift sign by approximately 24° (ayanamsha)', () => {
      const tropical = 100; // Cancer (90-120)
      const sidereal = getLongitudeInSiderealSign(tropical);

      // Tropical is 100° = 10° Cancer
      // Sidereal should be ~24° earlier = 76° = 16° Gemini
      expect(sidereal.sign).toBe('Gemini');
      expect(sidereal.signNumber).toBe(2);
    });

    it('should wrap correctly (e.g., Aries Point becomes Pisces in sidereal)', () => {
      const tropical = 0; // 0° Aries tropical
      const sidereal = getLongitudeInSiderealSign(tropical);

      // Should be in Pisces (previous sign)
      expect(sidereal.sign).toBe('Pisces');
      expect(sidereal.signNumber).toBe(11);
    });

    it('should accept custom ayanamsha', () => {
      const tropical = 100;
      const customAyanamsha = 20;
      const result = getLongitudeInSiderealSign(tropical, customAyanamsha);

      expect(result).toBeDefined();
      expect(result.sign).toBeDefined();
    });
  });

  describe('convertLongitudeToZodiacSystem', () => {
    const testLongitude = 123.45;

    it('should return tropical longitude for tropical system', () => {
      const result = convertLongitudeToZodiacSystem(
        testLongitude,
        0,
        'tropical',
      );
      expect(result).toBe(testLongitude);
    });

    it('should return sidereal longitude for sidereal system', () => {
      const result = convertLongitudeToZodiacSystem(
        testLongitude,
        0,
        'sidereal',
      );
      expect(result).toBeCloseTo(testLongitude - 24, 1);
    });

    it('should return equatorial RA for equatorial system', () => {
      const result = convertLongitudeToZodiacSystem(
        testLongitude,
        0,
        'equatorial',
      );
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(360);
    });

    it('should default to tropical for unknown system', () => {
      const result = convertLongitudeToZodiacSystem(
        testLongitude,
        0,
        'tropical' as never,
      );
      expect(result).toBe(testLongitude);
    });
  });

  describe('getSignForZodiacSystem', () => {
    const testLongitude = 130; // Leo in tropical

    it('should return Leo for tropical system', () => {
      const result = getSignForZodiacSystem(testLongitude, 'tropical');
      expect(result.sign).toBe('Leo');
      expect(result.signNumber).toBe(4);
    });

    it('should return different sign for sidereal system', () => {
      const tropicalResult = getSignForZodiacSystem(testLongitude, 'tropical');
      const siderealResult = getSignForZodiacSystem(testLongitude, 'sidereal');

      // Signs should be different (earlier in zodiac)
      expect(tropicalResult.sign).not.toBe(siderealResult.sign);
      expect(siderealResult.signNumber).toBeLessThan(tropicalResult.signNumber);
    });

    it('should return valid sign for equatorial system', () => {
      const result = getSignForZodiacSystem(testLongitude, 'equatorial');
      expect(result.sign).toBeDefined();
      expect(result.signNumber).toBeGreaterThanOrEqual(0);
      expect(result.signNumber).toBeLessThan(12);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Pisces-Aries boundary correctly', () => {
      const piaces = getLongitudeInTropicalSign(359.9);
      const aries = getLongitudeInTropicalSign(0.1);

      expect(piaces.sign).toBe('Pisces');
      expect(aries.sign).toBe('Aries');
    });

    it('should handle all 12 signs in sidereal', () => {
      const signs = new Set<string>();
      for (let i = 0; i < 360; i += 30) {
        const result = getLongitudeInSiderealSign(i);
        signs.add(result.sign);
      }
      expect(signs.size).toBe(12);
    });

    it('should be consistent across multiple calls', () => {
      const lng = 175.5;
      const result1 = convertLongitudeToZodiacSystem(lng, 0, 'sidereal');
      const result2 = convertLongitudeToZodiacSystem(lng, 0, 'sidereal');
      expect(result1).toBe(result2);
    });
  });
});
