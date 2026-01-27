/**
 * Constants for video script generation
 */

import { ContentAspect } from '../shared/types';

export const VIDEO_ANGLE_OPTIONS = [
  'Misconception',
  'Felt experience',
  'Pattern recognition',
  'Timing nuance',
  'Practical observation',
];

export const SECONDARY_THEME_COOLDOWN_DAYS = 10;

export const DEBUG_VIDEO_HOOK = process.env.DEBUG_VIDEO_HOOK === '1';

/**
 * Map angle string to ContentAspect
 */
export const mapAngleToAspect = (angle: string): ContentAspect => {
  switch (angle) {
    case 'Misconception':
      return ContentAspect.COMMON_MISCONCEPTION;
    case 'Felt experience':
      return ContentAspect.EMOTIONAL_IMPACT;
    case 'Pattern recognition':
      return ContentAspect.SUBTLE_INSIGHT;
    case 'Timing nuance':
      return ContentAspect.TIMING_AND_CONTEXT;
    case 'Practical observation':
      return ContentAspect.PRACTICAL_APPLICATION;
    default:
      return ContentAspect.CORE_MEANING;
  }
};

/**
 * Get aspect label for prompts
 */
export const aspectLabel = (aspect: ContentAspect): string => {
  const labels: Record<ContentAspect, string> = {
    [ContentAspect.CORE_MEANING]: 'Core meaning and symbolism',
    [ContentAspect.COMMON_MISCONCEPTION]: 'Common misconception',
    [ContentAspect.EMOTIONAL_IMPACT]: 'Emotional or psychological impact',
    [ContentAspect.REAL_LIFE_EXPRESSION]: 'How it shows up in daily life',
    [ContentAspect.TIMING_AND_CONTEXT]: 'Timing and context',
    [ContentAspect.PRACTICAL_APPLICATION]: 'Practical application',
    [ContentAspect.WHEN_TO_AVOID]: 'When to avoid working with it',
    [ContentAspect.SUBTLE_INSIGHT]: 'Subtle or overlooked detail',
  };
  return labels[aspect];
};

/**
 * Slug prefixes allowed by category
 */
export const CATEGORY_SLUG_PREFIXES: Record<string, string[]> = {
  lunar: ['moon', 'moon/', 'moon-', 'moon-in', 'lunar', 'eclipses'],
  planetary: ['astronomy/planets', 'astronomy/retrogrades', 'planets'],
  zodiac: ['zodiac', 'rising-sign', 'birth-chart'],
  tarot: ['tarot', 'card-combinations', 'tarot-spreads'],
  crystals: ['crystals'],
  numerology: ['numerology', 'angel-numbers', 'life-path'],
  chakras: ['chakras'],
  sabbat: ['wheel-of-the-year', 'sabbats', 'sabbat'],
};

/**
 * Theme display name map for TikTok metadata
 */
export const THEME_DISPLAY_MAP: Record<string, string> = {
  zodiac: 'ASTROLOGY',
  tarot: 'TAROT',
  lunar: 'LUNAR CYCLES',
  planetary: 'PLANETS',
  crystals: 'CRYSTALS',
  numerology: 'NUMEROLOGY',
  chakras: 'CHAKRAS',
  sabbat: 'WHEEL OF THE YEAR',
};
