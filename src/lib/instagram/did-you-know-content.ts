import type { ThemeCategory } from '@/lib/social/types';
import type { IGDidYouKnowContent } from './types';
import { seededRandom } from './ig-utils';

// Fact pools by grimoire category - surprising, shareable, save-worthy facts
const FACT_POOLS: Record<string, Array<{ fact: string; source: string }>> = {
  tarot: [
    {
      fact: "The Death card doesn't mean literal death. It represents transformation, endings, and powerful new beginnings.",
      source: 'tarot/death',
    },
    {
      fact: 'The Fool is numbered 0, not 1. It represents infinite potential before the journey even begins.',
      source: 'tarot/the-fool',
    },
    {
      fact: 'The Tower card is actually one of the most healing cards in tarot. It destroys what was never built on solid ground.',
      source: 'tarot/the-tower',
    },
    {
      fact: "The High Priestess guards the threshold between the conscious and unconscious mind. She's the keeper of hidden knowledge.",
      source: 'tarot/the-high-priestess',
    },
    {
      fact: 'The Lovers card is really about choice and alignment, not just romantic love.',
      source: 'tarot/the-lovers',
    },
    {
      fact: "The Wheel of Fortune reminds us that nothing is permanent. What goes up must come down, and what's down will rise again.",
      source: 'tarot/wheel-of-fortune',
    },
    {
      fact: 'The Star card appears after The Tower for a reason. After destruction comes hope and healing.',
      source: 'tarot/the-star',
    },
    {
      fact: 'The Major Arcana tells a complete story called "The Fool\'s Journey" from innocence to enlightenment.',
      source: 'tarot/the-fool',
    },
  ],
  crystals: [
    {
      fact: "Amethyst gets its purple colour from iron impurities and natural radiation. The name comes from the Greek 'amethystos', meaning 'not intoxicated'.",
      source: 'crystals/amethyst',
    },
    {
      fact: "Rose Quartz has been used as a love talisman since 600 BC. Ancient Romans believed it was created by Cupid's tears.",
      source: 'crystals/rose-quartz',
    },
    {
      fact: "Citrine is called the 'merchant's stone' because it's believed to attract wealth. It never needs cleansing because it doesn't hold negative energy.",
      source: 'crystals/citrine',
    },
    {
      fact: 'Obsidian is volcanic glass formed when lava cools rapidly. Ancient civilisations used it for mirrors and surgical blades.',
      source: 'crystals/obsidian',
    },
    {
      fact: 'Moonstone appears to glow from within due to a phenomenon called adularescence, caused by light scattering between microscopic layers.',
      source: 'crystals/moonstone',
    },
    {
      fact: "Clear Quartz amplifies the energy of any crystal placed near it. It's called the 'master healer' for this reason.",
      source: 'crystals/clear-quartz',
    },
    {
      fact: "Labradorite's iridescent flash is called labradorescence. Inuit legend says it contains the Northern Lights trapped in stone.",
      source: 'crystals/labradorite',
    },
    {
      fact: 'Selenite is named after Selene, the Greek moon goddess. It dissolves in water, so never cleanse it with liquid.',
      source: 'crystals/selenite',
    },
  ],
  spells: [
    {
      fact: 'Moon water is most potent when charged under a full moon. Different moon phases infuse water with different intentions.',
      source: 'spells/moon-water',
    },
    {
      fact: 'Salt circles have been used for protection across almost every culture in history, from Ancient Rome to medieval Europe to Japanese Shinto.',
      source: 'spells/salt-circle-protection',
    },
    {
      fact: 'Candle colour matters in spellwork. White candles can substitute for any colour because they contain all colours in the spectrum.',
      source: 'spells/candle-spell',
    },
    {
      fact: 'Cord cutting rituals symbolically sever energetic attachments to people, habits, or situations that no longer serve you.',
      source: 'spells/cord-cutting',
    },
    {
      fact: "Mirror spells work on the principle of reflection: they send energy back to its source. That's why they're used for both protection and self-reflection.",
      source: 'spells/mirror-spell',
    },
    {
      fact: 'Money jars combine the magic of herbs, coins, and intention. They work through sympathetic magic: like attracts like.',
      source: 'spells/money-jar',
    },
  ],
  numerology: [
    {
      fact: "Seeing 11:11 isn't coincidence. In numerology, 11 is a master number representing spiritual awakening and intuitive insight.",
      source: 'numerology/angel-numbers/111',
    },
    {
      fact: "The number 222 means your manifestations are coming to fruition. It's the universe telling you to stay patient.",
      source: 'numerology/angel-numbers/222',
    },
    {
      fact: 'Your Life Path number is calculated from your full birth date. It reveals your core purpose and the lessons your soul chose to learn.',
      source: 'numerology/life-path/1',
    },
    {
      fact: '333 is the number of the Ascended Masters. When you see it, spiritual guides are nearby and want to help.',
      source: 'numerology/angel-numbers/333',
    },
    {
      fact: '444 means angels are surrounding you with protection and support. It appears most when you need reassurance.',
      source: 'numerology/angel-numbers/444',
    },
    {
      fact: '555 signals massive change is coming. In numerology, 5 is the number of freedom, adventure, and transformation.',
      source: 'numerology/angel-numbers/555',
    },
    {
      fact: '777 is the luckiest angel number. It means you are exactly where you are meant to be on your spiritual path.',
      source: 'numerology/angel-numbers/777',
    },
  ],
  runes: [
    {
      fact: 'The Elder Futhark has 24 runes, divided into three aettir of eight. Each aett is governed by a different Norse deity.',
      source: 'runes/fehu',
    },
    {
      fact: "Fehu, the first rune, literally means 'cattle'. In Norse society, cattle was wealth. It represents abundance and new beginnings.",
      source: 'runes/fehu',
    },
    {
      fact: "The word 'rune' comes from Old Norse 'rún', meaning 'secret' or 'whisper'. Runes were never just an alphabet: they were a system of magic.",
      source: 'runes/ansuz',
    },
    {
      fact: "Odin hung upside down from Yggdrasil for nine days and nights to gain the knowledge of runes. That's why rune magic is considered sacred.",
      source: 'runes/ansuz',
    },
    {
      fact: "The rune Gebo (ᚷ) means 'gift' and represents equal exchange. It's the origin of the X we use for kisses.",
      source: 'runes/gebo',
    },
  ],
  chakras: [
    {
      fact: "The word 'chakra' comes from Sanskrit meaning 'wheel'. There are 7 main chakras aligned along your spine, each spinning at a different frequency.",
      source: 'chakras/root',
    },
    {
      fact: "Your Heart Chakra is the bridge between the lower (physical) and upper (spiritual) chakras. It's where earthly and divine energy meet.",
      source: 'chakras/heart',
    },
    {
      fact: 'The Third Eye Chakra vibrates at the colour indigo. When balanced, it enhances intuition, foresight, and the ability to see beyond the physical.',
      source: 'chakras/third-eye',
    },
    {
      fact: 'The Root Chakra at the base of your spine governs your survival instincts. When blocked, anxiety and fear take over.',
      source: 'chakras/root',
    },
    {
      fact: 'The Crown Chakra is associated with the colour violet or white. When open, it connects you to universal consciousness and your highest self.',
      source: 'chakras/crown',
    },
  ],
  zodiac: [
    {
      fact: 'Your Sun sign is only one piece of the puzzle. Your Moon sign rules your emotions, and your Rising sign is how others perceive you.',
      source: 'zodiac/aries',
    },
    {
      fact: "Mercury retrograde happens 3-4 times per year and lasts about 3 weeks. It doesn't actually move backward: it's an optical illusion from Earth's perspective.",
      source: 'zodiac/gemini',
    },
    {
      fact: "Scorpio is the only sign ruled by two planets: Mars (traditional) and Pluto (modern). That's why Scorpios have both warrior energy and deep transformation power.",
      source: 'zodiac/scorpio',
    },
    {
      fact: 'The 12 zodiac signs are divided into 4 elements: Fire (action), Earth (stability), Air (intellect), Water (emotion). Your element reveals your core nature.',
      source: 'zodiac/aries',
    },
    {
      fact: "Pisces is the last sign of the zodiac, which means it carries a piece of every sign before it. That's why Pisces are the most empathic sign.",
      source: 'zodiac/pisces',
    },
    {
      fact: "Leo is ruled by the Sun, the only sign ruled by a star rather than a planet. That's why Leos naturally radiate main character energy.",
      source: 'zodiac/leo',
    },
  ],
};

