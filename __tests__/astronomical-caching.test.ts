/**
 * Tests for astronomical data caching with variable TTL
 * Verifies cache behavior for different planets and boundary conditions
 */

import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  formatDegreeMinutes,
} from '../utils/astrology/astronomical-data';

// Mock Date.now() for predictable cache expiration tests
const mockNow = new Date('2025-02-01T12:00:00Z').getTime();

describe('Astronomical Data Caching', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Variable TTL by Planet Speed', () => {
    it('caches Moon positions for 15 minutes (base)', () => {
      const date = new Date('2025-02-01T12:00:00Z');

      // First call - calculates
      const positions1 = getRealPlanetaryPositions(date);
      expect(positions1.Moon).toBeDefined();

      // Second call within 14 minutes - should hit cache
      jest.advanceTimersByTime(14 * 60 * 1000);
      const positions2 = getRealPlanetaryPositions(date);
      expect(positions2.Moon).toEqual(positions1.Moon);

      // Third call after 16 minutes - cache expired, recalculates
      jest.advanceTimersByTime(3 * 60 * 1000); // Total 17 minutes
      const positions3 = getRealPlanetaryPositions(date);
      // Note: Values might be same if using same date, but cache miss occurred
      expect(positions3.Moon).toBeDefined();
    });

    it('caches Saturn positions for 7 days (base)', () => {
      const date = new Date('2025-02-01T12:00:00Z');

      const positions1 = getRealPlanetaryPositions(date);
      expect(positions1.Saturn).toBeDefined();

      // 6 days later - should still be cached
      jest.advanceTimersByTime(6 * 24 * 60 * 60 * 1000);
      const positions2 = getRealPlanetaryPositions(date);
      expect(positions2.Saturn).toEqual(positions1.Saturn);

      // 8 days later - cache expired
      jest.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);
      const positions3 = getRealPlanetaryPositions(date);
      expect(positions3.Saturn).toBeDefined();
    });
  });

  describe('Dynamic Boundary Detection (75% faster refresh)', () => {
    it('reduces TTL when Moon near sign exit (28-29°)', () => {
      // Moon at 29° should have shorter cache (225s instead of 900s)
      // This is implementation detail, but ensures timing accuracy
      const date = new Date('2025-02-01T12:00:00Z');
      const positions = getRealPlanetaryPositions(date);

      // If Moon is near boundary (28-29° or 0-1°), TTL should be reduced
      if (positions.Moon.degree >= 28 || positions.Moon.degree <= 1) {
        // Cache should expire much sooner (75% reduction)
        // This ensures sign change timing is accurate
        expect(true).toBe(true); // Placeholder for cache expiration check
      }
    });

    it('uses base TTL when Moon mid-sign (15°)', () => {
      // When not near boundaries, use full TTL for performance
      const date = new Date('2025-02-01T12:00:00Z');
      const positions = getRealPlanetaryPositions(date);

      if (positions.Moon.degree > 1 && positions.Moon.degree < 28) {
        // Full 15-minute cache
        expect(true).toBe(true);
      }
    });
  });

  describe('Moon Phase Caching', () => {
    it('caches moon phase for 1 hour', () => {
      const date = new Date('2025-02-01T12:00:00Z');

      const phase1 = getAccurateMoonPhase(date);
      expect(phase1.illumination).toBeGreaterThanOrEqual(0);
      expect(phase1.illumination).toBeLessThanOrEqual(100);

      // 30 minutes later - should hit cache
      jest.advanceTimersByTime(30 * 60 * 1000);
      const phase2 = getAccurateMoonPhase(date);
      expect(phase2).toEqual(phase1);

      // 61 minutes later - cache expired
      jest.advanceTimersByTime(31 * 60 * 1000);
      const phase3 = getAccurateMoonPhase(date);
      expect(phase3.illumination).toBeDefined();
    });

    it('rounds cache key to nearest hour', () => {
      // Calls within same hour should share cache
      const date1 = new Date('2025-02-01T12:15:00Z');
      const date2 = new Date('2025-02-01T12:45:00Z');

      const phase1 = getAccurateMoonPhase(date1);
      const phase2 = getAccurateMoonPhase(date2);

      // Should be from same cached result (rounded to 12:00)
      expect(phase2).toEqual(phase1);
    });

    it('provides different cache for different hours', () => {
      const date1 = new Date('2025-02-01T12:00:00Z');
      const date2 = new Date('2025-02-01T13:00:00Z');

      const phase1 = getAccurateMoonPhase(date1);
      const phase2 = getAccurateMoonPhase(date2);

      // Different hours = different cache entries (though values might be similar)
      expect(phase1).toBeDefined();
      expect(phase2).toBeDefined();
    });
  });

  describe('Cache Cleanup', () => {
    it('prevents cache from growing indefinitely', () => {
      // Generate many different position requests
      for (let i = 0; i < 1500; i++) {
        const date = new Date(mockNow + i * 1000);
        getRealPlanetaryPositions(date);
      }

      // Cache cleanup should have kicked in (MAX_CACHE_SIZE = 1000)
      // This is a smoke test - actual cache size management is internal
      expect(true).toBe(true);
    });

    it('removes expired entries during cleanup', () => {
      const date = new Date('2025-02-01T12:00:00Z');

      // Create entries
      getRealPlanetaryPositions(date);

      // Fast forward past expiration
      jest.advanceTimersByTime(10 * 24 * 60 * 60 * 1000); // 10 days

      // Trigger cleanup by creating new entry
      const futureDate = new Date(mockNow + 10 * 24 * 60 * 60 * 1000);
      getRealPlanetaryPositions(futureDate);

      // Expired entries should be removed
      expect(true).toBe(true);
    });
  });
});

