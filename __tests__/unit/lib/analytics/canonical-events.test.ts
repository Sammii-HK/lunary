import { canonicaliseEvent } from '@/lib/analytics/canonical-events';

describe('canonicaliseEvent', () => {
  it('maps legacy birth_chart_viewed -> chart_viewed and preserves audit metadata', () => {
    const result = canonicaliseEvent({
      eventType: 'birth_chart_viewed',
      userId: 'user_1',
      pagePath: '/birth-chart',
      metadata: { utm_source: 'tiktok', message: 'should_not_be_kept' },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.row.eventType).toBe('chart_viewed');
    expect(result.row.userId).toBe('user_1');
    expect(result.row.pagePath).toBe('/birth-chart');
    expect(result.row.metadata).toBeTruthy();
    expect(result.row.metadata).toMatchObject({
      canonical_event_type: 'chart_viewed',
      legacy_event_type: 'birth_chart_viewed',
      utm_source: 'tiktok',
    });
    expect((result.row.metadata as any).message).toBeUndefined();
  });

  it('maps legacy tarot and personalised horoscope events to activation events', () => {
    const tarot = canonicaliseEvent({
      eventType: 'tarot_viewed',
      userId: 'user_1',
    });
    const paidTarot = canonicaliseEvent({
      eventType: 'personalized_tarot_viewed',
      userId: 'user_1',
    });
    const horoscope = canonicaliseEvent({
      eventType: 'personalized_horoscope_viewed',
      userId: 'user_1',
    });

    expect(tarot.ok).toBe(true);
    expect(paidTarot.ok).toBe(true);
    expect(horoscope.ok).toBe(true);
    if (!tarot.ok || !paidTarot.ok || !horoscope.ok) return;

    expect(tarot.row.eventType).toBe('tarot_drawn');
    expect(paidTarot.row.eventType).toBe('tarot_drawn');
    expect(horoscope.row.eventType).toBe('horoscope_viewed');
  });

  it('accepts checkout funnel proof events', () => {
    const started = canonicaliseEvent({
      eventType: 'checkout_started',
      userId: 'user_1',
      metadata: { utm_source: 'threads', cta_id: 'pricing_monthly' },
    });
    const completed = canonicaliseEvent({
      eventType: 'checkout_completed',
      userId: 'user_1',
      metadata: { first_touch_source: 'threads' },
    });

    expect(started.ok).toBe(true);
    expect(completed.ok).toBe(true);
    if (!started.ok || !completed.ok) return;

    expect(started.row.eventType).toBe('checkout_started');
    expect(started.row.metadata).toMatchObject({
      canonical_event_type: 'checkout_started',
      utm_source: 'threads',
      cta_id: 'pricing_monthly',
    });
    expect(completed.row.eventType).toBe('checkout_completed');
  });

  it('supports anonymous users (userId derived from anonymousId)', () => {
    const result = canonicaliseEvent({
      eventType: 'signup',
      anonymousId: 'anon_123',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.row.eventType).toBe('signup_completed');
    expect(result.row.userId).toBe('anon:anon_123');
    expect(result.row.anonymousId).toBe('anon_123');
  });

  it('derives grimoire entity_id from pagePath when missing', () => {
    const result = canonicaliseEvent({
      eventType: 'grimoire_viewed',
      anonymousId: 'a1',
      pagePath: '/grimoire/houses/mars?x=1',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.row.entityType).toBe('grimoire');
    expect(result.row.entityId).toBe('houses/mars');
  });

  it('rejects unknown event types', () => {
    const result = canonicaliseEvent({
      eventType: 'unknown_event',
      userId: 'user_1',
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('skipped_invalid');
  });
});