const CATEGORIES: ThemeCategory[] = [
  'tarot',
  'crystals',
  'spells',
  'numerology',
  'runes',
  'chakras',
  'zodiac',
];

/**
 * Generate a "Did You Know" fact card for a given date.
 * Deterministic: same date = same fact.
 */
export function generateDidYouKnow(dateStr: string): IGDidYouKnowContent {
  const rng = seededRandom(`dyk-${dateStr}`);

  // Pick category
  const category = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
  const pool = FACT_POOLS[category] || FACT_POOLS.tarot;

  // Pick fact from pool
  const entry = pool[Math.floor(rng() * pool.length)];

  return {
    fact: entry.fact,
    category,
    source: entry.source,
  };
}

/**
 * Generate multiple "Did You Know" facts for preview purposes.
 */
export function generateDidYouKnowBatch(
  dateStr: string,
  count: number = 3,
): IGDidYouKnowContent[] {
  const results: IGDidYouKnowContent[] = [];
  const rng = seededRandom(`dyk-batch-${dateStr}`);

  const shuffledCategories = [...CATEGORIES].sort(() => rng() - 0.5);

  for (let i = 0; i < count; i++) {
    const category = shuffledCategories[i % shuffledCategories.length];
    const pool = FACT_POOLS[category] || FACT_POOLS.tarot;
    const entry = pool[Math.floor(rng() * pool.length)];

    results.push({
      fact: entry.fact,
      category,
      source: entry.source,
    });
  }

  return results;
}
