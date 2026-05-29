import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import { UserProvider, useUser } from '@/context/UserContext';
import { useSubscription } from '@/hooks/useSubscription';

// ===========================================================================
// Paying-user downgrade protection (regression guard for PR #265 deferred bug)
//
// A transient /api/profile failure — a network blip, a 5xx, or a background
// focus/sync/birth-chart re-fetch — must NEVER strip a paying/trialling user's
// Pro entitlement. Before the fix, the catch block in UserContext synthesised
// a fully-resolved FREE user ({ isPaid: false }) on any error, so once loading
// resolved to false every entitlement consumer (useSubscription.hasAccess,
// CosmicScore detail, the Time Machine date picker) treated the payer as free.
//
// These tests render the real UserProvider, load a paying user, then make a
// subsequent profile fetch fail, and assert the user stays Pro throughout.
// ===========================================================================

// --- Mock the auth layer so the provider sees an authenticated user without
//     touching better-auth. useAuthStatus reads from this module. ---
const mockAuthUser = {
  id: 'user_paying_123',
  email: 'payer@example.com',
  name: 'Paying User',
};

jest.mock('@/components/AuthStatus', () => ({
  useAuthStatus: () => ({
    isAuthenticated: true,
    user: mockAuthUser,
    profile: null,
    loading: false,
  }),
}));

// --- Stub the client-side caches the provider imports (no side effects). ---
jest.mock('@/lib/cache/dailyCache', () => ({
  DailyCache: { clear: jest.fn() },
}));
jest.mock('@/lib/patterns/snapshot/client-cache', () => ({
  ClientCache: { clearAll: jest.fn() },
}));

// --- A paying profile payload (active subscription, monthly AI plan). No
//     birthday, so the birth-chart regeneration effect never fires. ---
const PAYING_PROFILE = {
  profile: {
    name: 'Paying User',
    // intentionally no birthday → skips birth-chart regen effect
    birthChart: [{ body: 'Sun', sign: 'Taurus', degree: 27 }],
    location: {},
  },
  subscription: {
    status: 'active',
    planType: 'lunary_plus_ai',
    stripeCustomerId: 'cus_test_123',
    trialEndsAt: null,
  },
};

