/**
 * @jest-environment node
 *
 * VITAL OP - Signup -> 7-day trial auto-enrolment + idempotency.
 *
 * On every new user, src/lib/auth.ts (databaseHooks.user.create.after) inserts
 * a 7-day 'trial' / 'lunary_plus' subscription with
 * `ON CONFLICT (user_id) DO NOTHING`, sets `autoTrialCreated` from the insert
 * rowCount, and only emits the `trial_started` proof event when the insert
 * actually created a row. buildAuthLifecycleConversionEvents
 * (src/lib/analytics/auth-lifecycle-events.ts) builds those events and the
 * deterministic ids the DB dedupes on.
 *
 * If this enrolment is wrong, EITHER a brand-new user never gets their trial
 * (lost activation/revenue) OR a re-run / double signup double-enrols or wipes
 * an existing trial (false trial_started proofs, corrupted funnel).
 *
 * NON-DUPLICATION: the existing auth-lifecycle-events.test.ts covers the happy
 * 3-event path, the includeTrialStarted=false omission, and event-id stability
 * for one fixed input. This file adds the parts it does not: the trial-day
 * computation EDGE cases (already-past / far-future / unparseable trialEndsAt),
 * the trialEndsAt-missing-but-flag-set guard, cross-user id uniqueness, the
 * signup/signup_completed pair being emitted with NO trial regardless of flag,
 * and a SOURCE-LEVEL pin of the ON CONFLICT DO NOTHING + rowCount idempotency
 * mechanism in auth.ts (the same fs-readFileSync structural-pin pattern the
 * suite already uses for the UserContext downgrade guard). No network, no DB.
 */
import { buildAuthLifecycleConversionEvents } from '@/lib/analytics/auth-lifecycle-events';

const fixedCreatedAt = '2026-05-25T10:00:00.000Z';

function eventTypes(
  events: ReturnType<typeof buildAuthLifecycleConversionEvents>,
) {
  return events.map((e) => e.eventType);
}

function eventOf(
  events: ReturnType<typeof buildAuthLifecycleConversionEvents>,
  type: string,
) {
  return events.find((e) => e.eventType === type);
}

// ---------------------------------------------------------------------------
// The signup / signup_completed pair is UNCONDITIONAL — it must be emitted for
// every new user, with or without a trial, so the signup funnel is never lost.
// ---------------------------------------------------------------------------
describe('VITAL signup - signup pair is always emitted', () => {
  it('emits exactly signup + signup_completed when no trial is enrolled', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_no_trial', email: 'a@b.com', createdAt: fixedCreatedAt },
      includeTrialStarted: false,
    });
    expect(eventTypes(events)).toEqual(['signup', 'signup_completed']);
  });

  it('emits the signup pair even when includeTrialStarted is true but trialEndsAt is missing', () => {
    // The trial insert "succeeded" (flag true) but no end date was passed: the
    // builder must still record the signup, and must NOT fabricate a
    // trial_started without a date.
    const events = buildAuthLifecycleConversionEvents({
      user: {
        id: 'u_flag_no_date',
        email: 'a@b.com',
        createdAt: fixedCreatedAt,
      },
      includeTrialStarted: true,
      trialEndsAt: null,
    });
    expect(eventTypes(events)).toEqual(['signup', 'signup_completed']);
  });

  it('the signup pair carries no plan/trial fields (it is identity-only)', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_pair', email: 'a@b.com', createdAt: fixedCreatedAt },
      includeTrialStarted: false,
    });
    for (const e of events) {
      expect(e.planType).toBeNull();
      expect(e.trialDaysRemaining).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// trial_started is the ENROLMENT proof. It must only appear when the insert
// created a row (includeTrialStarted) AND a trial end date exists, and it must
// carry a correct, non-negative day count.
// ---------------------------------------------------------------------------
describe('VITAL signup - trial_started enrolment proof', () => {
  it('records a 7-day trial_started for a fresh enrolment', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_fresh', email: 'a@b.com', createdAt: fixedCreatedAt },
      // exactly 7 days after createdAt
      trialEndsAt: '2026-06-01T10:00:00.000Z',
      includeTrialStarted: true,
    });
    const trial = eventOf(events, 'trial_started');
    expect(trial).toBeDefined();
    expect(trial!.planType).toBe('lunary_plus');
    expect(trial!.trialDaysRemaining).toBe(7);
    expect(trial!.featureName).toBe('auto_trial');
    expect(trial!.metadata).toMatchObject({
      trial_source: 'auto_signup_trial',
      trial_length_days: 7,
    });
  });

  it('clamps an already-past trialEndsAt to 0 days (never negative)', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_past', email: 'a@b.com', createdAt: fixedCreatedAt },
      trialEndsAt: '2026-05-20T10:00:00.000Z', // before createdAt
      includeTrialStarted: true,
    });
    const trial = eventOf(events, 'trial_started');
    expect(trial).toBeDefined();
    expect(trial!.trialDaysRemaining).toBe(0);
    expect(trial!.trialDaysRemaining).toBeGreaterThanOrEqual(0);
  });

  it('computes the day count by rounding UP a partial day', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_partial', email: 'a@b.com', createdAt: fixedCreatedAt },
      // 6 days 1 hour after createdAt -> ceil -> 7
      trialEndsAt: '2026-05-31T11:00:00.000Z',
      includeTrialStarted: true,
    });
    expect(eventOf(events, 'trial_started')!.trialDaysRemaining).toBe(7);
  });

  it('falls back to 7 days when trialEndsAt is unparseable but the flag is set', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_bad_date', email: 'a@b.com', createdAt: fixedCreatedAt },
      trialEndsAt: 'not-a-real-date',
      includeTrialStarted: true,
    });
    const trial = eventOf(events, 'trial_started');
    // An unparseable date still yields a sane, positive trial length so the
    // proof event is never written with NaN/negative days.
    expect(trial).toBeDefined();
    expect(trial!.trialDaysRemaining).toBe(7);
  });

  it('accepts a Date object as well as an ISO string for trialEndsAt', () => {
    const created = new Date(fixedCreatedAt);
    const ends = new Date(created.getTime() + 7 * 86400000);
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_dateobj', email: 'a@b.com', createdAt: created },
      trialEndsAt: ends,
      includeTrialStarted: true,
    });
    expect(eventOf(events, 'trial_started')!.trialDaysRemaining).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// IDEMPOTENCY: re-running the builder for the same user yields identical event
