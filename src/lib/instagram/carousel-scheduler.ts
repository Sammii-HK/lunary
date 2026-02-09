import type { ThemeCategory } from '@/lib/social/types';
import { seededRandom } from './ig-utils';
import { crystalDatabase } from '@/constants/grimoire/crystals';
import spellsData from '@/data/spells.json';
import tarotData from '@/data/tarot-cards.json';

// Dynamically load ALL grimoire content from your databases
function getCategorySlugs(category: ThemeCategory): string[] {
  switch (category) {
    case 'crystals':
      // Use ALL 200+ crystals!
      return crystalDatabase.map((crystal) => `crystals/${crystal.id}`);

    case 'spells':
      // Use ALL 200+ spells!
      return (spellsData as any[]).map(
        (spell) =>
          `spells/${spell.id || spell.slug || spell.name.toLowerCase().replace(/\s+/g, '-')}`,
      );

    case 'tarot':
      // Use ALL tarot cards (Major + Minor Arcana)
      return (tarotData as any[]).map(
        (card) => `tarot/${card.slug || card.id}`,
      );

    case 'zodiac':
      return [
        'zodiac/aries',
        'zodiac/taurus',
        'zodiac/gemini',
        'zodiac/cancer',
        'zodiac/leo',
        'zodiac/virgo',
        'zodiac/libra',
        'zodiac/scorpio',
        'zodiac/sagittarius',
        'zodiac/capricorn',
        'zodiac/aquarius',
        'zodiac/pisces',
      ];

    case 'numerology':
      return [
        'numerology/angel-numbers/111',
        'numerology/angel-numbers/222',
        'numerology/angel-numbers/333',
        'numerology/angel-numbers/444',
        'numerology/angel-numbers/555',
        'numerology/angel-numbers/666',
        'numerology/angel-numbers/777',
        'numerology/angel-numbers/888',
        'numerology/angel-numbers/999',
        'numerology/life-path/1',
        'numerology/life-path/2',
        'numerology/life-path/3',
        'numerology/life-path/4',
        'numerology/life-path/5',
        'numerology/life-path/6',
        'numerology/life-path/7',
        'numerology/life-path/8',
        'numerology/life-path/9',
        'numerology/life-path/11',
        'numerology/life-path/22',
        'numerology/life-path/33',
      ];

    case 'runes':
      return [
        'runes/fehu',
        'runes/uruz',
        'runes/thurisaz',
        'runes/ansuz',
        'runes/raido',
        'runes/kenaz',
        'runes/gebo',
        'runes/wunjo',
        'runes/hagalaz',
        'runes/nauthiz',
        'runes/isa',
        'runes/jera',
        'runes/eihwaz',
        'runes/perthro',
        'runes/algiz',
        'runes/sowilo',
        'runes/tiwaz',
        'runes/berkano',
        'runes/ehwaz',
        'runes/mannaz',
        'runes/laguz',
        'runes/ingwaz',
        'runes/dagaz',
        'runes/othala',
      ];

    case 'chakras':
      return [
        'chakras/root',
        'chakras/sacral',
        'chakras/solar-plexus',
        'chakras/heart',
        'chakras/throat',
        'chakras/third-eye',
        'chakras/crown',
      ];

    case 'sabbat':
      return [
        'sabbats/samhain',
        'sabbats/yule',
        'sabbats/imbolc',
        'sabbats/ostara',
        'sabbats/beltane',
        'sabbats/litha',
        'sabbats/lughnasadh',
        'sabbats/mabon',
      ];

    default:
      return [];
  }
}

// Weights for carousel category selection (reuses existing weights but
// includes lower-weight categories that still make great carousels)
const CAROUSEL_WEIGHTS: Record<string, number> = {
  tarot: 4,
  zodiac: 3,
  spells: 3,
  crystals: 3,
  numerology: 2,
  runes: 1,
  chakras: 1,
  sabbat: 0, // seasonal only - handled separately
};

/**
 * Select a carousel category and slug for a given date.
 * Deterministic: same date = same selection.
 * Now using FULL grimoire databases (200+ crystals, 200+ spells, all tarot)
 */
export function selectCarouselForDate(date: string): {
  category: ThemeCategory;
  slug: string;
} {
  const rng = seededRandom(`carousel-${date}`);

  // Build weighted pool
  const pool: ThemeCategory[] = [];
  for (const [cat, weight] of Object.entries(CAROUSEL_WEIGHTS)) {
    for (let i = 0; i < weight; i++) {
      pool.push(cat as ThemeCategory);
    }
  }

  // Select category
  const category = pool[Math.floor(rng() * pool.length)];

  // Get ALL slugs for this category from full databases
  const slugs = getCategorySlugs(category);
  if (slugs.length === 0) {
    console.warn(
      `[Carousel Scheduler] No slugs found for category: ${category}`,
    );
    return { category: 'crystals', slug: 'crystals/amethyst' };
  }

  // Select slug deterministically from FULL pool (200+ options!)
  const slug = slugs[Math.floor(rng() * slugs.length)];

  return { category, slug };
}

/**
 * Get the carousel posting schedule for a week.
 * Returns dates (Tue/Thu/Sat) with their carousel selections.
 */
export function getWeeklyCarouselSchedule(
  weekStartDate: string,
): Array<{ date: string; category: ThemeCategory; slug: string }> {
  const start = new Date(weekStartDate);
  const schedule: Array<{
    date: string;
    category: ThemeCategory;
    slug: string;
  }> = [];

  // Tue (day 2), Thu (day 4), Sat (day 6) from week start (Monday = day 0)
  const carouselDays = [1, 3, 5]; // 0-indexed offsets from Monday

  for (const offset of carouselDays) {
    const d = new Date(start);
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split('T')[0];
    const selection = selectCarouselForDate(dateStr);
    schedule.push({ date: dateStr, ...selection });
  }

  return schedule;
}
