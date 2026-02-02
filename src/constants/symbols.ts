import symbolsData from '@/data/symbols.json';

export const ZODIAC_SIGNS = symbolsData.zodiacSigns;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const bodiesSymbols = symbolsData.bodies;
export const planetSymbols = symbolsData.bodies;
export const zodiacSymbol = symbolsData.zodiac;
export const zodiacUnicode = symbolsData.unicode;
export const astroPointSymbols = symbolsData.points;

// Unicode symbols for planets (for display without special fonts)
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
  chiron: '⚷',
  northnode: '☊',
  southnode: '☋',
};

// Aspect symbols
export const aspectSymbols: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
  quincunx: '⚻',
  semisextile: '⚺',
};

// Moon phase icon paths (branded SVG icons)
export const moonPhaseIcons: Record<string, string> = {
  'new moon': '/icons/moon-phases/new-moon.svg',
  'waxing crescent': '/icons/moon-phases/waxing-cresent-moon.svg',
  'first quarter': '/icons/moon-phases/first-quarter.svg',
  'waxing gibbous': '/icons/moon-phases/waxing-gibbous-moon.svg',
  'full moon': '/icons/moon-phases/full-moon.svg',
  'waning gibbous': '/icons/moon-phases/waning-gibbous-moon.svg',
  'last quarter': '/icons/moon-phases/last-quarter.svg',
  'waning crescent': '/icons/moon-phases/waning-cresent-moon.svg',
};

// Helper functions for easy access
export function getPlanetSymbol(planet: string, useUnicode = true): string {
  const key = planet.toLowerCase().replace(/\s+/g, '');
  if (useUnicode) {
    return planetUnicode[key] || planet.charAt(0);
  }
  return planetSymbols[key as keyof typeof planetSymbols] || planet.charAt(0);
}

export function getZodiacSymbol(sign: string, useUnicode = true): string {
  const key = sign.toLowerCase();
  if (useUnicode) {
    return zodiacUnicode[key as keyof typeof zodiacUnicode] || sign.charAt(0);
  }
  return zodiacSymbol[key as keyof typeof zodiacSymbol] || sign.charAt(0);
}

export function getAspectSymbol(aspect: string): string {
  const key = aspect.toLowerCase();
  return aspectSymbols[key] || aspect;
}

export function getMoonPhaseIcon(phase: string): string {
  const key = phase.toLowerCase();
  // Check for partial matches
  for (const [phaseName, iconPath] of Object.entries(moonPhaseIcons)) {
    if (key.includes(phaseName) || phaseName.includes(key)) {
      return iconPath;
    }
  }
  // Default to full moon icon
  return '/icons/moon-phases/full-moon.svg';
}
