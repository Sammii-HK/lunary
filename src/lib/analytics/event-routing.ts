import type { CanonicalEventType } from '@/lib/analytics/canonical-events';
import { forwardEventToPostHog } from '@/lib/posthog-forward';

const POSTHOG_ONLY_EVENTS = new Set<CanonicalEventType>([
  'page_viewed',
  'cta_impression',
  'cta_clicked',
]);

export function shouldPersistEventToNeon(
  eventType: CanonicalEventType,
): boolean {
  return !POSTHOG_ONLY_EVENTS.has(eventType);
}

type ForwardableCanonicalEvent = {
  eventType: CanonicalEventType;
  eventId: string | null;
  userId: string;
  anonymousId: string | null;
  planType: string | null;
  trialDaysRemaining: number | null;
  featureName: string | null;
  pagePath: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
};

export function forwardCanonicalEventToPostHog(
  row: ForwardableCanonicalEvent,
): void {
  const distinctId = row.anonymousId || row.userId || 'unknown';

  forwardEventToPostHog({
    distinctId,
    event: row.eventType,
    properties: {
      ...(row.metadata || {}),
      event_id: row.eventId,
      plan_type: row.planType,
      trial_days_remaining: row.trialDaysRemaining,
      feature_name: row.featureName,
      page_path: row.pagePath,
      entity_type: row.entityType,
      entity_id: row.entityId,
      authenticated: !row.userId.startsWith('anon:'),
    },
  });
}
