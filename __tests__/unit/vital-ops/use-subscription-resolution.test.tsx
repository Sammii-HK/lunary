/**
 * @jest-environment jsdom
 *
 * VITAL OP - useSubscription tier RESOLUTION (the hook every gated surface reads).
 *
 * src/hooks/useSubscription.ts turns the user's (status, plan, trialEndsAt)
 * into { isSubscribed, isTrialActive, plan, hasAccess, showUpgradePrompt }.
 * Every paywall / FeatureGate / CTA in the app branches on this. It must:
 *   - DENY paid features to a free or anonymous user (the privacy/revenue line);
 *   - treat cancelled / past_due as NOT subscribed (no entitlement);
 *   - normalise a raw 'monthly'/'yearly' plan onto the right plan state;
 *   - fail closed while loading (no entitlement leaks before data arrives).
 *
 * We mock useUser directly so the hook is tested in ISOLATION (the provider's
 * own behaviour is already covered by user-context-paying-downgrade.test.tsx,
 * which this file does NOT duplicate — that test pins the transient-failure
 * downgrade GUARD and the paying-grant path; this file pins the free DENY path,
 * the cancelled/past_due resolution, plan-state normalisation, and the
 * documented status-trusting invariant around trialEndsAt). No network/DB.
 */
import { renderHook } from '@testing-library/react';

