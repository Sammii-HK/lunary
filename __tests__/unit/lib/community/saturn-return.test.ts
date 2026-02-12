import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  isInSaturnReturn,
  getCurrentWeeklyTheme,
} from '@/lib/community/saturn-return';

describe('isInSaturnReturn', () => {
  // Pin "today" so tests don't drift
  const realDate = Date;
  const fakeNow = new Date('2026-06-15T12:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fakeNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns true for age 27', () => {
    // Born 1999-01-01 → age 27 on 2026-06-15
    expect(isInSaturnReturn('1999-01-01')).toBe(true);
  });

  it('returns true for age 28', () => {
    expect(isInSaturnReturn('1998-01-01')).toBe(true);
  });

  it('returns true for age 29', () => {
    expect(isInSaturnReturn('1997-01-01')).toBe(true);
  });

  it('returns true for age 30', () => {
    expect(isInSaturnReturn('1996-01-01')).toBe(true);
  });

  it('returns false for age 26', () => {
    expect(isInSaturnReturn('2000-01-01')).toBe(false);
  });

  it('returns false for age 31', () => {
    expect(isInSaturnReturn('1995-01-01')).toBe(false);
  });

  it('returns false for null birthday', () => {
    expect(isInSaturnReturn(null)).toBe(false);
  });

  it('returns false for invalid date string', () => {
    expect(isInSaturnReturn('not-a-date')).toBe(false);
  });

  it('accepts Date objects', () => {
    expect(isInSaturnReturn(new Date('1998-06-15'))).toBe(true);
  });

  it('handles birthday not yet passed in current year', () => {
    // Born 1998-12-25 → hasn't turned 28 yet on 2026-06-15
    expect(isInSaturnReturn('1998-12-25')).toBe(true); // age 27
  });
});

describe('getCurrentWeeklyTheme', () => {
  it('returns a theme from metadata', () => {
    const metadata = {
      weekly_themes: [
        'Structure & Boundaries',
        'Career & Purpose',
        'Relationships & Commitment',
        'Health & Discipline',
        'Identity & Authenticity',
        'Legacy & Responsibility',
        'Integration & Wisdom',
      ],
    };

    const result = getCurrentWeeklyTheme(metadata);
    expect(result).not.toBeNull();
    expect(result!.theme).toBeTruthy();
    expect(result!.weekIndex).toBeGreaterThanOrEqual(0);
    expect(result!.weekIndex).toBeLessThan(7);
    expect(metadata.weekly_themes).toContain(result!.theme);
  });

  it('returns null for null metadata', () => {
    expect(getCurrentWeeklyTheme(null)).toBeNull();
  });

  it('returns null for undefined metadata', () => {
    expect(getCurrentWeeklyTheme(undefined)).toBeNull();
  });

  it('returns null for empty themes array', () => {
    expect(getCurrentWeeklyTheme({ weekly_themes: [] })).toBeNull();
  });

  it('returns null for missing weekly_themes key', () => {
    expect(getCurrentWeeklyTheme({} as any)).toBeNull();
  });
});
