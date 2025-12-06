/**
 * Internal Link Sculpting Utility
 * Generates smart internal links based on content type and context
 * for optimal SEO link flow and topical authority building.
 */

export interface InternalLink {
  text: string;
  href: string;
  priority: number;
}

// Hub pages that should receive maximum link equity
export const HUB_PAGES: InternalLink[] = [
  { text: 'Zodiac Signs Guide', href: '/grimoire/zodiac', priority: 10 },
  { text: 'Tarot Card Meanings', href: '/grimoire/tarot', priority: 10 },
  { text: 'Crystal Guide', href: '/grimoire/crystals', priority: 9 },
  { text: 'Moon Rituals', href: '/grimoire/moon-rituals', priority: 9 },
  { text: 'Birth Chart Guide', href: '/grimoire/birth-chart', priority: 10 },
  { text: 'Astrology Glossary', href: '/grimoire/glossary', priority: 8 },
  { text: 'Planet Meanings', href: '/grimoire/astronomy', priority: 9 },
];

// Related content categories for cross-linking
const ZODIAC_TO_RELATED = {
  aries: ['mars', 'fire', 'the-emperor', 'carnelian', 'compatibility/aries'],
  taurus: [
    'venus',
    'earth',
    'the-hierophant',
    'rose-quartz',
    'compatibility/taurus',
  ],
  gemini: ['mercury', 'air', 'the-lovers', 'citrine', 'compatibility/gemini'],
  cancer: ['moon', 'water', 'the-chariot', 'moonstone', 'compatibility/cancer'],
  leo: ['sun', 'fire', 'strength', 'sunstone', 'compatibility/leo'],
  virgo: ['mercury', 'earth', 'the-hermit', 'amazonite', 'compatibility/virgo'],
  libra: ['venus', 'air', 'justice', 'rose-quartz', 'compatibility/libra'],
  scorpio: ['pluto', 'water', 'death', 'obsidian', 'compatibility/scorpio'],
  sagittarius: [
    'jupiter',
    'fire',
    'temperance',
    'turquoise',
    'compatibility/sagittarius',
  ],
  capricorn: [
    'saturn',
    'earth',
    'the-devil',
    'garnet',
    'compatibility/capricorn',
  ],
  aquarius: ['uranus', 'air', 'the-star', 'amethyst', 'compatibility/aquarius'],
  pisces: [
    'neptune',
    'water',
    'the-moon',
    'aquamarine',
    'compatibility/pisces',
  ],
};

const PLANET_TO_RELATED: Record<string, string[]> = {
  sun: ['leo', 'the-sun', 'solar plexus', 'citrine', 'gold'],
  moon: [
    'cancer',
    'the-high-priestess',
    'third eye',
    'moonstone',
    'moon-rituals',
  ],
  mercury: ['gemini', 'virgo', 'the-magician', 'citrine', 'mercury-retrograde'],
  venus: ['taurus', 'libra', 'the-empress', 'rose-quartz', 'love'],
  mars: ['aries', 'the-tower', 'carnelian', 'courage', 'action'],
  jupiter: [
    'sagittarius',
    'wheel-of-fortune',
    'turquoise',
    'expansion',
    'luck',
  ],
  saturn: ['capricorn', 'the-world', 'obsidian', 'discipline', 'karma'],
  uranus: ['aquarius', 'the-fool', 'amethyst', 'innovation', 'change'],
  neptune: ['pisces', 'the-hanged-man', 'aquamarine', 'dreams', 'intuition'],
  pluto: ['scorpio', 'judgement', 'obsidian', 'transformation', 'power'],
};

/**
 * Get recommended internal links for a zodiac sign page
 */