function okJson(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

function serverError(): Response {
  return {
    ok: false,
    status: 500,
    json: async () => ({ error: 'boom' }),
  } as Response;
}

/**
 * Routes fetch by URL so the provider's auxiliary effects
 * (subscription sync, focus handler) don't interfere with the
 * assertions. The profile response is controlled by `profileResponder`,
 * which the tests swap mid-run to simulate a transient failure.
 */
function installFetchMock(profileResponder: () => Promise<Response>) {
  const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/profile')) {
      return profileResponder();
    }
    // get-subscription sync: report active so it doesn't trigger extra refetch
    if (url.includes('/api/stripe/get-subscription')) {
      return okJson({ status: 'active' });
    }
    // Any other incidental fetch: benign empty ok.
    return okJson({});
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(UserProvider, null, children);

// Combined consumer: exposes both the raw context and the entitlement hook
// that every gated surface ultimately reads.
function useUserAndSubscription() {
  return { ...useUser(), subscription: useSubscription() };
}

describe('UserContext: paying user is never downgraded on transient profile failure', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads a paying user as Pro with feature access granted', async () => {
    installFetchMock(() => Promise.resolve(okJson(PAYING_PROFILE)));

    const { result } = renderHook(() => useUserAndSubscription(), { wrapper });

    await waitFor(() => expect(result.current.user?.isPaid).toBe(true));

    expect(result.current.user?.subscriptionStatus).toBe('active');
    expect(result.current.user?.subscriptionPlan).toBe('lunary_plus_ai');
    expect(result.current.subscription.isSubscribed).toBe(true);
    expect(result.current.subscription.showUpgradePrompt).toBe(false);
    // personalized_horoscope is a paid-only feature; a free user is denied it.
    expect(
      result.current.subscription.hasAccess('personalized_horoscope'),
    ).toBe(true);
  });

  it('KEEPS the user Pro when a later profile refetch fails (network/5xx)', async () => {
    // Start healthy, then flip the profile endpoint to a 500 for the refetch.
    let failProfile = false;
    installFetchMock(() =>
      Promise.resolve(failProfile ? serverError() : okJson(PAYING_PROFILE)),
    );

    const { result } = renderHook(() => useUserAndSubscription(), { wrapper });

    await waitFor(() => expect(result.current.user?.isPaid).toBe(true));

    // A transient failure on a background/focus/manual refetch.
    failProfile = true;
    await act(async () => {
      await result.current.refetch();
    });

    // The error must be surfaced for observability...
    await waitFor(() => expect(result.current.error).not.toBeNull());

    // ...but the paying entitlement MUST be preserved end to end.
    expect(result.current.user?.isPaid).toBe(true);
    expect(result.current.user?.subscriptionStatus).toBe('active');
    expect(result.current.user?.subscriptionPlan).toBe('lunary_plus_ai');
    expect(result.current.user?.stripeCustomerId).toBe('cus_test_123');

    // The hook every gated surface reads must still treat them as Pro.
    expect(result.current.subscription.isSubscribed).toBe(true);
    expect(result.current.subscription.showUpgradePrompt).toBe(false);
    expect(
      result.current.subscription.hasAccess('personalized_horoscope'),
    ).toBe(true);
    // loading is false (resolved) — so this is NOT merely masked by a
    // loading flag; the data layer genuinely preserved the entitlement.
    expect(result.current.loading).toBe(false);
  });

  it('preserves the trial entitlement on failure for a trialling user', async () => {
    const trialProfile = {
      ...PAYING_PROFILE,
      subscription: {
        status: 'trial',
        planType: 'lunary_plus_ai_annual',
        stripeCustomerId: 'cus_trial_999',
        trialEndsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      },
    };

    let failProfile = false;
    installFetchMock(() =>
      Promise.resolve(failProfile ? serverError() : okJson(trialProfile)),
    );

    const { result } = renderHook(() => useUserAndSubscription(), { wrapper });

    await waitFor(() =>
      expect(result.current.user?.subscriptionStatus).toBe('trial'),
    );
    expect(result.current.user?.isPaid).toBe(true);

    failProfile = true;
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    // Trial users are paid users — must not be downgraded either.
    expect(result.current.user?.isPaid).toBe(true);
    expect(result.current.user?.subscriptionStatus).toBe('trial');
    expect(result.current.subscription.isTrialActive).toBe(true);
    expect(result.current.subscription.showUpgradePrompt).toBe(false);
  });
});

// ===========================================================================
// Structural verification: the catch block must not synthesise a free
// entitlement when a prior user already exists.
// ===========================================================================
describe('UserContext source: transient-failure entitlement guard', () => {
  const fs = require('fs');
  const source: string = fs.readFileSync(
    'src/context/UserContext.tsx',
    'utf-8',
  );

  it('uses a functional setUser updater in the catch block to preserve prior state', () => {
    // The fix preserves the previous user via the updater form.
    expect(source).toContain('setUser((prev) =>');
    expect(source).toContain('...prev');
  });

  it('does NOT unconditionally hard-set isPaid:false on every fetch error', () => {
    // The old bug: the catch block always built { ... isPaid: false }.
    // After the fix, isPaid:false only appears in the no-prior-user fallback
    // branch, never as an unconditional overwrite of an existing user.
    const catchStart = source.indexOf('} catch (err) {');
    const finallyStart = source.indexOf('} finally {', catchStart);
    expect(catchStart).toBeGreaterThan(-1);
    expect(finallyStart).toBeGreaterThan(catchStart);
    const catchBody = source.slice(catchStart, finallyStart);
    // The fallback (no prior user) branch is allowed to set isPaid: false once.
    const isPaidFalseCount = (catchBody.match(/isPaid:\s*false/g) || []).length;
    expect(isPaidFalseCount).toBeLessThanOrEqual(1);
    // And it must be guarded by the prev-exists check, not standalone.
    expect(catchBody).toContain('prev');
  });
});
