import type { ShareFormat } from '@/hooks/useShareModal';
import { FORMAT_SIZES, STORY_SAFE_ZONES } from './types';

// Increment this to bust OG image caches when designs change
export const OG_IMAGE_VERSION = 6;

export function getFormatDimensions(format: ShareFormat = 'square') {
  return FORMAT_SIZES[format];
}

export function getElementGradient(element: string): string {
  const gradients: Record<string, string> = {
    Fire: 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #EAB308 100%)',
    Earth: 'linear-gradient(135deg, #65A30D 0%, #059669 50%, #0D9488 100%)',
    Air: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
    Water: 'linear-gradient(135deg, #0891B2 0%, #0D9488 50%, #1D4ED8 100%)',
  };

  return (
    gradients[element] || 'linear-gradient(135deg, #8458D8 0%, #7B7BE8 100%)'
  );
}

export function getMoonPhaseIcon(phase: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

  const phaseMap: Record<string, string> = {
    'New Moon': 'new-moon',
    'Waxing Crescent': 'waxing-cresent-moon',
    'First Quarter': 'first-quarter',
    'Waxing Gibbous': 'waxing-gibbous-moon',
    'Full Moon': 'full-moon',
    'Waning Gibbous': 'waning-gibbous-moon',
    'Last Quarter': 'last-quarter',
    'Waning Crescent': 'waning-cresent-moon',
  };

  const iconName = phaseMap[phase] || 'full-moon';
  return `${baseUrl}/icons/moon-phases/${iconName}.svg`;
}

export function getStoryContentArea() {
  return {
    top: STORY_SAFE_ZONES.top,
    bottom: STORY_SAFE_ZONES.bottom,
    height: STORY_SAFE_ZONES.contentHeight,
  };
}

export function getOGFonts() {
  return [
    {
      name: 'Roboto Mono',
      data: fetch(
        new URL(
          '/fonts/RobotoMono-Light.ttf',
          process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app',
        ),
      ).then((res) => res.arrayBuffer()),
      weight: 300,
      style: 'normal',
    },
    {
      name: 'Roboto Mono',
      data: fetch(
        new URL(
          '/fonts/RobotoMono-Regular.ttf',
          process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app',
        ),
      ).then((res) => res.arrayBuffer()),
      weight: 400,
      style: 'normal',
    },
  ];
}

export const OG_COLORS = {
  background: '#0A0A0A',
  primaryViolet: '#8458D8',
  cometTrail: '#7B7BE8',
  galaxyHaze: '#C77DFF',
  cosmicRose: '#EE789E',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  border: 'rgba(255, 255, 255, 0.12)',
  cardBg: 'rgba(255, 255, 255, 0.03)',
} as const;

// Seeded pseudo-random number generator
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }

  return function () {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export function generateStarfield(shareId: string, count: number = 80): Star[] {
  const random = seededRandom(shareId);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      x: random() * 100,
      y: random() * 100,
      size: 1 + random() * 2,
      opacity: 0.3 + random() * 0.6,
    });
  }

  return stars;
}

export function getStarCount(format: ShareFormat): number {
  switch (format) {
    case 'story':
      return 120;
    case 'landscape':
      return 60;
    default:
      return 80;
  }
}

export function renderBrandedFooter(baseUrl: string, fontSize: number = 16) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  };
}
