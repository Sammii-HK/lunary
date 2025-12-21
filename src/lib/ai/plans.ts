import { AiPlan, AiPlanId } from './types';

export const AI_PLANS: Record<AiPlanId, AiPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceGBP: 0,
    dailyMessageLimit: 3,
    memoryTurns: 0,
    features: ['Basic Q&A', 'Astrology primer responses'],
  },
  lunary_plus: {
    id: 'lunary_plus',
    name: 'Lunary+',
    priceGBP: 4.99,
    dailyMessageLimit: 50,
    memoryTurns: 20,
    features: [
      'Full astrological context (tarot, transits, moon)',
      'Expanded emotional reflection',
      'Assist commands',
    ],
    addOns: {
      aiPackPriceGBP: 2.99,
      creditPacks: [
        { credits: 10, priceGBP: 1.99 },
        { credits: 50, priceGBP: 6.99 },
      ],
    },
  },
  lunary_plus_ai: {
    id: 'lunary_plus_ai',
    name: 'Lunary+ AI',
    priceGBP: 8.99,
    dailyMessageLimit: 300,
    memoryTurns: 50,
    features: [
      'Deeper analysis with journaling & rituals',
      'Companion memory (longer reflections)',
      'Early access to assist modules',
    ],
    addOns: {
      aiPackPriceGBP: 2.99,
      creditPacks: [
        { credits: 10, priceGBP: 1.99 },
        { credits: 50, priceGBP: 6.99 },
      ],
    },
  },
  lunary_plus_ai_annual: {
    id: 'lunary_plus_ai_annual',
    name: 'Lunary+ AI Annual',
    priceGBP: 89.99,
    dailyMessageLimit: 300,
    memoryTurns: 50,
    features: [
      'Deeper analysis with journaling & rituals',
      'Companion memory (longer reflections)',
      'Early access to assist modules',
      'Extended timeline analysis',
      'Yearly forecast',
      'Data export',
    ],
    addOns: {
      aiPackPriceGBP: 2.99,
      creditPacks: [
        { credits: 10, priceGBP: 1.99 },
        { credits: 50, priceGBP: 6.99 },
      ],
    },
  },
};

export const DEFAULT_PLAN_ORDER: AiPlanId[] = [
  'free',
  'lunary_plus',
  'lunary_plus_ai',
  'lunary_plus_ai_annual',
];

export const PRICE_TEST_VARIANTS = [7.99, 8.99, 9.99];

export const DAILY_MESSAGE_LIMITS: Record<AiPlanId, number> = {
  free: AI_PLANS.free.dailyMessageLimit,
  lunary_plus: AI_PLANS.lunary_plus.dailyMessageLimit,
  lunary_plus_ai: AI_PLANS.lunary_plus_ai.dailyMessageLimit,
  lunary_plus_ai_annual: AI_PLANS.lunary_plus_ai_annual.dailyMessageLimit,
};

export const MEMORY_TURN_LIMITS: Record<AiPlanId, number> = {
  free: AI_PLANS.free.memoryTurns,
  lunary_plus: AI_PLANS.lunary_plus.memoryTurns,
  lunary_plus_ai: AI_PLANS.lunary_plus_ai.memoryTurns,
  lunary_plus_ai_annual: AI_PLANS.lunary_plus_ai_annual.memoryTurns,
};

export const PLAN_LIMITS = {
  requestPerSecond: 1,
  requestsPerMinutePerIp: 10,
};

export const CONTEXT_RULES: Record<
  AiPlanId,
  {
    historyLimit: number;
    includeMood: boolean;
  }
> = {
  free: {
    historyLimit: 0,
    includeMood: false,
  },
  lunary_plus: {
    historyLimit: 4,
    includeMood: true,
  },
  lunary_plus_ai: {
    historyLimit: 8,
    includeMood: true,
  },
  lunary_plus_ai_annual: {
    historyLimit: 8,
    includeMood: true,
  },
};

export const MEMORY_SNIPPET_LIMITS: Record<AiPlanId, number> = {
  free: 0,
  lunary_plus: 2,
  lunary_plus_ai: 4,
  lunary_plus_ai_annual: 4,
};

export type PlanUsageSnapshot = {
  userId: string;
  planId: AiPlanId;
  day: string;
  usedMessages: number;
  tokensIn: number;
  tokensOut: number;
};

export const AI_LIMIT_REACHED_MESSAGE =
  "You've reached your daily message limit. Your limit will reset tomorrow, or upgrade your plan for more messages.";
