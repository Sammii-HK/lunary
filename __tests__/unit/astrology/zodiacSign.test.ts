import { describe, it, expect } from '@jest/globals';
import {
  getZodiacSign,
  formatDegree,
} from '../../../utils/astrology/astrology';

/**
 * Zodiac Sign and Degree Formatting Tests
 *
 * Tests verify correct zodiac sign assignment and degree formatting
 * based on ecliptic longitude calculations.
 */

describe('Zodiac Sign Calculation', () => {
  describe('Sign Boundaries', () => {
    it('assigns Aries for 0° ecliptic longitude', () => {
      expect(getZodiacSign(0)).toBe('Aries');
    });

    it('assigns Aries for 15° ecliptic longitude', () => {
      expect(getZodiacSign(15)).toBe('Aries');
    });

    it('assigns Aries for 29.9° ecliptic longitude', () => {
      expect(getZodiacSign(29.9)).toBe('Aries');
    });

    it('assigns Taurus for 30° ecliptic longitude', () => {
      expect(getZodiacSign(30)).toBe('Taurus');
    });

    it('assigns Gemini for 60° ecliptic longitude', () => {
      expect(getZodiacSign(60)).toBe('Gemini');
    });

    it('assigns Cancer for 90° ecliptic longitude', () => {
      expect(getZodiacSign(90)).toBe('Cancer');
    });

    it('assigns Leo for 120° ecliptic longitude', () => {
      expect(getZodiacSign(120)).toBe('Leo');
    });

    it('assigns Virgo for 150° ecliptic longitude', () => {
      expect(getZodiacSign(150)).toBe('Virgo');
    });

    it('assigns Libra for 180° ecliptic longitude', () => {
      expect(getZodiacSign(180)).toBe('Libra');
    });

    it('assigns Scorpio for 210° ecliptic longitude', () => {
      expect(getZodiacSign(210)).toBe('Scorpio');
    });

    it('assigns Sagittarius for 240° ecliptic longitude', () => {
      expect(getZodiacSign(240)).toBe('Sagittarius');
    });

    it('assigns Capricorn for 270° ecliptic longitude', () => {
      expect(getZodiacSign(270)).toBe('Capricorn');
    });

    it('assigns Aquarius for 300° ecliptic longitude', () => {
      expect(getZodiacSign(300)).toBe('Aquarius');
    });

    it('assigns Pisces for 330° ecliptic longitude', () => {
      expect(getZodiacSign(330)).toBe('Pisces');
    });

    it('assigns Pisces for 359.9° ecliptic longitude', () => {
      expect(getZodiacSign(359.9)).toBe('Pisces');
    });
  });

  describe('Cusp Positions', () => {
    it('handles Aries/Taurus cusp correctly', () => {
      expect(getZodiacSign(29.999)).toBe('Aries');
      expect(getZodiacSign(30.001)).toBe('Taurus');
    });

    it('handles Pisces/Aries cusp correctly (360° boundary)', () => {
      expect(getZodiacSign(359.999)).toBe('Pisces');
      expect(getZodiacSign(0.001)).toBe('Aries');
    });
  });

  describe('Edge Cases', () => {
    it('handles exact 360° as Aries', () => {
      expect(getZodiacSign(360)).toBe('Aries');
    });

    it('handles values slightly over 360°', () => {
      // Should normalize to 0-360 range
      const sign = getZodiacSign(361);
      expect(sign).toBeDefined();
      expect(typeof sign).toBe('string');
    });

    it('handles negative values', () => {
      // Should normalize negative values
      const sign = getZodiacSign(-30);
      expect(sign).toBeDefined();
      expect(typeof sign).toBe('string');
    });
  });
});

