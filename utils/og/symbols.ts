import { thematicPaletteConfig } from '@/constants/seo/generated-category-themes';

/**
 * Symbol and Color Mappings for Thematic OG Images
 *
 * Provides symbols for zodiac, planets, runes, and category-specific colors
 * for generating beautiful, mystical educational images.
 *
 * Zodiac and planet symbols use the Astronomicon font mapping.
 * Moon phases use image paths from /public/icons/moon-phases/
 */

// ============================================================================
// ZODIAC SYMBOLS (Astronomicon font mapping)
// ============================================================================

export const zodiacSymbols: Record<string, string> = {
  aries: 'A',
  taurus: 'B',
  gemini: 'C',
  cancer: 'D',
  leo: 'E',
  virgo: 'F',
  libra: 'G',
  scorpio: 'H',
  sagittarius: 'I',
  capricorn: 'J',
  aquarius: 'K',
  pisces: 'L',
};

// Unicode fallback for zodiac (when Astronomicon not available)
export const zodiacUnicode: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

export const zodiacElements: Record<string, string> = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water',
};

// ============================================================================
// PLANETARY SYMBOLS (Astronomicon font mapping)
// ============================================================================

export const planetSymbols: Record<string, string> = {
  sun: 'Q',
  moon: 'R',
  mercury: 'S',
  venus: 'T',
  mars: 'U',
  jupiter: 'V',
  saturn: 'W',
  uranus: 'X',
  neptune: 'Y',
  pluto: 'Z',
  ascendant: 'a',
  midheaven: 'm',
  'north-node': 'n',
  northnode: 'n',
  'south-node': 's',
  southnode: 's',
  chiron: 'c',
  lilith: 'l',
};

// Unicode fallback for planets (when Astronomicon not available)
export const planetUnicode: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  'north-node': '☊',
  'south-node': '☋',
  chiron: '⚷',
};

// ============================================================================
// RUNE SYMBOLS (Elder Futhark)
// ============================================================================

export const runeSymbols: Record<string, string> = {
  fehu: 'ᚠ',
  uruz: 'ᚢ',
  thurisaz: 'ᚦ',
  ansuz: 'ᚨ',
  raidho: 'ᚱ',
  kenaz: 'ᚲ',
  gebo: 'ᚷ',
  wunjo: 'ᚹ',
  hagalaz: 'ᚺ',
  nauthiz: 'ᚾ',
  isa: 'ᛁ',
  jera: 'ᛃ',
  eihwaz: 'ᛇ',
  perthro: 'ᛈ',
  algiz: 'ᛉ',
  sowilo: 'ᛊ',
  tiwaz: 'ᛏ',
  berkano: 'ᛒ',
  ehwaz: 'ᛖ',
  mannaz: 'ᛗ',
  laguz: 'ᛚ',
  ingwaz: 'ᛜ',
  dagaz: 'ᛞ',
  othala: 'ᛟ',
};

// ============================================================================
// TAROT SYMBOLS
// ============================================================================

export const tarotSuitSymbols: Record<string, string> = {
  wands: '🜂', // Fire alchemical symbol
  cups: '🜄', // Water alchemical symbol
  swords: '🜁', // Air alchemical symbol
  pentacles: '🜃', // Earth alchemical symbol
  major: '*',
};

export const tarotMajorSymbols: Record<string, string> = {
  'the-fool': '0',
  'the-magician': 'I',
  'the-high-priestess': 'II',
  'the-empress': 'III',
  'the-emperor': 'IV',
  'the-hierophant': 'V',
  'the-lovers': 'VI',
  'the-chariot': 'VII',
  strength: 'VIII',
  'the-hermit': 'IX',
  'wheel-of-fortune': 'X',
  justice: 'XI',
  'the-hanged-man': 'XII',
  death: 'XIII',
  temperance: 'XIV',
  'the-devil': 'XV',
  'the-tower': 'XVI',
  'the-star': 'XVII',
  'the-moon': 'XVIII',
  'the-sun': 'XIX',
  judgement: 'XX',
  'the-world': 'XXI',
};

// ============================================================================
// MOON PHASE IMAGES (paths to /public/icons/moon-phases/)
// ============================================================================

export const moonPhaseImages: Record<string, string> = {
  new: '/icons/moon-phases/new-moon.png',
  'new-moon': '/icons/moon-phases/new-moon.png',
  'waxing-crescent': '/icons/moon-phases/waxing-cresent-moon.png',
  'first-quarter': '/icons/moon-phases/first-quarter.png',
  'waxing-gibbous': '/icons/moon-phases/waxing-gibbous-moon.png',
  full: '/icons/moon-phases/full-moon.png',
  'full-moon': '/icons/moon-phases/full-moon.png',
  'waning-gibbous': '/icons/moon-phases/waning-gibbous-moon.png',
  'last-quarter': '/icons/moon-phases/last-quarter.png',
  'third-quarter': '/icons/moon-phases/last-quarter.png',
  'waning-crescent': '/icons/moon-phases/waning-cresent-moon.png',
};

