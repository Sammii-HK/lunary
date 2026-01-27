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
  yearly: 'lunary_plus_ai_annual',
  annual: 'lunary_plus_ai_annual',
  premium: 'lunary_plus_ai',
  'cosmic explorer': 'free',
  'cosmic guide': 'lunary_plus',
  'cosmic master': 'lunary_plus_ai',
  lunary_plus: 'lunary_plus',
  lunary_plus_ai: 'lunary_plus_ai',
  lunary_plus_ai_annual: 'lunary_plus_ai_annual',
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

  if (
    normalized.includes('cosmic master') ||
    normalized.includes('lunary_plus_ai_annual') ||
    (normalized.includes('annual') && normalized.includes('ai'))
  ) {
    return 'lunary_plus_ai_annual';
  }

  if (normalized.includes('lunary_plus_ai') && !normalized.includes('annual')) {
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

  console.log('[Plan Resolver] Checking user plan:', {
    userId: user.id,
    userPlan: user.plan,
    candidates: planCandidates,
  });

  for (const candidate of planCandidates) {
    const resolved = resolveFromValue(candidate);
    if (resolved) {
      console.log(
        '[Plan Resolver] Resolved to:',
        resolved,
        'from candidate:',
        candidate,
      );
      return resolved;
    }
  }

  console.warn(
    '[Plan Resolver] No plan found, defaulting to free for user:',
    user.id,
  );
  return 'free';
};
