/**
 * Pinterest Evergreen Content Generator
 *
 * Generates keyword-rich evergreen pins for Pinterest.
 * Pinterest is a search engine — series framing is meaningless here.
 * Keywords > hashtags (already at 0). Evergreen educational content performs best.
 *
 * Format: SEO-focused title + keyword-rich description (~220-232 chars ideal)
 * No hashtags, no series framing, no partNumber/totalParts
 * Schedule: 1-3 fresh pins daily
 */

import { FACT_POOLS } from '@/lib/instagram/did-you-know-content';
import { seededRandom } from '@/lib/instagram/ig-utils';
import type { ThemeCategory } from '@/lib/social/types';

const CATEGORIES: ThemeCategory[] = [
  'tarot',
  'crystals',
  'spells',
  'numerology',
  'runes',
  'chakras',
  'zodiac',
];

// SEO keyword prefixes by category (front-loaded for Pinterest search)
const SEO_TITLES: Record<string, string[]> = {
  tarot: [
    'Tarot Card Meanings',
    'Tarot Reading Guide',
    'Tarot for Beginners',
    'Tarot Card Facts',
    'Understanding Tarot',
  ],
  crystals: [
    'Crystal Healing Guide',
    'Crystal Meanings and Properties',
    'Healing Crystals for Beginners',
    'Crystal Facts You Should Know',
    'Crystal Energy Guide',
  ],
  spells: [
    'Beginner Spell Guide',
    'Spell and Ritual Basics',
    'Witchcraft for Beginners',
    'Easy Spells and Rituals',
    'Magic Spell Guide',
  ],
  numerology: [
    'Numerology Basics',
    'Angel Number Meanings',
    'Numerology Guide for Beginners',
    'Understanding Angel Numbers',
    'Life Path Number Guide',
  ],
  runes: [
    'Elder Futhark Rune Meanings',
    'Norse Rune Guide',
    'Rune Reading for Beginners',
    'Viking Rune Facts',
    'Rune Divination Guide',
  ],
  chakras: [
    'Chakra Healing Guide',
    'Understanding the 7 Chakras',
    'Chakra Balancing Tips',
    'Chakra Energy Guide',
    'Chakra Meditation Basics',
  ],
  zodiac: [
    'Astrology Facts',
    'Zodiac Sign Guide',
    'Birth Chart Basics',
    'Astrology for Beginners',
    'Zodiac Sign Meanings',
  ],
};

// CTA lines for Pinterest descriptions (evergreen, link-worthy)
const CTA_LINES: string[] = [
  'Save this for later. Learn more at lunary.app',
  'Pin this to your spiritual board. Explore more at lunary.app',
  'Bookmark for your journey. Discover more at lunary.app',
  'Save for when you need this. Visit lunary.app for more',
  'Pin this guide. Find your cosmic blueprint at lunary.app',
];

export interface PinterestPin {
  title: string;
  description: string;
  category: ThemeCategory;
  fact: string;
  source: string;
  scheduledHour: number;
}

// Pinterest posting hours (UTC): spread for optimal reach
const PINTEREST_HOURS = [11, 15, 20];

export function generatePinterestPins(dateStr: string): PinterestPin[] {
  const pins: PinterestPin[] = [];
  // Generate 1-3 pins deterministically
  const countRng = seededRandom(`pinterest-count-${dateStr}`);
  const pinCount = 1 + Math.floor(countRng() * 3); // 1-3

  for (let slot = 0; slot < pinCount; slot++) {
    const rng = seededRandom(`pinterest-${dateStr}-${slot}`);
    const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
    const pool = FACT_POOLS[category] ?? FACT_POOLS.tarot;
    const entry = pool[Math.floor(rng() * pool.length)];

    // Pick SEO title
    const titles = SEO_TITLES[category] ?? SEO_TITLES.tarot;
    const title = titles[Math.floor(rng() * titles.length)];

    // Pick CTA
    const cta = CTA_LINES[Math.floor(rng() * CTA_LINES.length)];

    // Build keyword-rich description (~220-232 chars ideal)
    // Front-load the fact, then add CTA
    const description = `${entry.fact} ${cta}`;

    pins.push({
      title,
      description,
      category,
      fact: entry.fact,
      source: entry.source,
      scheduledHour: PINTEREST_HOURS[slot % PINTEREST_HOURS.length],
    });
  }

  return pins;
}
