/**
 * @jest-environment node
 *
 * VITAL OP #3 - Trial logic (start / days-remaining / ended) and the gates
 * that flip when a trial is active vs expired.
 *
 * Source: utils/pricing.ts (getTrialDaysRemaining, isTrialExpired,
 * hasDateAccess, hasFeatureAccess).
 *
 * Existing __tests__/unit/utils/pricing.test.ts only covers the 3-day
 * happy path of getTrialDaysRemaining. These tests add the uncovered
 * boundaries, the entirely-untested isTrialExpired and hasDateAccess
 * (calendar paywall), and the trial -> paid gate flip. No network/DB.
 */
import {
  getTrialDaysRemaining,
  isTrialExpired,
  hasDateAccess,
  hasFeatureAccess,
} from '../../../utils/pricing';

const FIXED_NOW = new Date('2026-01-14T12:00:00Z');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('VITAL #3 trial - getTrialDaysRemaining', () => {
  it('returns 0 when no trial end date is set', () => {
    expect(getTrialDaysRemaining(undefined)).toBe(0);
    expect(getTrialDaysRemaining('')).toBe(0);
  });

  it('returns the ceiling of days remaining mid-trial', () => {
    // 3 days 1 hour out -> ceil -> 4
    expect(getTrialDaysRemaining('2026-01-17T13:00:00Z')).toBe(4);
  });

  it('never returns a negative number once the trial has passed', () => {
    expect(getTrialDaysRemaining('2026-01-10T12:00:00Z')).toBe(0);
  });

  it('returns 0 at the exact instant the trial ends', () => {
    expect(getTrialDaysRemaining('2026-01-14T12:00:00Z')).toBe(0);
  });

  it('counts a trial ending later today as 1 day (rounds up partial day)', () => {
    expect(getTrialDaysRemaining('2026-01-14T18:00:00Z')).toBe(1);
  });
});

describe('VITAL #3 trial - isTrialExpired', () => {
  it('is not expired when no end date exists (no trial started)', () => {
    expect(isTrialExpired(undefined)).toBe(false);
    expect(isTrialExpired('')).toBe(false);
  });

  it('is not expired while the end date is in the future', () => {
    expect(isTrialExpired('2026-01-20T12:00:00Z')).toBe(false);
  });

  it('is expired once the end date is in the past', () => {
    expect(isTrialExpired('2026-01-13T12:00:00Z')).toBe(true);
  });

  it('agrees with getTrialDaysRemaining at the boundary', () => {
    const past = '2026-01-13T12:00:00Z';
    expect(isTrialExpired(past)).toBe(true);
    expect(getTrialDaysRemaining(past)).toBe(0);
  });
});

describe('VITAL #3 trial - gates flip on trial status', () => {
  it('a trialing user gets Pro entitlements (gate open)', () => {
    expect(
      hasFeatureAccess('trial', 'lunary_plus_ai', 'unlimited_ai_chat'),
    ).toBe(true);
  });

  it('a free user (trial ended, downgraded) loses Pro entitlements (gate shut)', () => {
    expect(
      hasFeatureAccess('free', 'lunary_plus_ai', 'unlimited_ai_chat'),
    ).toBe(false);
  });
});

describe('VITAL #3 trial - hasDateAccess calendar gate (paywall cap)', () => {
  const today = new Date('2026-01-14T09:00:00Z');
  const sevenDaysAgo = new Date('2026-01-07T09:00:00Z');
  const eightDaysAgo = new Date('2026-01-06T09:00:00Z');
  const future = new Date('2026-02-01T09:00:00Z');

  it('lets a trialing user reach any date (full calendar)', () => {
    expect(hasDateAccess(eightDaysAgo, 'trial')).toBe(true);
    expect(hasDateAccess(future, 'trial')).toBe(true);
  });

  it('lets an active subscriber reach any date', () => {
    expect(hasDateAccess(eightDaysAgo, 'active')).toBe(true);
    expect(hasDateAccess(future, 'active')).toBe(true);
  });

  it('also honours the raw Stripe "trialing" status', () => {
    expect(hasDateAccess(eightDaysAgo, 'trialing')).toBe(true);
  });

  it('limits a free user to today and the previous 7 days', () => {
    expect(hasDateAccess(today, 'free')).toBe(true);
    expect(hasDateAccess(sevenDaysAgo, 'free')).toBe(true);
  });

  it('blocks a free user from dates older than 7 days', () => {
    expect(hasDateAccess(eightDaysAgo, 'free')).toBe(false);
  });

  it('blocks a free user from future dates', () => {
    expect(hasDateAccess(future, 'free')).toBe(false);
  });

  it('treats undefined status as free (fail closed)', () => {
    expect(hasDateAccess(eightDaysAgo, undefined)).toBe(false);
    expect(hasDateAccess(today, undefined)).toBe(true);
  });
});
