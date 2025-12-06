/**
 * Grimoire Search Index
 * Pre-built search index for the "Ask the Grimoire" semantic search feature
 * This provides fast keyword-based search without requiring vector embeddings
 */

export interface GrimoireEntry {
  slug: string;
  title: string;
  category: 'zodiac' | 'planet' | 'tarot' | 'crystal' | 'ritual' | 'concept';
  keywords: string[];
  summary: string;
  relatedSlugs: string[];
}

export const GRIMOIRE_SEARCH_INDEX: GrimoireEntry[] = [
  // ============================================================================
  // ZODIAC SIGNS
  // ============================================================================
  {
    slug: 'zodiac/aries',
    title: 'Aries',
    category: 'zodiac',
    keywords: [
      'aries',
      'ram',
      'fire sign',
      'cardinal',
      'mars ruled',
      'first sign',
      'spring',
      'pioneer',
      'warrior',
      'leader',
    ],
    summary:
      'Aries is the first sign of the zodiac, a cardinal fire sign ruled by Mars. Known for courage, initiative, and pioneering spirit.',
    relatedSlugs: [
      'astronomy/planets/mars',
      'tarot/the-emperor',
      'crystals/carnelian',
    ],
  },
  {
    slug: 'zodiac/taurus',
    title: 'Taurus',
    category: 'zodiac',
    keywords: [
      'taurus',
      'bull',
      'earth sign',
      'fixed',
      'venus ruled',
      'second sign',
      'sensual',
      'stable',
      'luxury',
      'patient',
    ],
    summary:
      'Taurus is the second sign of the zodiac, a fixed earth sign ruled by Venus. Known for stability, sensuality, and appreciation of beauty.',
    relatedSlugs: [
      'astronomy/planets/venus',
      'tarot/the-hierophant',
      'crystals/rose-quartz',
    ],
  },
  {
    slug: 'zodiac/gemini',
    title: 'Gemini',
    category: 'zodiac',
    keywords: [
      'gemini',
      'twins',
      'air sign',
      'mutable',
      'mercury ruled',
      'third sign',
      'communication',
      'curious',
      'versatile',
      'intellectual',
    ],
    summary:
      'Gemini is the third sign of the zodiac, a mutable air sign ruled by Mercury. Known for curiosity, communication, and adaptability.',
    relatedSlugs: [
      'astronomy/planets/mercury',
      'tarot/the-lovers',
      'crystals/citrine',
    ],
  },
  {
    slug: 'zodiac/cancer',
    title: 'Cancer',
    category: 'zodiac',
    keywords: [
      'cancer',
      'crab',
      'water sign',
      'cardinal',
      'moon ruled',
      'fourth sign',
      'emotional',
      'nurturing',
      'home',
      'family',
      'protective',
    ],
    summary:
      'Cancer is the fourth sign of the zodiac, a cardinal water sign ruled by the Moon. Known for nurturing, emotional depth, and strong family bonds.',
    relatedSlugs: [
      'astronomy/planets/moon',
      'tarot/the-chariot',
      'crystals/moonstone',
    ],
  },
  {
    slug: 'zodiac/leo',
    title: 'Leo',
    category: 'zodiac',
    keywords: [
      'leo',
      'lion',
      'fire sign',
      'fixed',
      'sun ruled',
      'fifth sign',
      'creative',
      'dramatic',
      'generous',
      'confident',
      'leader',
    ],
    summary:
      'Leo is the fifth sign of the zodiac, a fixed fire sign ruled by the Sun. Known for creativity, confidence, and natural leadership.',
    relatedSlugs: [
      'astronomy/planets/sun',
      'tarot/strength',
      'crystals/sunstone',
    ],
  },
  {
    slug: 'zodiac/virgo',
    title: 'Virgo',
    category: 'zodiac',
    keywords: [
      'virgo',
      'virgin',
      'maiden',
      'earth sign',
      'mutable',
      'mercury ruled',
      'sixth sign',
      'analytical',
      'practical',
      'detail',
      'service',
      'health',
    ],
    summary:
      'Virgo is the sixth sign of the zodiac, a mutable earth sign ruled by Mercury. Known for analytical thinking, attention to detail, and service.',
    relatedSlugs: [
      'astronomy/planets/mercury',
      'tarot/the-hermit',
      'crystals/amazonite',
    ],
  },
  {
    slug: 'zodiac/libra',
    title: 'Libra',
    category: 'zodiac',
    keywords: [
      'libra',
      'scales',
      'air sign',
      'cardinal',
      'venus ruled',
      'seventh sign',
      'balance',
      'harmony',
      'partnership',
      'justice',
      'beauty',
    ],
    summary:
      'Libra is the seventh sign of the zodiac, a cardinal air sign ruled by Venus. Known for seeking balance, harmony, and partnership.',
    relatedSlugs: [
      'astronomy/planets/venus',
      'tarot/justice',
      'crystals/rose-quartz',
    ],
  },
  {
    slug: 'zodiac/scorpio',
    title: 'Scorpio',
    category: 'zodiac',
    keywords: [
      'scorpio',
      'scorpion',
      'water sign',
      'fixed',
      'pluto ruled',
      'mars ruled',
      'eighth sign',
      'intense',
      'transformative',
      'passionate',
      'mystery',
      'depth',
    ],
    summary:
      'Scorpio is the eighth sign of the zodiac, a fixed water sign ruled by Pluto. Known for intensity, transformation, and emotional depth.',
    relatedSlugs: [
      'astronomy/planets/pluto',
      'tarot/death',
      'crystals/obsidian',
    ],
  },
  {
    slug: 'zodiac/sagittarius',
    title: 'Sagittarius',
    category: 'zodiac',
    keywords: [
      'sagittarius',
      'archer',
      'centaur',
      'fire sign',
      'mutable',
      'jupiter ruled',
      'ninth sign',
      'adventure',
      'philosophy',
      'optimism',
      'freedom',
      'travel',
    ],
    summary:
      'Sagittarius is the ninth sign of the zodiac, a mutable fire sign ruled by Jupiter. Known for adventure, philosophy, and optimism.',
    relatedSlugs: [
      'astronomy/planets/jupiter',
      'tarot/temperance',
      'crystals/turquoise',
    ],
  },
  {
    slug: 'zodiac/capricorn',
    title: 'Capricorn',
    category: 'zodiac',
    keywords: [
      'capricorn',
      'goat',
      'sea goat',
      'earth sign',
      'cardinal',
      'saturn ruled',
      'tenth sign',
      'ambitious',
      'disciplined',
      'responsible',
      'career',
      'authority',
    ],
    summary:
      'Capricorn is the tenth sign of the zodiac, a cardinal earth sign ruled by Saturn. Known for ambition, discipline, and responsibility.',
    relatedSlugs: [
      'astronomy/planets/saturn',
      'tarot/the-devil',
      'crystals/garnet',
    ],
  },
  {
    slug: 'zodiac/aquarius',
    title: 'Aquarius',
    category: 'zodiac',
    keywords: [
      'aquarius',
      'water bearer',
      'air sign',
      'fixed',
      'uranus ruled',
      'saturn ruled',
      'eleventh sign',
      'innovative',
      'humanitarian',
      'independent',
      'unique',
      'rebel',
    ],
    summary:
      'Aquarius is the eleventh sign of the zodiac, a fixed air sign ruled by Uranus. Known for innovation, independence, and humanitarian ideals.',
    relatedSlugs: [
      'astronomy/planets/uranus',
      'tarot/the-star',
      'crystals/amethyst',
    ],
  },
  {
    slug: 'zodiac/pisces',
    title: 'Pisces',
    category: 'zodiac',
    keywords: [
      'pisces',
      'fish',
      'water sign',
      'mutable',
      'neptune ruled',
      'jupiter ruled',
      'twelfth sign',
      'intuitive',
      'dreamy',
      'compassionate',
      'spiritual',
      'artistic',
    ],
    summary:
      'Pisces is the twelfth sign of the zodiac, a mutable water sign ruled by Neptune. Known for intuition, compassion, and spiritual depth.',
    relatedSlugs: [
      'astronomy/planets/neptune',
      'tarot/the-moon',
      'crystals/aquamarine',
    ],
  },

  // ============================================================================
  // PLANETS
  // ============================================================================
  {
    slug: 'astronomy/planets/sun',
    title: 'The Sun in Astrology',
    category: 'planet',
    keywords: [
      'sun',
      'solar',
      'ego',
      'identity',
      'vitality',
      'life force',
      'purpose',
      'father',
      'masculine',
      'leo ruler',
    ],
    summary:
      'The Sun represents your core identity, ego, and life purpose. It rules Leo and shows how you shine your light in the world.',
    relatedSlugs: ['zodiac/leo', 'tarot/the-sun', 'crystals/citrine'],
  },
  {
    slug: 'astronomy/planets/moon',
    title: 'The Moon in Astrology',
    category: 'planet',
    keywords: [
      'moon',
      'lunar',
      'emotions',
      'instincts',
      'mother',
      'feminine',
      'nurturing',
      'subconscious',
      'cancer ruler',
      'cycles',
    ],
    summary:
      'The Moon represents your emotional nature, instincts, and inner needs. It rules Cancer and governs your subconscious mind.',
    relatedSlugs: [
      'zodiac/cancer',
      'tarot/the-high-priestess',
      'crystals/moonstone',
    ],
  },
  {
    slug: 'astronomy/planets/mercury',
    title: 'Mercury in Astrology',
    category: 'planet',
    keywords: [
      'mercury',
      'communication',
      'thinking',
      'learning',
      'intellect',
      'messenger',
      'gemini ruler',
      'virgo ruler',
      'retrograde',
    ],
    summary:
      'Mercury governs communication, thinking, and learning. It rules Gemini and Virgo, and its retrograde periods affect technology and travel.',
    relatedSlugs: [
      'zodiac/gemini',
      'zodiac/virgo',
      'tarot/the-magician',
      'events/2025/mercury-retrograde',
    ],
  },
  {
    slug: 'astronomy/planets/venus',
    title: 'Venus in Astrology',
    category: 'planet',
    keywords: [
      'venus',
      'love',
      'beauty',
      'relationships',
      'values',
      'pleasure',
      'taurus ruler',
      'libra ruler',
      'feminine',
      'attraction',
    ],
    summary:
      'Venus represents love, beauty, and relationships. It rules Taurus and Libra, governing attraction, values, and aesthetic sensibility.',
    relatedSlugs: [
      'zodiac/taurus',
      'zodiac/libra',
      'tarot/the-empress',
      'crystals/rose-quartz',
    ],
  },
  {
    slug: 'astronomy/planets/mars',
    title: 'Mars in Astrology',
    category: 'planet',
    keywords: [
      'mars',
      'action',
      'energy',
      'drive',
      'passion',
      'aggression',
      'warrior',
      'aries ruler',
      'masculine',
      'courage',
    ],
    summary:
      'Mars represents action, drive, and passion. It rules Aries and governs how you assert yourself and pursue your desires.',
    relatedSlugs: ['zodiac/aries', 'tarot/the-tower', 'crystals/carnelian'],
  },
  {
    slug: 'astronomy/planets/jupiter',
    title: 'Jupiter in Astrology',
    category: 'planet',
    keywords: [
      'jupiter',
      'expansion',
      'luck',
      'abundance',
      'wisdom',
      'growth',
      'optimism',
      'sagittarius ruler',
      'benefic',
      'philosophy',
    ],
    summary:
      'Jupiter represents expansion, luck, and wisdom. It rules Sagittarius and brings growth, optimism, and opportunity wherever it touches.',
    relatedSlugs: [
      'zodiac/sagittarius',
      'tarot/wheel-of-fortune',
      'crystals/turquoise',
    ],
  },
  {
    slug: 'astronomy/planets/saturn',
    title: 'Saturn in Astrology',
    category: 'planet',
    keywords: [
      'saturn',
      'discipline',
      'structure',
      'responsibility',
      'karma',
      'limitations',
      'time',
      'capricorn ruler',
      'lessons',
      'authority',
    ],
    summary:
      'Saturn represents discipline, structure, and responsibility. It rules Capricorn and teaches important life lessons through challenges.',
    relatedSlugs: ['zodiac/capricorn', 'tarot/the-world', 'crystals/obsidian'],
  },

  // ============================================================================
  // CONCEPTS
  // ============================================================================
  {
    slug: 'rising-sign',
    title: 'Rising Sign (Ascendant)',
    category: 'concept',
    keywords: [
      'rising sign',
      'ascendant',
      'first house',
      'appearance',
      'outer personality',
      'how others see you',
      'mask',
      'birth time',
    ],
    summary:
      'Your rising sign is the zodiac sign rising on the eastern horizon at your birth. It represents your outer personality and first impressions.',
    relatedSlugs: ['birth-chart', 'astronomy'],
  },
  {
    slug: 'birth-chart',
    title: 'Birth Chart (Natal Chart)',
    category: 'concept',
    keywords: [
      'birth chart',
      'natal chart',
      'horoscope',
      'astrology chart',
      'birth time',
      'planetary positions',
      'houses',
      'aspects',
    ],
    summary:
      'A birth chart is a map of the sky at your exact moment of birth, showing the positions of all planets, houses, and aspects.',
    relatedSlugs: ['rising-sign', 'astronomy', 'placements'],
  },
  {
    slug: 'moon-rituals',
    title: 'Moon Rituals',
    category: 'ritual',
    keywords: [
      'moon ritual',
      'lunar ritual',
      'full moon',
      'new moon',
      'moon phase',
      'manifestation',
      'release',
      'intention setting',
    ],
    summary:
      'Moon rituals are practices aligned with lunar phases to manifest intentions, release what no longer serves, and work with cosmic energy.',
    relatedSlugs: ['astronomy/planets/moon', 'events/2025/eclipses'],
  },
  {
    slug: 'mercury-retrograde',
    title: 'Mercury Retrograde',
    category: 'concept',
    keywords: [
      'mercury retrograde',
      'retrograde',
      'communication problems',
      'technology issues',
      'travel delays',
      'review',
      'reflect',
    ],
    summary:
      'Mercury retrograde is a period when Mercury appears to move backward, traditionally associated with communication and technology disruptions.',
    relatedSlugs: [
      'astronomy/planets/mercury',
      'events/2025/mercury-retrograde',
    ],
  },
  {
    slug: 'tarot',
    title: 'Tarot Reading',
    category: 'tarot',
    keywords: [
      'tarot',
      'tarot cards',
      'tarot reading',
      'major arcana',
      'minor arcana',
      'divination',
      'fortune telling',
      'guidance',
    ],
    summary:
      'Tarot is a system of 78 cards used for divination, self-reflection, and spiritual guidance. Each card carries symbolic meaning.',
    relatedSlugs: ['tarot/the-fool', 'tarot/the-magician'],
  },
  {
    slug: 'crystals',
    title: 'Crystals & Gemstones',
    category: 'crystal',
    keywords: [
      'crystals',
      'gemstones',
      'healing crystals',
      'crystal meanings',
      'crystal properties',
      'crystal healing',
      'stones',
    ],
    summary:
      'Crystals are natural stones believed to carry unique energetic properties. They are used in healing, meditation, and spiritual practices.',
    relatedSlugs: [
      'crystals/amethyst',
      'crystals/rose-quartz',
      'crystals/clear-quartz',
    ],
  },
];

