/**
 * Tests for weekly numerology calculation
 * Ensures the universal week number is calculated correctly and consistently
 */

// Extract the calculation logic for testing
function calculateUniversalWeekNumber(date: Date): number {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  let sum = day + month;

  const yearStr = year.toString();
  for (const digit of yearStr) {
    sum += parseInt(digit, 10);
  }

  while (sum > 9) {
    let newSum = 0;
    const sumStr = sum.toString();
    for (const digit of sumStr) {
      newSum += parseInt(digit, 10);
    }
    sum = newSum;
  }

  return sum || 9;
}

describe('Weekly Numerology Calculation', () => {
  describe('calculateUniversalWeekNumber', () => {
    it('should reduce to a single digit between 1-9', () => {
      const testDates = [
        new Date('2025-01-01'),
        new Date('2025-06-15'),
        new Date('2025-12-31'),
        new Date('2024-02-29'), // Leap year
      ];

      testDates.forEach((date) => {
        const result = calculateUniversalWeekNumber(date);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(9);
      });
    });

    it('should return consistent results for the same date', () => {
      const date = new Date('2025-03-15');
      const result1 = calculateUniversalWeekNumber(date);
      const result2 = calculateUniversalWeekNumber(date);

      expect(result1).toBe(result2);
    });

    it('should calculate correctly for known dates', () => {
      // January 1, 2025: 1 + 1 + 2 + 0 + 2 + 5 = 11 -> 1 + 1 = 2
      expect(calculateUniversalWeekNumber(new Date('2025-01-01'))).toBe(2);

      // December 31, 2025: 31 + 12 + 2 + 0 + 2 + 5 = 52 -> 5 + 2 = 7
      expect(calculateUniversalWeekNumber(new Date('2025-12-31'))).toBe(7);

      // June 15, 2025: 15 + 6 + 2 + 0 + 2 + 5 = 30 -> 3 + 0 = 3
      expect(calculateUniversalWeekNumber(new Date('2025-06-15'))).toBe(3);
    });

    it('should handle edge cases', () => {
      // Very old date
      const oldDate = new Date('1990-01-01');
      const oldResult = calculateUniversalWeekNumber(oldDate);
      expect(oldResult).toBeGreaterThanOrEqual(1);
      expect(oldResult).toBeLessThanOrEqual(9);

      // Future date
      const futureDate = new Date('2030-12-25');
      const futureResult = calculateUniversalWeekNumber(futureDate);
      expect(futureResult).toBeGreaterThanOrEqual(1);
      expect(futureResult).toBeLessThanOrEqual(9);
    });

    it('should never return 0', () => {
      // Test many dates to ensure we never get 0
      for (let i = 1; i <= 31; i++) {
        for (let m = 1; m <= 12; m++) {
          const date = new Date(2025, m - 1, Math.min(i, 28));
          const result = calculateUniversalWeekNumber(date);
          expect(result).not.toBe(0);
        }
      }
    });

    it('should handle different years consistently', () => {
      // Same day/month in different years should potentially give different results
      const date2024 = new Date('2024-05-10');
      const date2025 = new Date('2025-05-10');
      const date2026 = new Date('2026-05-10');

      // Each should be valid
      [date2024, date2025, date2026].forEach((date) => {
        const result = calculateUniversalWeekNumber(date);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(9);
      });
    });
  });
});
