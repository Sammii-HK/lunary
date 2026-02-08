import type { ThemeCategory } from '@/lib/social/types';
import { seededRandom } from './ig-utils';

// Grimoire slug pools by category (representative samples that rotate)
const CATEGORY_SLUGS: Partial<Record<ThemeCategory, string[]>> = {
  tarot: [
    'tarot/the-fool',
    'tarot/the-magician',
    'tarot/the-high-priestess',
    'tarot/the-empress',
    'tarot/the-emperor',
    'tarot/the-hierophant',
    'tarot/the-lovers',
    'tarot/the-chariot',
    'tarot/strength',
    'tarot/the-hermit',
    'tarot/wheel-of-fortune',
    'tarot/justice',
    'tarot/the-hanged-man',
    'tarot/death',
    'tarot/temperance',
    'tarot/the-devil',
    'tarot/the-tower',
    'tarot/the-star',
    'tarot/the-moon',
    'tarot/the-sun',
    'tarot/judgement',
    'tarot/the-world',
  ],
  zodiac: [
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
  ],
  spells: [
    'spells/salt-circle-protection',
    'spells/mirror-spell',
    'spells/candle-spell',
    'spells/money-jar',
    'spells/love-spell',
    'spells/moon-water',
    'spells/banishing-spell',
    'spells/cord-cutting',
    'spells/cleansing-ritual',
    'spells/prosperity-spell',
    'spells/dream-spell',
    'spells/healing-spell',
  ],
  crystals: [
    'crystals/amethyst',
    'crystals/rose-quartz',
    'crystals/citrine',
    'crystals/obsidian',
    'crystals/moonstone',
    'crystals/clear-quartz',
    'crystals/labradorite',
    'crystals/selenite',
    'crystals/tigers-eye',
    'crystals/lapis-lazuli',
    'crystals/malachite',
    'crystals/turquoise',
  ],
  numerology: [
    'numerology/angel-numbers/111',
    'numerology/angel-numbers/222',
    'numerology/angel-numbers/333',
    'numerology/angel-numbers/444',
    'numerology/angel-numbers/555',
    'numerology/angel-numbers/777',
    'numerology/life-path/1',
    'numerology/life-path/7',
    'numerology/life-path/11',
    'numerology/life-path/22',
  ],
  runes: [
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
  ],
  chakras: [
    'chakras/root',
    'chakras/sacral',
    'chakras/solar-plexus',
    'chakras/heart',
    'chakras/throat',
    'chakras/third-eye',
    'chakras/crown',
  ],
  sabbat: [
    'sabbats/samhain',
    'sabbats/yule',
    'sabbats/imbolc',
    'sabbats/ostara',
    'sabbats/beltane',
    'sabbats/litha',
    'sabbats/lughnasadh',
    'sabbats/mabon',
  ],
};

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

  // Select slug within category
  const slugs = CATEGORY_SLUGS[category] || [];
  if (slugs.length === 0) {
    return { category: 'tarot', slug: 'tarot/the-fool' };
  }

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
