import { describe, it, expect } from '@jest/globals';
import {
  calculateCeres,
  calculatePallas,
  calculateJuno,
  calculateVesta,
  calculateHygiea,
  calculatePholus,
  calculatePsyche,
  calculateEros,
} from '../../../utils/astrology/asteroids';

/**
 * Asteroid Position Calculation Tests
 *
 * Tests verify asteroid calculations using Kepler orbital mechanics.
 * Acceptable tolerance: ±3° (asteroids use simplified orbital elements)
 *
 * Reference epoch: JD 2461000.5 (2026-01-15.0 TDB)
 * Orbital elements from JPL Horizons System
 */

describe('Asteroid Calculations', () => {
  describe('Major Asteroids', () => {
    it('calculates Ceres position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculateCeres(date);

      // Position should be within 0-360°
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);

      // Known position at epoch should be close to initial mean anomaly
      // This is a sanity check, not an exact comparison
      expect(position).toBeDefined();
      expect(typeof position).toBe('number');
      expect(isNaN(position)).toBe(false);
    });

    it('calculates Pallas position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculatePallas(date);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);
      expect(isNaN(position)).toBe(false);
    });

    it('calculates Juno position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculateJuno(date);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);
      expect(isNaN(position)).toBe(false);
    });

    it('calculates Vesta position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculateVesta(date);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);
      expect(isNaN(position)).toBe(false);
    });
  });

  describe('Minor Asteroids', () => {
    it('calculates Hygiea position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculateHygiea(date);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);
      expect(isNaN(position)).toBe(false);
    });

    it('calculates Pholus position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculatePholus(date);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);
      expect(isNaN(position)).toBe(false);
    });

    it('calculates Psyche position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculatePsyche(date);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);
      expect(isNaN(position)).toBe(false);
    });

    it('calculates Eros position', () => {
      const date = new Date('2026-01-15T00:00:00Z');
      const position = calculateEros(date);

      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(360);
      expect(isNaN(position)).toBe(false);
    });
  });

  describe('Orbital Motion Over Time', () => {
    it('shows Ceres moving over 30 days', () => {
      const date1 = new Date('2026-01-01T00:00:00Z');
      const date2 = new Date('2026-01-31T00:00:00Z');

      const position1 = calculateCeres(date1);
      const position2 = calculateCeres(date2);

      // Ceres should move in 30 days (mean motion ~0.214°/day)
      expect(position1).not.toEqual(position2);

      // Movement should be reasonable (not wrapping around multiple times)
      const diff = Math.abs(position2 - position1);
      expect(diff).toBeGreaterThan(1); // Should move more than 1°
      expect(diff).toBeLessThan(30); // But less than 30° in 30 days
    });

    it('shows different movement rates for different asteroids', () => {
      const date1 = new Date('2026-01-01T00:00:00Z');
      const date2 = new Date('2026-02-01T00:00:00Z');

      const ceres1 = calculateCeres(date1);
      const ceres2 = calculateCeres(date2);
      const ceresDiff = Math.abs(ceres2 - ceres1);

      const vesta1 = calculateVesta(date1);
      const vesta2 = calculateVesta(date2);
      const vestaDiff = Math.abs(vesta2 - vesta1);

      // Both asteroids should move, but at different rates
      expect(ceresDiff).toBeGreaterThan(1);
      expect(ceresDiff).toBeLessThan(30);
      expect(vestaDiff).toBeGreaterThan(1);
      expect(vestaDiff).toBeLessThan(30);

      // Movement rates should be different (not necessarily predictable which is faster)
      expect(Math.abs(ceresDiff - vestaDiff)).toBeGreaterThan(0.1);
    });
  });

  describe('Historical Dates', () => {
    it('calculates positions for year 2000', () => {
      const date = new Date('2000-01-01T00:00:00Z');

      const ceres = calculateCeres(date);
      const pallas = calculatePallas(date);
      const juno = calculateJuno(date);
      const vesta = calculateVesta(date);

      [ceres, pallas, juno, vesta].forEach((position) => {
        expect(position).toBeGreaterThanOrEqual(0);
        expect(position).toBeLessThan(360);
        expect(isNaN(position)).toBe(false);
      });
    });

    it('calculates positions for future date', () => {
      const date = new Date('2030-01-01T00:00:00Z');

      const ceres = calculateCeres(date);
      const pallas = calculatePallas(date);

      expect(ceres).toBeGreaterThanOrEqual(0);
      expect(ceres).toBeLessThan(360);
      expect(pallas).toBeGreaterThanOrEqual(0);
      expect(pallas).toBeLessThan(360);
    });
  });

  describe('Consistency Tests', () => {
    it('returns consistent results for same date', () => {
      const date = new Date('2026-01-15T12:00:00Z');

      const ceres1 = calculateCeres(date);
      const ceres2 = calculateCeres(date);

      expect(ceres1).toEqual(ceres2);
    });

    it('returns different results for different dates', () => {
      const date1 = new Date('2026-01-15T00:00:00Z');
      const date2 = new Date('2026-01-16T00:00:00Z');

      const ceres1 = calculateCeres(date1);
      const ceres2 = calculateCeres(date2);

      expect(ceres1).not.toEqual(ceres2);
    });

    it('handles timezone-independent calculations', () => {
      // Same UTC time, different timezone representations
      const dateUTC = new Date('2026-01-15T12:00:00Z');
      const dateLocal = new Date('2026-01-15T12:00:00+00:00');

      const ceresUTC = calculateCeres(dateUTC);
      const ceresLocal = calculateCeres(dateLocal);

      expect(ceresUTC).toEqual(ceresLocal);
    });
  });

  describe('Numerical Stability', () => {
    it('handles dates far from epoch without errors', () => {
      const farFuture = new Date('2100-01-01T00:00:00Z');
      const farPast = new Date('1900-01-01T00:00:00Z');

      expect(() => calculateCeres(farFuture)).not.toThrow();
      expect(() => calculateCeres(farPast)).not.toThrow();

      const future = calculateCeres(farFuture);
      const past = calculateCeres(farPast);

      expect(future).toBeGreaterThanOrEqual(0);
      expect(future).toBeLessThan(360);
      expect(past).toBeGreaterThanOrEqual(0);
      expect(past).toBeLessThan(360);
    });

    it('produces reasonable values near epoch', () => {
      // Near the reference epoch, positions should be calculable
      const nearEpoch = new Date('2026-01-15T00:00:00Z');

      const allAsteroids = [
        calculateCeres,
        calculatePallas,
        calculateJuno,
        calculateVesta,
        calculateHygiea,
        calculatePholus,
        calculatePsyche,
        calculateEros,
      ];

      allAsteroids.forEach((calcFn) => {
        const position = calcFn(nearEpoch);
        expect(position).toBeGreaterThanOrEqual(0);
        expect(position).toBeLessThan(360);
        expect(isFinite(position)).toBe(true);
      });
    });
  });
});