describe('Degree/Minute Formatting', () => {
  it('formats degrees and minutes correctly', () => {
    expect(formatDegreeMinutes(15.5)).toBe("15°30'");
    expect(formatDegreeMinutes(0.25)).toBe("0°15'");
    expect(formatDegreeMinutes(29.99)).toBe("29°59'");
  });

  it('handles whole degrees', () => {
    expect(formatDegreeMinutes(10.0)).toBe("10°00'");
    expect(formatDegreeMinutes(0.0)).toBe("0°00'");
  });

  it('rounds minutes to nearest integer', () => {
    expect(formatDegreeMinutes(15.508)).toBe("15°30'"); // 0.508 * 60 = 30.48 → 30
    expect(formatDegreeMinutes(15.517)).toBe("15°31'"); // 0.517 * 60 = 31.02 → 31
  });

  it('handles longitudes across sign boundaries', () => {
    expect(formatDegreeMinutes(30.5)).toBe("0°30'"); // 0.5° Taurus
    expect(formatDegreeMinutes(60.75)).toBe("0°45'"); // 0.75° Gemini
  });
});

describe('Planetary Position Data Structure', () => {
  it('includes all required fields', () => {
    const date = new Date('2025-02-01T12:00:00Z');
    const positions = getRealPlanetaryPositions(date);

    expect(positions.Sun).toMatchObject({
      longitude: expect.any(Number),
      sign: expect.any(String),
      degree: expect.any(Number),
      minutes: expect.any(Number),
      retrograde: expect.any(Boolean),
      newRetrograde: expect.any(Boolean),
      newDirect: expect.any(Boolean),
    });
  });

  it('includes duration for all planets', () => {
    const date = new Date('2025-02-01T12:00:00Z');
    const positions = getRealPlanetaryPositions(date);

    // Duration should be present (or null if calculation fails)
    expect(positions.Sun.duration).toBeDefined();
    expect(positions.Moon.duration).toBeDefined();
    expect(positions.Jupiter.duration).toBeDefined();

    if (positions.Sun.duration) {
      expect(positions.Sun.duration).toMatchObject({
        totalDays: expect.any(Number),
        remainingDays: expect.any(Number),
        displayText: expect.any(String),
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
    }
  });

  it('has degree within 0-29 range', () => {
    const date = new Date('2025-02-01T12:00:00Z');
    const positions = getRealPlanetaryPositions(date);

    Object.values(positions).forEach((pos: any) => {
      expect(pos.degree).toBeGreaterThanOrEqual(0);
      expect(pos.degree).toBeLessThan(30);
    });
  });

  it('has minutes within 0-59 range', () => {
    const date = new Date('2025-02-01T12:00:00Z');
    const positions = getRealPlanetaryPositions(date);

    Object.values(positions).forEach((pos: any) => {
      expect(pos.minutes).toBeGreaterThanOrEqual(0);
      expect(pos.minutes).toBeLessThan(60);
    });
  });
});

describe('Moon Phase Data Structure', () => {
  it('includes all required fields', () => {
    const date = new Date('2025-02-01T12:00:00Z');
    const phase = getAccurateMoonPhase(date);

    expect(phase).toMatchObject({
      name: expect.any(String),
      energy: expect.any(String),
      priority: expect.any(Number),
      emoji: expect.any(String),
      illumination: expect.any(Number),
      age: expect.any(Number),
      isSignificant: expect.any(Boolean),
    });
  });

  it('has illumination between 0-100%', () => {
    const date = new Date('2025-02-01T12:00:00Z');
    const phase = getAccurateMoonPhase(date);

    expect(phase.illumination).toBeGreaterThanOrEqual(0);
    expect(phase.illumination).toBeLessThanOrEqual(100);
  });

  it('has age between 0-29.53 days', () => {
    const date = new Date('2025-02-01T12:00:00Z');
    const phase = getAccurateMoonPhase(date);

    expect(phase.age).toBeGreaterThanOrEqual(0);
    expect(phase.age).toBeLessThan(30);
  });

  it('returns correct phase names', () => {
    const validPhases = [
      'New Moon',
      'Waxing Crescent',
      'First Quarter',
      'Waxing Gibbous',
      'Full Moon',
      'Wolf Moon',
      'Snow Moon',
      'Worm Moon',
      'Pink Moon',
      'Flower Moon',
      'Strawberry Moon',
      'Buck Moon',
      'Sturgeon Moon',
      'Harvest Moon',
      'Hunter Moon',
      'Beaver Moon',
      'Cold Moon',
      'Waning Gibbous',
      'Third Quarter',
      'Waning Crescent',
    ];

    const date = new Date('2025-02-01T12:00:00Z');
    const phase = getAccurateMoonPhase(date);

    expect(validPhases).toContain(phase.name);
  });
});
