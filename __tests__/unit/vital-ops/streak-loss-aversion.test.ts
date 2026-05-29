/**
 * Streak loss-aversion retention wedge.
 *
 * Pins the gating logic for the loss-aversion surfaces added to the streak
 * mechanic:
 *   1. StreakBanner at-risk derivation + loss-framed sub-line copy.
 *   2. StreakBanner trial loss-aversion line gating (active trial + streak >= 3
 *      + one-time localStorage guard) and its copy.
 *   3. PostTrialMessaging "you built an N-day streak" lead gating (longest >= 3).
 *   4. The streak check-in route firing streak_broken only on a genuine reset
 *      (a >= 7 day gap) with a positive previous streak.
 *
 * These mirror the exact derivations in the source so the contract is pinned
 * independently of rendering (matching the convention in
 * streak-banner-activation.test.tsx). No network, no DB, no heavy import graph.
 */

// --- Mirrors of the source derivations -------------------------------------

const MIN_STREAK_FOR_TRIAL_NUDGE = 3; // src/components/StreakBanner.tsx

/** Mirror: StreakBanner at-risk derivation. Source: StreakBanner.tsx. */
function deriveAtRisk(current: number, lastCheckIn: string | null): boolean {
  const todayISO = new Date().toISOString().split('T')[0];
  const checkedInToday = lastCheckIn === todayISO;
  return current > 0 && !checkedInToday;
}

/** Mirror: StreakBanner sub-line selection. Source: StreakBanner.tsx. */
function subLine(
  current: number,
  atRisk: boolean,
  milestoneHook: string | null,
): string | null {
  return atRisk
    ? `Open a reading today to keep your ${current}-day streak.`
    : milestoneHook;
}

/** Mirror: StreakBanner trial-nudge gate. Source: StreakBanner.tsx. */
function showTrialNudge(args: {
  trialEndsAt?: string;
  current: number;
  nudgeSeen: boolean;
  now?: number;
}): boolean {
  const now = args.now ?? Date.now();
  const trialEndDate = args.trialEndsAt ? new Date(args.trialEndsAt) : null;
  const trialIsActive = trialEndDate !== null && trialEndDate.getTime() > now;
  return (
    trialIsActive &&
    args.current >= MIN_STREAK_FOR_TRIAL_NUDGE &&
    !args.nudgeSeen
  );
}

/** Mirror: StreakBanner trial-days-remaining. Source: StreakBanner.tsx. */
function trialDaysRemaining(trialEndsAt: string, now: number): number {
  return Math.max(
    1,
    Math.ceil((new Date(trialEndsAt).getTime() - now) / (1000 * 60 * 60 * 24)),
  );
}

/** Mirror: PostTrialMessaging lost-streak lead gate. Source: PostTrialMessaging.tsx. */
function hasSavableStreak(longest: number): boolean {
  return longest >= 3;
}

/**
 * Mirror: the streak_broken fire condition in the check-in route. Source:
 * src/app/api/streak/check-in/route.ts — fires only when the gap since last
 * check-in is >= 7 days (a genuine reset) and the streak that broke was > 0.
 */
function shouldFireStreakBroken(
  daysAway: number,
  previousStreak: number,
): boolean {
  return daysAway >= 7 && previousStreak > 0;
}

// --- Tests ------------------------------------------------------------------

describe('StreakBanner at-risk derivation', () => {
  const todayISO = new Date().toISOString().split('T')[0];

  it('is NOT at risk when the user has already checked in today', () => {
    expect(deriveAtRisk(5, todayISO)).toBe(false);
  });

  it('is at risk when the last check-in is not today and a streak exists', () => {
    expect(deriveAtRisk(5, '2020-01-01')).toBe(true);
  });

  it('is never at risk with no streak', () => {
    expect(deriveAtRisk(0, '2020-01-01')).toBe(false);
    expect(deriveAtRisk(0, null)).toBe(false);
  });

  it('swaps the sub-line to the loss-framed nudge when at risk', () => {
    const atRisk = deriveAtRisk(5, '2020-01-01');
    expect(subLine(5, atRisk, '2 more days to your 7-day milestone.')).toBe(
      'Open a reading today to keep your 5-day streak.',
    );
  });

  it('keeps the gain-framed milestone hook when not at risk', () => {
    const atRisk = deriveAtRisk(5, todayISO);
    const hook = '2 more days to your 7-day milestone.';
    expect(subLine(5, atRisk, hook)).toBe(hook);
  });
});

