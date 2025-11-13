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
  yearly: 'lunary_plus',
  premium: 'lunary_plus_ai',
};

const NORMALISE = (value?: string | null): string | null => {
  if (!value) return null;
  return value.trim().toLowerCase();
};

export const resolvePlanId = (user: AuthenticatedUser): AiPlanId => {
  const fromUserPlan = NORMALISE(user.plan);
  if (fromUserPlan && PLAN_OVERRIDES[fromUserPlan]) {
    return PLAN_OVERRIDES[fromUserPlan];
  }

  const fromSubscription = NORMALISE(
    (user as any)?.subscription?.plan ?? (user as any)?.subscriptionPlan,
  );
  if (fromSubscription && SUBSCRIPTION_PLAN_MAP[fromSubscription]) {
    return SUBSCRIPTION_PLAN_MAP[fromSubscription];
  }

  return 'free';
};
