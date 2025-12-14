/**
 * Lunary PDF Theme
 *
 * Brand colours and typography tokens for PDF generation.
 * Uses rgb() values for pdf-lib compatibility.
 */

import { rgb } from 'pdf-lib';

// Brand Colours (hex for reference, rgb for pdf-lib)
export const COLORS = {
  // Backgrounds
  eventHorizon: rgb(0.039, 0.039, 0.039), // #0A0A0A
  singularity: rgb(0.02, 0.02, 0.02), // #050505
  backgroundAlt: rgb(0.1, 0.1, 0.18), // #1A1A2E - for callouts/cards
  cardBg: rgb(0.07, 0.07, 0.07), // #121212

  // Primary Palette
  nebulaViolet: rgb(0.52, 0.35, 0.85), // #8458D8
  cometTrail: rgb(0.48, 0.48, 0.91), // #7B7BE8
  galaxyHaze: rgb(0.78, 0.49, 1), // #C77DFF
  cosmicRose: rgb(0.93, 0.47, 0.62), // #EE789E
  supernova: rgb(0.82, 0.44, 0.91), // #D070E8

  // Text
  stardust: rgb(1, 1, 1), // #FFFFFF
  textMuted: rgb(0.8, 0.8, 0.8), // #CCCCCC
  textSoft: rgb(0.6, 0.6, 0.6), // #999999

  // Semantic (use sparingly)
  solarFlare: rgb(0.82, 0.38, 0.38), // #D06060 - errors only
  auroraGreen: rgb(0.42, 0.61, 0.48), // #6B9B7A - success only

  // Borders
  border: rgb(0.17, 0.17, 0.17), // #2A2A2A
} as const;

// Hex values for reference/documentation
export const HEX_COLORS = {
  eventHorizon: '#0A0A0A',
  singularity: '#050505',
  nebulaViolet: '#8458D8',
  cometTrail: '#7B7BE8',
  galaxyHaze: '#C77DFF',
  cosmicRose: '#EE789E',
  supernova: '#D070E8',
  stardust: '#FFFFFF',
  solarFlare: '#D06060',
  auroraGreen: '#6B9B7A',
} as const;

// Typography
export const TYPOGRAPHY = {
  // Font families (loaded dynamically)
  heading: 'Roboto Mono',
  body: 'Roboto Mono',

  // Font sizes (in points) - refined for better hierarchy
  sizes: {
    h1: 28, // Cover title - slightly smaller for elegance
    h2: 20, // Section headers
    h3: 16, // Spell titles
    h4: 12, // Sub-sections
    body: 10, // Main content
    small: 9, // Meta info
    tiny: 7, // Footer
    meta: 8, // Moon phases, difficulty
  },

  // Line height multiplier
  lineHeight: 1.6, // Slightly more breathing room
} as const;

// Layout constants
export const LAYOUT = {
  // A4 dimensions in points
  pageWidth: 595.28,
  pageHeight: 841.89,

  // Margins
  margin: 50,

  // Derived
  get contentWidth() {
    return this.pageWidth - this.margin * 2;
  },
} as const;

// Spacing tokens
export const SPACING = {
  xs: 5,
  sm: 10,
  md: 20,
  lg: 30,
  xl: 40,
} as const;

// Export convenience aliases
export const PAGE_WIDTH = LAYOUT.pageWidth;
export const PAGE_HEIGHT = LAYOUT.pageHeight;
export const MARGIN = LAYOUT.margin;
export const CONTENT_WIDTH = LAYOUT.contentWidth;
export const FONT_SIZES = TYPOGRAPHY.sizes;
export const LINE_HEIGHT = TYPOGRAPHY.lineHeight;
