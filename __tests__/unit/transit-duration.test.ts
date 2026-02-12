/**
 * Tests for transit milestone duration formatting edge cases
 *
 * Validates that the duration label logic never produces
 * "0-month" or "1-month" for short transits.
 */

describe('Transit milestone duration formatting', () => {
  /**
   * Mirrors the logic in daily-posts/route.ts for the halfway milestone
   * duration label calculation.
   */
  function getDurationLabel(totalDays: number): string {
    const transitYears = Math.round(totalDays / 365);
    const transitMonths = Math.round(totalDays / 30);

    if (transitYears >= 1) return `${transitYears}-year`;
    if (transitMonths >= 2) return `${transitMonths}-month`;
    if (totalDays >= 14) return `${Math.round(totalDays / 7)}-week`;
    return `${totalDays}-day`;
  }

  it('should format multi-year transits as years', () => {
    expect(getDurationLabel(730)).toBe('2-year');
    expect(getDurationLabel(4380)).toBe('12-year');
    expect(getDurationLabel(365)).toBe('1-year');
  });

  it('should format multi-month transits as months', () => {
    expect(getDurationLabel(90)).toBe('3-month');
    expect(getDurationLabel(60)).toBe('2-month');
    expect(getDurationLabel(180)).toBe('6-month');
  });

  it('should format short transits as weeks when >= 14 days', () => {
    expect(getDurationLabel(30)).toBe('4-week');
    expect(getDurationLabel(21)).toBe('3-week');
    expect(getDurationLabel(14)).toBe('2-week');
  });

  it('should format very short transits as days when < 14 days', () => {
    expect(getDurationLabel(10)).toBe('10-day');
    expect(getDurationLabel(7)).toBe('7-day');
    expect(getDurationLabel(3)).toBe('3-day');
  });

  it('should never produce 0-month or 1-month labels', () => {
    // These are the edge cases that triggered the bug
    for (let days = 1; days <= 44; days++) {
      const label = getDurationLabel(days);
      expect(label).not.toMatch(/^0-month/);
      expect(label).not.toMatch(/^1-month/);
    }
  });
});
