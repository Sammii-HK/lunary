import {
  calculateTransitDuration,
  formatDuration,
  getSlowPlanetSignTotalDays,
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
      expect(duration!.displayText).toMatch(/d left|h left/);
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
      expect(duration!.displayText).toMatch(/w left|d left/);
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
      expect(duration!.remainingDays).toBeLessThanOrEqual(1);
      expect(duration!.displayText).toMatch(/h left/);
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
    it('looks up Jupiter duration from pre-computed segments', () => {
      // Jupiter in Cancer — test within a known segment
      const duration = calculateTransitDuration(
        'Jupiter',
        'Cancer',
        105,
        new Date('2025-07-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.totalDays).toBeGreaterThan(200);
      expect(duration!.displayText).toMatch(/m left|y left/);
    });

    it('handles Saturn in Pisces', () => {
      const duration = calculateTransitDuration(
        'Saturn',
        'Pisces',
        330,
        new Date('2025-02-01'),
      );

      expect(duration).not.toBeNull();
      expect(duration!.totalDays).toBeGreaterThan(100);
    });

    it('returns null for dates outside pre-computed range', () => {
      // 2040 is outside the 2020-2035 scan range
      const duration = calculateTransitDuration(
        'Neptune',
        'Aries',
        15,
        new Date('2040-01-01'),
      );

      expect(duration).toBeNull();
    });

    it('aggregates Saturn in Aries across retrograde segments', () => {
      // Saturn in Aries has 2 segments:
      //   Segment 1: 2025-05-25 → 2025-09-01 (~99 days, brief entry before retrograde)
      //   Segment 2: 2026-02-14 → 2028-04-13 (~789 days, main transit)
      // Total cumulative: ~888 days ≈ 2.4 years

      // Test during segment 1 (brief first entry)
      const seg1 = calculateTransitDuration(
        'Saturn',
        'Aries',
        0,
        new Date('2025-07-01'),
      );

      expect(seg1).not.toBeNull();
      // totalDays should be the FULL cumulative duration, not just 99 days
      expect(seg1!.totalDays).toBeGreaterThan(800);
      expect(seg1!.totalDays).toBeLessThan(920);
      // remainingDays should include rest of seg1 + all of seg2
      expect(seg1!.remainingDays).toBeGreaterThan(750);
      // startDate should be first segment start
      expect(seg1!.startDate.getFullYear()).toBe(2025);
      // endDate should be last segment end (2028)
      expect(seg1!.endDate.getFullYear()).toBe(2028);

      // Test during segment 2 (main transit)
      const seg2 = calculateTransitDuration(
        'Saturn',
        'Aries',
        0,
        new Date('2027-01-15'),
      );

      expect(seg2).not.toBeNull();
      // totalDays should still be the full cumulative duration
      expect(seg2!.totalDays).toBe(seg1!.totalDays);
      // remainingDays should only cover rest of segment 2
      expect(seg2!.remainingDays).toBeGreaterThan(400);
      expect(seg2!.remainingDays).toBeLessThan(500);
      // Same start/end dates as seg1
      expect(seg2!.startDate.getTime()).toBe(seg1!.startDate.getTime());
      expect(seg2!.endDate.getTime()).toBe(seg1!.endDate.getTime());
    });

    it('calculates correct halfway point for multi-segment transits', () => {
      // For Saturn in Aries (totalDays ≈ 888), halfway is at ~444 cumulative days
      // Segment 1 is 99 days, so halfway falls in segment 2:
      // 444 - 99 = 345 days into segment 2 (starting 2026-02-14)
      // → approximately 2027-01-25

      const halfway = calculateTransitDuration(
        'Saturn',
        'Aries',
        0,
        new Date('2027-01-25'),
      );

      expect(halfway).not.toBeNull();
      // At the halfway point, remainingDays should be approximately half of totalDays
      const ratio = halfway!.remainingDays / halfway!.totalDays;
      expect(ratio).toBeGreaterThan(0.4);
      expect(ratio).toBeLessThan(0.6);
    });
  });

  describe('getSlowPlanetSignTotalDays', () => {
    it('returns cumulative days for Saturn in Aries', () => {
      const days = getSlowPlanetSignTotalDays('Saturn', 'Aries');
      expect(days).not.toBeNull();
      // ~888 days across 2 retrograde segments
      expect(days!).toBeGreaterThan(800);
      expect(days!).toBeLessThan(920);
    });

    it('returns null for unknown planet', () => {
      expect(getSlowPlanetSignTotalDays('Ceres', 'Aries')).toBeNull();
    });

    it('returns null for sign with no data', () => {
      expect(getSlowPlanetSignTotalDays('Saturn', 'FakeSign')).toBeNull();
    });
  });

  describe('Duration Formatting', () => {
    it('formats hours correctly', () => {
      expect(formatDuration(0.5)).toBe('12h left');
      expect(formatDuration(0.04)).toBe('1h left');
    });

    it('formats sub-hour correctly', () => {
      expect(formatDuration(0.01)).toBe('<1h left');
    });

    it('formats days correctly', () => {
      expect(formatDuration(1)).toBe('1d left');
      expect(formatDuration(5)).toBe('5d left');
      expect(formatDuration(13)).toBe('13d left');
    });

    it('formats weeks correctly', () => {
      expect(formatDuration(14)).toBe('2w left');
      expect(formatDuration(21)).toBe('3w left');
      expect(formatDuration(30)).toBe('4w left');
    });

    it('formats months correctly', () => {
      expect(formatDuration(56)).toBe('2m left');
      expect(formatDuration(60)).toBe('2m left');
      expect(formatDuration(90)).toBe('3m left');
    });

    it('formats years correctly', () => {
      expect(formatDuration(365)).toBe('1y left');
      expect(formatDuration(730)).toBe('2y left');
    });

    it('transitions from days to weeks at 14 days', () => {
      expect(formatDuration(13)).toBe('13d left'); // Still days
      expect(formatDuration(14)).toBe('2w left'); // Now weeks
    });

    it('transitions from weeks to months at 8 weeks', () => {
      expect(formatDuration(55)).toBe('8w left'); // Just under threshold
      expect(formatDuration(56)).toBe('2m left'); // At threshold
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