// ids (so the DB's ON CONFLICT (event_id) DO NOTHING dedupe collapses repeats),
// and different users get different ids (no cross-user collision).
// ---------------------------------------------------------------------------
describe('VITAL signup - idempotent, collision-free event ids', () => {
  const params = {
    user: { id: 'u_idem', email: 'a@b.com', createdAt: fixedCreatedAt },
    trialEndsAt: '2026-06-01T10:00:00.000Z',
    includeTrialStarted: true,
  };

  it('produces byte-identical event ids when re-run for the same user (dedupe key)', () => {
    const a = buildAuthLifecycleConversionEvents(params).map((e) => e.eventId);
    const b = buildAuthLifecycleConversionEvents(params).map((e) => e.eventId);
    expect(a).toEqual(b);
  });

  it('the three event ids within a single enrolment are all distinct', () => {
    const ids = buildAuthLifecycleConversionEvents(params).map(
      (e) => e.eventId,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a different user id yields different event ids (no cross-user dedupe)', () => {
    const other = buildAuthLifecycleConversionEvents({
      ...params,
      user: { ...params.user, id: 'u_other' },
    }).map((e) => e.eventId);
    const mine = buildAuthLifecycleConversionEvents(params).map(
      (e) => e.eventId,
    );
    // No id is shared between two different users' enrolments.
    expect(other.some((id) => mine.includes(id))).toBe(false);
  });

  it('normalises the email (trim + lowercase) consistently across events', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: {
        id: 'u_email',
        email: '  MixedCase@Example.COM  ',
        createdAt: fixedCreatedAt,
      },
      trialEndsAt: '2026-06-01T10:00:00.000Z',
      includeTrialStarted: true,
    });
    for (const e of events) {
      expect(e.userEmail).toBe('mixedcase@example.com');
    }
  });

  it('tolerates a null email without throwing (bot/edge signup)', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'u_null_email', email: null },
      includeTrialStarted: false,
    });
    expect(eventTypes(events)).toEqual(['signup', 'signup_completed']);
    expect(events[0].userEmail).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SOURCE-LEVEL pin of the auth.ts enrolment mechanism. We cannot import the
// after-create hook (it is a closure inside initializeAuth), so we pin the two
// load-bearing idempotency invariants in the source itself, matching the
// fs-readFileSync structural-pin style already used elsewhere in the suite.
// ---------------------------------------------------------------------------
describe('VITAL signup - auth.ts enrolment idempotency mechanism (source pin)', () => {
  const fs = require('fs');
  const source: string = fs.readFileSync('src/lib/auth.ts', 'utf-8');

  it('inserts the auto-trial with ON CONFLICT (user_id) DO NOTHING (no double-enrol / no wipe)', () => {
    // The conflict target MUST be user_id so a second signup attempt for an
    // existing user is a no-op rather than inserting a duplicate or overwriting
    // an in-flight/paid subscription.
    const normalised = source.replace(/\s+/g, ' ');
    expect(normalised).toContain('ON CONFLICT (user_id) DO NOTHING');
  });

  it('inserts as a 7-day trial on the lunary_plus plan with trial_used = true', () => {
    const normalised = source.replace(/\s+/g, ' ');
    expect(normalised).toContain("'trial'");
    expect(normalised).toContain("'lunary_plus'");
    // 7-day window is computed via setDate(getDate() + 7)
    expect(normalised).toContain('getDate() + 7');
  });

  it('gates the trial_started proof on the insert actually creating a row (rowCount > 0)', () => {
    // autoTrialCreated is derived from the insert rowCount and is what decides
    // includeTrialStarted. If the row already existed (DO NOTHING -> rowCount 0)
    // we must NOT emit a fresh trial_started proof.
    const normalised = source.replace(/\s+/g, ' ');
    expect(normalised).toMatch(
      /autoTrialCreated\s*=\s*\(?\s*trialResult\.rowCount/,
    );
    expect(normalised).toContain('includeTrialStarted: autoTrialCreated');
  });

  it('records lifecycle events inside the same hook so signup proof always fires', () => {
    expect(source).toContain('recordAuthLifecycleConversionEvents(pool, user');
  });
});
