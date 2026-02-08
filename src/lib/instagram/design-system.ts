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
export const CATEGORY_ACCENT: Record<ThemeCategory, string> = {
  zodiac: '#8B5CF6', // violet
  tarot: '#C084FC', // purple
  lunar: '#818CF8', // indigo
  planetary: '#60A5FA', // blue
  crystals: '#34D399', // emerald
  numerology: '#F59E0B', // amber
  chakras: '#F472B6', // pink
  sabbat: '#65A30D', // lime
  runes: '#9CA3AF', // gray
  spells: '#A78BFA', // violet
};

// Category → gradient for dark mode backgrounds
export const CATEGORY_GRADIENT: Record<ThemeCategory, string> = {
  zodiac: 'linear-gradient(135deg, #1a1028 0%, #0d0a14 50%, #0a0a0a 100%)',
  tarot: 'linear-gradient(135deg, #1a0f28 0%, #0d0a14 50%, #0a0a0a 100%)',
  lunar: 'linear-gradient(135deg, #0f1428 0%, #0a0d14 50%, #0a0a0a 100%)',
  planetary: 'linear-gradient(135deg, #0f1a28 0%, #0a0d14 50%, #0a0a0a 100%)',
  crystals: 'linear-gradient(135deg, #0f2818 0%, #0a140d 50%, #0a0a0a 100%)',
  numerology: 'linear-gradient(135deg, #28200f 0%, #14100a 50%, #0a0a0a 100%)',
  chakras: 'linear-gradient(135deg, #280f1a 0%, #140a0d 50%, #0a0a0a 100%)',
  sabbat: 'linear-gradient(135deg, #1a280f 0%, #0d140a 50%, #0a0a0a 100%)',
  runes: 'linear-gradient(135deg, #1a1a1f 0%, #0d0d10 50%, #0a0a0a 100%)',
  spells: 'linear-gradient(135deg, #1a1028 0%, #0d0a14 50%, #0a0a0a 100%)',
};

// Dark cosmic backgrounds for memes (sign-tinted gradients matching brand)
export const MEME_BACKGROUNDS: Record<string, string> = {
  aries: 'linear-gradient(135deg, #1a0a0a 0%, #0d0a0a 50%, #0a0a0a 100%)',
  taurus: 'linear-gradient(135deg, #0a1a0f 0%, #0a0d0a 50%, #0a0a0a 100%)',
  gemini: 'linear-gradient(135deg, #1a1a0a 0%, #0d0d0a 50%, #0a0a0a 100%)',
  cancer: 'linear-gradient(135deg, #14101a 0%, #0d0a14 50%, #0a0a0a 100%)',
  leo: 'linear-gradient(135deg, #1a150a 0%, #0d0d0a 50%, #0a0a0a 100%)',
  virgo: 'linear-gradient(135deg, #0a1a0f 0%, #0a0d0a 50%, #0a0a0a 100%)',
  libra: 'linear-gradient(135deg, #1a0a14 0%, #0d0a0d 50%, #0a0a0a 100%)',
  scorpio: 'linear-gradient(135deg, #14081a 0%, #0d0a14 50%, #0a0a0a 100%)',
  sagittarius: 'linear-gradient(135deg, #1a0f0a 0%, #0d0a0a 50%, #0a0a0a 100%)',
  capricorn: 'linear-gradient(135deg, #12121a 0%, #0d0d10 50%, #0a0a0a 100%)',
  aquarius: 'linear-gradient(135deg, #0a101a 0%, #0a0d14 50%, #0a0a0a 100%)',
  pisces: 'linear-gradient(135deg, #0a1418 0%, #0a0d10 50%, #0a0a0a 100%)',
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
