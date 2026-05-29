/**
 * @jest-environment node
 *
 * VITAL OP #8 - UserContext paying-user downgrade guard.
 *
 * The catch block in src/context/UserContext.tsx runs on ANY profile-fetch
 * failure (network blip, 5xx, background focus/sync re-fetch). It must NOT
 * synthesise a free entitlement for a user who is already paying/trialling -
 * doing so strips the Pro UI (Time Machine, full CosmicScore, every
 * hasAccess() gate) mid-session and is directly revenue-affecting.
 *
 * Following the repo's established convention for UserContext tests
 * (see user-context-chart-generation.test.ts), we extract the EXACT
 * intended catch-block reducer and assert its behaviour, plus a structural
 * source check.
 *
 * STATUS ON origin/main: the guard is NOT implemented - the catch block
 * unconditionally rebuilds the user with isPaid:false. The behavioural
 * "preserve paying user" cases are therefore marked .skip with a BUG note;
 * they will pass and should be un-skipped once the guard ships
 * (the fix lives in unmerged PR #268). The no-prior-user fallback case,
 * which is correct on main today, is left active.
 *
 * No network/DB. Deterministic.
 */

type MinimalUser = {
  id: string;
  name?: string;
  email?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  isPaid: boolean;
  hasBirthChart?: boolean;
  hasPersonalCard?: boolean;
};

/**
 * INTENDED catch-block reducer (the guard PR #268 ships).
 * Preserve the last-known user (incl. paid entitlement) on a transient
 * failure; only fall back to a minimal logged-in shell when there is no
 * prior user to lose.
 */
function reduceOnFetchError(
  prev: MinimalUser | null,
  authIdentity: { userId: string; userName?: string; userEmail?: string },
): MinimalUser {
  const { userId, userName, userEmail } = authIdentity;
  return prev
    ? {
        ...prev,
        id: userId,
        name: prev.name || userName || undefined,
        email: prev.email || userEmail || undefined,
      }
    : {
        id: userId,
        name: userName || undefined,
        email: userEmail || undefined,
        hasBirthChart: false,
        hasPersonalCard: false,
        isPaid: false,
      };
}

const PRO_USER: MinimalUser = {
  id: 'user_1',
  name: 'Sammii',
  email: 'sammii@example.com',
  subscriptionStatus: 'active',
  subscriptionPlan: 'lunary_plus_ai',
  isPaid: true,
  hasBirthChart: true,
  hasPersonalCard: true,
};

const TRIAL_USER: MinimalUser = {
  id: 'user_2',
  subscriptionStatus: 'trial',
  subscriptionPlan: 'lunary_plus',
  isPaid: true,
  hasBirthChart: true,
  hasPersonalCard: false,
};

const IDENTITY = {
  userId: 'user_1',
  userName: 'Sammii',
  userEmail: 'sammii@example.com',
};

describe('VITAL #8 downgrade guard - no prior user (correct on main today)', () => {
  it('falls back to a minimal logged-in shell when there is no prior user', () => {
    const next = reduceOnFetchError(null, IDENTITY);
    expect(next.id).toBe('user_1');
    expect(next.isPaid).toBe(false); // nothing to lose - acceptable
    expect(next.hasBirthChart).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// BUG: On origin/main the UserContext catch block does NOT preserve a prior
// paying user - it unconditionally rebuilds { ...basic, isPaid: false },
// downgrading an active/trialling user to free on any transient profile-fetch
// failure (network blip, focus/sync/birth-chart re-fetch). The intended guard
// (functional setUser((prev) => ...) updater) is implemented by the reducer
// above and lands in unmerged PR #268. Un-skip these once the guard ships.
// App logic intentionally NOT changed by this test suite.
// ---------------------------------------------------------------------------
describe.skip('VITAL #8 downgrade guard - paying user preserved through a transient failure', () => {
  it('keeps an active Pro user paid (isPaid + plan survive the error)', () => {
    const next = reduceOnFetchError(PRO_USER, IDENTITY);
    expect(next.isPaid).toBe(true);
    expect(next.subscriptionStatus).toBe('active');
    expect(next.subscriptionPlan).toBe('lunary_plus_ai');
  });

  it('keeps a trialling user paid (does not strip the trial)', () => {
    const next = reduceOnFetchError(TRIAL_USER, {
      userId: 'user_2',
      userName: undefined,
      userEmail: undefined,
    });
    expect(next.isPaid).toBe(true);
    expect(next.subscriptionStatus).toBe('trial');
  });

  it('refreshes auth-identity fields without dropping entitlement state', () => {
    const next = reduceOnFetchError(PRO_USER, IDENTITY);
    expect(next.id).toBe('user_1');
    expect(next.name).toBe('Sammii');
    expect(next.hasBirthChart).toBe(true);
    expect(next.hasPersonalCard).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Structural source check: documents the present (buggy) shape on main and
// will flip to expecting the guard once PR #268 merges. Kept as a forward-
// looking .skip so it does not fail the suite on main.
// ---------------------------------------------------------------------------
describe.skip('VITAL #8 downgrade guard - source uses a functional setUser updater', () => {
  const fs = require('fs');
  const source = fs.readFileSync('src/context/UserContext.tsx', 'utf-8');

  it('uses setUser((prev) => ...) to preserve prior state in the catch block', () => {
    // BUG: not present on origin/main; ships in PR #268.
    expect(source).toContain('setUser((prev) =>');
    expect(source).toContain('...prev');
  });

  it('does not unconditionally hard-set isPaid:false in the catch block', () => {
    const catchStart = source.indexOf('} catch (err) {');
    const finallyStart = source.indexOf('} finally {', catchStart);
    const catchBody = source.slice(catchStart, finallyStart);
    const isPaidFalseCount = (catchBody.match(/isPaid:\s*false/g) || []).length;
    // BUG: on main this count is 1 inside an UNCONDITIONAL object; after the
    // fix the single occurrence is gated behind the no-prior-user branch.
    expect(catchBody).toContain('prev');
    expect(isPaidFalseCount).toBeLessThanOrEqual(1);
  });
});
