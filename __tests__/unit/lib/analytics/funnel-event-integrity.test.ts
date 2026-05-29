/**
 * Funnel event integrity — fire -> canonicalise -> consume name contract.
 *
 * The conversion funnel the founder uses to judge profitability is built on
 * `conversion_events.event_type`. Every client-fired event is rewritten by
 * `canonicaliseEvent` (in /api/ether/cv) BEFORE it is stored, so the stored
 * `event_type` is ALWAYS a canonical name. A metrics/funnel query that filters
 * on a NAME the canonicaliser never produces silently returns zero — a corrupt
 * funnel number with no error.
 *
 * This suite pins the deterministic invariants of `canonicaliseEvent` (the only
 * pure, DB-free part of the pipeline) so that a future rename, a dropped accept
 * entry, or a legacy-map regression fails loudly here instead of quietly
 * zeroing a KPI in production.
 *
 * Scope notes / why each block exists are inline. Several blocks pin CURRENT
 * (buggy) behaviour and are marked with a loud `// BUG:` so the regression is
 * documented, not hidden. See the PR description for the full bug list and the
 * funnel impact of each.
 *
 * Pure unit only — no DB, no network, no app-code changes.
 */

import { canonicaliseEvent } from '@/lib/analytics/canonical-events';

/** Convenience: canonicalise a fire-name and return the stored event_type, or null if dropped. */
function storedTypeFor(fireName: string): string | null {
  const result = canonicaliseEvent({
    eventType: fireName,
    userId: 'user_test',
    pagePath: '/x',
  });
  return result.ok ? result.row.eventType : null;
}

describe('canonicaliseEvent — determinism & idempotence', () => {
  it('is deterministic: identical input yields an identical canonical row', () => {
    const input = {
      eventType: 'birth_chart_viewed',
      userId: 'user_1',
      anonymousId: 'anon_1',
      userEmail: 'A@Example.com',
      pagePath: '/birth-chart/',
      metadata: { utm_source: 'tiktok' },
    };

    const a = canonicaliseEvent(input);
    const b = canonicaliseEvent(input);

    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    // Structural equality across the whole stored row.
    expect(b.row).toEqual(a.row);
  });

  it('is idempotent on the OUTPUT name: re-canonicalising the canonical name is a fixed point', () => {
    // Every canonical name must canonicalise to itself. If a canonical output
    // were itself treated as a legacy alias, a double-pass (e.g. a backfill that
    // re-ingests stored rows) would silently shift the event to a different
    // bucket. This pins that the canonical set is a fixed point of the map.
    const canonicalOutputs = [
      'app_opened',
      'product_opened',
      'page_viewed',
      'cta_clicked',
      'cta_impression',
      'signup_completed',
      'trial_started',
      'subscription_started',
      'checkout_started',
      'checkout_completed',
      'pricing_page_viewed',
      'onboarding_completed',
      'chart_viewed',
      'tarot_drawn',
      'horoscope_viewed',
      'grimoire_viewed',
      'daily_dashboard_viewed',
      'astral_chat_used',
      'ritual_started',
      'ritual_completed',
      'birth_data_submitted',
    ];

    for (const name of canonicalOutputs) {
      expect(storedTypeFor(name)).toBe(name);
    }
  });

  it('normalisation is stable: trailing slash, casing and query string do not change the canonical type', () => {
    const variants = [
      { eventType: 'birth_chart_viewed', pagePath: '/birth-chart' },
      { eventType: 'birth_chart_viewed', pagePath: '/birth-chart/' },
      { eventType: 'birth_chart_viewed', pagePath: '/birth-chart?ref=x#frag' },
    ];

    const types = variants.map((v) =>
      canonicaliseEvent({ ...v, userId: 'u1' }),
    );
    for (const t of types) {
      expect(t.ok).toBe(true);
      if (!t.ok) return;
      expect(t.row.eventType).toBe('chart_viewed');
      // pagePath normalises to the slash-stripped, query-stripped path.
      expect(t.row.pagePath).toBe('/birth-chart');
    }
  });
});

