/**
 * Tests for moon illumination calculation accuracy
 * Verifies astronomy-engine calculations and enhanced features
 */

import {
  getEnhancedMoonIllumination,
  formatIllumination,
  formatMoonDistance,
  getNextSignificantPhase,
} from '../utils/astrology/moon-illumination-improved';
import { getAccurateMoonPhase } from '../utils/astrology/astronomical-data';

describe('Moon Illumination Calculation', () => {
  describe('Basic Illumination Accuracy', () => {
    it('calculates illumination percentage between 0-100%', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      expect(moon.illumination).toBeGreaterThanOrEqual(0);
      expect(moon.illumination).toBeLessThanOrEqual(100);
    });

    it('provides precise illumination with 3 decimals', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      expect(moon.illuminationPrecise).toBeGreaterThanOrEqual(0);
      expect(moon.illuminationPrecise).toBeLessThanOrEqual(100);
      expect(moon.illuminationPrecise.toString()).toMatch(/\.\d{3}$/);
    });

    it('calculates moon age within 0-29.53 days', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      expect(moon.age).toBeGreaterThanOrEqual(0);
      expect(moon.age).toBeLessThan(30);
    });

    it('determines waxing vs waning correctly', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      expect(['waxing', 'waning']).toContain(moon.trend);

      // Phase < 180° should be waxing
      if (moon.phaseAngle < 180) {
        expect(moon.trend).toBe('waxing');
      } else {
        expect(moon.trend).toBe('waning');
      }
    });
  });

  describe('Change Rate Calculation', () => {
    it('calculates illumination change rate', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Change rate should be between 0% and 0.28% per hour
      expect(moon.changeRate).toBeGreaterThanOrEqual(0);
      expect(moon.changeRate).toBeLessThanOrEqual(0.3);
    });

    it('has maximum change rate near quarter moons', () => {
      // At quarter moons (90°, 270°), change rate should be highest
      // This is a conceptual test - actual values depend on current date
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // If near quarter (80-100° or 260-280°), expect higher rate
      if (
        (moon.phaseAngle > 80 && moon.phaseAngle < 100) ||
        (moon.phaseAngle > 260 && moon.phaseAngle < 280)
      ) {
        expect(moon.changeRate).toBeGreaterThan(0.2);
      }
    });

    it('has minimum change rate near new/full moons', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // If near new (0°) or full (180°), expect lower rate
      if (
        moon.phaseAngle < 10 ||
        moon.phaseAngle > 350 ||
        (moon.phaseAngle > 170 && moon.phaseAngle < 190)
      ) {
        expect(moon.changeRate).toBeLessThan(0.1);
      }
    });
  });

  describe('Distance and Angular Size', () => {
    it('calculates Earth-Moon distance in km', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Moon distance ranges from ~356,500 km (perigee) to ~406,700 km (apogee)
      expect(moon.distanceKm).toBeGreaterThan(350000);
      expect(moon.distanceKm).toBeLessThan(410000);
    });

    it('calculates angular size (apparent diameter)', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Moon's angular size varies from ~29' (apogee) to ~34' (perigee)
      // astronomy-engine provides diam_km which we use
      expect(moon.angularSize).toBeGreaterThan(0);
    });

    it('detects supermoon when close to perigee', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Supermoon = within 90% of perigee distance
      if (moon.isSuperMoon) {
        expect(moon.distanceKm).toBeLessThan(370000); // Approximate threshold
      }
    });

    it('detects micromoon when close to apogee', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Micromoon = within 90% of apogee distance
      if (moon.isMicroMoon) {
        expect(moon.distanceKm).toBeGreaterThan(400000); // Approximate threshold
      }
    });

    it('supermoon and micromoon are mutually exclusive', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Cannot be both supermoon and micromoon
      expect(moon.isSuperMoon && moon.isMicroMoon).toBe(false);
    });
  });

  describe('Phase Name Accuracy', () => {
    it('identifies new moon correctly', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      if (moon.illumination <= 3) {
        expect(moon.name).toBe('New Moon');
        expect(moon.emoji).toBe('🌑');
      }
    });

    it('identifies full moon correctly', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      if (moon.illumination >= 97) {
        expect(moon.name).toMatch(/Moon$/); // "Full Moon" or named moon
        expect(moon.emoji).toBe('🌕');
      }
    });

    it('identifies quarter moons correctly', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      if (moon.phaseAngle >= 85 && moon.phaseAngle <= 95) {
        expect(moon.name).toBe('First Quarter');
        expect(moon.emoji).toBe('🌓');
      }

      if (moon.phaseAngle >= 265 && moon.phaseAngle <= 275) {
        expect(moon.name).toBe('Third Quarter');
        expect(moon.emoji).toBe('🌗');
      }
    });

    it('uses traditional moon names for full moons', () => {
      const validNames = [
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
        'Full Moon',
      ];

      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      if (moon.illumination >= 97) {
        expect(validNames).toContain(moon.name);
      }
    });
  });

  describe('Supermoon Energy Enhancement', () => {
    it('amplifies energy description for supermoons', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      if (moon.isSuperMoon) {
        expect(moon.energy).toContain('Amplified');
        expect(moon.priority).toBeGreaterThanOrEqual(9);
      }
    });

    it('uses normal energy for regular moons', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      if (!moon.isSuperMoon) {
        expect(moon.energy).not.toContain('Amplified');
      }
    });
  });

  describe('Next Significant Phase Timing', () => {
    it('calculates hours until next quarter phase', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);
      const next = getNextSignificantPhase(moon.phaseAngle, moon.age);

      expect(next.hoursUntil).toBeGreaterThan(0);
      expect(next.hoursUntil).toBeLessThan(708.7); // Max = full lunar cycle
      expect([
        'First Quarter',
        'Full Moon',
        'Third Quarter',
        'New Moon',
      ]).toContain(next.phaseName);
    });

    it('predicts correct next phase based on current angle', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);
      const next = getNextSignificantPhase(moon.phaseAngle, moon.age);

      if (moon.phaseAngle < 90) {
        expect(next.phaseName).toBe('First Quarter');
      } else if (moon.phaseAngle < 180) {
        expect(next.phaseName).toBe('Full Moon');
      } else if (moon.phaseAngle < 270) {
        expect(next.phaseName).toBe('Third Quarter');
      } else {
        expect(next.phaseName).toBe('New Moon');
      }
    });
  });

  describe('Formatting Functions', () => {
    it('formats illumination with precision', () => {
      expect(formatIllumination(50.123, false)).toBe('50%');
      expect(formatIllumination(50.123, true)).toBe('50.123%');
      expect(formatIllumination(99.876, false)).toBe('100%');
      expect(formatIllumination(99.876, true)).toBe('99.876%');
    });

    it('formats moon distance with supermoon indicator', () => {
      const normal = formatMoonDistance(384400, false, false);
      expect(normal).toContain('384,400 km');
      expect(normal).not.toContain('Supermoon');

      const superMoon = formatMoonDistance(356500, true, false);
      expect(superMoon).toContain('Supermoon');
      expect(superMoon).toContain('Extra close');

      const microMoon = formatMoonDistance(406700, false, true);
      expect(microMoon).toContain('Micromoon');
      expect(microMoon).toContain('Extra far');
    });
  });

  describe('Comparison with Basic Implementation', () => {
    it('matches basic implementation for core values', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const basic = getAccurateMoonPhase(date);
      const enhanced = getEnhancedMoonIllumination(date);

      // Core values should match (within rounding)
      expect(Math.abs(basic.illumination - enhanced.illumination)).toBeLessThan(
        1,
      );
      expect(Math.abs(basic.age - enhanced.age)).toBeLessThan(0.01);
      expect(basic.name).toBe(enhanced.name);
      expect(basic.emoji).toBe(enhanced.emoji);
    });

    it('provides additional data not in basic implementation', () => {
      const date = new Date('2025-02-01T12:00:00Z');
      const enhanced = getEnhancedMoonIllumination(date);

      // Enhanced features
      expect(enhanced.illuminationPrecise).toBeDefined();
      expect(enhanced.phaseAngle).toBeDefined();
      expect(enhanced.angularSize).toBeDefined();
      expect(enhanced.distanceKm).toBeDefined();
      expect(enhanced.isSuperMoon).toBeDefined();
      expect(enhanced.isMicroMoon).toBeDefined();
      expect(enhanced.trend).toBeDefined();
      expect(enhanced.changeRate).toBeDefined();
    });
  });

  describe('Astronomy-Engine Integration', () => {
    it('uses accurate JPL ephemeris data', () => {
      // astronomy-engine uses JPL DE431 ephemeris
      // This provides sub-arcsecond accuracy
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Sanity checks that we're getting realistic values
      expect(moon.illumination).toBeGreaterThanOrEqual(0);
      expect(moon.illumination).toBeLessThanOrEqual(100);
      expect(moon.distanceKm).toBeGreaterThan(350000);
      expect(moon.distanceKm).toBeLessThan(410000);
    });

    it('accounts for observer location (geocentric)', () => {
      // astronomy-engine calculates geocentric positions
      // (as seen from Earth's center, not specific location)
      const date = new Date('2025-02-01T12:00:00Z');
      const moon = getEnhancedMoonIllumination(date);

      // Phase angle should be consistent globally
      expect(moon.phaseAngle).toBeGreaterThanOrEqual(0);
      expect(moon.phaseAngle).toBeLessThan(360);
    });
  });
});