// Mock the only dependency of useSubscription: useUser from UserContext.
const mockUseUser = jest.fn();
jest.mock('@/context/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

import { useSubscription } from '@/hooks/useSubscription';

function withUser(user: any, loading = false) {
  mockUseUser.mockReturnValue({ user, loading });
  return renderHook(() => useSubscription()).result.current;
}

afterEach(() => {
  mockUseUser.mockReset();
});

// ---------------------------------------------------------------------------
// Free / anonymous: the entitlement floor. A free user must be denied every
// personalised / paid feature and be shown the upgrade prompt.
// ---------------------------------------------------------------------------
describe('VITAL useSubscription - free & anonymous resolve to no entitlement', () => {
  it('an anonymous (no user) caller is not subscribed and is DENIED paid features', () => {
    const sub = withUser(null);
    expect(sub.isSubscribed).toBe(false);
    expect(sub.isTrialActive).toBe(false);
    expect(sub.status).toBe('free');
    expect(sub.plan).toBe('free');
    expect(sub.showUpgradePrompt).toBe(true);
    // The privacy line: a paid/personalised feature must be denied.
    expect(sub.hasAccess('personalized_horoscope')).toBe(false);
    expect(sub.hasAccess('unlimited_ai_chat')).toBe(false);
    // ...but generic free content is allowed.
    expect(sub.hasAccess('general_horoscope')).toBe(true);
    expect(sub.hasAccess('moon_phases')).toBe(true);
  });

  it('an explicit free user is denied paid features and prompted to upgrade', () => {
    const sub = withUser({
      subscriptionStatus: 'free',
      subscriptionPlan: 'free',
    });
    expect(sub.isSubscribed).toBe(false);
    expect(sub.showUpgradePrompt).toBe(true);
    expect(sub.hasAccess('personal_tarot')).toBe(false);
    expect(sub.hasAccess('general_tarot')).toBe(true);
  });

  it('while LOADING, fails closed: not subscribed and hasAccess denies everything', () => {
    const sub = withUser(undefined, true);
    expect(sub.loading).toBe(true);
    expect(sub.isSubscribed).toBe(false);
    // No entitlement may leak before the real subscription state has loaded.
    expect(sub.hasAccess('general_horoscope')).toBe(false);
    expect(sub.hasAccess('personalized_horoscope')).toBe(false);
    expect(sub.showUpgradePrompt).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Cancelled / past_due: NOT subscribed. These statuses must not grant Pro.
// ---------------------------------------------------------------------------
describe('VITAL useSubscription - cancelled & past_due grant no entitlement', () => {
  it('a cancelled user is not subscribed and is denied paid features', () => {
    const sub = withUser({
      subscriptionStatus: 'cancelled',
      subscriptionPlan: 'lunary_plus_ai',
    });
    expect(sub.isSubscribed).toBe(false);
    expect(sub.isTrialActive).toBe(false);
    expect(sub.hasAccess('unlimited_ai_chat')).toBe(false);
    expect(sub.hasAccess('personalized_horoscope')).toBe(false);
    // Cancelled users are intentionally NOT nagged with the upgrade prompt.
    expect(sub.showUpgradePrompt).toBe(false);
  });

  it('a past_due user is not subscribed and is denied paid features', () => {
    const sub = withUser({
      subscriptionStatus: 'past_due',
      subscriptionPlan: 'lunary_plus_ai',
    });
    expect(sub.isSubscribed).toBe(false);
    expect(sub.hasAccess('weekly_reports')).toBe(false);
    expect(sub.hasAccess('personal_tarot')).toBe(false);
    // past_due is still promptable (re-engage to fix payment).
    expect(sub.showUpgradePrompt).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Paid resolution + plan-state normalisation. Confirms the hook maps the plan
// id onto the correct plan state AND the correct FEATURE_ACCESS list.
// ---------------------------------------------------------------------------
describe('VITAL useSubscription - paid resolution and plan-state mapping', () => {
  it('active Plus is subscribed (monthly state) with Plus features but NOT Pro features', () => {
    const sub = withUser({
      subscriptionStatus: 'active',
      subscriptionPlan: 'lunary_plus',
    });
    expect(sub.isSubscribed).toBe(true);
    expect(sub.plan).toBe('monthly');
    expect(sub.showUpgradePrompt).toBe(false);
    expect(sub.hasAccess('personalized_horoscope')).toBe(true);
    // Tier boundary holds through the hook: Plus cannot reach Pro-only AI.
    expect(sub.hasAccess('unlimited_ai_chat')).toBe(false);
  });

  it('active Pro (annual) is subscribed (yearly state) with the full AI suite', () => {
    const sub = withUser({
      subscriptionStatus: 'active',
      subscriptionPlan: 'lunary_plus_ai_annual',
    });
    expect(sub.isSubscribed).toBe(true);
    expect(sub.plan).toBe('yearly');
    expect(sub.hasAccess('unlimited_ai_chat')).toBe(true);
    expect(sub.hasAccess('yearly_forecast')).toBe(true);
  });

  it('normalises a raw "monthly" plan string to the monthly plan state', () => {
    const sub = withUser({
      subscriptionStatus: 'active',
      subscriptionPlan: 'monthly',
    });
    expect(sub.plan).toBe('monthly');
    expect(sub.isSubscribed).toBe(true);
  });

  it('normalises a raw "yearly" plan string to the yearly plan state with AI access', () => {
    const sub = withUser({
      subscriptionStatus: 'active',
      subscriptionPlan: 'yearly',
    });
    expect(sub.plan).toBe('yearly');
    // raw 'yearly' maps to the annual Pro entitlements.
    expect(sub.hasAccess('unlimited_ai_chat')).toBe(true);
  });

  it('defaults a paying user with NO plan to the free plan state but still subscribed', () => {
    // status active but plan missing: isSubscribed is driven by status, and the
    // plan state falls back to free. (Documents the status-led resolution.)
    const sub = withUser({ subscriptionStatus: 'active' });
    expect(sub.isSubscribed).toBe(true);
    expect(sub.plan).toBe('free');
  });
});

// ---------------------------------------------------------------------------
// Trial resolution + the trialEndsAt / status relationship.
// ---------------------------------------------------------------------------
describe('VITAL useSubscription - trial resolution and day count', () => {
  const FIXED_NOW = new Date('2026-01-14T12:00:00Z');
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('a trialing user is subscribed, trial-active, and reports days remaining', () => {
    const sub = withUser({
      subscriptionStatus: 'trial',
      subscriptionPlan: 'lunary_plus_ai',
      trialEndsAt: '2026-01-19T12:00:00Z', // 5 days out
    });
    expect(sub.isSubscribed).toBe(true);
    expect(sub.isTrialActive).toBe(true);
    expect(sub.trialDaysRemaining).toBe(5);
    expect(sub.hasAccess('unlimited_ai_chat')).toBe(true);
    expect(sub.showUpgradePrompt).toBe(false);
  });

  it('a trial with a missing end date falls back to a positive trial length (never 0/locked)', () => {
    const sub = withUser({
      subscriptionStatus: 'trial',
      subscriptionPlan: 'lunary_plus',
      // no trialEndsAt
    });
    expect(sub.isTrialActive).toBe(true);
    // monthly fallback is 7 days; the user is not accidentally shown 0 days.
    expect(sub.trialDaysRemaining).toBeGreaterThan(0);
  });

  it('INVARIANT: the hook trusts status, NOT trialEndsAt — a stale "trial" row with a PAST end date still resolves as subscribed', () => {
    // This pins the actual (status-led) behaviour: useSubscription keys
    // isSubscribed off status === 'trial' and does NOT re-check trialEndsAt
    // against the clock. The post-expiry DOWNGRADE is therefore the backend's
    // job (the daily-posts cron flips status 'trial' -> 'free' once the trial
    // has ended). If that downgrade is ever skipped, this hook keeps the user
    // on Pro. Pinned so any future change to either side is a conscious one.
    const sub = withUser({
      subscriptionStatus: 'trial',
      subscriptionPlan: 'lunary_plus_ai',
      trialEndsAt: '2026-01-01T12:00:00Z', // already in the PAST vs FIXED_NOW
    });
    expect(sub.isSubscribed).toBe(true);
    expect(sub.isTrialActive).toBe(true);
    // trialDaysRemaining DOES honour the clock and clamps to 0...
    // ...but the fallback kicks in (|| fallbackTrialDays) because 0 is falsy,
    // so it reports the fallback length rather than 0. Documented here so the
    // divergence between "days shown" and "is actually expired" is explicit.
    expect(sub.trialDaysRemaining).toBeGreaterThan(0);
    // Entitlement still granted because status is 'trial'. This is the gap a
    // missed downgrade would expose; it is NOT re-validated against the date.
    expect(sub.hasAccess('unlimited_ai_chat')).toBe(true);
  });
});