describe('Degree Formatting', () => {
  describe('Basic Formatting', () => {
    it('formats 0° correctly', () => {
      const result = formatDegree(0);
      expect(result.degree).toBe(0);
      expect(result.minute).toBe(0);
    });

    it('formats 15.5° correctly', () => {
      const result = formatDegree(15.5);
      expect(result.degree).toBe(15);
      expect(result.minute).toBe(30);
    });

    it('formats 29.99° correctly', () => {
      const result = formatDegree(29.99);
      expect(result.degree).toBe(29);
      expect(result.minute).toBeGreaterThanOrEqual(59);
      expect(result.minute).toBeLessThan(60);
    });
  });

  describe('Sign Degree Conversion', () => {
    it('converts 0° ecliptic to 0° Aries', () => {
      const result = formatDegree(0);
      expect(result.degree).toBe(0);
    });

    it('converts 30° ecliptic to 0° Taurus', () => {
      const result = formatDegree(30);
      expect(result.degree).toBe(0);
      expect(result.minute).toBe(0);
    });

    it('converts 45° ecliptic to 15° Taurus', () => {
      const result = formatDegree(45);
      expect(result.degree).toBe(15);
      expect(result.minute).toBe(0);
    });

    it('converts 90° ecliptic to 0° Cancer', () => {
      const result = formatDegree(90);
      expect(result.degree).toBe(0);
      expect(result.minute).toBe(0);
    });

    it('converts 180° ecliptic to 0° Libra', () => {
      const result = formatDegree(180);
      expect(result.degree).toBe(0);
      expect(result.minute).toBe(0);
    });

    it('converts 270° ecliptic to 0° Capricorn', () => {
      const result = formatDegree(270);
      expect(result.degree).toBe(0);
      expect(result.minute).toBe(0);
    });
  });

  describe('Minute Precision', () => {
    it('rounds minutes correctly', () => {
      // 15.25° = 15°15'
      const result = formatDegree(15.25);
      expect(result.degree).toBe(15);
      expect(result.minute).toBe(15);
    });

    it('handles fractional minutes', () => {
      // 15.5° = 15°30'
      const result = formatDegree(15.5);
      expect(result.degree).toBe(15);
      expect(result.minute).toBe(30);
    });

    it('keeps minutes under 60', () => {
      const result = formatDegree(29.999);
      expect(result.minute).toBeLessThan(60);
    });
  });

  describe('Full Circle', () => {
    it('formats all zodiac sign boundaries correctly', () => {
      for (let i = 0; i < 12; i++) {
        const longitude = i * 30;
        const result = formatDegree(longitude);
        expect(result.degree).toBe(0);
        expect(result.minute).toBe(0);
      }
    });

    it('formats mid-sign positions correctly', () => {
      for (let i = 0; i < 12; i++) {
        const longitude = i * 30 + 15;
        const result = formatDegree(longitude);
        expect(result.degree).toBe(15);
        expect(result.minute).toBe(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles 360° correctly', () => {
      const result = formatDegree(360);
      // Should normalize to 0°
      expect(result.degree).toBe(0);
      expect(result.minute).toBe(0);
    });

    it('handles values over 360°', () => {
      const result = formatDegree(375);
      // 375° = 15° (normalized)
      expect(result.degree).toBe(15);
    });

    it('handles very small fractions', () => {
      const result = formatDegree(0.001);
      expect(result.degree).toBe(0);
      expect(result.minute).toBeGreaterThanOrEqual(0);
      expect(result.minute).toBeLessThan(1);
    });
  });

  describe('Degree-Minute Range Validation', () => {
    it('always returns degrees in 0-29 range', () => {
      for (let i = 0; i < 360; i += 5) {
        const result = formatDegree(i);
        expect(result.degree).toBeGreaterThanOrEqual(0);
        expect(result.degree).toBeLessThan(30);
      }
    });

    it('always returns minutes in 0-59 range', () => {
      for (let i = 0; i < 360; i += 0.5) {
        const result = formatDegree(i);
        expect(result.minute).toBeGreaterThanOrEqual(0);
        expect(result.minute).toBeLessThan(60);
      }
    });
  });
});

describe('Integration - Sign and Degree', () => {
  it('correctly identifies sign and degree for known positions', () => {
    const testCases = [
      { longitude: 0, expectedSign: 'Aries', expectedDegree: 0 },
      { longitude: 15.5, expectedSign: 'Aries', expectedDegree: 15 },
      { longitude: 29.9, expectedSign: 'Aries', expectedDegree: 29 },
      { longitude: 30, expectedSign: 'Taurus', expectedDegree: 0 },
      { longitude: 45, expectedSign: 'Taurus', expectedDegree: 15 },
      { longitude: 90, expectedSign: 'Cancer', expectedDegree: 0 },
      { longitude: 180, expectedSign: 'Libra', expectedDegree: 0 },
      { longitude: 270, expectedSign: 'Capricorn', expectedDegree: 0 },
      { longitude: 359, expectedSign: 'Pisces', expectedDegree: 29 },
    ];

    testCases.forEach(({ longitude, expectedSign, expectedDegree }) => {
      const sign = getZodiacSign(longitude);
      const { degree } = formatDegree(longitude);

      expect(sign).toBe(expectedSign);
      expect(degree).toBe(expectedDegree);
    });
  });
});
