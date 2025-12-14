import { PdfTarotCard, PdfTarotSpread } from '../pdf/schema';

export type ShopCategory =
  | 'spell'
  | 'crystal'
  | 'tarot'
  | 'seasonal'
  | 'astrology'
  | 'birthchart'
  | 'retrograde'
  | 'bundle';

export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ShopCategory;
  whatInside: string[];
  perfectFor?: string[];
  related: string[];
  price: number;
  gradient: string;
  stripePriceId?: string | null;
  // SEO fields
  tags?: string[];
  keywords?: string[];
  metaDescription?: string;
  badge?: 'new' | 'seasonal' | 'trending' | 'popular';
  spreads?: PdfTarotSpread[];
  cards?: PdfTarotCard[];
  journalPrompts?: string[];
  closingText?: string;
  optionalAffirmation?: string;
  // Crystal pack specific fields
  crystalSelectionMethod?: 'intention' | 'zodiac' | 'chakra' | 'custom';
  selectionValue?: string;
  customCrystals?: string[];
};

// Brand Palette:
// Primary: Nebula Violet #8458D8, Comet Trail #7B7BE8, Galaxy Haze #C77DFF
// Accent: Supernova #D070E8, Cosmic Rose #EE789E
// Background: Event Horizon #0A0A0A, Singularity #050505
// Lighter shades derived from primary palette
const BRAND = {
  nebulaViolet: '#8458D8',
  nebulaLight: '#9B75E3',
  nebulaDark: '#6B42B8',
  cometTrail: '#7B7BE8',
  cometLight: '#9A9AF0',
  cometDark: '#5C5CD4',
  galaxyHaze: '#C77DFF',
  hazeLight: '#D9A5FF',
  hazeDark: '#A855E0',
  supernova: '#D070E8',
  supernovaLight: '#E099F0',
  supernovaDark: '#B050C8',
  cosmicRose: '#EE789E',
  roseLight: '#F5A0B8',
  roseDark: '#D45A7A',
  eventHorizon: '#0A0A0A',
  singularity: '#050505',
  deepSpace: '#121212',
  midnightPurple: '#1A1028',
};

