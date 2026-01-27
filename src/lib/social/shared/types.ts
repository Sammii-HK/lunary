/**
 * Shared types used across social copy and video script generators
 */

export enum ContentAspect {
  CORE_MEANING = 'core_meaning',
  COMMON_MISCONCEPTION = 'common_misconception',
  EMOTIONAL_IMPACT = 'emotional_impact',
  REAL_LIFE_EXPRESSION = 'real_life_expression',
  TIMING_AND_CONTEXT = 'timing_and_context',
  PRACTICAL_APPLICATION = 'practical_application',
  WHEN_TO_AVOID = 'when_to_avoid',
  SUBTLE_INSIGHT = 'subtle_insight',
}

export const CONTENT_ASPECTS: ContentAspect[] = [
  ContentAspect.CORE_MEANING,
  ContentAspect.COMMON_MISCONCEPTION,
  ContentAspect.EMOTIONAL_IMPACT,
  ContentAspect.REAL_LIFE_EXPRESSION,
  ContentAspect.TIMING_AND_CONTEXT,
  ContentAspect.PRACTICAL_APPLICATION,
  ContentAspect.WHEN_TO_AVOID,
  ContentAspect.SUBTLE_INSIGHT,
];

export type ContentDomain =
  | 'astrology'
  | 'tarot'
  | 'moon'
  | 'crystals'
  | 'numerology'
  | 'rituals';

export type ThemeCategory =
  | 'zodiac'
  | 'planetary'
  | 'lunar'
  | 'chakras'
  | 'tarot'
  | 'crystals'
  | 'numerology'
  | 'sabbat';

export type HashtagData = {
  domain: string;
  topic: string;
  brand: string;
};
