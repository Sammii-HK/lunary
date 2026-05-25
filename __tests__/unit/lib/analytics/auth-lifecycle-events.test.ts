import { buildAuthLifecycleConversionEvents } from '@/lib/analytics/auth-lifecycle-events';

describe('buildAuthLifecycleConversionEvents', () => {
  it('records signup, canonical signup, and auto-trial proof for new users', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: {
        id: 'user_1',
        email: ' SAMMII@EXAMPLE.COM ',
        createdAt: '2026-05-25T10:00:00.000Z',
      },
      trialEndsAt: '2026-06-01T10:00:00.000Z',
      includeTrialStarted: true,
    });

    expect(events.map((event) => event.eventType)).toEqual([
      'signup',
      'signup_completed',
      'trial_started',
    ]);
    expect(events.map((event) => event.userEmail)).toEqual([
      'sammii@example.com',
      'sammii@example.com',
      'sammii@example.com',
    ]);
    expect(events[0].metadata).toMatchObject({
      source: 'auth',
      canonical_pair: 'signup_completed',
    });
    expect(events[1].metadata).toMatchObject({
      canonical_event_type: 'signup_completed',
      paired_legacy_event_type: 'signup',
    });
    expect(events[2]).toMatchObject({
      planType: 'lunary_plus',
      trialDaysRemaining: 7,
      featureName: 'auto_trial',
      metadata: {
        canonical_event_type: 'trial_started',
        trial_source: 'auto_signup_trial',
      },
    });
  });

  it('omits trial_started when the subscription insert was not created', () => {
    const events = buildAuthLifecycleConversionEvents({
      user: { id: 'user_2', email: null },
      trialEndsAt: '2026-06-01T10:00:00.000Z',
      includeTrialStarted: false,
    });

    expect(events.map((event) => event.eventType)).toEqual([
      'signup',
      'signup_completed',
    ]);
  });

  it('uses deterministic event ids for auth lifecycle deduplication', () => {
    const params = {
      user: { id: 'user_3', email: 'a@example.com' },
      trialEndsAt: '2026-06-01T10:00:00.000Z',
      includeTrialStarted: true,
    };

    const first = buildAuthLifecycleConversionEvents(params);
    const second = buildAuthLifecycleConversionEvents(params);

    expect(first.map((event) => event.eventId)).toEqual(
      second.map((event) => event.eventId),
    );
  });
});
