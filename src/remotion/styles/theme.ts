/**
 * Lunary Brand Theme for Remotion
 *
 * Brand Aesthetic: Premium, dark, minimal
 * - Subtle effects, no flashy animations
 * - Deep purples, blacks, muted cosmic colors
 * - Clean layouts, generous negative space
 * - Smooth easing, professional typography
 */

export const COLORS = {
  // Primary brand colors
  cosmicBlack: '#0a0a0f',
  deepPurple: '#1a1a2e',
  midnightBlue: '#16213e',

  // Accent colors
  lunarGold: '#d4af37',
  stellarSilver: '#c0c0c0',
  cosmicPurple: '#9b59b6',
  nebulaPink: '#e91e63',

  // Text colors
  primaryText: '#ffffff',
  secondaryText: '#b0b0c0',
  mutedText: '#6b6b80',

  // Highlight colors (for subtitles)
  highlightBlue: '#5AD7FF',
  highlightPurple: '#a855f7',

  // Gradients
  backgroundGradientStart: '#0a0a0f',
  backgroundGradientEnd: '#1a1a2e',
} as const;

export const FONTS = {
  // Primary brand font for titles/overlays
  title: 'Roboto',
  titleWeight: '700',

  // Subtitle font (bold sans-serif for TikTok legibility)
  subtitle: 'Roboto',
  subtitleWeight: '600',

  // Body text
  body: 'Roboto',
  bodyWeight: '400',
} as const;

export const TIMING = {
  // Transition durations (in frames at 30fps)
  fadeIn: 15, // 0.5s
  fadeOut: 15, // 0.5s
  slideIn: 12, // 0.4s
  crossfade: 30, // 1.0s

  // Animation easing
  easeOut: [0.16, 1, 0.3, 1] as const, // Smooth deceleration
  easeInOut: [0.4, 0, 0.2, 1] as const, // Natural movement
  spring: { damping: 15, stiffness: 150 },
} as const;

export const DIMENSIONS = {
  // TikTok/Reels/Stories (9:16)
  story: { width: 1080, height: 1920 },
  // Instagram Square (1:1)
  square: { width: 1080, height: 1080 },
  // YouTube (16:9)
  landscape: { width: 1920, height: 1080 },
  youtube: { width: 1920, height: 1080 },
} as const;

export const STYLES = {
  // Lower third styling
  lowerThird: {
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderColor: COLORS.lunarGold,
    padding: 20,
    borderRadius: 4,
  },

  // Topic card styling
  topicCard: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderColor: COLORS.cosmicPurple,
    padding: 24,
    borderRadius: 8,
  },

  // Subtitle styling
  subtitle: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '8px 16px',
    borderRadius: 4,
    fontSize: 46, // Optimized for TikTok with bold sans-serif
    lineHeight: 1.4,
  },
} as const;

export type ThemeColors = typeof COLORS;
export type ThemeFonts = typeof FONTS;
export type ThemeTiming = typeof TIMING;
export type ThemeDimensions = typeof DIMENSIONS;