describe('StreakBanner trial loss-aversion line gating', () => {
  const FUTURE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const PAST = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

  it('shows for an active trial with a streak >= 3 that has not been seen', () => {
    expect(
      showTrialNudge({ trialEndsAt: FUTURE, current: 3, nudgeSeen: false }),
    ).toBe(true);
  });

  it('is hidden for streaks below 3 (not worth a loss nudge)', () => {
    expect(
      showTrialNudge({ trialEndsAt: FUTURE, current: 2, nudgeSeen: false }),
    ).toBe(false);
  });

  it('is hidden once the one-time guard has fired', () => {
    expect(
      showTrialNudge({ trialEndsAt: FUTURE, current: 5, nudgeSeen: true }),
    ).toBe(false);
  });

  it('is hidden when no trial date is supplied (free / no trial)', () => {
    expect(showTrialNudge({ current: 5, nudgeSeen: false })).toBe(false);
  });

  it('is hidden when the trial date is in the past (lapsed / past_due)', () => {
    // A stale trialEndsAt must never re-trigger "keep your streak".
    expect(
      showTrialNudge({ trialEndsAt: PAST, current: 5, nudgeSeen: false }),
    ).toBe(false);
  });

  it('rounds the days remaining up, with a floor of 1', () => {
    const now = Date.parse('2026-05-29T12:00:00Z');
    const endsIn2Days = '2026-05-31T18:00:00Z';
    expect(trialDaysRemaining(endsIn2Days, now)).toBe(3);
    const endsSoon = '2026-05-29T13:00:00Z';
    expect(trialDaysRemaining(endsSoon, now)).toBe(1);
  });
});

describe('StreakBanner one-time guard (localStorage)', () => {
  const KEY = 'lunary.streakTrialNudgeSeen';

  beforeEach(() => window.localStorage.clear());

  it('treats an unset key as not-yet-seen, and a set key as seen', () => {
    // Mirror: useEffect reads getItem(KEY) and sets dismissed = (seen === '1').
    const readDismissed = () => window.localStorage.getItem(KEY) === '1';
    expect(readDismissed()).toBe(false);

    // Mirror: dismissTrialNudge writes '1'.
    window.localStorage.setItem(KEY, '1');
    expect(readDismissed()).toBe(true);
  });

  it('once dismissed, the nudge gate is false even for a qualifying streak', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    window.localStorage.setItem(KEY, '1');
    const seen = window.localStorage.getItem(KEY) === '1';
    expect(
      showTrialNudge({ trialEndsAt: future, current: 10, nudgeSeen: seen }),
    ).toBe(false);
  });
});

describe('PostTrialMessaging lost-streak lead gating', () => {
  it('leads with the lost streak only when the longest streak was >= 3', () => {
    expect(hasSavableStreak(3)).toBe(true);
    expect(hasSavableStreak(7)).toBe(true);
    expect(hasSavableStreak(2)).toBe(false);
    expect(hasSavableStreak(0)).toBe(false);
  });
});

describe('streak check-in fires streak_broken only on a genuine reset', () => {
  it('fires when the gap is >= 7 days and there was a streak to lose', () => {
    expect(shouldFireStreakBroken(7, 5)).toBe(true);
    expect(shouldFireStreakBroken(30, 12)).toBe(true);
  });

  it('does not fire for short pauses (< 7 day gap, streak is preserved)', () => {
    expect(shouldFireStreakBroken(2, 5)).toBe(false);
    expect(shouldFireStreakBroken(6, 5)).toBe(false);
  });

  it('does not fire when there was no streak to break', () => {
    expect(shouldFireStreakBroken(10, 0)).toBe(false);
  });
});