// Unicode emoji fallback for moon phases
export const moonPhaseSymbols: Record<string, string> = {
  new: '🌑',
  'new-moon': '🌑',
  'waxing-crescent': '🌒',
  'first-quarter': '🌓',
  'waxing-gibbous': '🌔',
  full: '🌕',
  'full-moon': '🌕',
  'waning-gibbous': '🌖',
  'last-quarter': '🌗',
  'third-quarter': '🌗',
  'waning-crescent': '🌘',
};

// ============================================================================
// CHAKRA COLORS
// ============================================================================

export const chakraColors: Record<string, { primary: string; glow: string }> = {
  root: { primary: '#DC2626', glow: 'rgba(220, 38, 38, 0.3)' },
  sacral: { primary: '#EA580C', glow: 'rgba(234, 88, 12, 0.3)' },
  'solar-plexus': { primary: '#EAB308', glow: 'rgba(234, 179, 8, 0.3)' },
  heart: { primary: '#16A34A', glow: 'rgba(22, 163, 74, 0.3)' },
  throat: { primary: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.3)' },
  'third-eye': { primary: '#6366F1', glow: 'rgba(99, 102, 241, 0.3)' },
  crown: { primary: '#A855F7', glow: 'rgba(168, 85, 247, 0.3)' },
};

// Chakras use color only (no symbols) - the accent/glow color is the visual
export const chakraSymbols: Record<string, string | null> = {
  root: null,
  sacral: null,
  'solar-plexus': null,
  heart: null,
  throat: null,
  'third-eye': null,
  crown: null,
};

// ============================================================================
// SABBAT COLORS (Wheel of the Year)
// ============================================================================

export const sabbatColors: Record<
  string,
  { primary: string; secondary: string; accent: string }
> = {
  samhain: { primary: '#1a1a1a', secondary: '#2d1f1f', accent: '#EA580C' },
  yule: { primary: '#1e3a5f', secondary: '#0f172a', accent: '#22D3EE' },
  imbolc: { primary: '#1f2937', secondary: '#0f172a', accent: '#F9FAFB' },
  ostara: { primary: '#14532d', secondary: '#0f172a', accent: '#86EFAC' },
  beltane: { primary: '#4c1d95', secondary: '#1e1b4b', accent: '#F472B6' },
  litha: { primary: '#713f12', secondary: '#1c1917', accent: '#FCD34D' },
  lughnasadh: { primary: '#7c2d12', secondary: '#1c1917', accent: '#FB923C' },
  mabon: { primary: '#431407', secondary: '#1c1917', accent: '#F59E0B' },
};

export const sabbatSymbols: Record<string, string> = {
  samhain: '🎃',
  yule: '❄',
  imbolc: '🕯',
  ostara: '🥚',
  beltane: '🔥',
  litha: '☀',
  lughnasadh: '🌾',
  mabon: '🍂',
};

// ============================================================================
// ELEMENT COLORS
// ============================================================================

export const elementColors: Record<
  string,
  { primary: string; secondary: string }
> = {
  fire: { primary: '#DC2626', secondary: '#7f1d1d' },
  water: { primary: '#2563EB', secondary: '#1e3a8a' },
  air: { primary: '#7C3AED', secondary: '#4c1d95' },
  earth: { primary: '#059669', secondary: '#064e3b' },
};

// ============================================================================
// NUMEROLOGY
// ============================================================================

// Plain numbers render well as large symbols across all fonts
export const numerologySymbols: Record<string, string> = {
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '11': '11',
  '22': '22',
  '33': '33',
};

// ============================================================================
// CATEGORY GRADIENTS
// ============================================================================

export interface CategoryTheme {
  gradient: string;
  accentColor: string;
  textColor: string;
  subtleTextColor: string;
}

type PaletteMap = typeof thematicPaletteConfig.palettesByTopLevelCategory;
type PaletteKey = keyof PaletteMap;
type PaletteEntry = PaletteMap[PaletteKey];

const paletteMap = thematicPaletteConfig.palettesByTopLevelCategory;

const paletteAliases: Record<string, string> = {
  lunar: 'moon',
  'wheel-of-the-year': 'wheel-of-the-year',
  sabbat: 'wheel-of-the-year',
  sabbats: 'sabbats',
  planetary: 'astronomy',
  moon: 'moon',
  'moon-in': 'moon-in',
};

