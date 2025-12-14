/**
 * Lunary PDF Styles & Brand Constants
 * Used across all pack PDF generation
 */

// Brand Colors (matching your CSS variables)
export const BRAND = {
  // Primary palette
  nebulaViolet: '#8458D8',
  cometTrail: '#7B7BE8',
  galaxyHaze: '#C77DFF',
  cosmicRose: '#EE789E',
  supernova: '#D070E8',

  // Light variants
  nebulaLight: '#9B75E3',
  cometLight: '#9A9AF0',
  hazeLight: '#D9A5FF',
  roseLight: '#F5A0B8',
  supernovaLight: '#E099F0',

  // Dark variants
  nebulaDark: '#6B42B8',
  cometDark: '#5C5CD4',

  // Backgrounds
  eventHorizon: '#0A0A0A',
  singularity: '#050505',
  deepSpace: '#121212',
  midnightPurple: '#1A1028',

  // Text
  stardust: '#FFFFFF',
  stardustMuted: '#CCCCCC',
  stardustSoft: '#999999',

  // Semantic
  success: '#6B9B7A',
  error: '#D06060',
} as const;

// PDF-specific colors (React-PDF uses these)
export const PDF_COLORS = {
  background: BRAND.eventHorizon,
  backgroundAlt: BRAND.deepSpace,
  primary: BRAND.nebulaViolet,
  secondary: BRAND.cometTrail,
  accent: BRAND.galaxyHaze,
  accentWarm: BRAND.cosmicRose,
  text: BRAND.stardust,
  textMuted: BRAND.stardustMuted,
  textSoft: BRAND.stardustSoft,
  border: '#2A2A2A',
  borderLight: '#3A3A3A',
} as const;

// Typography
export const TYPOGRAPHY = {
  // Font sizes
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 14,
  body: 11,
  small: 9,
  tiny: 8,

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.7,
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Page dimensions (A4)
export const PAGE = {
  width: 595.28, // A4 width in points
  height: 841.89, // A4 height in points
  marginTop: 50,
  marginBottom: 60,
  marginLeft: 50,
  marginRight: 50,
} as const;

// Category-specific accent colors
export const CATEGORY_COLORS: Record<string, string> = {
  spell: BRAND.nebulaViolet,
  crystal: BRAND.galaxyHaze,
  tarot: BRAND.supernova,
  seasonal: BRAND.cosmicRose,
  astrology: BRAND.cometTrail,
  birthchart: BRAND.nebulaLight,
  bundle: BRAND.galaxyHaze,
};

// Decorative elements
export const DECORATIONS = {
  starSymbol: '✦',
  moonSymbol: '☽',
  sunSymbol: '☉',
  divider: '─────────────────────',
  bullet: '•',
  arrow: '→',
};
