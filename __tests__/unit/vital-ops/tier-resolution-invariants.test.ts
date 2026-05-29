/**
 * @jest-environment node
 *
 * VITAL OP - Tier / entitlement RESOLUTION invariants (free vs trial vs pro).
 *
 * The whole funnel and every gate downstream depend on this being correct:
 *   - subscription status (+ plan type) -> which FEATURE_ACCESS list applies;
 *   - a FREE user must NEVER resolve to a personalised / paid feature;
 *   - any non-paying status (cancelled, past_due, expired, garbage, undefined)
 *     must FAIL CLOSED to the free list — no entitlement is ever granted
 *     without a backing 'trial' or 'active' status;
 *   - normalizePlanType is deterministic and preserves specific plan ids.
 *
 * Source: utils/pricing.ts (hasFeatureAccess, normalizePlanType) over the
 * FEATURE_ACCESS entitlement map (utils/entitlements.ts).
 *
 * NON-DUPLICATION: the existing pricing.test.ts spot-checks a couple of
 * features and 3 normalize cases; trial-lifecycle.test.ts pins the trial
 * boundary helpers; free-tier-caps-and-generic.test.ts pins the
 * generic-vs-personalised content matrix. This file pins the parts none of
 * them touch: the full normalizePlanType decision table, the fail-closed
 * behaviour for every NON-paying status, the within-paid TIER boundary
 * (Plus cannot reach Pro-only AI features), and the determinism contract.
 * Pure logic. No network, no DB. Deterministic.
 */
import { hasFeatureAccess, normalizePlanType } from '../../../utils/pricing';
import { FEATURE_ACCESS } from '../../../utils/entitlements';

// ---------------------------------------------------------------------------
// normalizePlanType - the canonical plan-id resolver. Its output decides which
// FEATURE_ACCESS list a paying user is measured against, so a wrong mapping
// silently over- or under-grants entitlements.
// ---------------------------------------------------------------------------
describe('VITAL tier - normalizePlanType decision table', () => {
  it('defaults a missing/empty plan to "free" (fail safe)', () => {
    expect(normalizePlanType(undefined)).toBe('free');
    expect(normalizePlanType('')).toBe('free');
  });

  it.each([
    'free',
    'lunary_plus',
    'lunary_plus_annual',
    'lunary_plus_ai',
    'lunary_plus_ai_annual',
  ])('preserves the specific plan id "%s" verbatim', (planId) => {
    expect(normalizePlanType(planId)).toBe(planId);
  });

  it('maps the generic "yearly"/"annual" terms to the annual Pro plan', () => {
    // Documented contract: a bare yearly term is treated as the top annual tier.
    expect(normalizePlanType('yearly')).toBe('lunary_plus_ai_annual');
    expect(normalizePlanType('annual')).toBe('lunary_plus_ai_annual');
  });

  it('maps the generic "monthly" term to the conservative base plan', () => {
    // Documented contract: 'monthly' is ambiguous between Plus and Pro, so it
    // resolves to the LOWER tier (lunary_plus) rather than over-granting Pro.
    expect(normalizePlanType('monthly')).toBe('lunary_plus');
  });

  it('passes an unrecognised plan string through unchanged (no invented tier)', () => {
    // An unknown plan must not be coerced into a paid tier; it flows through
    // and is then measured against the (non-matching) paid lists, i.e. it only
    // ever gets the shared free features. See the fail-closed tests below.
    expect(normalizePlanType('some_future_plan')).toBe('some_future_plan');
  });

  it('is deterministic for the same input', () => {
    expect(normalizePlanType('monthly')).toBe(normalizePlanType('monthly'));
    expect(normalizePlanType('yearly')).toBe(normalizePlanType('yearly'));
  });
});

