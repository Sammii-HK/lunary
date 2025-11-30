// Icon mappings for OG images
// These use Unicode symbols and can be replaced with Icons8 dotty SVGs

export const ZODIAC_ICONS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

export const PLANET_ICONS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

export const MOON_PHASE_ICONS: Record<string, string> = {
  'New Moon': '🌑',
  'Waxing Crescent': '🌒',
  'First Quarter': '🌓',
  'Waxing Gibbous': '🌔',
  'Full Moon': '🌕',
  'Waning Gibbous': '🌖',
  'Third Quarter': '🌗',
  'Waning Crescent': '🌘',
};

export const ELEMENT_ICONS: Record<string, string> = {
  Fire: '🔥',
  Water: '💧',
  Air: '💨',
  Earth: '🌍',
};

export function getZodiacIcon(sign: string): string {
  return ZODIAC_ICONS[sign] || '★';
}

export function getPlanetIcon(planet: string): string {
  return PLANET_ICONS[planet] || '●';
}

export function getMoonPhaseIcon(phase: string): string {
  // Match partial phase names
  for (const [key, icon] of Object.entries(MOON_PHASE_ICONS)) {
    if (phase.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
      return icon;
    }
  }
  // Fallback based on phase keywords
  if (phase.toLowerCase().includes('new')) return '🌑';
  if (phase.toLowerCase().includes('full')) return '🌕';
  if (phase.toLowerCase().includes('first')) return '🌓';
  if (
    phase.toLowerCase().includes('third') ||
    phase.toLowerCase().includes('last')
  )
    return '🌗';
  if (
    phase.toLowerCase().includes('waxing') &&
    phase.toLowerCase().includes('crescent')
  )
    return '🌒';
  if (
    phase.toLowerCase().includes('waxing') &&
    phase.toLowerCase().includes('gibbous')
  )
    return '🌔';
  if (
    phase.toLowerCase().includes('waning') &&
    phase.toLowerCase().includes('gibbous')
  )
    return '🌖';
  if (
    phase.toLowerCase().includes('waning') &&
    phase.toLowerCase().includes('crescent')
  )
    return '🌘';
  return '🌙';
}

export function getElementIcon(element: string): string {
  return ELEMENT_ICONS[element] || '✦';
}

// Dynamic moon phase icon based on illumination percentage
export function getDynamicMoonIcon(
  illumination: number,
  isWaxing: boolean,
): string {
  if (illumination < 3) return '🌑'; // New Moon
  if (illumination < 25) return isWaxing ? '🌒' : '🌘'; // Crescent
  if (illumination >= 25 && illumination < 52) return isWaxing ? '🌓' : '🌗'; // Quarter
  if (illumination >= 52 && illumination < 97) return isWaxing ? '🌔' : '🌖'; // Gibbous
  return '🌕'; // Full Moon
}
