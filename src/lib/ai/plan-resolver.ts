import { AuthenticatedUser } from './auth';
import { AiPlanId } from './types';

const PLAN_OVERRIDES: Record<string, AiPlanId> = {
  'lunary+': 'lunary_plus',
  'lunary plus': 'lunary_plus',
  lunaryplus: 'lunary_plus',
  'lunary+ ai': 'lunary_plus_ai',
  'lunary plus ai': 'lunary_plus_ai',
  lunaryplusai: 'lunary_plus_ai',
  'ai+': 'lunary_plus_ai',
  'cosmic explorer': 'free',
  'cosmic guide': 'lunary_plus',
  'cosmic master': 'lunary_plus_ai',
};

const SUBSCRIPTION_PLAN_MAP: Record<string, AiPlanId> = {
  free: 'free',
  trial: 'lunary_plus',
  monthly: 'lunary_plus',
  yearly: 'lunary_plus_ai',
  annual: 'lunary_plus_ai',
  premium: 'lunary_plus_ai',
  'cosmic explorer': 'free',
  'cosmic guide': 'lunary_plus',
  'cosmic master': 'lunary_plus_ai',
};

const NORMALISE = (value?: string | null): string | null => {
  if (!value) return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
  const withoutParens = cleaned
    .replace(/\((.*?)\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return withoutParens || cleaned;
};

const resolveFromValue = (value?: string | null): AiPlanId | null => {
  const normalized = NORMALISE(value);
  if (!normalized) return null;

  if (PLAN_OVERRIDES[normalized]) {
    return PLAN_OVERRIDES[normalized];
  }

  if (SUBSCRIPTION_PLAN_MAP[normalized]) {
    return SUBSCRIPTION_PLAN_MAP[normalized];
  }

  if (normalized.includes('cosmic master') || normalized.includes('annual')) {
    return 'lunary_plus_ai';
  }

  if (normalized.includes('cosmic guide') || normalized.includes('monthly')) {
    return 'lunary_plus';
  }

  if (normalized.includes('cosmic explorer')) {
    return 'free';
  }

  return null;
};

export const resolvePlanId = (user: AuthenticatedUser): AiPlanId => {
  const planCandidates = [
    user.plan,
    (user as any)?.subscription?.plan,
    (user as any)?.subscription?.plan_type,
    (user as any)?.subscriptionPlan,
    (user as any)?.plan_type,
  ];

  for (const candidate of planCandidates) {
    const resolved = resolveFromValue(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return 'free';
};
