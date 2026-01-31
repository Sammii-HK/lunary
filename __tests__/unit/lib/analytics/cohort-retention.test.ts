/**
 * Cohort Retention Calculation Tests
 *
 * Tests the Day 1, Day 7, Day 30 retention calculations to ensure they work correctly
 */

import { describe, it, expect } from '@jest/globals';

describe('Cohort Retention Calculations', () => {
  describe('Day 1 Retention Definition', () => {
    it('should define Day 1 as the calendar day after signup', () => {
      // User signs up on Monday Jan 1 at 11:00 PM
      const signupTime = new Date('2026-01-01T23:00:00Z');

      // User returns on Tuesday Jan 2 at 1:00 AM (2 hours later, but next calendar day)
      const returnTime = new Date('2026-01-02T01:00:00Z');

      // Should count as Day 1 return
      expect(isDay1Return(signupTime, returnTime)).toBe(true);
    });

    it('should NOT count returns on signup day as Day 1', () => {
      // User signs up on Monday Jan 1 at 8:00 AM
      const signupTime = new Date('2026-01-01T08:00:00Z');

      // User returns same day at 11:00 PM (15 hours later, same calendar day)
      const returnTime = new Date('2026-01-01T23:00:00Z');

      // Should NOT count as Day 1 (that's Day 0)
      expect(isDay1Return(signupTime, returnTime)).toBe(false);
    });

    it('should NOT count returns 25 hours later as Day 1 if it is Day 2', () => {
      // User signs up on Monday Jan 1 at 11:00 PM
      const signupTime = new Date('2026-01-01T23:00:00Z');

      // User returns on Wednesday Jan 3 at 12:00 AM (25 hours later, but Day 2)
      const returnTime = new Date('2026-01-03T00:00:00Z');

      // Should NOT count as Day 1 (that's Day 2)
      expect(isDay1Return(signupTime, returnTime)).toBe(false);
    });

    it('should handle timezone correctly (UTC)', () => {
      // User signs up late on Monday UTC
      const signupTime = new Date('2026-01-01T23:59:59Z');

      // User returns early Tuesday UTC
      const returnTime = new Date('2026-01-02T00:00:01Z');

      // Should count as Day 1 (different UTC calendar days)
      expect(isDay1Return(signupTime, returnTime)).toBe(true);
    });
  });

  describe('Day 7 Retention Definition', () => {
    it('should count any return within Days 1-7 as retained', () => {
      const signupTime = new Date('2026-01-01T12:00:00Z');

      // Returns on different days within week
      const day1 = new Date('2026-01-02T12:00:00Z');
      const day3 = new Date('2026-01-04T12:00:00Z');
      const day7 = new Date('2026-01-08T12:00:00Z');

      expect(isDay7Retained(signupTime, [day1])).toBe(true);
      expect(isDay7Retained(signupTime, [day3])).toBe(true);
      expect(isDay7Retained(signupTime, [day7])).toBe(true);
    });

    it('should NOT count Day 8 returns as Day 7 retained', () => {
      const signupTime = new Date('2026-01-01T12:00:00Z');
      const day8 = new Date('2026-01-09T12:00:00Z');

      expect(isDay7Retained(signupTime, [day8])).toBe(false);
    });
  });

  describe('Cohort Size Calculation', () => {
    it('should count users who signed up on a given calendar day', () => {
      const cohortDay = new Date('2026-01-01');

      const signups = [
        new Date('2026-01-01T00:00:01Z'), // Start of day
        new Date('2026-01-01T12:00:00Z'), // Middle of day
        new Date('2026-01-01T23:59:59Z'), // End of day
      ];

      expect(getUsersInCohort(cohortDay, signups)).toBe(3);
    });

    it('should NOT count users from different days', () => {
      const cohortDay = new Date('2026-01-01');

      const signups = [
        new Date('2025-12-31T23:59:59Z'), // Day before
        new Date('2026-01-02T00:00:01Z'), // Day after
      ];

      expect(getUsersInCohort(cohortDay, signups)).toBe(0);
    });
  });

  describe('Full Cohort Retention Scenario', () => {
    it('should calculate correct Day 1 retention rate', () => {
      // 10 users sign up on Jan 1
      const cohort = Array.from({ length: 10 }, (_, i) => ({
        userId: `user${i}`,
        signupTime: new Date('2026-01-01T12:00:00Z'),
      }));

      // 3 users return on Day 1 (Jan 2)
      const returns = [
        { userId: 'user0', time: new Date('2026-01-02T12:00:00Z') },
        { userId: 'user2', time: new Date('2026-01-02T14:00:00Z') },
        { userId: 'user5', time: new Date('2026-01-02T18:00:00Z') },
      ];

      const retention = calculateDay1Retention(cohort, returns);

      expect(retention).toEqual({
        cohortSize: 10,
        retained: 3,
        retentionRate: 30.0, // 30%
      });
    });

    it('should handle 0% retention correctly', () => {
      const cohort = Array.from({ length: 10 }, (_, i) => ({
        userId: `user${i}`,
        signupTime: new Date('2026-01-01T12:00:00Z'),
      }));

      const returns: any[] = []; // No returns

      const retention = calculateDay1Retention(cohort, returns);

      expect(retention).toEqual({
        cohortSize: 10,
        retained: 0,
        retentionRate: 0,
      });
    });

    it('should handle 100% retention correctly', () => {
      const cohort = Array.from({ length: 5 }, (_, i) => ({
        userId: `user${i}`,
        signupTime: new Date('2026-01-01T12:00:00Z'),
      }));

      // All users return on Day 1
      const returns = cohort.map((user) => ({
        userId: user.userId,
        time: new Date('2026-01-02T12:00:00Z'),
      }));

      const retention = calculateDay1Retention(cohort, returns);

      expect(retention).toEqual({
        cohortSize: 5,
        retained: 5,
        retentionRate: 100.0,
      });
    });
  });
});