function resolvePaletteKey(category: string): PaletteKey | null {
  if (!category) return null;
  const normalized = category.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(paletteMap, normalized)) {
    return normalized as PaletteKey;
  }
  const alias = paletteAliases[normalized];
  return alias ? (alias as PaletteKey) : null;
}

function getPaletteEntry(category: string): PaletteEntry | null {
  const key = resolvePaletteKey(category);
  if (!key) {
    return null;
  }
  return paletteMap[key] ?? null;
}

function buildGradientFromPalette(entry: PaletteEntry): string {
  const [first, second, third] = entry.backgrounds;
  return `linear-gradient(135deg, ${first} 0%, ${second} 55%, ${third} 100%)`;
}

export function getPaletteTheme(category: string): CategoryTheme | null {
  const entry = getPaletteEntry(category);
  if (!entry) {
    return null;
  }
  return {
    gradient: buildGradientFromPalette(entry),
    accentColor: entry.highlight,
    textColor: thematicPaletteConfig.meta.rules.text,
    subtleTextColor: 'rgba(255, 255, 255, 0.6)',
  };
}

export function getPaletteHighlightColor(category: string): string | null {
  const entry = getPaletteEntry(category);
  return entry?.highlight ?? null;
}

function applyPaletteAccentAdjustments(
  category: string,
  theme: CategoryTheme,
  subCategory?: string,
): CategoryTheme {
  if (category === 'zodiac') {
    const element = subCategory ? zodiacElements[subCategory] : 'fire';
    const accent = elementColors[element]?.primary || theme.accentColor;
    return { ...theme, accentColor: accent };
  }

  if (category === 'chakras') {
    const chakra = subCategory ? chakraColors[subCategory] : chakraColors.crown;
    const accent = chakra?.primary || theme.accentColor;
    return { ...theme, accentColor: accent };
  }

  if (['sabbat', 'sabbats', 'wheel-of-the-year'].includes(category)) {
    const sabbat = subCategory ? sabbatColors[subCategory] : sabbatColors.yule;
    const accent = sabbat?.accent || theme.accentColor;
    return { ...theme, accentColor: accent };
  }

  return theme;
}

export function getCategoryTheme(
  category: string,
  subCategory?: string,
): CategoryTheme {
  const normalizedCategory = (category || '').toLowerCase();
  const paletteTheme = getPaletteTheme(normalizedCategory);
  if (paletteTheme) {
    return applyPaletteAccentAdjustments(
      normalizedCategory,
      paletteTheme,
      subCategory,
    );
  }

  switch (normalizedCategory) {
    case 'zodiac': {
      const element = subCategory ? zodiacElements[subCategory] : 'fire';
      const elemColor = elementColors[element] || elementColors.fire;
      return {
        gradient: `linear-gradient(135deg, #0f172a 0%, ${elemColor.secondary} 50%, #0a0a0a 100%)`,
        accentColor: elemColor.primary,
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };
    }

    case 'tarot':
      return {
        gradient:
          'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #0f0a1a 100%)',
        accentColor: '#a78bfa',
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };

    case 'lunar':
      return {
        gradient:
          'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)',
        accentColor: '#94a3b8',
        textColor: '#e2e8f0',
        subtleTextColor: 'rgba(255, 255, 255, 0.5)',
      };

    case 'crystals':
      return {
        gradient:
          'linear-gradient(135deg, #1e1b2e 0%, #2d1f4e 30%, #0a0a0a 100%)',
        accentColor: '#c084fc',
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };

    case 'chakras': {
      const chakra = subCategory
        ? chakraColors[subCategory]
        : chakraColors.crown;
      return {
        gradient: `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)`,
        accentColor: chakra?.primary || '#a855f7',
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };
    }

    case 'sabbat': {
      const sabbat = subCategory
        ? sabbatColors[subCategory]
        : sabbatColors.yule;
      return {
        gradient: `linear-gradient(135deg, ${sabbat?.primary || '#1a1a1a'} 0%, ${sabbat?.secondary || '#0a0a0a'} 100%)`,
        accentColor: sabbat?.accent || '#fcd34d',
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };
    }

    case 'numerology':
      return {
        gradient:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0a0a0a 100%)',
        accentColor: '#fcd34d',
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };

    case 'runes':
      return {
        gradient:
          'linear-gradient(135deg, #1f2937 0%, #374151 30%, #0a0a0a 100%)',
        accentColor: '#9ca3af',
        textColor: '#e5e7eb',
        subtleTextColor: 'rgba(255, 255, 255, 0.5)',
      };

    case 'planetary':
      return {
        gradient:
          'linear-gradient(135deg, #0c1445 0%, #1e3a8a 30%, #0a0a0a 100%)',
        accentColor: '#60a5fa',
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };

    default:
      return {
        gradient:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #1e1b2e 70%, #0a0a0a 100%)',
        accentColor: '#a78bfa',
        textColor: '#ffffff',
        subtleTextColor: 'rgba(255, 255, 255, 0.6)',
      };
  }
}

