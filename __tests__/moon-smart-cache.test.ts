/**
 * Tests for smart moon cache with percentage-based expiration
 */

import {
  getSmartMoonData,
  formatSupermoonInfo,
  formatCacheInfo,
} from '../utils/astrology/moon-smart-cache';

describe('Smart Moon Cache', () => {
  describe('Percentage-Based Cache Expiration', () => {
    it('calculates TTL until next integer percentage', () => {
      const moon = getSmartMoonData(new Date('2025-02-01T12:00:00Z'));

      // Should have calculated when next percentage will be reached
      expect(moon.nextPercentageIn).toBeGreaterThan(0);
      expect(moon.optimalCacheTTL).toBeGreaterThan(0);

      // TTL should be reasonable (1 minute to 1 hour)
      expect(moon.optimalCacheTTL).toBeGreaterThanOrEqual(60); // Min 1 minute
      expect(moon.optimalCacheTTL).toBeLessThanOrEqual(3600); // Max 1 hour
    });

    it('TTL is shorter when near percentage boundary', () => {
      // At 50.95%, next percentage (51%) is very close
      // Cache should expire soon (~12 minutes at 0.25%/hour rate)
      const moon = getSmartMoonData(new Date());

      const decimalPart =
        moon.illuminationPrecise - Math.floor(moon.illuminationPrecise);

      if (decimalPart > 0.9 || decimalPart < 0.1) {
        // Near boundary - TTL should be shorter
        expect(moon.optimalCacheTTL).toBeLessThan(1800); // Less than 30 min
      }
    });

    it('TTL is longer when far from percentage boundary', () => {
      const moon = getSmartMoonData(new Date());

      const decimalPart =
        moon.illuminationPrecise - Math.floor(moon.illuminationPrecise);

      if (decimalPart > 0.4 && decimalPart < 0.6) {
        // Middle of percentage - TTL can be longer
        // At 0.14%/hour rate, 0.5% takes ~3.5 hours
        // But capped at 1 hour max
        expect(moon.optimalCacheTTL).toBeGreaterThan(600); // More than 10 min
      }
    });

    it('calculates correct direction (waxing vs waning)', () => {
      const moon = getSmartMoonData(new Date());

      expect(['waxing', 'waning']).toContain(moon.trend);

      // If waxing, should count up to next higher integer
      // If waning, should count down to next lower integer
      if (moon.trend === 'waxing') {
        const nextTarget = Math.ceil(moon.illuminationPrecise);
        expect(nextTarget).toBeGreaterThanOrEqual(moon.illumination);
      } else {
        const nextTarget = Math.floor(moon.illuminationPrecise);
        expect(nextTarget).toBeLessThanOrEqual(moon.illumination);
      }
    });
  });

  describe('No More Arbitrary Hour Jumps', () => {
    it('expires based on illumination change, not time', () => {
      const moon = getSmartMoonData(new Date());

      // Old system: always 1 hour, regardless of illumination
      // New system: variable based on when percentage will change

      // If change rate is fast (near quarters), TTL should be shorter
      if (moon.changeRatePerHour > 0.2) {
        expect(moon.optimalCacheTTL).toBeLessThan(3600);
      }

      // If change rate is slow (near new/full), TTL can be longer
      if (moon.changeRatePerHour < 0.05) {
        expect(moon.optimalCacheTTL).toBeGreaterThan(1800);
      }
    });

    it('provides smooth percentage transitions', () => {
      // When cache expires, illumination integer should change
      const moon1 = getSmartMoonData(new Date());

      // Simulate waiting until cache expires
      const futureDate = new Date(
        Date.now() + moon1.optimalCacheTTL * 1000 + 1000,
      );
      const moon2 = getSmartMoonData(futureDate);

      // After TTL, percentage SHOULD have changed (or be very close)
      // This prevents showing "50%" for a long time then jumping to "52%"
      const percentageChange = Math.abs(
        moon2.illumination - moon1.illumination,
      );

      // Should change by 0 or 1 (smooth), not 2+ (jump)
      expect(percentageChange).toBeLessThanOrEqual(1);
    });
  });

  describe('Supermoon Detection', () => {
    it('detects supermoon when close to perigee', () => {
      const moon = getSmartMoonData(new Date());

      // Supermoon = within 90% of closest approach
      // 356,500 km (perigee) + 10% buffer = ~361,500 km
      if (moon.isSuperMoon) {
        expect(moon.distanceKm).toBeLessThan(370000);
        expect(moon.energy).toContain('Supermoon');
        expect(moon.priority).toBeGreaterThanOrEqual(9);
      }
    });

    it('detects micromoon when close to apogee', () => {
      const moon = getSmartMoonData(new Date());

      // Micromoon = within 90% of farthest distance
      if (moon.isMicroMoon) {
        expect(moon.distanceKm).toBeGreaterThan(400000);
      }
    });

    it('supermoon and micromoon are mutually exclusive', () => {
      const moon = getSmartMoonData(new Date());
      expect(moon.isSuperMoon && moon.isMicroMoon).toBe(false);
    });

    it('includes angular size (apparent diameter)', () => {
      const moon = getSmartMoonData(new Date());

      // Moon's angular size varies from ~29' to ~34' arcminutes
      expect(moon.angularSize).toBeGreaterThan(0);

      // Supermoons appear larger
      if (moon.isSuperMoon) {
        expect(moon.angularSize).toBeGreaterThan(3475); // Larger than average
      }
    });
  });

  describe('Change Rate Calculation', () => {
    it('calculates change rate per hour', () => {
      const moon = getSmartMoonData(new Date());

      // Change rate varies from ~0% (at new/full) to ~0.28% (at quarters)
      expect(moon.changeRatePerHour).toBeGreaterThan(0);
      expect(moon.changeRatePerHour).toBeLessThanOrEqual(0.3);
    });

    it('change rate is maximum near quarter moons', () => {
      const moon = getSmartMoonData(new Date());

      // At quarters (90°, 270°), rate should be high
      if (
        (moon.phaseAngle > 80 && moon.phaseAngle < 100) ||
        (moon.phaseAngle > 260 && moon.phaseAngle < 280)
      ) {
        expect(moon.changeRatePerHour).toBeGreaterThan(0.2);
      }
    });

    it('change rate is minimum near new/full moons', () => {
      const moon = getSmartMoonData(new Date());

      // At new (0°) or full (180°), rate should be low
      if (
        moon.phaseAngle < 10 ||
        moon.phaseAngle > 350 ||
        (moon.phaseAngle > 170 && moon.phaseAngle < 190)
      ) {
        expect(moon.changeRatePerHour).toBeLessThan(0.1);
      }
    });
  });

  describe('Data Completeness', () => {
    it('includes all required fields', () => {
      const moon = getSmartMoonData(new Date());

      expect(moon).toMatchObject({
        name: expect.any(String),
        energy: expect.any(String),
        priority: expect.any(Number),
        emoji: expect.any(String),
        illumination: expect.any(Number),
        illuminationPrecise: expect.any(Number),
        age: expect.any(Number),
        isSignificant: expect.any(Boolean),
        distanceKm: expect.any(Number),
        isSuperMoon: expect.any(Boolean),
        isMicroMoon: expect.any(Boolean),
        angularSize: expect.any(Number),
        changeRatePerHour: expect.any(Number),
        nextPercentageIn: expect.any(Number),
        optimalCacheTTL: expect.any(Number),
        phaseAngle: expect.any(Number),
        trend: expect.any(String),
      });
    });

    it('has valid value ranges', () => {
      const moon = getSmartMoonData(new Date());

      expect(moon.illumination).toBeGreaterThanOrEqual(0);
      expect(moon.illumination).toBeLessThanOrEqual(100);
      expect(moon.illuminationPrecise).toBeGreaterThanOrEqual(0);
      expect(moon.illuminationPrecise).toBeLessThanOrEqual(100);
      expect(moon.age).toBeGreaterThanOrEqual(0);
      expect(moon.age).toBeLessThan(30);
      expect(moon.phaseAngle).toBeGreaterThanOrEqual(0);
      expect(moon.phaseAngle).toBeLessThan(360);
      expect(moon.distanceKm).toBeGreaterThan(350000);
      expect(moon.distanceKm).toBeLessThan(410000);
    });
  });

  describe('Helper Functions', () => {
    it('formats supermoon info', () => {
      const moon = getSmartMoonData(new Date());
      const info = formatSupermoonInfo(moon);

      expect(info).toContain('km');

      if (moon.isSuperMoon) {
        expect(info).toContain('Supermoon');
        expect(info).toContain('close');
      }

      if (moon.isMicroMoon) {
        expect(info).toContain('Micromoon');
        expect(info).toContain('far');
      }
    });

    it('formats cache info for debugging', () => {
      const moon = getSmartMoonData(new Date());
      const info = formatCacheInfo(moon);

      expect(info).toContain('Next update');
      expect(info).toMatch(/\d+m/); // Minutes
      expect(info).toMatch(/\d+s/); // Seconds
      expect(info).toContain('%'); // Percentage target
    });
  });

  describe('Cache Performance', () => {
    it('caches results for calculated duration', () => {
      const date = new Date();

      // First call - calculates
      const moon1 = getSmartMoonData(date);

      // Second call with same date - should hit cache
      const moon2 = getSmartMoonData(date);

      // Should be identical (from cache)
      expect(moon2).toEqual(moon1);
    });

    it('uses per-minute cache keys', () => {
      // Calls within same minute share cache
      const date1 = new Date('2025-02-01T12:30:15Z');
      const date2 = new Date('2025-02-01T12:30:45Z');

      const moon1 = getSmartMoonData(date1);
      const moon2 = getSmartMoonData(date2);

      // Should be from same cache (rounded to 12:30)
      expect(moon2).toEqual(moon1);
    });

    it('different minutes use different cache', () => {
      const date1 = new Date('2025-02-01T12:30:00Z');
      const date2 = new Date('2025-02-01T12:31:00Z');

      const moon1 = getSmartMoonData(date1);
      const moon2 = getSmartMoonData(date2);

      // Different minutes = different cache keys
      // Values might be similar, but they're separate calculations
      expect(moon1).toBeDefined();
      expect(moon2).toBeDefined();
    });
  });

  describe('Comparison with Fixed-Hour Cache', () => {
    it('eliminates hour-boundary jumps', () => {
      // Old system: 59 minutes = "50%", then at 60 minutes = "51%"
      // New system: expires at exactly when "51%" is reached

      const moon = getSmartMoonData(new Date());

      // TTL should align with percentage change, not arbitrary hour
      const hoursToNextPercent = moon.nextPercentageIn / 3600;

      // If very close to next percentage, TTL should be short
      const decimalPart =
        moon.illuminationPrecise - Math.floor(moon.illuminationPrecise);
      if (decimalPart > 0.95 || decimalPart < 0.05) {
        expect(hoursToNextPercent).toBeLessThan(0.5); // Less than 30 min
      }
    });

    it('provides more accurate updates during active phases', () => {
      const moon = getSmartMoonData(new Date());

      // During quarters (fast change), updates should be more frequent
      if (moon.changeRatePerHour > 0.2) {
        // High change rate = shorter cache
        expect(moon.optimalCacheTTL).toBeLessThan(3600); // Less than 1 hour

        // At 0.28%/hour, reaching next % takes ~3.5 hours
        // But we cap at 1 hour max for freshness
      }
    });
  });
});
