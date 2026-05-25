import { deterministicEventId } from './deterministic-event-id';

export type AuthLifecycleEventType =
  | 'signup'
  | 'signup_completed'
  | 'trial_started';

export type AuthLifecycleUser = {
  id: string;
  email?: string | null;
  createdAt?: Date | string | null;
};

export type AuthLifecycleConversionEvent = {
  eventType: AuthLifecycleEventType;
  eventId: string;
  userId: string;
  userEmail: string | null;
  planType: string | null;
  trialDaysRemaining: number | null;
  featureName: string | null;
  pagePath: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

function normalizeEmail(email?: string | null): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

function normalizeCreatedAt(createdAt?: Date | string | null): Date {
  if (createdAt instanceof Date && Number.isFinite(createdAt.getTime())) {
    return createdAt;
  }

  if (typeof createdAt === 'string') {
    const parsed = new Date(createdAt);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }

  return new Date();
}

function daysUntil(value: Date, from: Date): number {
  const diffMs = value.getTime() - from.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function buildAuthLifecycleConversionEvents(params: {
  user: AuthLifecycleUser;
  trialEndsAt?: Date | string | null;
  includeTrialStarted?: boolean;
}): AuthLifecycleConversionEvent[] {
  const createdAt = normalizeCreatedAt(params.user.createdAt);
  const userEmail = normalizeEmail(params.user.email);
  const base = {
    userId: params.user.id,
    userEmail,
    pagePath: null,
    createdAt,
  };

  const events: AuthLifecycleConversionEvent[] = [
    {
      ...base,
      eventType: 'signup',
      eventId: deterministicEventId('auth', 'signup', params.user.id),
      planType: null,
      trialDaysRemaining: null,
      featureName: 'auth_signup',
      metadata: {
        source: 'auth',
        legacy_event_type: 'signup',
        canonical_pair: 'signup_completed',
      },
    },
    {
      ...base,
      eventType: 'signup_completed',
      eventId: deterministicEventId('auth', 'signup_completed', params.user.id),
      planType: null,
      trialDaysRemaining: null,
      featureName: 'auth_signup',
      metadata: {
        source: 'auth',
        canonical_event_type: 'signup_completed',
        paired_legacy_event_type: 'signup',
      },
    },
  ];

  if (!params.includeTrialStarted || !params.trialEndsAt) {
    return events;
  }

  const trialEndsAt =
    params.trialEndsAt instanceof Date
      ? params.trialEndsAt
      : new Date(params.trialEndsAt);
  const trialDaysRemaining = Number.isFinite(trialEndsAt.getTime())
    ? daysUntil(trialEndsAt, createdAt)
    : 7;

  events.push({
    ...base,
    eventType: 'trial_started',
    eventId: deterministicEventId('auth', 'trial_started', params.user.id),
    planType: 'lunary_plus',
    trialDaysRemaining,
    featureName: 'auto_trial',
    metadata: {
      source: 'auth',
      canonical_event_type: 'trial_started',
      trial_source: 'auto_signup_trial',
      trial_length_days: 7,
      trial_ends_at: Number.isFinite(trialEndsAt.getTime())
        ? trialEndsAt.toISOString()
        : null,
    },
  });

  return events;
}
