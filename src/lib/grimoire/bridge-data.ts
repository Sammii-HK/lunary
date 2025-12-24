import type { GrimoireEntry } from '@/constants/seo/grimoire-search-index';

export const BRIDGE_MAP: Record<string, string[]> = {
  venus: [
    'tarot/the-empress',
    'crystals/rose-quartz',
    'zodiac/taurus',
    'zodiac/libra',
  ],
  moon: ['tarot/the-high-priestess', 'moon-rituals', 'astronomy/planets/moon'],
  mercury: [
    'tarot/the-magician',
    'glossary#retrograde',
    'zodiac/gemini',
    'zodiac/virgo',
  ],
  mars: ['tarot/strength', 'zodiac/aries', 'zodiac/scorpio'],
  saturn: ['tarot/the-world', 'zodiac/capricorn', 'zodiac/aquarius'],
  jupiter: ['tarot/wheel-of-fortune', 'zodiac/sagittarius', 'zodiac/pisces'],
  sun: ['tarot/the-sun', 'zodiac/leo'],
  neptune: ['tarot/the-moon', 'zodiac/pisces'],
  pluto: ['tarot/death', 'zodiac/scorpio'],
  uranus: ['tarot/the-fool', 'zodiac/aquarius'],
  nodes: ['glossary#north-node', 'glossary#south-node', 'glossary#lunar-nodes'],
};

export const BRIDGE_KEYS = Object.keys(BRIDGE_MAP);

export const ALIAS_MAP: Record<string, string> = {
  'the empress': 'tarot/the-empress',
  'the high priestess': 'tarot/the-high-priestess',
  'high priestess': 'tarot/the-high-priestess',
  'the magician': 'tarot/the-magician',
  magician: 'tarot/the-magician',
  'wheel of fortune': 'tarot/wheel-of-fortune',
  'the wheel of fortune': 'tarot/wheel-of-fortune',
  'the sun': 'tarot/the-sun',
  'the moon': 'tarot/the-moon',
  'the fool': 'tarot/the-fool',
  'the world': 'tarot/the-world',
  strength: 'tarot/strength',
  death: 'tarot/death',
  'rising sign': 'rising-sign',
  ascendant: 'rising-sign',
  'birth chart': 'birth-chart',
  'natal chart': 'birth-chart',
  'sun sign': 'glossary#sun-sign',
  'star sign': 'glossary#sun-sign',
  'moon sign': 'glossary#moon-sign',
  retrograde: 'glossary#retrograde',
  'mercury retrograde': 'glossary#retrograde',
  'full moon': 'moon-rituals',
  'new moon': 'moon-rituals',
  synastry: 'glossary#synastry',
};

export function validateBridgeData(slugIndex: Map<string, GrimoireEntry>) {
  const missingSlugs = new Set<string>();
  const missingAliases = new Set<string>();

  Object.values(BRIDGE_MAP).forEach((slugs) => {
    slugs.forEach((slug) => {
      if (!slugIndex.has(slug)) missingSlugs.add(slug);
    });
  });

  Object.entries(ALIAS_MAP).forEach(([alias, slug]) => {
    if (!slugIndex.has(slug)) missingAliases.add(alias);
  });

  return {
    missingSlugs: Array.from(missingSlugs),
    missingAliases: Array.from(missingAliases),
  };
}
