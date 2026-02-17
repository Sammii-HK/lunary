import type { ThemeCategory } from '@/lib/social/types';

/** Content pillar for Threads posts */
export type ThreadsPillar =
  | 'cosmic_timing'
  | 'conversation'
  | 'identity'
  | 'educational'
  | 'visual_crosspost';

/** Source of Threads content */
export type ThreadsSource = 'original' | 'ig_crosspost';

export interface ThreadsPost {
  hook: string;
  body: string;
  prompt: string;
  topicTag: string;
  hasImage: boolean;
  imageUrl: string | null;
  pillar: ThreadsPillar;
  scheduledTime: string; // ISO timestamp
  source: ThreadsSource;
}

export interface ThreadsPostBatch {
  date: string;
  posts: ThreadsPost[];
}

/** Map ThemeCategory to a single Threads topic tag */
export const THREADS_TOPIC_TAGS: Record<ThemeCategory, string> = {
  zodiac: 'Astrology',
  tarot: 'Tarot',
  lunar: 'Moon',
  planetary: 'Astrology',
  crystals: 'Crystals',
  numerology: 'Numerology',
  chakras: 'Spirituality',
  sabbat: 'Spirituality',
  runes: 'Spirituality',
  spells: 'Spirituality',
};

/** Weekday posting slots (3 posts/day) in UTC hours — UK/US crossover window */
export const WEEKDAY_SLOTS_UTC = [14, 17, 21];

/** Weekend posting slots (2 posts/day) in UTC hours — UK/US crossover window */
export const WEEKEND_SLOTS_UTC = [14, 20];

/** Character limits for Threads posts */
export const THREADS_CHAR_LIMITS = {
  hook: 80,
  body: 200,
  total: 300,
} as const;

/** IG post types that can be cross-posted to Threads with images */
export const CROSSPOSTABLE_IG_TYPES = [
  'meme',
  'sign_ranking',
  'compatibility',
  'did_you_know',
  'quote',
] as const;

export type CrosspostableIGType = (typeof CROSSPOSTABLE_IG_TYPES)[number];