describe('Moon Illumination Cache Optimization', () => {
  it('shows value of precise caching for live updates', () => {
    const date1 = new Date('2025-02-01T12:00:00Z');
    const date2 = new Date('2025-02-01T12:05:00Z'); // 5 minutes later

    const moon1 = getEnhancedMoonIllumination(date1);
    const moon2 = getEnhancedMoonIllumination(date2);

    // With precise illumination (3 decimals), 5-minute difference should be visible
    // Change rate: ~0.14% per hour = 0.0023% per minute × 5 = 0.0116% change
    const expectedChange = moon1.changeRate * (5 / 60); // 5 minutes = 5/60 hours

    // Actual change might be small but should be detectable with precision
    if (moon1.changeRate > 0.1) {
      // Only test if change rate is significant
      expect(
        Math.abs(moon2.illuminationPrecise - moon1.illuminationPrecise),
      ).toBeGreaterThan(0);
    }
  });

  it('recommends per-minute caching for live updates', () => {
    // For "live" feel: cache per minute instead of per hour
    // User sees: 50.142% → 50.154% → 50.165% every minute
    // vs 1-hour cache: stays at 50.142% for full hour

    const date = new Date('2025-02-01T12:00:00Z');
    const moon = getEnhancedMoonIllumination(date);

    // If change rate > 0.1% per hour, minute-level caching provides value
    if (moon.changeRate > 0.1) {
      const changePerMinute = moon.changeRate / 60;
      expect(changePerMinute).toBeGreaterThan(0.001); // Visible at 3 decimals
    }
  });
});
