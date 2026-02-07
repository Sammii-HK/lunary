import { thematicPaletteConfig } from '@/constants/seo/thematic-palette-config';

export type BackgroundAnimationType =
  | 'starfield'
  | 'aurora'
  | 'floating-orbs'
  | 'candle-flames'
  | 'sacred-geometry'
  | 'mist-wisps'
  | 'ember-particles';

export interface CategoryVisualConfig {
  backgroundAnimation: BackgroundAnimationType;
  gradientColors: [string, string, string];
  highlightColor: string;
  particleTintColor: string;
  accentColor: string;
}

/**
 * Maps top-level categories to their background animation type.
 * Priority weights from the plan determine which animation
 * best represents each category's visual identity.
 */
const CATEGORY_ANIMATION_MAP: Record<string, BackgroundAnimationType> = {
  // Starfield — cosmic/lunar themes
  lunar: 'starfield',
  moon: 'starfield',
  'moon-in': 'starfield',
  eclipses: 'starfield',
  astronomy: 'starfield',
  'lunar-nodes': 'starfield',

  // Aurora — zodiac/planetary themes
  zodiac: 'aurora',
  transits: 'aurora',
  aspects: 'aurora',
  'birth-chart': 'aurora',
  placements: 'aurora',
  'rising-sign': 'aurora',
  cusps: 'aurora',
  decans: 'aurora',
  houses: 'aurora',

  // Floating Orbs — mystical/divination themes
  tarot: 'floating-orbs',
  crystals: 'floating-orbs',
  divination: 'floating-orbs',

  // Candle Flames — spell/magic themes
  spells: 'candle-flames',
  'candle-magic': 'candle-flames',
  'jar-spells': 'candle-flames',
  protection: 'candle-flames',

  // Sacred Geometry — numerology/numbers themes
  numerology: 'sacred-geometry',
  'angel-numbers': 'sacred-geometry',
  'life-path': 'sacred-geometry',
  'mirror-hours': 'sacred-geometry',
  'double-hours': 'sacred-geometry',
  manifestation: 'sacred-geometry',
  meditation: 'sacred-geometry',
  chakras: 'sacred-geometry',

  // Mist Wisps — witchcraft/esoteric themes
  'shadow-work': 'mist-wisps',
  'modern-witchcraft': 'mist-wisps',
  'witchcraft-tools': 'mist-wisps',
  'witchcraft-ethics': 'mist-wisps',
  correspondences: 'mist-wisps',
  runes: 'mist-wisps',

  // Ember Particles — seasonal/cyclical themes
  sabbats: 'ember-particles',
  'wheel-of-the-year': 'ember-particles',
  seasons: 'ember-particles',
  'chinese-zodiac': 'ember-particles',
};

/** Default palette for unmapped categories */
const DEFAULT_VISUALS: CategoryVisualConfig = {
  backgroundAnimation: 'starfield',
  gradientColors: ['#0A0A0A', '#1a1a2e', '#2C2140'],
  highlightColor: '#5AD7FF',
  particleTintColor: '#5AD7FF',
  accentColor: '#5AD7FF',
};

/**
 * Get the visual configuration for a category.
 * Reads colors from the palette config and maps to the
 * appropriate background animation type.
 */
export function getCategoryVisuals(category: string): CategoryVisualConfig {
  const palette =
    thematicPaletteConfig.palettesByTopLevelCategory[
      category as keyof typeof thematicPaletteConfig.palettesByTopLevelCategory
    ];

  if (!palette) {
    return DEFAULT_VISUALS;
  }

  const backgroundAnimation = CATEGORY_ANIMATION_MAP[category] || 'starfield';

  return {
    backgroundAnimation,
    gradientColors: [...palette.backgrounds] as [string, string, string],
    highlightColor: palette.highlight,
    particleTintColor: palette.highlight,
    accentColor: palette.highlight,
  };
}

/** All available animation types for admin preview */
export const ALL_ANIMATION_TYPES: BackgroundAnimationType[] = [
  'starfield',
  'aurora',
  'floating-orbs',
  'candle-flames',
  'sacred-geometry',
  'mist-wisps',
  'ember-particles',
];

/** Get a representative category for each animation type (for preview) */
export function getRepresentativeCategory(
  animationType: BackgroundAnimationType,
): string {
  const map: Record<BackgroundAnimationType, string> = {
    starfield: 'moon',
    aurora: 'zodiac',
    'floating-orbs': 'tarot',
    'candle-flames': 'spells',
    'sacred-geometry': 'numerology',
    'mist-wisps': 'modern-witchcraft',
    'ember-particles': 'sabbats',
  };
  return map[animationType];
}
