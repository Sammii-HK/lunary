import {
  calculateTransitDuration,
  formatDuration,
  getSlowPlanetSignTotalDays,
  refreshDuration,
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

    it('handles retrograde planets by counting down to 0°', () => {
      // Mercury at 10° in Virgo: longitude = 150 (Virgo start) + 10 = 160
      // Direct:     elapsed 10° (entered from 0°), remaining 20° → ~4.9d
      // Retrograde: elapsed 20° (entered from 30°), remaining 10° → ~2.4d
      const direct = calculateTransitDuration(
        'Mercury',
        'Virgo',
        160, // 10° into Virgo
        new Date('2025-08-01'),
        undefined,
        false,
      );
      const retrograde = calculateTransitDuration(
        'Mercury',
        'Virgo',
        160, // 10° into Virgo
        new Date('2025-08-01'),
        undefined,
        true,
      );

      expect(direct).not.toBeNull();
      expect(retrograde).not.toBeNull();

      // Retrograde has fewer days remaining: 10° to exit vs 20° to exit direct
      expect(retrograde!.remainingDays).toBeLessThan(direct!.remainingDays);
      // Direct: ~4.9d remaining; retrograde: ~2.4d remaining
      expect(direct!.remainingDays).toBeCloseTo(20 / 4.092, 0);
      expect(retrograde!.remainingDays).toBeCloseTo(10 / 4.092, 0);

      // startDate reflects entry from opposite side
      // Direct entered ~2.4d ago; retrograde entered ~4.9d ago (from the 30° end)
      expect(retrograde!.startDate.getTime()).toBeLessThan(
        direct!.startDate.getTime(),
      );
    });

    it('retrograde near sign entry (low degree) shows only a few days left', () => {
      // Mercury retrograde at 3° in Virgo — will exit back into Leo very soon
      // degreesRemaining = 3° / 4.092°/day ≈ 0.73 days
      const duration = calculateTransitDuration(
        'Mercury',
        'Virgo',
        123, // 3° into Virgo
        new Date('2025-08-15'),
        undefined,
        true,
      );

      expect(duration).not.toBeNull();
      expect(duration!.remainingDays).toBeLessThan(1);
      expect(duration!.displayText).toMatch(/h left/);
    });

    it('retrograde near sign exit (high degree) shows more days left', () => {
      // Mercury retrograde at 28° in Virgo — entered recently, long way back to 0°
      // degreesRemaining = 28° / 4.092°/day ≈ 6.8 days
      const duration = calculateTransitDuration(
        'Mercury',
        'Virgo',
        148, // 28° into Virgo
        new Date('2025-08-01'),
        undefined,
        true,
      );

      expect(duration).not.toBeNull();
      expect(duration!.remainingDays).toBeGreaterThan(5);
      expect(duration!.remainingDays).toBeLessThan(10);
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

  describe('refreshDuration', () => {
    const now = Date.now();
    const msPerHour = 3600000;
    const msPerDay = 86400000;

    function makeDuration(startMsAgo: number, endMsFromNow: number) {
      return {
        startDate: new Date(now - startMsAgo),
        endDate: new Date(now + endMsFromNow),
        totalDays: (startMsAgo + endMsFromNow) / msPerDay,
      };
    }

    it('returns correct remainingDays for an active transit', () => {
      const duration = makeDuration(5 * msPerDay, 3 * msPerDay);
      const result = refreshDuration(duration);

      expect(result).not.toBeNull();
      expect(result!.remainingDays).toBeCloseTo(3, 1);
      expect(result!.displayText).toBe('3d left');
    });

    it('returns correct displayText for a transit ending in hours', () => {
      const duration = makeDuration(msPerDay, 6 * msPerHour);
      const result = refreshDuration(duration);

      expect(result).not.toBeNull();
      expect(result!.remainingDays).toBeCloseTo(0.25, 2);
      expect(result!.displayText).toBe('6h left');
    });

    it('returns <1h left when transit expired less than 1 hour ago', () => {
      // endDate is 30 minutes in the past — mid sign-change transition
      const duration = makeDuration(2 * msPerDay, -0.5 * msPerHour);
      const result = refreshDuration(duration);

      expect(result).not.toBeNull();
      expect(result!.remainingDays).toBe(0);
      expect(result!.displayText).toBe('<1h left');
    });

    it('returns <1h left when transit expired just now (endDate = now)', () => {
      const duration = makeDuration(msPerDay, 0);
      // endDate exactly at now — remainingMs is 0, which is <= 0 but within 1h
      const result = refreshDuration(duration);

      expect(result).not.toBeNull();
      expect(result!.displayText).toBe('<1h left');
    });

    it('returns null when transit expired more than 1 hour ago', () => {
      const duration = makeDuration(2 * msPerDay, -2 * msPerHour);
      const result = refreshDuration(duration);

      expect(result).toBeNull();
    });

    it('returns null when transit expired days ago', () => {
      const duration = makeDuration(10 * msPerDay, -3 * msPerDay);
      const result = refreshDuration(duration);

      expect(result).toBeNull();
    });

    it('returns null when duration is null', () => {
      expect(refreshDuration(null)).toBeNull();
    });

    it('returns null when duration is undefined', () => {
      expect(refreshDuration(undefined)).toBeNull();
    });

    it('returns null when endDate is missing', () => {
      expect(
        refreshDuration({ startDate: new Date(), endDate: undefined as any }),
      ).toBeNull();
    });

    it('accepts ISO string dates (JSON serialisation)', () => {
      const duration = {
        startDate: new Date(now - 5 * msPerDay).toISOString(),
        endDate: new Date(now + 3 * msPerDay).toISOString(),
        totalDays: 8,
      };
      const result = refreshDuration(duration as any);

      expect(result).not.toBeNull();
      expect(result!.remainingDays).toBeCloseTo(3, 1);
    });

    it('preserves totalDays from the stored duration', () => {
      const duration = makeDuration(5 * msPerDay, 3 * msPerDay);
      const result = refreshDuration(duration);

      expect(result!.totalDays).toBe(duration.totalDays);
    });

    it('computes totalDays from start/end when not stored', () => {
      const duration = {
        startDate: new Date(now - 5 * msPerDay),
        endDate: new Date(now + 3 * msPerDay),
      };
      const result = refreshDuration(duration);

      expect(result).not.toBeNull();
      // totalDays = 8 days, ceiled
      expect(result!.totalDays).toBe(8);
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