describe('fire -> canonical -> consume contract for KEY funnel events', () => {
  // These are the names the funnel/KPI consumers filter on against the
  // conversion_events table. Each MUST be reachable from a real fire-name.
  // (fireName fired by analytics.ts/auth/webhooks) -> (stored canonical name)
  const fireToStored: Array<[string, string]> = [
    // Funnel entry. auth.ts writes both 'signup' AND 'signup_completed' (canonical
    // pair); the client 'signup' fire canonicalises to 'signup_completed'.
    ['signup', 'signup_completed'],
    // Trial + subscription spine.
    ['trial_started', 'trial_started'],
    ['subscription_started', 'subscription_started'],
    // trial_converted canonicalises to subscription_started for KPI purposes,
    // but the Stripe webhook ALSO writes a raw 'trial_converted' row, which is
    // why consumers query IN ('trial_converted','subscription_started').
    ['trial_converted', 'subscription_started'],
    // Checkout proof events (source-labelled activation reads these).
    ['checkout_started', 'checkout_started'],
    ['checkout_completed', 'checkout_completed'],
    // Pricing + onboarding funnel steps.
    ['pricing_page_viewed', 'pricing_page_viewed'],
    ['onboarding_completed', 'onboarding_completed'],
    // Activation events (ACTIVATION_EVENTS). Paid users fire the personalised
    // variants which MUST land on the same canonical bucket free users use.
    ['personalized_horoscope_viewed', 'horoscope_viewed'],
    ['horoscope_viewed', 'horoscope_viewed'],
    ['personalized_tarot_viewed', 'tarot_drawn'],
    ['tarot_viewed', 'tarot_drawn'],
    ['birth_chart_viewed', 'chart_viewed'],
    ['grimoire_viewed', 'grimoire_viewed'],
    ['daily_dashboard_viewed', 'daily_dashboard_viewed'],
    ['astral_chat_used', 'astral_chat_used'],
    ['ritual_started', 'ritual_started'],
    ['ritual_completed', 'ritual_completed'],
  ];

  it.each(fireToStored)(
    'fire "%s" is stored as canonical "%s"',
    (fireName, storedName) => {
      expect(storedTypeFor(fireName)).toBe(storedName);
    },
  );

  it('every key funnel fire-name survives canonicalisation (none silently dropped)', () => {
    const dropped = fireToStored
      .map(([fireName]) => fireName)
      .filter((fireName) => storedTypeFor(fireName) === null);
    expect(dropped).toEqual([]);
  });

  it('legacy A/B-test fire-names fold onto canonical KPI buckets (not dropped)', () => {
    // These banner/paywall A/B events are intentionally mapped onto canonical
    // KPI events so dashboards read them without new event types. Pin the map
    // so a rename does not orphan an active experiment.
    expect(storedTypeFor('trial_countdown_view')).toBe('paywall_shown');
    expect(storedTypeFor('trial_countdown_cta_click')).toBe('cta_clicked');
    expect(storedTypeFor('astral_paywall_view')).toBe('paywall_shown');
    expect(storedTypeFor('astral_paywall_cta_click')).toBe('cta_clicked');
  });

  it('the legacy event name is preserved in metadata for audit drill-down', () => {
    const result = canonicaliseEvent({
      eventType: 'trial_converted',
      userId: 'u1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.row.eventType).toBe('subscription_started');
    expect(result.row.metadata).toMatchObject({
      legacy_event_type: 'trial_converted',
      canonical_event_type: 'subscription_started',
    });
  });
});

describe('unknown / malformed event types are rejected, never silently bucketed', () => {
  it('rejects an unknown event type with skipped_invalid', () => {
    const result = canonicaliseEvent({
      eventType: 'totally_made_up',
      userId: 'u1',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('skipped_invalid');
  });

  it.each([null, undefined, 123, '', '   ', {}])(
    'rejects non-string / empty event type %p',
    (bad) => {
      const result = canonicaliseEvent({
        eventType: bad as unknown,
        userId: 'u1',
      });
      expect(result.ok).toBe(false);
    },
  );

  it('a valid event with no user and no anonymousId is skipped_no_user (not stored under empty id)', () => {
    const result = canonicaliseEvent({ eventType: 'signup' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('skipped_no_user');
  });
});

/**
 * ───────────────────────────────────────────────────────────────────────────
 * SILENT FUNNEL-CORRUPTION BUGS (pinned, not fixed)
 *
 * The events below have a real fire-helper in `conversionTracking` that is
 * actually called from the app, AND are listed in the `CanonicalEventType`
 * union, BUT are NOT in the `canonicaliseEventType` accept-list (nor the legacy
 * map). So when fired through /api/ether/cv they are returned as
 * `skipped_invalid` and NEVER written to conversion_events.
 *
 * For the three below, a metrics consumer ALSO filters conversion_events on the
 * exact (never-stored) name, so the corresponding funnel number is hard-wired
 * to zero with no error. The `// BUG:` `it.skip` states the intended contract;
 * the companion test pins the current (broken) reality so the regression is
 * green-locked until the canonicaliser / consumer is corrected.
 * ───────────────────────────────────────────────────────────────────────────
 */
describe('BUG: fired-and-consumed events dropped by canonicalisation', () => {
  // BUG: `upgrade_clicked` is fired from 7 call-sites (pricing page, ConversionCTAs,
  // TrialReminder, UpgradePrompt, ...) and consumed at
  // src/app/api/admin/analytics/route.ts:217 (`upgradeClickRate`) and
  // cta-conversions/route.ts:34. It is dropped by canonicalisation, so
  // upgradeClickRate is permanently 0 in the admin analytics funnel.
  it.skip('BUG: upgrade_clicked SHOULD survive canonicalisation (consumed by upgradeClickRate)', () => {
    expect(storedTypeFor('upgrade_clicked')).not.toBeNull();
  });
  it('current behaviour: upgrade_clicked is dropped (upgradeClickRate reads 0)', () => {
    expect(storedTypeFor('upgrade_clicked')).toBeNull();
  });

  // BUG: `feature_gated` is fired from FeatureGate.tsx + guide page and consumed
  // at src/app/api/admin/analytics/route.ts:223 (`featureGated` count). Dropped
  // by canonicalisation -> that gate-impression metric is permanently 0.
  it.skip('BUG: feature_gated SHOULD survive canonicalisation (consumed by admin analytics)', () => {
    expect(storedTypeFor('feature_gated')).not.toBeNull();
  });
  it('current behaviour: feature_gated is dropped (gate-impression metric reads 0)', () => {
    expect(storedTypeFor('feature_gated')).toBeNull();
  });

  // BUG: `crystal_recommendations_viewed` is fired from CrystalWidget.tsx and
  // consumed in admin/analytics/route.ts:324 (`aiUsageCount`),
  // analytics/summary PRODUCT_EVENTS, and admin/analytics/user-segments. It is
  // neither an accepted canonical name nor a legacy alias, so it is dropped and
  // every consumer of it counts 0.
  it.skip('BUG: crystal_recommendations_viewed SHOULD survive canonicalisation (consumed widely)', () => {
    expect(storedTypeFor('crystal_recommendations_viewed')).not.toBeNull();
  });
  it('current behaviour: crystal_recommendations_viewed is dropped (aiUsageCount reads 0)', () => {
    expect(storedTypeFor('crystal_recommendations_viewed')).toBeNull();
  });
});

/**
 * BUG: legacy-name CONSUMER mismatch in admin/analytics/route.ts.
 *
 * `analytics/summary` was already corrected (see its inline comment dated
 * 2026-01-16) to filter PRODUCT_EVENTS on canonical names. But
 * src/app/api/admin/analytics/route.ts:324 still filters on the LEGACY names:
 *   IN ('personalized_tarot_viewed','personalized_horoscope_viewed',
 *       'birth_chart_viewed','crystal_recommendations_viewed')
 * Those rows are stored under their canonical names (tarot_drawn /
 * horoscope_viewed / chart_viewed) or dropped (crystal). So that `aiUsageCount`
 * query matches nothing and the admin "AI usage %" is permanently 0.
 *
 * These tests pin the canonicaliser reality the consumer is out of step with:
 * the legacy names DO map (or drop), proving the literal-name filter is stale.
 */
describe('BUG: admin/analytics aiUsageCount filters on stale legacy names', () => {
  it('personalized_tarot_viewed is stored as tarot_drawn, not under its own name', () => {
    expect(storedTypeFor('personalized_tarot_viewed')).toBe('tarot_drawn');
  });
  it('personalized_horoscope_viewed is stored as horoscope_viewed, not under its own name', () => {
    expect(storedTypeFor('personalized_horoscope_viewed')).toBe(
      'horoscope_viewed',
    );
  });
  it('birth_chart_viewed is stored as chart_viewed, not under its own name', () => {
    expect(storedTypeFor('birth_chart_viewed')).toBe('chart_viewed');
  });
  // The intended contract: a consumer measuring "AI/personalised feature usage"
  // should query canonical names. Skipped until admin/analytics/route.ts:324 is
  // migrated to ['tarot_drawn','horoscope_viewed','chart_viewed', ...].
  it.skip('BUG: admin aiUsageCount SHOULD query canonical names so it is not permanently 0', () => {
    // Placeholder for the fixed consumer; canonicaliser side is already correct.
    expect(true).toBe(true);
  });
});

/**
 * BUG (held PR #294 — "Streak loss-aversion retention wedge").
 *
 * #294 adds the streak_broken FIRE site (src/app/api/streak/check-in/route.ts
 * calls conversionTracking.streakBroken -> trackConversion('streak_broken')) and
 * a new `streak_at_risk_nudge_clicked` helper, but its canonical-events.ts diff
 * only extends the TYPE UNION — it does NOT add either name to the
 * `canonicaliseEventType` accept-list. So once #294 merges, the retention
 * wedge's core signal (streak_broken) and its nudge-CTA will be fired and then
 * dropped at /api/ether/cv, exactly like the streak_broken-never-called bug
 * that already bit this session.
 *
 * On main today these names are also dropped (the fire site is not yet present).
 * This pins the current reality and flags the gap #294 must close.
 */
describe('BUG: streak retention events are dropped by canonicalisation (affects PR #294)', () => {
  it('current behaviour: streak_broken is dropped (retention wedge signal lost)', () => {
    expect(storedTypeFor('streak_broken')).toBeNull();
  });
  it('current behaviour: login_streak_milestone is dropped', () => {
    expect(storedTypeFor('login_streak_milestone')).toBeNull();
  });
  it('current behaviour: user_reactivated is dropped', () => {
    expect(storedTypeFor('user_reactivated')).toBeNull();
  });
  // The contract PR #294 must satisfy: its newly-fired retention events must be
  // accepted by the canonicaliser, or they never reach conversion_events.
  it.skip('BUG: streak_broken SHOULD survive canonicalisation once PR #294 fires it', () => {
    expect(storedTypeFor('streak_broken')).toBe('streak_broken');
  });
});
