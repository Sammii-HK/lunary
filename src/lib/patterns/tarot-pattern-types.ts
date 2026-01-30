/**
 * Shared TypeScript types for tarot pattern visualizations
 */

export type UserTier =
  | 'free'
  | 'lunary_plus'
  | 'lunary_plus_ai'
  | 'lunary_plus_ai_annual';

export const TIER_LABELS: Record<UserTier, string> = {
  free: 'Free',
  lunary_plus: 'Lunary+',
  lunary_plus_ai: 'Pro Monthly',
  lunary_plus_ai_annual: 'Pro Annual',
};

export interface PatternTheme {
  label: string;
  detail?: string;
  trend?: 'up' | 'down' | 'stable';
  strength?: number; // 0-100
  count?: number;
  appearanceDates?: string[];
}

export interface FrequentCard {
  name: string;
  count: number;
  percentage: number;
  suit?: string;
  meaning?: string;
  emoji?: string;
  appearances: Array<{ date: string; readingId?: string }>;
}

export interface SuitPattern {
  suit: string;
  count: number;
  percentage: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface PatternAnalysis {
  dominantThemes: PatternTheme[];
  frequentCards: FrequentCard[];
  suitPatterns: SuitPattern[];
  arcanaBalance: {
    major: number;
    minor: number;
  };
  totalReadings: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface PatternFeatureConfig {
  free: {
    limit?: number | null;
    [key: string]: any;
  };
  lunary_plus: {
    limit?: number | null;
    [key: string]: any;
  };
  lunary_plus_ai: {
    limit?: number | null;
    showTrends?: boolean;
    aiInsights?: boolean;
    [key: string]: any;
  };
  lunary_plus_ai_annual: {
    limit?: number | null;
    showTrends?: boolean;
    aiInsights?: boolean;
    [key: string]: any;
  };
}

export const PATTERN_FEATURES: Record<string, PatternFeatureConfig> = {
  dominantThemes: {
    free: { limit: 3 },
    lunary_plus: { limit: 5 },
    lunary_plus_ai: { limit: null, showTrends: true },
    lunary_plus_ai_annual: { limit: null, showTrends: true, aiInsights: true },
  },
  frequentCards: {
    free: { limit: 5 },
    lunary_plus: { limit: 10 },
    lunary_plus_ai: { limit: 15, allowDrillDown: true },
    lunary_plus_ai_annual: {
      limit: null,
      allowDrillDown: true,
      showCombinations: true,
    },
  },
  timeRange: {
    free: { maxDays: 7 },
    lunary_plus: { maxDays: 90 },
    lunary_plus_ai: { maxDays: 365 },
    lunary_plus_ai_annual: { maxDays: 365 },
  },
};

export function getFeatureConfig(feature: string, tier: UserTier): any {
  return PATTERN_FEATURES[feature]?.[tier] || {};
}