// SOFT LINEAR GRADIENTS ONLY - Beautiful color-to-color blends
export const SHOP_GRADIENTS = {
  // === PRIMARY SOFT BLENDS (135deg diagonal) ===
  nebulaToHaze: `linear-gradient(135deg, ${BRAND.nebulaViolet} 0%, ${BRAND.galaxyHaze} 100%)`,
  nebulaToComet: `linear-gradient(135deg, ${BRAND.nebulaViolet} 0%, ${BRAND.cometTrail} 100%)`,
  nebulaToRose: `linear-gradient(135deg, ${BRAND.nebulaViolet} 0%, ${BRAND.cosmicRose} 100%)`,
  nebulaToSupernova: `linear-gradient(135deg, ${BRAND.nebulaViolet} 0%, ${BRAND.supernova} 100%)`,
  cometToHaze: `linear-gradient(135deg, ${BRAND.cometTrail} 0%, ${BRAND.galaxyHaze} 100%)`,
  cometToRose: `linear-gradient(135deg, ${BRAND.cometTrail} 0%, ${BRAND.cosmicRose} 100%)`,
  cometToSupernova: `linear-gradient(135deg, ${BRAND.cometTrail} 0%, ${BRAND.supernova} 100%)`,
  hazeToRose: `linear-gradient(135deg, ${BRAND.galaxyHaze} 0%, ${BRAND.cosmicRose} 100%)`,
  hazeToSupernova: `linear-gradient(135deg, ${BRAND.galaxyHaze} 0%, ${BRAND.supernova} 100%)`,
  roseToSupernova: `linear-gradient(135deg, ${BRAND.cosmicRose} 0%, ${BRAND.supernova} 100%)`,

  // === REVERSED SOFT BLENDS (135deg) ===
  hazeToNebula: `linear-gradient(135deg, ${BRAND.galaxyHaze} 0%, ${BRAND.nebulaViolet} 100%)`,
  roseToNebula: `linear-gradient(135deg, ${BRAND.cosmicRose} 0%, ${BRAND.nebulaViolet} 100%)`,
  roseToComet: `linear-gradient(135deg, ${BRAND.cosmicRose} 0%, ${BRAND.cometTrail} 100%)`,
  roseToHaze: `linear-gradient(135deg, ${BRAND.cosmicRose} 0%, ${BRAND.galaxyHaze} 100%)`,
  supernovaToNebula: `linear-gradient(135deg, ${BRAND.supernova} 0%, ${BRAND.nebulaViolet} 100%)`,
  supernovaToComet: `linear-gradient(135deg, ${BRAND.supernova} 0%, ${BRAND.cometTrail} 100%)`,
  supernovaToHaze: `linear-gradient(135deg, ${BRAND.supernova} 0%, ${BRAND.galaxyHaze} 100%)`,
  supernovaToRose: `linear-gradient(135deg, ${BRAND.supernova} 0%, ${BRAND.cosmicRose} 100%)`,

  // === LIGHT SHADE BLENDS (softer, more pastel) ===
  lightNebulaToHaze: `linear-gradient(135deg, ${BRAND.nebulaLight} 0%, ${BRAND.hazeLight} 100%)`,
  lightNebulaToRose: `linear-gradient(135deg, ${BRAND.nebulaLight} 0%, ${BRAND.roseLight} 100%)`,
  lightCometToHaze: `linear-gradient(135deg, ${BRAND.cometLight} 0%, ${BRAND.hazeLight} 100%)`,
  lightCometToRose: `linear-gradient(135deg, ${BRAND.cometLight} 0%, ${BRAND.roseLight} 100%)`,
  lightHazeToRose: `linear-gradient(135deg, ${BRAND.hazeLight} 0%, ${BRAND.roseLight} 100%)`,
  lightHazeToSupernova: `linear-gradient(135deg, ${BRAND.hazeLight} 0%, ${BRAND.supernovaLight} 100%)`,
  lightRoseToSupernova: `linear-gradient(135deg, ${BRAND.roseLight} 0%, ${BRAND.supernovaLight} 100%)`,
  lightSupernovaToHaze: `linear-gradient(135deg, ${BRAND.supernovaLight} 0%, ${BRAND.hazeLight} 100%)`,

  // === LIGHT TO MAIN BLENDS (pastel to saturated) ===
  nebulaFade: `linear-gradient(135deg, ${BRAND.nebulaLight} 0%, ${BRAND.nebulaViolet} 100%)`,
  cometFade: `linear-gradient(135deg, ${BRAND.cometLight} 0%, ${BRAND.cometTrail} 100%)`,
  hazeFade: `linear-gradient(135deg, ${BRAND.hazeLight} 0%, ${BRAND.galaxyHaze} 100%)`,
  roseFade: `linear-gradient(135deg, ${BRAND.roseLight} 0%, ${BRAND.cosmicRose} 100%)`,
  supernovaFade: `linear-gradient(135deg, ${BRAND.supernovaLight} 0%, ${BRAND.supernova} 100%)`,

  // === CROSS-LIGHT BLENDS (light of one to main of another) ===
  lightNebulaToMainHaze: `linear-gradient(135deg, ${BRAND.nebulaLight} 0%, ${BRAND.galaxyHaze} 100%)`,
  lightNebulaToMainRose: `linear-gradient(135deg, ${BRAND.nebulaLight} 0%, ${BRAND.cosmicRose} 100%)`,
  lightCometToMainSupernova: `linear-gradient(135deg, ${BRAND.cometLight} 0%, ${BRAND.supernova} 100%)`,
  lightHazeToMainRose: `linear-gradient(135deg, ${BRAND.hazeLight} 0%, ${BRAND.cosmicRose} 100%)`,
  lightHazeToMainNebula: `linear-gradient(135deg, ${BRAND.hazeLight} 0%, ${BRAND.nebulaViolet} 100%)`,
  lightRoseToMainHaze: `linear-gradient(135deg, ${BRAND.roseLight} 0%, ${BRAND.galaxyHaze} 100%)`,
  lightRoseToMainNebula: `linear-gradient(135deg, ${BRAND.roseLight} 0%, ${BRAND.nebulaViolet} 100%)`,
  lightSupernovaToMainComet: `linear-gradient(135deg, ${BRAND.supernovaLight} 0%, ${BRAND.cometTrail} 100%)`,

  // === THREE COLOR SOFT BLENDS ===
  nebulaHazeRose: `linear-gradient(135deg, ${BRAND.nebulaViolet} 0%, ${BRAND.galaxyHaze} 50%, ${BRAND.cosmicRose} 100%)`,
  cometHazeRose: `linear-gradient(135deg, ${BRAND.cometTrail} 0%, ${BRAND.galaxyHaze} 50%, ${BRAND.cosmicRose} 100%)`,
  cometSupernovaRose: `linear-gradient(135deg, ${BRAND.cometTrail} 0%, ${BRAND.supernova} 50%, ${BRAND.cosmicRose} 100%)`,
  nebulaSupernovaRose: `linear-gradient(135deg, ${BRAND.nebulaViolet} 0%, ${BRAND.supernova} 50%, ${BRAND.cosmicRose} 100%)`,
  hazeNebulaCometBlend: `linear-gradient(135deg, ${BRAND.galaxyHaze} 0%, ${BRAND.nebulaViolet} 50%, ${BRAND.cometTrail} 100%)`,
  roseSupernovaHaze: `linear-gradient(135deg, ${BRAND.cosmicRose} 0%, ${BRAND.supernova} 50%, ${BRAND.galaxyHaze} 100%)`,
  cometNebulaHaze: `linear-gradient(135deg, ${BRAND.cometTrail} 0%, ${BRAND.nebulaViolet} 50%, ${BRAND.galaxyHaze} 100%)`,
  supernovaHazeNebula: `linear-gradient(135deg, ${BRAND.supernova} 0%, ${BRAND.galaxyHaze} 50%, ${BRAND.nebulaViolet} 100%)`,

  // === DIFFERENT ANGLES (110deg - more horizontal) ===
  horizNebulaToHaze: `linear-gradient(110deg, ${BRAND.nebulaViolet} 0%, ${BRAND.galaxyHaze} 100%)`,
  horizCometToRose: `linear-gradient(110deg, ${BRAND.cometTrail} 0%, ${BRAND.cosmicRose} 100%)`,
  horizHazeToSupernova: `linear-gradient(110deg, ${BRAND.galaxyHaze} 0%, ${BRAND.supernova} 100%)`,
  horizRoseToNebula: `linear-gradient(110deg, ${BRAND.cosmicRose} 0%, ${BRAND.nebulaViolet} 100%)`,
  horizSupernovaToComet: `linear-gradient(110deg, ${BRAND.supernova} 0%, ${BRAND.cometTrail} 100%)`,

  // === DIFFERENT ANGLES (160deg - more vertical) ===
  vertNebulaToRose: `linear-gradient(160deg, ${BRAND.nebulaViolet} 0%, ${BRAND.cosmicRose} 100%)`,
  vertCometToHaze: `linear-gradient(160deg, ${BRAND.cometTrail} 0%, ${BRAND.galaxyHaze} 100%)`,
  vertHazeToNebula: `linear-gradient(160deg, ${BRAND.galaxyHaze} 0%, ${BRAND.nebulaViolet} 100%)`,
  vertRoseToSupernova: `linear-gradient(160deg, ${BRAND.cosmicRose} 0%, ${BRAND.supernova} 100%)`,
  vertSupernovaToHaze: `linear-gradient(160deg, ${BRAND.supernova} 0%, ${BRAND.galaxyHaze} 100%)`,

  // === FULL SPECTRUM SOFT BLENDS ===
  fullSpectrum: `linear-gradient(135deg, ${BRAND.nebulaViolet} 0%, ${BRAND.cometTrail} 25%, ${BRAND.galaxyHaze} 50%, ${BRAND.supernova} 75%, ${BRAND.cosmicRose} 100%)`,
  reverseSpectrum: `linear-gradient(135deg, ${BRAND.cosmicRose} 0%, ${BRAND.supernova} 25%, ${BRAND.galaxyHaze} 50%, ${BRAND.cometTrail} 75%, ${BRAND.nebulaViolet} 100%)`,
  warmSpectrum: `linear-gradient(135deg, ${BRAND.cosmicRose} 0%, ${BRAND.supernova} 33%, ${BRAND.galaxyHaze} 66%, ${BRAND.hazeLight} 100%)`,
  coolSpectrum: `linear-gradient(135deg, ${BRAND.cometTrail} 0%, ${BRAND.nebulaViolet} 33%, ${BRAND.galaxyHaze} 66%, ${BRAND.hazeLight} 100%)`,
} as const;