// ============================================================================
// SYMBOL LOOKUP
// ============================================================================

/**
 * Check if a category uses Astronomicon font for symbols
 */
export function usesAstronomiconFont(category: string): boolean {
  return (
    category === 'zodiac' || category === 'planetary' || category === 'aspects'
  );
}

/**
 * Check if a category uses images instead of symbols
 */
export function usesImageForSymbol(category: string): boolean {
  return category === 'lunar';
}

/**
 * Check if a category uses Unicode symbols that need special font
 * Runes use Noto Sans Runic font (loaded separately)
 */
export function usesUnicodeFallback(category: string): boolean {
  // Runes now use Noto Sans Runic font
  return category === 'runes';
}

/**
 * Get moon phase image path for lunar content
 */
export function getMoonPhaseImage(slug: string): string | null {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');
  return moonPhaseImages[normalizedSlug] || moonPhaseImages.full;
}

export function getSymbolForContent(
  category: string,
  slug: string,
): string | null {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');

  switch (category) {
    case 'zodiac':
      return zodiacSymbols[normalizedSlug] || null;

    case 'planetary':
      return planetSymbols[normalizedSlug] || null;

    case 'runes':
      // Elder Futhark unicode - uses Noto Sans Runic font
      return runeSymbols[normalizedSlug] || null;

    case 'tarot':
      return tarotMajorSymbols[normalizedSlug] || tarotSuitSymbols.major;

    case 'lunar':
      // Lunar uses images, not symbols - return null here
      return null;

    case 'chakras':
      // Chakras use color only, no symbol
      return null;

    case 'sabbat':
      // Emoji symbols may not render reliably in OG images
      // The seasonal gradient + title creates the visual identity
      return null;

    case 'numerology': {
      const num = normalizedSlug.match(/\d+/)?.[0];
      return num ? numerologySymbols[num] || num : null;
    }

    default:
      return null;
  }
}

// ============================================================================
// ATTRIBUTE STRINGS
// ============================================================================

export function getAttributeString(
  category: string,
  slug: string,
): string | null {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');

  switch (category) {
    case 'zodiac':
      const element = zodiacElements[normalizedSlug];
      const rulers: Record<string, string> = {
        aries: 'Mars',
        taurus: 'Venus',
        gemini: 'Mercury',
        cancer: 'Moon',
        leo: 'Sun',
        virgo: 'Mercury',
        libra: 'Venus',
        scorpio: 'Pluto',
        sagittarius: 'Jupiter',
        capricorn: 'Saturn',
        aquarius: 'Uranus',
        pisces: 'Neptune',
      };
      const modalities: Record<string, string> = {
        aries: 'Cardinal',
        taurus: 'Fixed',
        gemini: 'Mutable',
        cancer: 'Cardinal',
        leo: 'Fixed',
        virgo: 'Mutable',
        libra: 'Cardinal',
        scorpio: 'Fixed',
        sagittarius: 'Mutable',
        capricorn: 'Cardinal',
        aquarius: 'Fixed',
        pisces: 'Mutable',
      };
      if (element && rulers[normalizedSlug]) {
        return `${modalities[normalizedSlug]} ${element.charAt(0).toUpperCase() + element.slice(1)} • ${rulers[normalizedSlug]}`;
      }
      return null;

    case 'chakras':
      const chakraLocations: Record<string, string> = {
        root: 'Base of Spine • Earth',
        sacral: 'Below Navel • Water',
        'solar-plexus': 'Stomach • Fire',
        heart: 'Center Chest • Air',
        throat: 'Throat • Ether',
        'third-eye': 'Between Brows • Light',
        crown: 'Top of Head • Cosmic',
      };
      return chakraLocations[normalizedSlug] || null;

    case 'sabbat':
      const sabbatDates: Record<string, string> = {
        samhain: 'October 31 • The Thinning Veil',
        yule: 'December 21 • Winter Solstice',
        imbolc: 'February 1 • First Light',
        ostara: 'March 20 • Spring Equinox',
        beltane: 'May 1 • Sacred Fire',
        litha: 'June 21 • Summer Solstice',
        lughnasadh: 'August 1 • First Harvest',
        mabon: 'September 22 • Autumn Equinox',
      };
      return sabbatDates[normalizedSlug] || null;

    default:
      return null;
  }
}