// ---------------------------------------------------------------------------
// hasFeatureAccess - FAIL CLOSED for every status that is not trial/active.
// This is the core "no entitlement without a backing subscription state" rule.
// ---------------------------------------------------------------------------
describe('VITAL tier - non-paying statuses fail closed to free-only', () => {
  const NON_PAYING_STATUSES = [
    'free',
    'cancelled',
    'canceled',
    'past_due',
    'expired',
    'incomplete',
    'unpaid',
    'paused',
    'unknown_garbage_status',
    undefined,
  ];

  // A representative personalised / paid-only feature. If any non-paying
  // status can reach this, a free user is getting personalised content.
  const PAID_ONLY: Array<string> = [
    'personalized_horoscope',
    'personal_tarot',
    'unlimited_ai_chat',
    'weekly_reports',
    'transit_calendar',
  ];

  it.each(NON_PAYING_STATUSES)(
    'status "%s" with a Pro plan id STILL cannot reach paid features',
    (status) => {
      // Even though the plan id says lunary_plus_ai, the STATUS is not
      // trial/active, so entitlement must be denied. A backing paid status is
      // mandatory — the plan id alone never unlocks anything.
      for (const feature of PAID_ONLY) {
        expect(
          hasFeatureAccess(status as any, 'lunary_plus_ai', feature as any),
        ).toBe(false);
      }
    },
  );

  // -------------------------------------------------------------------------
  // FIXED (was an under-grant bug; resolved in fix/churned-user-free-access):
  //
  // hasFeatureAccess() previously only fell back to the FREE feature list when
  // the status was exactly 'free' or empty/undefined. For ANY other non-paying
  // status (cancelled, past_due, expired, incomplete, unpaid, paused, garbage)
  // it hit a trailing `return false` and DENIED EVERYTHING — including the
  // generic free content (general_horoscope, moon_phases, grimoire) that an
  // anonymous 'free' visitor can see. This flowed through the production
  // useSubscription().hasAccess() hook, so a churned/lapsed subscriber was more
  // locked out than a brand-new free user — exactly the win-back audience lost
  // their free horoscope/moon-phase/grimoire access.
  //
  // The fix replaced that trailing `return false` with
  // `return freeFeatures.includes(feature);`, so every non-trial/active status
  // now resolves EXACTLY the free tier — no more, no less. Paid/personalised
  // features stay denied because they are not in the free list and there is no
  // backing trial/active status (pinned by the fail-closed test above).
  // -------------------------------------------------------------------------
  it('a cancelled/past_due/expired status still gets generic FREE features', () => {
    const LAPSED = ['cancelled', 'past_due', 'expired', 'incomplete', 'unpaid'];
    for (const status of LAPSED) {
      expect(hasFeatureAccess(status as any, 'free', 'general_horoscope')).toBe(
        true,
      );
      expect(hasFeatureAccess(status as any, 'free', 'moon_phases')).toBe(true);
      expect(hasFeatureAccess(status as any, 'free', 'grimoire')).toBe(true);
    }
  });

  it('a lapsed status grants ONLY the free tier, never paid/personalised content', () => {
    // Companion to the win-back test above. The free-tier fallback must NOT
    // leak paid content: a lapsed status with even a Pro plan id is still
    // denied every personalised feature (no backing trial/active status).
    expect(hasFeatureAccess('cancelled', 'free', 'general_horoscope')).toBe(
      true,
    );
    expect(hasFeatureAccess('past_due', 'lunary_plus_ai', 'moon_phases')).toBe(
      true,
    );
    expect(hasFeatureAccess('expired', 'free', 'grimoire')).toBe(true);
    // Free content is granted, but the paid boundary holds: a Pro plan id on a
    // non-paying status unlocks nothing personalised.
    expect(
      hasFeatureAccess('cancelled', 'lunary_plus_ai', 'personalized_horoscope'),
    ).toBe(false);
    expect(
      hasFeatureAccess('past_due', 'lunary_plus_ai', 'personal_tarot'),
    ).toBe(false);
    expect(
      hasFeatureAccess('expired', 'lunary_plus_ai', 'transit_calendar'),
    ).toBe(false);
    // 'free' itself behaves identically — the win-back fallback is consistent.
    expect(hasFeatureAccess('free', 'free', 'general_horoscope')).toBe(true);
  });

  it('undefined/empty status DOES correctly fall back to the free feature list', () => {
    // The fallback works for the canonical free/empty cases — it is only the
    // OTHER lapsed statuses (above) that are mishandled.
    expect(hasFeatureAccess(undefined, undefined, 'general_horoscope')).toBe(
      true,
    );
    expect(hasFeatureAccess('', '', 'moon_phases')).toBe(true);
    expect(
      hasFeatureAccess(undefined, undefined, 'personalized_horoscope'),
    ).toBe(false);
  });

  it('an EXPIRED-equivalent (status downgraded to free) loses every paid feature', () => {
    // This is the post-trial downgrade contract once the backend has flipped
    // status from 'trial' to 'free': the user keeps generic content and loses
    // all personalised content in the same call.
    expect(hasFeatureAccess('free', 'lunary_plus_ai', 'general_tarot')).toBe(
      true,
    );
    expect(hasFeatureAccess('free', 'lunary_plus_ai', 'personal_tarot')).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// Within-paid TIER boundary: Plus must NOT reach Pro-only AI features. A
// regression that flattened the tiers would give every Plus subscriber the AI
// suite for free.
// ---------------------------------------------------------------------------
describe('VITAL tier - paid tier boundary (Plus < Pro)', () => {
  // Features that live ONLY in the Pro (lunary_plus_ai*) lists, never in Plus.
  const PRO_ONLY = [
    'unlimited_ai_chat',
    'weekly_reports',
    'downloadable_reports',
    'ai_ritual_generation',
    'relationship_timing',
    'shared_cosmic_events',
  ] as const;

  it('sanity: each PRO_ONLY feature really is absent from the Plus list', () => {
    const plus = FEATURE_ACCESS.lunary_plus as readonly string[];
    for (const feature of PRO_ONLY) {
      expect(plus.includes(feature)).toBe(false);
    }
  });

  it.each(PRO_ONLY)(
    'an active Plus subscriber CANNOT reach Pro-only "%s"',
    (feature) => {
      expect(hasFeatureAccess('active', 'lunary_plus', feature as any)).toBe(
        false,
      );
      expect(hasFeatureAccess('trial', 'lunary_plus', feature as any)).toBe(
        false,
      );
    },
  );

  it.each(PRO_ONLY)(
    'an active Pro subscriber CAN reach Pro-only "%s"',
    (feature) => {
      expect(hasFeatureAccess('active', 'lunary_plus_ai', feature as any)).toBe(
        true,
      );
      expect(
        hasFeatureAccess('active', 'lunary_plus_ai_annual', feature as any),
      ).toBe(true);
    },
  );

  it('Plus still gets its OWN personalised features (boundary is not over-strict)', () => {
    // Guard against the boundary test over-reaching: Plus must keep the
    // personalised content it pays for.
    expect(
      hasFeatureAccess('active', 'lunary_plus', 'personalized_horoscope'),
    ).toBe(true);
    expect(hasFeatureAccess('active', 'lunary_plus', 'personal_tarot')).toBe(
      true,
    );
  });
});

// ---------------------------------------------------------------------------
// status normalisation: 'trialing' (raw Stripe) must behave exactly like
// 'trial', and trial must equal active for entitlement purposes.
// ---------------------------------------------------------------------------
describe('VITAL tier - trialing == trial == active entitlement parity', () => {
  const PAID_FEATURE = 'personalized_horoscope';

  it('"trialing", "trial", and "active" all unlock the same paid feature', () => {
    expect(hasFeatureAccess('trialing', 'lunary_plus', PAID_FEATURE)).toBe(
      true,
    );
    expect(hasFeatureAccess('trial', 'lunary_plus', PAID_FEATURE)).toBe(true);
    expect(hasFeatureAccess('active', 'lunary_plus', PAID_FEATURE)).toBe(true);
  });

  it('the three resolve identically across a range of features (deterministic parity)', () => {
    const features = [
      'general_horoscope',
      'personalized_horoscope',
      'unlimited_ai_chat',
      'moon_phases',
    ];
    for (const f of features) {
      const trialing = hasFeatureAccess('trialing', 'lunary_plus_ai', f as any);
      const trial = hasFeatureAccess('trial', 'lunary_plus_ai', f as any);
      const active = hasFeatureAccess('active', 'lunary_plus_ai', f as any);
      expect(trial).toBe(trialing);
      expect(active).toBe(trialing);
    }
  });
});
