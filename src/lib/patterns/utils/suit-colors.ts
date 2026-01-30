/**
 * SINGLE SOURCE OF TRUTH for suit color mappings
 * Used across ALL pattern visualizations to maintain brand cohesion
 */
export const SUIT_COLORS = {
  Cups: 'secondary', // Water/Emotion - Comet Trail
  Wands: 'highlight', // Fire/Action - Supernova
  Swords: 'accent', // Air/Intellect - Galaxy Haze
  Pentacles: 'success', // Earth/Material - Aurora Green
  'Major Arcana': 'primary', // Spirit - Nebula Violet
} as const;

export type SuitName = keyof typeof SUIT_COLORS;
export type SuitColorVariant = (typeof SUIT_COLORS)[SuitName];

/**
 * Get Tailwind color classes for a suit
 * Returns full class strings to avoid dynamic class generation
 */
export function getSuitColorClasses(suit: SuitName) {
  const variant = SUIT_COLORS[suit];

  // Map to specific Tailwind classes to ensure they're included in build
  // Note: Only includes variants actually used by suits
  const classMap: Record<
    SuitColorVariant,
    {
      bg: string;
      bgLight: string;
      text: string;
      border: string;
      borderLight: string;
    }
  > = {
    primary: {
      bg: 'bg-lunary-primary',
      bgLight: 'bg-lunary-primary-950/40',
      text: 'text-lunary-primary-300',
      border: 'border-lunary-primary-800',
      borderLight: 'border-lunary-primary/20',
    },
    secondary: {
      bg: 'bg-lunary-secondary',
      bgLight: 'bg-lunary-secondary-950/40',
      text: 'text-lunary-secondary-300',
      border: 'border-lunary-secondary-800',
      borderLight: 'border-lunary-secondary/20',
    },
    accent: {
      bg: 'bg-lunary-accent',
      bgLight: 'bg-lunary-accent-950/40',
      text: 'text-lunary-accent-300',
      border: 'border-lunary-accent-800',
      borderLight: 'border-lunary-accent/20',
    },
    highlight: {
      bg: 'bg-lunary-highlight',
      bgLight: 'bg-lunary-highlight-950/40',
      text: 'text-lunary-highlight-300',
      border: 'border-lunary-highlight-800',
      borderLight: 'border-lunary-highlight/20',
    },
    success: {
      bg: 'bg-lunary-success',
      bgLight: 'bg-lunary-success-950/40',
      text: 'text-lunary-success-300',
      border: 'border-lunary-success-800',
      borderLight: 'border-lunary-success/20',
    },
  };

  return classMap[variant];
}

/**
 * Get HSL color value for use with chart libraries
 * Returns actual HSL values (not CSS variables) for recharts compatibility
 */
export function getSuitColorHSL(suit: SuitName): string {
  // Actual Lunary brand colors in HSL format
  const colorMap: Record<SuitColorVariant, string> = {
    primary: 'hsl(256, 64%, 60%)', // Nebula Violet #8458D8
    secondary: 'hsl(240, 74%, 68%)', // Comet Trail #7B7BE8
    accent: 'hsl(282, 100%, 74%)', // Galaxy Haze #C77DFF
    highlight: 'hsl(289, 75%, 67%)', // Supernova #D070E8
    success: 'hsl(143, 20%, 51%)', // Aurora Green #6B9B7A
  };

  return colorMap[SUIT_COLORS[suit]];
}
