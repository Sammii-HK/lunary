/**
 * Retrograde Detection Tests
 *
 * Tests the wraparound-safe retrograde detection logic used in both
 * astrology.ts (main planets) and birthChart.ts (minor bodies).
 */

import { normalizeDegrees } from 'utils/astrology/birthChart';

// Mirror the retrograde detection logic from astrology.ts
function isRetrograde(currentLong: number, previousLong: number): boolean {
  const forwardMotion = (((currentLong - previousLong) % 360) + 360) % 360;
  return forwardMotion > 180;
}

describe('Retrograde detection', () => {
  it('detects normal direct motion (e.g., 10° to 11°)', () => {
    expect(isRetrograde(11, 10)).toBe(false);
  });

  it('detects normal retrograde motion (e.g., 15° to 14°)', () => {
    expect(isRetrograde(14, 15)).toBe(true);
  });

  it('handles forward motion crossing 0° Aries (359° to 1°) — NOT retrograde', () => {
    // This is the critical edge case that was previously broken
    expect(isRetrograde(1, 359)).toBe(false);
  });

  it('handles backward motion crossing 0° Aries (1° to 359°) — IS retrograde', () => {
    expect(isRetrograde(359, 1)).toBe(true);
  });

  it('handles large forward motion (e.g., Moon: 0° to 13°)', () => {
    expect(isRetrograde(13, 0)).toBe(false);
  });

  it('handles stationary planet (same position)', () => {
    // Not technically retrograde — forward motion is 0
    expect(isRetrograde(100, 100)).toBe(false);
  });

  it('handles forward motion just under 180°', () => {
    expect(isRetrograde(179, 0)).toBe(false);
  });

  it('handles backward motion just over 180°', () => {
    expect(isRetrograde(0, 179)).toBe(true);
  });
});

describe('normalizeDegrees', () => {
  it('normalizes positive degrees within range', () => {
    expect(normalizeDegrees(45)).toBe(45);
  });

  it('normalizes 360 to 0', () => {
    expect(normalizeDegrees(360)).toBeCloseTo(0);
  });

  it('normalizes values over 360', () => {
    expect(normalizeDegrees(400)).toBeCloseTo(40);
  });

  it('normalizes negative degrees', () => {
    expect(normalizeDegrees(-10)).toBeCloseTo(350);
  });

  it('normalizes large negative degrees', () => {
    expect(normalizeDegrees(-370)).toBeCloseTo(350);
  });

  it('normalizes 0', () => {
    expect(normalizeDegrees(0)).toBe(0);
  });
});
