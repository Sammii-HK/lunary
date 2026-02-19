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
  /** Adaptive subtitle background opacity based on gradient brightness (#14) */
  subtitleBackgroundOpacity?: number;
}

/**
 * Calculate relative luminance from a hex color string
 * Returns 0-255 range
 */
function hexLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return 40; // default mid-dark
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Calculate adaptive subtitle opacity from gradient colors (#14)
 * Dark backgrounds need less contrast, bright backgrounds need more
 */
function calculateSubtitleOpacity(
  gradientColors: [string, string, string],
): number {
  const avgLuminance =
    gradientColors.reduce((sum, c) => sum + hexLuminance(c), 0) /
    gradientColors.length;

  if (avgLuminance < 40) return 0.35; // Dark backgrounds
  if (avgLuminance > 80) return 0.65; // Bright backgrounds
  return 0.5; // Medium backgrounds
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

  // Aurora — numerology/numbers themes (switched from sacred-geometry;
  // aurora bg consistently outperforms in TikTok engagement data)
  numerology: 'aurora',
  'angel-numbers': 'aurora',
  'life-path': 'aurora',
  'mirror-hours': 'aurora',
  'double-hours': 'aurora',
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
  subtitleBackgroundOpacity: 0.35,
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
  const gradientColors = [...palette.backgrounds] as [string, string, string];

  return {
    backgroundAnimation,
    gradientColors,
    highlightColor: palette.highlight,
    particleTintColor: palette.highlight,
    accentColor: palette.highlight,
    subtitleBackgroundOpacity: calculateSubtitleOpacity(gradientColors),
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
