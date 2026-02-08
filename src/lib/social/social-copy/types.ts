/**
 * Types for social copy generation
 */

import type { HashtagData } from '../shared/types';

export type SocialPostType =
  | 'educational_intro'
  | 'educational_deep_1'
  | 'educational_deep_2'
  | 'educational_deep_3'
  | 'closing_ritual'
  | 'closing_statement'
  | 'persona'
  | 'question'
  | 'video_caption'
  | 'threads_question'
  | 'threads_beta_cta';

export type SourcePack = {
  topic: string;
  theme: string;
  platform: string;
  postType: SocialPostType;
  grimoireFacts: string[];
  grimoireExamples: string[];
  relatedKeywords: string[];
  contentDomain: string;
  topicDomain: string;
  topicDefinition: string;
  grimoireExcerpt: string;
  disallowedAnalogies: string[];
  searchKeyword: string;
  displayTitle?: string;
  topicTitle: string;
  categoryLabel: string;
  categoryContextClause: string;
  grimoireSnippets: string[];
  hashtagData: HashtagData;
  allowJournaling: boolean;
  tone: string;
  constraints: string[];
  needsContext: boolean;
  noveltyContext?: NoveltyContext;
};

export type SocialCopyResult = {
  content: string;
  hashtags: string[];
  title?: string;
  safetyChecks?: string[];
};

export type NoveltyContext = {
  recentTexts?: string[];
  recentOpenings?: string[];
  avoidBigrams?: string[];
  dayLabel?: string;
};

export type OpeningIntent =
  | 'definition'
  | 'misconception'
  | 'observation'
  | 'quick_rule'
  | 'question'
  | 'contrast'
  | 'signal';

export type OpeningVariation = {
  line: string;
  intent: OpeningIntent;
};

export type OpeningVariationOptions = {
  preferredIntent?: OpeningIntent;
  avoidOpenings?: string[];
  intentOrder?: OpeningIntent[];
};

export type VideoCaptionValidation = {
  issues: string[];
  lines: string[];
};

export const OPENING_INTENTS: OpeningIntent[] = [
  'definition',
  'misconception',
  'observation',
  'quick_rule',
  'question',
  'contrast',
  'signal',
];
