import type { ThemeCategory } from '@/lib/social/types';
import type { IGFormat } from './design-system';

// --- Post Types ---

export type IGPostType =
  | 'meme'
  | 'carousel'
  | 'angel_number_carousel'
  | 'one_word'
  | 'quote'
  | 'app_feature'
  | 'did_you_know'
  | 'sign_ranking'
  | 'compatibility'
  | 'story';

// Meme template variants
export type MemeTemplate = 'classic' | 'comparison' | 'callout' | 'hot_take';

// Meme content categories
export type MemeCategory =
  | 'zodiac_humor'
  | 'cosmic_truth'
  | 'retrograde_mood'
  | 'sign_callout';

// Carousel slide types
export type CarouselSlideVariant = 'cover' | 'body' | 'cta';

// --- Content Structures ---

export interface IGMemeContent {
  sign: string;
  setup: string;
  punchline: string;
  template: MemeTemplate;
  category: MemeCategory;
}

export interface IGCarouselSlide {
  slideIndex: number;
  totalSlides: number;
  title: string;
  content: string;
  subtitle?: string;
  symbol?: string;
  category: ThemeCategory;
  variant: CarouselSlideVariant;
}

export interface IGCarouselContent {
  title: string;
  category: ThemeCategory;
  slug: string;
  slides: IGCarouselSlide[];
}

// Story variants
export type StoryVariant =
  | 'daily_moon'
  | 'tarot_pull'
  | 'quote'
  | 'did_you_know'
  | 'affirmation'
  | 'ritual_tip'
  | 'sign_of_the_day'
  | 'transit_alert'
  | 'numerology';

// Rotating pool story types (2 slots/day, change daily)
export type RotatingStoryType =
  | 'affirmation'
  | 'ritual_tip'
  | 'sign_of_the_day'
  | 'transit_alert'
  | 'did_you_know'
  | 'numerology'
  | 'quote';

// --- New Content Structures ---

export interface IGDidYouKnowContent {
  fact: string;
  category: ThemeCategory;
  source: string; // grimoire slug reference
}

export interface IGSignRankingContent {
  trait: string;
  rankings: Array<{ sign: string; rank: number }>;
}

export interface IGCompatibilityContent {
  sign1: string;
  sign2: string;
  score: number;
  element1: string;
  element2: string;
  headline: string;
}

export interface IGStoryContent {
  variant: StoryVariant;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface IGStoryData {
  variant: StoryVariant;
  title: string;
  subtitle: string;
  params: Record<string, string>;
  endpoint: string;
}

// --- Post Batch ---

export interface IGPostBatch {
  date: string;
  posts: IGScheduledPost[];
}

export interface IGScheduledPost {
  type: IGPostType;
  format: IGFormat;
  imageUrls: string[];
  caption: string;
  hashtags: string[];
  scheduledTime: string; // ISO timestamp
  metadata: {
    category?: ThemeCategory;
    sign?: string;
    slug?: string;
    template?: MemeTemplate;
    moonPhase?: string;
    quoteText?: string;
    author?: string;
  };
}