export const PRICE_TIERS = {
  mini: 399,
  standard: 799,
  seasonal: 999,
  tarot: 1299,
  tarotPremium: 1499,
  deepDive: 1499,
  wheelBundle: 3900,
  lifetime: 8900,
} as const;

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  spell: 'Spell Packs',
  crystal: 'Crystal Packs',
  tarot: 'Tarot Packs',
  seasonal: 'Seasonal Packs',
  astrology: 'Astrology Packs',
  birthchart: 'Birth Chart Packs',
  bundle: 'Bundles',
  retrograde: 'Retrograde',
};

export const CATEGORY_GRADIENTS: Record<ShopCategory, string> = {
  spell: SHOP_GRADIENTS.nebulaToHaze,
  crystal: SHOP_GRADIENTS.hazeToRose,
  tarot: SHOP_GRADIENTS.supernovaToHaze,
  seasonal: SHOP_GRADIENTS.cometSupernovaRose,
  astrology: SHOP_GRADIENTS.cometToHaze,
  birthchart: SHOP_GRADIENTS.nebulaSupernovaRose,
  bundle: SHOP_GRADIENTS.fullSpectrum,
  retrograde: SHOP_GRADIENTS.cometToSupernova,
};

export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function getGradientForIndex(index: number): string {
  const gradients = Object.values(SHOP_GRADIENTS);
  return gradients[index % gradients.length];
}
