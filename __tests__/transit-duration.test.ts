import {
  calculateTransitDuration,
  formatDuration,
} from '../utils/astrology/transit-duration';
import { PLANET_DAILY_MOTION } from '../utils/astrology/transit-duration-constants';

describe('Transit Duration Calculation', () => {
  describe('Fast Planets (Moon-Mars)', () => {
    it('calculates Moon duration correctly', () => {
      // Moon at 15° in sign, should have ~1 day remaining (15° / 13.176°/day)
      const duration = calculateTransitDuration(
        'Moon',
        'Aries',
        15,
        new Date('2025-02-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.remainingDays).toBeGreaterThan(0);
      expect(duration!.remainingDays).toBeLessThan(3); // Moon moves fast
      expect(duration!.displayText).toMatch(/day/);
    });

    it('calculates Sun duration correctly', () => {
      // Sun at 10° in sign, should have ~20 days remaining (20° / 0.9856°/day)
      const duration = calculateTransitDuration(
        'Sun',
        'Aquarius',
        310,
        new Date('2025-02-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.remainingDays).toBeGreaterThan(15);
      expect(duration!.remainingDays).toBeLessThan(25);
      expect(duration!.displayText).toMatch(/week|day/);
    });

    it('calculates Mercury duration correctly', () => {
      // Mercury at 25° in sign, should have ~1 day remaining (5° / 4.092°/day)
      const duration = calculateTransitDuration(
        'Mercury',
        'Pisces',
        355,
        new Date('2025-03-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.remainingDays).toBeGreaterThan(0);
      expect(duration!.remainingDays).toBeLessThan(3);
    });

    it('handles planet at sign boundary (29.9°)', () => {
      // Moon at 29.9° - should be ending very soon
      const duration = calculateTransitDuration(
        'Moon',
        'Aries',
        29.9,
        new Date('2025-02-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.remainingDays).toBeLessThanOrEqual(1); // Ceil rounds 0.0076 up to 1
      expect(duration!.displayText).toMatch(/1 day|< 1 day/);
    });

    it('handles planet just entered sign (0.1°)', () => {
      // Venus at 0.1° - should have almost full duration
      const duration = calculateTransitDuration(
        'Venus',
        'Taurus',
        30.1,
        new Date('2025-04-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.remainingDays).toBeGreaterThan(15); // Venus takes ~18-19 days per sign
      expect(duration!.totalDays).toBeGreaterThan(duration!.remainingDays);
    });
  });

  describe('Slow Planets (Jupiter-Pluto)', () => {
    it('looks up Jupiter duration from YEARLY_TRANSITS', () => {
      // Jupiter in Gemini - test within the known range (Jan 1 - Jun 8, 2025)
      const duration = calculateTransitDuration(
        'Jupiter',
        'Gemini',
        75,
        new Date('2025-03-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.totalDays).toBeGreaterThan(100);
      expect(duration!.displayText).toMatch(/month/);
    });

    it('handles Saturn in Pisces', () => {
      const duration = calculateTransitDuration(
        'Saturn',
        'Pisces',
        330,
        new Date('2025-02-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.totalDays).toBeGreaterThan(365); // Saturn stays ~2.5 years per sign
    });

    it('returns null for dates outside YEARLY_TRANSITS range', () => {
      // Neptune in Aries in 2040 — outside the pre-computed data range
      const duration = calculateTransitDuration(
        'Neptune',
        'Aries',
        15,
        new Date('2040-01-01'),
      );

      // Returns null when no matching transit data exists
      expect(duration).toBeNull();
    });
  });

  describe('Duration Formatting', () => {
    it('formats < 1 day correctly', () => {
      expect(formatDuration(0.5)).toBe('< 1 day remaining');
    });

    it('formats 1 day correctly', () => {
      expect(formatDuration(1)).toBe('1 day remaining');
    });

    it('formats multiple days correctly', () => {
      expect(formatDuration(5)).toBe('5 days remaining');
    });

    it('formats weeks correctly', () => {
      expect(formatDuration(14)).toBe('2 weeks remaining');
      expect(formatDuration(7)).toBe('1 week remaining');
      expect(formatDuration(21)).toBe('3 weeks remaining');
    });

    it('formats months correctly', () => {
      expect(formatDuration(60)).toBe('2 months remaining');
      expect(formatDuration(56)).toBe('2 months remaining'); // 56 days = threshold for months
      expect(formatDuration(365)).toBe('12 months remaining');
    });

    it('formats weeks correctly', () => {
      expect(formatDuration(30)).toBe('4 weeks remaining');
      expect(formatDuration(14)).toBe('2 weeks remaining');
      expect(formatDuration(7)).toBe('1 week remaining');
    });

    it('transitions from weeks to months at 8 weeks', () => {
      expect(formatDuration(55)).toBe('8 weeks remaining'); // Just under threshold
      expect(formatDuration(56)).toBe('2 months remaining'); // At threshold
    });
  });

  describe('Edge Cases', () => {
    it('returns null for unknown planet', () => {
      const duration = calculateTransitDuration(
        'UnknownPlanet',
        'Aries',
        15,
        new Date(),
      );
      expect(duration).toBeNull();
    });

    it('handles retrograde planets (same calculation)', () => {
      // Retrograde doesn't affect duration calculation (still based on degrees remaining)
      const duration = calculateTransitDuration(
        'Mercury',
        'Virgo',
        150,
        new Date('2025-08-01'),
      );
      expect(duration).not.toBeNull();
    });

    it('handles dates in past and future', () => {
      const pastDuration = calculateTransitDuration(
        'Moon',
        'Aries',
        15,
        new Date('2020-01-01'),
      );
      const futureDuration = calculateTransitDuration(
        'Moon',
        'Aries',
        15,
        new Date('2030-01-01'),
      );

      expect(pastDuration).not.toBeNull();
      expect(futureDuration).not.toBeNull();
      // Both should have similar remaining days since it's based on position, not date
      expect(
        Math.abs(pastDuration!.remainingDays - futureDuration!.remainingDays),
      ).toBeLessThan(0.1);
    });
  });

  describe('Orbital Speed Constants', () => {
    it('has correct daily motion for all planets', () => {
      expect(PLANET_DAILY_MOTION.Moon).toBeCloseTo(13.176, 2);
      expect(PLANET_DAILY_MOTION.Sun).toBeCloseTo(0.9856, 3);
      expect(PLANET_DAILY_MOTION.Mercury).toBeCloseTo(4.092, 2);
      expect(PLANET_DAILY_MOTION.Venus).toBeCloseTo(1.602, 2);
      expect(PLANET_DAILY_MOTION.Mars).toBeCloseTo(0.524, 2);
      expect(PLANET_DAILY_MOTION.Jupiter).toBeCloseTo(0.083, 3);
      expect(PLANET_DAILY_MOTION.Saturn).toBeCloseTo(0.034, 3);
    });

    it('Moon orbital speed results in ~27.3 day orbit', () => {
      const degreesPerOrbit = 360;
      const daysPerOrbit = degreesPerOrbit / PLANET_DAILY_MOTION.Moon;
      expect(daysPerOrbit).toBeCloseTo(27.3, 1);
    });

    it('Sun orbital speed results in ~365 day year', () => {
      const degreesPerOrbit = 360;
      const daysPerYear = degreesPerOrbit / PLANET_DAILY_MOTION.Sun;
      expect(daysPerYear).toBeCloseTo(365, 0);
    });
  });
});
