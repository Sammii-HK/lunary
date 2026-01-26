/**
 * Domain and category mappings for content generation
 */

import type { ContentDomain, ThemeCategory } from '../types';

export const CATEGORY_DOMAIN_MAP: Record<ThemeCategory, ContentDomain> = {
  zodiac: 'astrology',
  planetary: 'astrology',
  lunar: 'moon',
  chakras: 'astrology',
  tarot: 'tarot',
  crystals: 'crystals',
  numerology: 'numerology',
  sabbat: 'rituals',
};

export const TOPIC_DOMAIN_LABELS: Record<ContentDomain, string> = {
  astrology: 'astrology',
  moon: 'moon_phases',
  tarot: 'tarot',
  numerology: 'numerology',
  rituals: 'rituals',
  crystals: 'crystals',
};

export const DISALLOWED_ANALOGY_DOMAINS = [
  'astrology',
  'moon_phases',
  'tarot',
  'numerology',
  'rituals',
  'crystals',
];

export const DOMAIN_ALLOWED_PREFIXES: Record<string, string[]> = {
  astrology: [
    'astronomy',
    'correspondences',
    'zodiac',
    'birth-chart',
    'transits',
    'houses',
    'rising-sign',
    'glossary',
  ],
  moon: [
    'moon',
    'astronomy/planets/moon',
    'moon/',
    'moon-in',
    'moon-phases',
    'lunar',
    'lunar-nodes',
    'eclipses',
  ],
  crystals: ['crystals'],
  tarot: ['tarot', 'card-combinations', 'tarot-spreads'],
  numerology: ['numerology', 'angel-numbers', 'life-path'],
  rituals: [
    'wheel-of-the-year',
    'sabbats',
    'sabbat',
    'rituals',
    'candle-magic',
    'spell',
  ],
};

export const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  astrology:
    'Focus on astrological concepts: zodiac signs, houses, planets, aspects, and transits.',
  moon: 'Focus on lunar cycles, phases, nodes, and moon-based timing.',
  crystals: 'Focus on crystal properties, uses, and correspondences.',
  tarot: 'Focus on tarot cards, spreads, suits, and symbolism.',
  numerology:
    'Focus on numbers, life paths, cycles, and numerological patterns.',
  rituals: 'Focus on seasonal practices, sabbats, and ritual work.',
};

export const CATEGORY_META: Record<
  ThemeCategory,
  { label: string; contextClause: string }
> = {
  zodiac: { label: 'Astrology basics', contextClause: 'in astrology' },
  planetary: { label: 'Transits', contextClause: 'in planetary transits' },
  lunar: { label: 'Moon phases', contextClause: 'of the Moon' },
  tarot: { label: 'Tarot', contextClause: 'in Tarot' },
  crystals: { label: 'Crystals', contextClause: 'with crystals' },
  numerology: { label: 'Numerology', contextClause: 'in numerology' },
  chakras: { label: 'Energy centers', contextClause: 'in energy work' },
  sabbat: {
    label: 'Wheel of the Year',
    contextClause: 'during the wheel of the year',
  },
};

export const AMBIGUOUS_DOMAINS = new Set(['tarot', 'crystals', 'numerology']);
