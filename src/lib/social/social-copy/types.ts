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

/**
 * Optional transit/event brief from the CalendarEvent system.
 * Passed in when the topic is tied to a specific cosmic event so
 * the prompt can lead with rarity, historical context, and convergence data.
 */
export type TransitBrief = {
  /** Human-readable event name, e.g. 'Neptune returns to Aries' */
  eventName: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** CRITICAL | HIGH | MEDIUM | LOW */
  rarity: string;
  /** 0-100 significance score */
  score: number;
  /** Full orbital period in years */
  orbitalPeriodYears?: number;
  /** Time spent in each sign */
  yearsPerSign?: number;
  /** When the planet was last in this sign, e.g. '1861-1875' */
  lastInThisSign?: string;
  /** What happened during the previous visit */
  historicalContext?: string;
  /** Pre-built rarity framing string */
  rarityFrame?: string;
  /** Pre-built content hooks from the event calendar */
  hookSuggestions?: string[];
  /** Event type discriminator */
  eventType?: string;
  /** Planet name when applicable */
  planet?: string;
  /** Zodiac sign when applicable */
  sign?: string;
};

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
  /** Optional event calendar data for transit/cosmic event posts */
  transitBrief?: TransitBrief;
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