export function getZodiacInternalLinks(sign: string): InternalLink[] {
  const signLower = sign.toLowerCase();
  const related =
    ZODIAC_TO_RELATED[signLower as keyof typeof ZODIAC_TO_RELATED] || [];

  const links: InternalLink[] = [
    // Ruling planet
    {
      text: `${sign} Ruling Planet`,
      href: `/grimoire/astronomy/planets/${related[0]}`,
      priority: 9,
    },
    // Associated tarot
    {
      text: 'Associated Tarot Card',
      href: `/grimoire/tarot/${related[2]}`,
      priority: 8,
    },
    // Crystal
    {
      text: `${sign} Crystals`,
      href: `/grimoire/crystals/${related[3]}`,
      priority: 7,
    },
    // Compatibility
    {
      text: `${sign} Compatibility`,
      href: `/grimoire/${related[4]}`,
      priority: 9,
    },
    // Birth chart context
    {
      text: 'Understanding Your Birth Chart',
      href: '/grimoire/birth-chart',
      priority: 8,
    },
    // Rising sign
    { text: 'Rising Sign Meaning', href: '/grimoire/rising-sign', priority: 7 },
    // Back to zodiac index
    { text: 'All Zodiac Signs', href: '/grimoire/zodiac', priority: 6 },
  ];

  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Get recommended internal links for a planet page
 */
export function getPlanetInternalLinks(planet: string): InternalLink[] {
  const planetLower = planet.toLowerCase();
  const related = PLANET_TO_RELATED[planetLower] || [];

  const links: InternalLink[] = [
    // Ruled signs
    {
      text: `${related[0]?.charAt(0).toUpperCase()}${related[0]?.slice(1)} Sign`,
      href: `/grimoire/zodiac/${related[0]}`,
      priority: 9,
    },
    // Tarot
    {
      text: 'Associated Tarot Card',
      href: `/grimoire/tarot/${related[2]}`,
      priority: 8,
    },
    // Crystals
    {
      text: `${planet} Crystals`,
      href: `/grimoire/crystals/${related[3]}`,
      priority: 7,
    },
    // Retrograde (for applicable planets)
    ...(planetLower === 'mercury'
      ? [
          {
            text: 'Mercury Retrograde Guide',
            href: '/grimoire/events/2025/mercury-retrograde',
            priority: 9,
          },
        ]
      : []),
    ...(planetLower === 'venus'
      ? [
          {
            text: 'Venus Retrograde Guide',
            href: '/grimoire/events/2025/venus-retrograde',
            priority: 9,
          },
        ]
      : []),
    // Birth chart context
    {
      text: `${planet} in Your Birth Chart`,
      href: '/grimoire/birth-chart',
      priority: 8,
    },
    // All planets
    {
      text: 'All Planets in Astrology',
      href: '/grimoire/astronomy',
      priority: 6,
    },
    // Placements
    {
      text: `${planet} Through the Signs`,
      href: '/grimoire/placements',
      priority: 7,
    },
  ];

  return links.filter((l) => l.href).sort((a, b) => b.priority - a.priority);
}

/**
 * Get recommended internal links for a tarot card page
 */
export function getTarotInternalLinks(cardName: string): InternalLink[] {
  const links: InternalLink[] = [
    // Related spread
    {
      text: 'Three Card Spread',
      href: '/grimoire/tarot/spreads/threeCard',
      priority: 7,
    },
    {
      text: 'Celtic Cross Spread',
      href: '/grimoire/tarot/spreads/celticCross',
      priority: 6,
    },
    // Major/Minor context
    { text: 'Major Arcana Guide', href: '/grimoire/tarot', priority: 8 },
    // How to read
    {
      text: 'How to Read Tarot',
      href: '/grimoire/tarot/how-to-read',
      priority: 7,
    },
    // Daily tarot
    { text: 'Daily Tarot Draw', href: '/tarot', priority: 9 },
    // Astrology connection
    {
      text: 'Tarot & Astrology Connections',
      href: '/grimoire/astronomy',
      priority: 6,
    },
  ];

  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Get recommended internal links for a crystal page
 */
export function getCrystalInternalLinks(crystalName: string): InternalLink[] {
  const links: InternalLink[] = [
    // Crystal cleansing
    {
      text: 'How to Cleanse Crystals',
      href: '/grimoire/crystals/cleansing',
      priority: 8,
    },
    // Crystal charging (moon)
    {
      text: 'Charging Crystals with Moon Energy',
      href: '/grimoire/moon-rituals',
      priority: 8,
    },
    // All crystals
    { text: 'Complete Crystal Guide', href: '/grimoire/crystals', priority: 7 },
    // Chakra connection
    { text: 'Chakra Guide', href: '/grimoire/chakras', priority: 6 },
    // Zodiac connection
    { text: 'Crystals by Zodiac Sign', href: '/grimoire/zodiac', priority: 6 },
  ];

  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Get recommended internal links for a placement page (e.g., Mercury in Aries)
 */
export function getPlacementInternalLinks(
  planet: string,
  sign: string,
): InternalLink[] {
  const links: InternalLink[] = [
    // Planet page
    {
      text: `${planet} in Astrology`,
      href: `/grimoire/astronomy/planets/${planet.toLowerCase()}`,
      priority: 9,
    },
    // Sign page
    {
      text: `${sign} Zodiac Sign`,
      href: `/grimoire/zodiac/${sign.toLowerCase()}`,
      priority: 9,
    },
    // Birth chart
    { text: 'Birth Chart Guide', href: '/grimoire/birth-chart', priority: 8 },
    // Other placements for same planet
    {
      text: `${planet} Through All Signs`,
      href: '/grimoire/placements',
      priority: 7,
    },
    // Compatibility
    {
      text: `${sign} Compatibility`,
      href: `/grimoire/compatibility`,
      priority: 6,
    },
  ];

  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Get recommended internal links for a compatibility page
 */
export function getCompatibilityInternalLinks(
  sign1: string,
  sign2: string,
): InternalLink[] {
  const links: InternalLink[] = [
    // Both signs
    {
      text: `${sign1} Zodiac Guide`,
      href: `/grimoire/zodiac/${sign1.toLowerCase()}`,
      priority: 9,
    },
    {
      text: `${sign2} Zodiac Guide`,
      href: `/grimoire/zodiac/${sign2.toLowerCase()}`,
      priority: 9,
    },
    // Birth chart
    {
      text: 'Birth Chart for Relationships',
      href: '/grimoire/birth-chart',
      priority: 8,
    },
    // Venus
    {
      text: 'Venus in Love',
      href: '/grimoire/astronomy/planets/venus',
      priority: 7,
    },
    // All compatibility
    {
      text: 'All Compatibility Matches',
      href: '/grimoire/compatibility',
      priority: 6,
    },
    // Moon signs
    {
      text: 'Moon Sign Compatibility',
      href: '/grimoire/astronomy/planets/moon',
      priority: 7,
    },
  ];

  return links.sort((a, b) => b.priority - a.priority);
}

/**
 * Get universal internal links that work on any grimoire page
 */
export function getUniversalInternalLinks(): InternalLink[] {
  return [
    { text: 'Get Your Birth Chart', href: '/birth-chart', priority: 10 },
    { text: 'Daily Horoscope', href: '/horoscope', priority: 9 },
    { text: 'Explore the Grimoire', href: '/grimoire', priority: 8 },
    { text: 'Ask the Grimoire', href: '/grimoire/search', priority: 7 },
  ];
}

/**
 * Combine and dedupe internal links, returning top N by priority
 */
export function combineInternalLinks(
  links: InternalLink[],
  maxLinks: number = 7,
): InternalLink[] {
  const seen = new Set<string>();
  const unique: InternalLink[] = [];

  for (const link of links.sort((a, b) => b.priority - a.priority)) {
    if (!seen.has(link.href)) {
      seen.add(link.href);
      unique.push(link);
    }
  }

  return unique.slice(0, maxLinks);
}