/**
 * Search the grimoire index
 * Returns entries matching the query, sorted by relevance
 */
export function searchGrimoireIndex(
  query: string,
  limit = 10,
): GrimoireEntry[] {
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

  if (queryWords.length === 0) return [];

  // Score each entry
  const scored = GRIMOIRE_SEARCH_INDEX.map((entry) => {
    let score = 0;

    // Title match (highest weight)
    if (entry.title.toLowerCase().includes(queryLower)) {
      score += 100;
    }

    // Exact keyword match
    for (const keyword of entry.keywords) {
      if (keyword === queryLower) {
        score += 50;
      } else if (keyword.includes(queryLower)) {
        score += 25;
      }
    }

    // Word-by-word matching
    for (const word of queryWords) {
      // Title word match
      if (entry.title.toLowerCase().includes(word)) {
        score += 10;
      }

      // Keyword word match
      for (const keyword of entry.keywords) {
        if (keyword.includes(word)) {
          score += 5;
        }
      }

      // Summary word match
      if (entry.summary.toLowerCase().includes(word)) {
        score += 2;
      }
    }

    return { entry, score };
  });

  // Filter and sort by score
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}

/**
 * Get related entries for a given slug
 */
export function getRelatedEntries(slug: string): GrimoireEntry[] {
  const entry = GRIMOIRE_SEARCH_INDEX.find((e) => e.slug === slug);
  if (!entry) return [];

  return entry.relatedSlugs
    .map((relatedSlug) =>
      GRIMOIRE_SEARCH_INDEX.find((e) => e.slug === relatedSlug),
    )
    .filter((e): e is GrimoireEntry => e !== undefined);
}
