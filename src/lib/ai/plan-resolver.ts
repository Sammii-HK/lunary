import { AuthenticatedUser } from './auth';
import { AiPlanId } from './types';

const PLAN_OVERRIDES: Record<string, AiPlanId> = {
  'lunary+': 'lunary_plus',
  'lunary-plus': 'lunary_plus',
  lunaryplus: 'lunary_plus',
  'lunary+ ai': 'lunary_plus_ai',
  'lunary-plus-ai': 'lunary_plus_ai',
  lunaryplusai: 'lunary_plus_ai',
  'ai+': 'lunary_plus_ai',
};

const SUBSCRIPTION_PLAN_MAP: Record<string, AiPlanId> = {
  free: 'free',
  trial: 'lunary_plus',
  monthly: 'lunary_plus',
  yearly: 'lunary_plus_ai', // Yearly subscriptions get premium (Cosmic Master)
  premium: 'lunary_plus_ai',
};

const NORMALISE = (value?: string | null): string | null => {
  if (!value) return null;
  return value.trim().toLowerCase();
};

export const resolvePlanId = (user: AuthenticatedUser): AiPlanId => {
  const fromUserPlan = NORMALISE(user.plan);
  
  // Check plan overrides first (for legacy plan names)
  if (fromUserPlan && PLAN_OVERRIDES[fromUserPlan]) {
    return PLAN_OVERRIDES[fromUserPlan];
  }
  
  // Check if user.plan matches subscription plan map (monthly/yearly from database)
  if (fromUserPlan && SUBSCRIPTION_PLAN_MAP[fromUserPlan]) {
    return SUBSCRIPTION_PLAN_MAP[fromUserPlan];
  }

  // Fallback to checking subscription object
  const fromSubscription = NORMALISE(
    (user as any)?.subscription?.plan ?? (user as any)?.subscriptionPlan,
  );
  if (fromSubscription && SUBSCRIPTION_PLAN_MAP[fromSubscription]) {
    return SUBSCRIPTION_PLAN_MAP[fromSubscription];
  }

  return 'free';
};
