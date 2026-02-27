import { OG_COLORS } from '@/lib/share/og-utils';
import type { ThemeCategory } from '@/lib/social/types';

// Instagram-optimized sizes (minimum 40px body text for mobile readability)
export const IG_SIZES = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
} as const;

export type IGFormat = keyof typeof IG_SIZES;

// Instagram text sizes - much larger than share OG for mobile readability
export const IG_TEXT = {
  // Dark cosmic mode (cards, quotes, carousels)
  dark: {
    title: 64,
    subtitle: 40,
    body: 36,
    label: 28,
    caption: 24,
    footer: 20,
  },
  // Bold pop mode (memes - light backgrounds)
  light: {
    title: 72,
    subtitle: 44,
    body: 40,
    label: 32,
    caption: 28,
    footer: 22,
  },
  // Story mode (portrait 1080x1920 - even larger for vertical scroll)
  story: {
    title: 72,
    subtitle: 48,
    body: 40,
    label: 32,
    caption: 28,
    footer: 22,
  },
} as const;

// Extends OG_COLORS with Instagram-specific additions
export const IG_COLORS = {
  ...OG_COLORS,
  // Light mode backgrounds for memes
  cream: '#FFF8F0',
  warmWhite: '#FFFDF7',
  softLavender: '#F5F0FF',
  blushPink: '#FFF0F5',
  // Light mode text
  darkText: '#1A1A2E',
  darkSubtext: '#4A4A6A',
  // Category accents
  accentGold: '#D4A574',
  accentSage: '#7BA18C',
  accentRose: '#C4687A',
  accentIndigo: '#6C63FF',
} as const;

// Category → accent color mapping (used for badges, borders, highlights)
// Using Lunary brand colors: violets, purples, cosmic hues
export const CATEGORY_ACCENT: Record<ThemeCategory, string> = {
  zodiac: '#8458d8', // Nebula Violet (primary brand)
  tarot: '#c77dff', // Galaxy Haze (accent brand)
  lunar: '#7b7be8', // Comet Trail (secondary brand)
  planetary: '#818CF8', // Soft indigo
  crystals: '#d070e8', // Supernova (highlight brand)
  numerology: '#c77dff', // Galaxy Haze
  chakras: '#ee789e', // Cosmic Rose (brand)
  sabbat: '#8458d8', // Nebula Violet
  runes: '#9CA3AF', // Neutral gray (keeps mystical feel)
  spells: '#d070e8', // Supernova
};

// Category → gradient for dark mode backgrounds
// Cosmic violet/purple tones matching Lunary brand — bright enough for stars to show
export const CATEGORY_GRADIENT: Record<ThemeCategory, string> = {
  zodiac: 'linear-gradient(135deg, #4a2878 0%, #2e1a52 50%, #1a1030 100%)', // Deep violet
  tarot: 'linear-gradient(135deg, #4a1e68 0%, #2e1248 50%, #1a0a2e 100%)', // Purple
  lunar: 'linear-gradient(135deg, #1e3460 0%, #162248 50%, #0e1630 100%)', // Indigo
  planetary: 'linear-gradient(135deg, #1a3258 0%, #142248 50%, #0e1630 100%)', // Blue-violet
  crystals: 'linear-gradient(135deg, #4a1e68 0%, #2e1248 50%, #1a0a2e 100%)', // Violet
  numerology: 'linear-gradient(135deg, #4a2878 0%, #2e1a52 50%, #1a1030 100%)', // Cosmic violet
  chakras: 'linear-gradient(135deg, #5c1a3c 0%, #3a1028 50%, #220a18 100%)', // Rose-violet
  sabbat: 'linear-gradient(135deg, #4a2878 0%, #2e1a52 50%, #1a1030 100%)', // Violet
  runes: 'linear-gradient(135deg, #2e2e42 0%, #1e1e30 50%, #141420 100%)', // Neutral blue-gray
  spells: 'linear-gradient(135deg, #4a1e68 0%, #2e1248 50%, #1a0a2e 100%)', // Deep purple
};

// Dark cosmic backgrounds for memes (sign-tinted gradients matching brand)
// Lifted from pure black so stars and text have more contrast against the bg
export const MEME_BACKGROUNDS: Record<string, string> = {
  aries: 'linear-gradient(135deg, #2a1010 0%, #1a0a0a 50%, #120808 100%)',
  taurus: 'linear-gradient(135deg, #102a18 0%, #0a1a0f 50%, #081210 100%)',
  gemini: 'linear-gradient(135deg, #2a2a10 0%, #1a1a0a 50%, #121208 100%)',
  cancer: 'linear-gradient(135deg, #1e1428 0%, #14102a 50%, #100c1e 100%)',
  leo: 'linear-gradient(135deg, #2a1e0a 0%, #1a150a 50%, #120f08 100%)',
  virgo: 'linear-gradient(135deg, #102a18 0%, #0a1a0f 50%, #081210 100%)',
  libra: 'linear-gradient(135deg, #2a1020 0%, #1a0a14 50%, #120810 100%)',
  scorpio: 'linear-gradient(135deg, #1c0a28 0%, #14082a 50%, #100820 100%)',
  sagittarius: 'linear-gradient(135deg, #2a1808 0%, #1a1008 50%, #120c08 100%)',
  capricorn: 'linear-gradient(135deg, #1c1c2a 0%, #14141e 50%, #101018 100%)',
  aquarius: 'linear-gradient(135deg, #0a182a 0%, #0a1020 50%, #081018 100%)',
  pisces: 'linear-gradient(135deg, #0a1e28 0%, #0a1418 50%, #081018 100%)',
};

// Zodiac sign → primary accent for meme text
export const SIGN_ACCENT: Record<string, string> = {
  aries: '#DC2626',
  taurus: '#059669',
  gemini: '#EAB308',
  cancer: '#7C3AED',
  leo: '#F59E0B',
  virgo: '#10B981',
  libra: '#EC4899',
  scorpio: '#8B5CF6',
  sagittarius: '#EA580C',
  capricorn: '#4B5563',
  aquarius: '#3B82F6',
  pisces: '#06B6D4',
};

// Spacing constants
export const IG_SPACING = {
  padding: 64,
  gap: 24,
  borderRadius: 24,
  footerHeight: 60,
} as const;

// Story safe zones (avoid Instagram UI overlays)
export const IG_STORY_SAFE = {
  top: 250, // Profile pic, username, story bar
  bottom: 300, // Reply bar, interaction buttons
  contentHeight: 1370, // Available content area
  sidePadding: 48,
} as const;
