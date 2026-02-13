import {
  pickBestSubscription,
  getTrialLevel,
} from '@/lib/stripe/subscription-utils';
import type Stripe from 'stripe';

// Helper to create a minimal mock subscription
function mockSub(
  overrides: Partial<Stripe.Subscription> & {
    planId?: string;
  },
): Stripe.Subscription {
  const { planId, ...rest } = overrides;
  return {
    id: 'sub_default',
    status: 'active',
    items: {
      data: [
        {
          price: {
            metadata: { plan_id: planId || 'lunary_plus' },
            recurring: { interval: 'month' },
          },
        },
      ],
    } as any,
    cancel_at_period_end: false,
    trial_end: null,
    ...rest,
  } as Stripe.Subscription;
}

const getPlanType = (sub: Stripe.Subscription): string =>
  sub.items.data[0]?.price?.metadata?.plan_id || 'lunary_plus';

describe('pickBestSubscription', () => {
  it('returns null for empty array', () => {
    expect(pickBestSubscription([], getPlanType)).toBeNull();
  });

  it('returns the only subscription', () => {
    const sub = mockSub({ id: 'sub_1' });
    expect(pickBestSubscription([sub], getPlanType)?.id).toBe('sub_1');
  });

  it('prefers active over past_due', () => {
    const active = mockSub({ id: 'sub_active', status: 'active' });
    const pastDue = mockSub({ id: 'sub_past_due', status: 'past_due' });
    expect(pickBestSubscription([pastDue, active], getPlanType)?.id).toBe(
      'sub_active',
    );
  });

  it('prefers active over trialing', () => {
    const active = mockSub({ id: 'sub_active', status: 'active' });
    const trialing = mockSub({ id: 'sub_trialing', status: 'trialing' });
    expect(pickBestSubscription([trialing, active], getPlanType)?.id).toBe(
      'sub_active',
    );
  });

  it('prefers trialing over past_due', () => {
    const trialing = mockSub({ id: 'sub_trialing', status: 'trialing' });
    const pastDue = mockSub({ id: 'sub_past_due', status: 'past_due' });
    expect(pickBestSubscription([pastDue, trialing], getPlanType)?.id).toBe(
      'sub_trialing',
    );
  });

  it('prefers past_due over canceled', () => {
    const pastDue = mockSub({ id: 'sub_past_due', status: 'past_due' });
    const canceled = mockSub({ id: 'sub_canceled', status: 'canceled' });
    expect(pickBestSubscription([canceled, pastDue], getPlanType)?.id).toBe(
      'sub_past_due',
    );
  });

  it('prefers higher-tier plan when status is the same', () => {
    const plus = mockSub({
      id: 'sub_plus',
      status: 'active',
      planId: 'lunary_plus',
    });
    const pro = mockSub({
      id: 'sub_pro',
      status: 'active',
      planId: 'lunary_plus_ai',
    });
    expect(pickBestSubscription([plus, pro], getPlanType)?.id).toBe('sub_pro');
  });

  it('prefers annual pro over monthly pro when status is the same', () => {
    const monthly = mockSub({
      id: 'sub_monthly',
      status: 'active',
      planId: 'lunary_plus_ai',
    });
    const annual = mockSub({
      id: 'sub_annual',
      status: 'active',
      planId: 'lunary_plus_ai_annual',
    });
    expect(pickBestSubscription([monthly, annual], getPlanType)?.id).toBe(
      'sub_annual',
    );
  });

  it('prefers active lower-tier over past_due higher-tier (status wins)', () => {
    const activePlus = mockSub({
      id: 'sub_plus',
      status: 'active',
      planId: 'lunary_plus',
    });
    const pastDuePro = mockSub({
      id: 'sub_pro',
      status: 'past_due',
      planId: 'lunary_plus_ai_annual',
    });
    expect(
      pickBestSubscription([pastDuePro, activePlus], getPlanType)?.id,
    ).toBe('sub_plus');
  });

  it('handles multiple subscriptions with mixed statuses', () => {
    const subs = [
      mockSub({ id: 'sub_1', status: 'canceled', planId: 'lunary_plus' }),
      mockSub({
        id: 'sub_2',
        status: 'past_due',
        planId: 'lunary_plus_ai',
      }),
      mockSub({ id: 'sub_3', status: 'active', planId: 'lunary_plus' }),
      mockSub({
        id: 'sub_4',
        status: 'trialing',
        planId: 'lunary_plus_ai_annual',
      }),
    ];
    // active wins over all, even though trialing has higher-tier plan
    expect(pickBestSubscription(subs, getPlanType)?.id).toBe('sub_3');
  });

  it('does not mutate the original array', () => {
    const subs = [
      mockSub({ id: 'sub_1', status: 'canceled' }),
      mockSub({ id: 'sub_2', status: 'active' }),
    ];
    const originalOrder = subs.map((s) => s.id);
    pickBestSubscription(subs, getPlanType);
    expect(subs.map((s) => s.id)).toEqual(originalOrder);
  });
});

describe('getTrialLevel', () => {
  it('returns "plus" for lunary_plus', () => {
    expect(getTrialLevel('lunary_plus')).toBe('plus');
  });

  it('returns "pro" for lunary_plus_ai', () => {
    expect(getTrialLevel('lunary_plus_ai')).toBe('pro');
  });

  it('returns "pro" for lunary_plus_ai_annual', () => {
    expect(getTrialLevel('lunary_plus_ai_annual')).toBe('pro');
  });

  it('returns "pro" for unknown plan types (defaults to pro)', () => {
    expect(getTrialLevel('some_future_plan')).toBe('pro');
  });

  it('returns "pro" for free plan', () => {
    expect(getTrialLevel('free')).toBe('pro');
  });
});