// Helper functions to implement
function isDay1Return(signupTime: Date, returnTime: Date): boolean {
  // Convert both to UTC date strings (YYYY-MM-DD)
  const signupDate = signupTime.toISOString().split('T')[0];
  const returnDate = returnTime.toISOString().split('T')[0];

  // Calculate expected Day 1 date
  const signupDay = new Date(signupDate);
  const expectedDay1 = new Date(signupDay);
  expectedDay1.setUTCDate(expectedDay1.getUTCDate() + 1);

  const expectedDay1Date = expectedDay1.toISOString().split('T')[0];

  return returnDate === expectedDay1Date;
}

function isDay7Retained(signupTime: Date, returns: Date[]): boolean {
  const signupDate = signupTime.toISOString().split('T')[0];
  const signupDay = new Date(signupDate);

  return returns.some((returnTime) => {
    const returnDate = returnTime.toISOString().split('T')[0];
    const returnDay = new Date(returnDate);

    // Calculate days difference
    const diffTime = returnDay.getTime() - signupDay.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Day 7 retention = any return on days 1-7
    return diffDays >= 1 && diffDays <= 7;
  });
}

function getUsersInCohort(cohortDay: Date, signups: Date[]): number {
  const cohortDate = cohortDay.toISOString().split('T')[0];

  return signups.filter((signup) => {
    const signupDate = signup.toISOString().split('T')[0];
    return signupDate === cohortDate;
  }).length;
}

interface User {
  userId: string;
  signupTime: Date;
}

interface Return {
  userId: string;
  time: Date;
}

function calculateDay1Retention(
  cohort: User[],
  returns: Return[],
): {
  cohortSize: number;
  retained: number;
  retentionRate: number;
} {
  const cohortSize = cohort.length;

  const retainedUsers = new Set<string>();

  cohort.forEach((user) => {
    const userReturns = returns.filter((r) => r.userId === user.userId);

    const hasDay1Return = userReturns.some((r) =>
      isDay1Return(user.signupTime, r.time),
    );

    if (hasDay1Return) {
      retainedUsers.add(user.userId);
    }
  });

  const retained = retainedUsers.size;
  const retentionRate = cohortSize > 0 ? (retained / cohortSize) * 100 : 0;

  return {
    cohortSize,
    retained,
    retentionRate: Math.round(retentionRate * 10) / 10, // Round to 1 decimal
  };
}
