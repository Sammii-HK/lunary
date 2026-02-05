/**
 * Programmatic Tarot Card SVG Generator
 *
 * Creates beautiful, on-brand tarot cards using:
 * - Seeded procedural star field (reused from video generator)
 * - Card-specific meaningful artwork
 * - Planet/zodiac symbols from Astronomicon font
 * - Lunary brand colors
 */

import {
  TAROT_VISUALS,
  type TarotVisual,
  type TarotArt,
} from '@/data/tarot-visuals';
import { planetSymbols, zodiacSymbol } from '@/constants/symbols';

// Brand colors from tailwind config
const COLORS = {
  bg: '#0A0A0A',
  bgDeep: '#050505',
  primary: '#8458D8',
  secondary: '#7B7BE8',
  accent: '#C77DFF',
  highlight: '#D070E8',
  rose: '#EE789E',
  text: '#FFFFFF',
};

// Element to color mapping (fallback)
const ELEMENT_COLORS: Record<string, { primary: string; secondary: string }> = {
  Fire: { primary: '#D06060', secondary: '#F59E0B' },
  Water: { primary: '#7B7BE8', secondary: '#2563EB' },
  Air: { primary: '#C77DFF', secondary: '#A78BFA' },
  Earth: { primary: '#6B9B7A', secondary: '#059669' },
};

/**
 * Seeded pseudo-random number generator (same as starfield-generator.ts)
 */
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

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

/**
 * Generate stars for the card background
 */
function generateStars(seed: string, count: number = 40): Star[] {
  const random = seededRandom(seed);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    stars.push({
      x: random() * 100,
      y: random() * 100,
      size: 0.5 + random() * 1.5,
      opacity: 0.2 + random() * 0.6,
    });
  }

  return stars;
}

/**
 * Generate card-specific meaningful artwork
 */
function generateCardArt(
  artType: TarotArt,
  colors: { primary: string; secondary: string },
): string {
  const p = colors.primary;
  const s = colors.secondary;

  switch (artType) {
    // The Fool - Cliff edge with spiral of potential
    case 'cliff-edge':
      return `
        <path d="M 15 95 L 45 85 L 50 70 L 55 85 L 85 95" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <path d="M 50 65 Q 60 55, 55 45 Q 50 35, 45 45 Q 40 55, 50 50 Q 55 45, 50 40" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.7"/>
        <circle cx="50" cy="35" r="3" fill="${s}" opacity="0.6"/>
      `;

    // The Magician - Infinity with 4 elements
    case 'infinity-tools':
      return `
        <path d="M 35 40 C 35 32, 45 32, 50 40 S 65 48, 65 40 S 55 32, 50 40 S 35 48, 35 40" fill="none" stroke="${p}" stroke-width="2" opacity="0.8"/>
        <circle cx="35" cy="70" r="4" fill="none" stroke="${s}" stroke-width="1" opacity="0.5"/>
        <rect x="46" y="66" width="8" height="8" fill="none" stroke="${s}" stroke-width="1" opacity="0.5"/>
        <path d="M 65 74 L 69 66 L 61 66 Z" fill="none" stroke="${s}" stroke-width="1" opacity="0.5"/>
        <path d="M 50 82 L 50 90 M 46 86 L 54 86" fill="none" stroke="${s}" stroke-width="1" opacity="0.5"/>
      `;

    // High Priestess - Two pillars with veil
    case 'pillars-veil':
      return `
        <rect x="20" y="30" width="8" height="50" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <rect x="72" y="30" width="8" height="50" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
        <path d="M 28 35 Q 50 25, 72 35" fill="none" stroke="${p}" stroke-width="1" opacity="0.3"/>
        <path d="M 35 40 Q 50 50, 65 40 Q 50 60, 35 50 Q 50 70, 65 60" fill="none" stroke="${p}" stroke-width="0.8" opacity="0.25" stroke-dasharray="2 2"/>
        <circle cx="50" cy="55" r="8" fill="none" stroke="${s}" stroke-width="1" opacity="0.5"/>
      `;

    // The Empress - Growing abundance
    case 'growing-abundance':
      return `
        <path d="M 50 85 Q 50 70, 45 60 Q 40 50, 50 45 Q 60 50, 55 60 Q 50 70, 50 85" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="50" cy="40" r="6" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.7"/>
        <path d="M 35 55 Q 30 50, 35 45" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <path d="M 65 55 Q 70 50, 65 45" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <path d="M 40 70 Q 35 65, 30 70" fill="none" stroke="${s}" stroke-width="1" opacity="0.3"/>
        <path d="M 60 70 Q 65 65, 70 70" fill="none" stroke="${s}" stroke-width="1" opacity="0.3"/>
      `;

    // The Emperor - Solid throne structure
    case 'throne-structure':
      return `
        <rect x="30" y="50" width="40" height="35" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <rect x="35" y="35" width="30" height="18" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <path d="M 35 35 L 50 22 L 65 35" fill="none" stroke="${s}" stroke-width="2" opacity="0.7"/>
        <circle cx="50" cy="28" r="3" fill="${s}" opacity="0.5"/>
        <line x1="40" y1="60" x2="40" y2="75" stroke="${p}" stroke-width="1" opacity="0.3"/>
        <line x1="60" y1="60" x2="60" y2="75" stroke="${p}" stroke-width="1" opacity="0.3"/>
      `;

    // The Hierophant - Sacred crossed keys
    case 'sacred-keys':
      return `
        <circle cx="50" cy="35" r="10" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <circle cx="50" cy="35" r="5" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <path d="M 35 55 L 50 70 L 65 55" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <line x1="50" y1="45" x2="50" y2="85" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <line x1="42" y1="65" x2="58" y2="65" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <line x1="45" y1="75" x2="55" y2="75" stroke="${s}" stroke-width="1" opacity="0.4"/>
      `;

    // The Lovers - Two becoming one
    case 'union-hearts':
      return `
        <circle cx="38" cy="45" r="12" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <circle cx="62" cy="45" r="12" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 50 45 L 50 80" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <path d="M 38 57 Q 50 75, 62 57" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="50" cy="38" r="4" fill="${s}" opacity="0.4"/>
      `;

    // The Chariot - Wheels in motion
    case 'chariot-wheels':
      return `
        <circle cx="30" cy="70" r="12" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="70" cy="70" r="12" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
        <line x1="30" y1="58" x2="30" y2="82" stroke="${p}" stroke-width="1" opacity="0.3"/>
        <line x1="18" y1="70" x2="42" y2="70" stroke="${p}" stroke-width="1" opacity="0.3"/>
        <line x1="70" y1="58" x2="70" y2="82" stroke="${s}" stroke-width="1" opacity="0.3"/>
        <line x1="58" y1="70" x2="82" y2="70" stroke="${s}" stroke-width="1" opacity="0.3"/>
        <path d="M 30 55 L 50 35 L 70 55" fill="none" stroke="${p}" stroke-width="2" opacity="0.7"/>
        <circle cx="50" cy="35" r="5" fill="${s}" opacity="0.5"/>
      `;

    // Strength - Gentle infinity, soft power
    case 'gentle-infinity':
      return `
        <path d="M 30 50 C 30 38, 45 38, 50 50 S 70 62, 70 50 S 55 38, 50 50 S 30 62, 30 50" fill="none" stroke="${p}" stroke-width="2.5" opacity="0.7" stroke-linecap="round"/>
        <path d="M 35 65 Q 50 80, 65 65" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.5"/>
        <circle cx="50" cy="50" r="3" fill="${s}" opacity="0.6"/>
      `;

    // The Hermit - Lantern illuminating the path
    case 'lantern-path':
      return `
        <path d="M 45 30 L 55 30 L 55 45 L 45 45 Z" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="50" cy="37" r="4" fill="${s}" opacity="0.7"/>
        <line x1="50" y1="45" x2="50" y2="55" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 50 55 L 30 90" stroke="${p}" stroke-width="1" opacity="0.3" stroke-dasharray="3 3"/>
        <path d="M 50 55 L 70 90" stroke="${p}" stroke-width="1" opacity="0.3" stroke-dasharray="3 3"/>
        <circle cx="35" cy="75" r="2" fill="${s}" opacity="0.3"/>
        <circle cx="65" cy="80" r="2" fill="${s}" opacity="0.3"/>
      `;

    // Wheel of Fortune - Rotating wheel of fate
    case 'wheel-cycle':
      return `
        <circle cx="50" cy="55" r="25" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="50" cy="55" r="18" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <circle cx="50" cy="55" r="8" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.7"/>
        <line x1="50" y1="30" x2="50" y2="80" stroke="${p}" stroke-width="1" opacity="0.3"/>
        <line x1="25" y1="55" x2="75" y2="55" stroke="${p}" stroke-width="1" opacity="0.3"/>
        <line x1="32" y1="37" x2="68" y2="73" stroke="${s}" stroke-width="1" opacity="0.3"/>
        <line x1="68" y1="37" x2="32" y2="73" stroke="${s}" stroke-width="1" opacity="0.3"/>
      `;

    // Justice - Balanced scales
    case 'balanced-scales':
      return `
        <line x1="50" y1="25" x2="50" y2="50" stroke="${p}" stroke-width="2" opacity="0.7"/>
        <line x1="25" y1="45" x2="75" y2="45" stroke="${p}" stroke-width="2" opacity="0.7"/>
        <path d="M 25 45 L 20 65 L 30 65 Z" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
        <path d="M 75 45 L 70 65 L 80 65 Z" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="50" cy="25" r="4" fill="${s}" opacity="0.5"/>
        <line x1="45" y1="75" x2="55" y2="75" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <line x1="50" y1="50" x2="50" y2="75" stroke="${p}" stroke-width="1.5" opacity="0.4"/>
      `;

    // The Hanged Man - Suspended, inverted perspective
    case 'suspended-figure':
      return `
        <line x1="35" y1="30" x2="65" y2="30" stroke="${p}" stroke-width="2" opacity="0.6"/>
        <line x1="50" y1="30" x2="50" y2="50" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <circle cx="50" cy="60" r="8" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.7"/>
        <line x1="50" y1="68" x2="50" y2="85" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 42 78 L 50 85 L 58 78" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
      `;

    // Death - Transformation gate/threshold
    case 'transformation-gate':
      return `
        <rect x="30" y="30" width="40" height="55" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 30 30 L 50 20 L 70 30" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <line x1="50" y1="30" x2="50" y2="85" stroke="${s}" stroke-width="1" opacity="0.3" stroke-dasharray="4 4"/>
        <circle cx="50" cy="55" r="10" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.5"/>
        <circle cx="50" cy="55" r="3" fill="${p}" opacity="0.6"/>
      `;

    // Temperance - Water flowing between vessels
    case 'flowing-vessels':
      return `
        <path d="M 25 40 L 30 60 L 40 60 L 35 40 Z" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <path d="M 60 60 L 65 80 L 75 80 L 70 60 Z" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
        <path d="M 37 50 Q 50 45, 63 70" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.7" stroke-dasharray="3 2"/>
        <circle cx="50" cy="55" r="4" fill="${s}" opacity="0.4"/>
      `;

    // The Devil - Chains of bondage
    case 'chains-below':
      return `
        <path d="M 40 35 L 50 25 L 60 35 L 50 45 Z" fill="none" stroke="${p}" stroke-width="2" opacity="0.7"/>
        <line x1="35" y1="55" x2="35" y2="85" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <line x1="65" y1="55" x2="65" y2="85" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <ellipse cx="35" cy="60" rx="5" ry="3" fill="none" stroke="${p}" stroke-width="1" opacity="0.5"/>
        <ellipse cx="35" cy="70" rx="5" ry="3" fill="none" stroke="${p}" stroke-width="1" opacity="0.5"/>
        <ellipse cx="65" cy="60" rx="5" ry="3" fill="none" stroke="${p}" stroke-width="1" opacity="0.5"/>
        <ellipse cx="65" cy="70" rx="5" ry="3" fill="none" stroke="${p}" stroke-width="1" opacity="0.5"/>
        <line x1="35" y1="55" x2="50" y2="45" stroke="${s}" stroke-width="1" opacity="0.3"/>
        <line x1="65" y1="55" x2="50" y2="45" stroke="${s}" stroke-width="1" opacity="0.3"/>
      `;

    // The Tower - Lightning striking
    case 'lightning-tower':
      return `
        <rect x="38" y="45" width="24" height="45" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 38 45 L 50 30 L 62 45" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <path d="M 50 10 L 45 25 L 52 25 L 48 40 L 55 25 L 48 25 L 53 10" fill="none" stroke="${s}" stroke-width="2" opacity="0.8"/>
        <circle cx="32" cy="60" r="2" fill="${s}" opacity="0.4"/>
        <circle cx="68" cy="70" r="2" fill="${s}" opacity="0.4"/>
        <circle cx="28" cy="80" r="2" fill="${p}" opacity="0.3"/>
      `;

    // The Star - Hope pouring forth
    case 'pouring-stars':
      return `
        <polygon points="50,25 53,35 63,35 55,42 58,52 50,46 42,52 45,42 37,35 47,35" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.8"/>
        <circle cx="30" cy="35" r="3" fill="${p}" opacity="0.4"/>
        <circle cx="70" cy="35" r="3" fill="${p}" opacity="0.4"/>
        <circle cx="25" cy="50" r="2" fill="${s}" opacity="0.3"/>
        <circle cx="75" cy="50" r="2" fill="${s}" opacity="0.3"/>
        <path d="M 40 60 Q 35 75, 30 90" fill="none" stroke="${p}" stroke-width="1" opacity="0.5"/>
        <path d="M 60 60 Q 65 75, 70 90" fill="none" stroke="${p}" stroke-width="1" opacity="0.5"/>
      `;

    // The Moon - Path between twin towers
    case 'twin-towers-moon':
      return `
        <rect x="18" y="55" width="12" height="30" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <rect x="70" y="55" width="12" height="30" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <circle cx="50" cy="35" r="12" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="55" cy="32" r="9" fill="${COLORS.bg}" opacity="1"/>
        <path d="M 30 85 Q 40 75, 50 85 Q 60 95, 70 85" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
      `;

    // The Sun - Radiant joy
    case 'radiant-sun':
      return `
        <circle cx="50" cy="50" r="15" fill="none" stroke="${s}" stroke-width="2" opacity="0.7"/>
        <circle cx="50" cy="50" r="8" fill="${p}" opacity="0.3"/>
        ${[0, 45, 90, 135, 180, 225, 270, 315]
          .map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 50 + 18 * Math.cos(rad);
            const y1 = 50 + 18 * Math.sin(rad);
            const x2 = 50 + 28 * Math.cos(rad);
            const y2 = 50 + 28 * Math.sin(rad);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p}" stroke-width="1.5" opacity="0.6"/>`;
          })
          .join('')}
      `;

    // Judgement - Rising figures
    case 'rising-figures':
      return `
        <path d="M 30 85 L 30 65 M 25 70 L 35 70" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <path d="M 50 85 L 50 60 M 45 65 L 55 65" stroke="${s}" stroke-width="1.5" opacity="0.5"/>
        <path d="M 70 85 L 70 65 M 65 70 L 75 70" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <circle cx="30" cy="60" r="4" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <circle cx="50" cy="52" r="5" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="70" cy="60" r="4" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <path d="M 35 30 L 50 20 L 65 30" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.5"/>
        <line x1="50" y1="20" x2="50" y2="40" stroke="${s}" stroke-width="1" opacity="0.4"/>
      `;

    // The World - Complete wreath
    case 'world-wreath':
      return `
        <ellipse cx="50" cy="55" rx="25" ry="30" fill="none" stroke="${p}" stroke-width="2" opacity="0.6"/>
        <ellipse cx="50" cy="55" rx="18" ry="22" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <circle cx="50" cy="55" r="6" fill="${s}" opacity="0.4"/>
        <circle cx="25" cy="35" r="4" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <circle cx="75" cy="35" r="4" fill="none" stroke="${p}" stroke-width="1" opacity="0.4"/>
        <circle cx="25" cy="75" r="4" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
        <circle cx="75" cy="75" r="4" fill="none" stroke="${s}" stroke-width="1" opacity="0.4"/>
      `;

    default:
      return '';
  }
}

/**
 * Generate subtle background pattern SVG
 */
function generatePattern(
  type: TarotVisual['pattern'],
  seed: string,
  colors: { primary: string; secondary: string },
): string {
  const random = seededRandom(seed + '-pattern');

  switch (type) {
    case 'radiating-lines': {
      const lines = [];
      const lineCount = 8;
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * 360;
        const length = 40 + random() * 5;
        const x2 = 50 + length * Math.cos((angle * Math.PI) / 180);
        const y2 = 55 + length * Math.sin((angle * Math.PI) / 180);
        lines.push(
          `<line x1="50" y1="55" x2="${x2}" y2="${y2}" stroke="${colors.primary}" stroke-width="0.2" opacity="0.1"/>`,
        );
      }
      return lines.join('');
    }

    case 'ascending-dots': {
      const dots = [];
      for (let i = 0; i < 8; i++) {
        const x = 30 + random() * 40;
        const y = 90 - i * 8 + random() * 3;
        const size = 0.4 + random() * 0.6;
        dots.push(
          `<circle cx="${x}" cy="${y}" r="${size}" fill="${colors.secondary}" opacity="${0.1 + random() * 0.15}"/>`,
        );
      }
      return dots.join('');
    }

    case 'flowing-waves': {
      const waves = [];
      for (let i = 0; i < 2; i++) {
        const y = 90 + i * 8;
        waves.push(
          `<path d="M 10 ${y} Q 30 ${y - 3}, 50 ${y} T 90 ${y}" fill="none" stroke="${colors.primary}" stroke-width="0.3" opacity="0.08"/>`,
        );
      }
      return waves.join('');
    }

    case 'geometric-grid': {
      const grid = [];
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 2; y++) {
          if (random() > 0.5) {
            grid.push(
              `<rect x="${25 + x * 18}" y="${85 + y * 10}" width="12" height="6" fill="none" stroke="${colors.primary}" stroke-width="0.2" opacity="0.08" rx="1"/>`,
            );
          }
        }
      }
      return grid.join('');
    }

    case 'spiral': {
      let path = 'M 50 55';
      let angle = 0;
      let radius = 2;
      for (let i = 0; i < 30; i++) {
        angle += 0.4;
        radius += 0.8;
        const x = 50 + radius * Math.cos(angle);
        const y = 55 + radius * Math.sin(angle);
        path += ` L ${x} ${y}`;
      }
      return `<path d="${path}" fill="none" stroke="${colors.primary}" stroke-width="0.2" opacity="0.1"/>`;
    }

    case 'concentric-circles':
    case 'none':
    default:
      return '';
  }
}

interface TarotCardSVGProps {
  cardKey: string;
  name: string;
  number: number;
  element: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Renders a tarot card as an SVG with meaningful artwork
 */
export function TarotCardSVG({
  cardKey,
  name,
  number,
  element,
  width = 240,
  height = 400,
  className,
}: TarotCardSVGProps) {
  const visual = TAROT_VISUALS[cardKey] || TAROT_VISUALS.default;
  const elementColors = ELEMENT_COLORS[element] || ELEMENT_COLORS.Air;

  const cardColors = visual.colors
    ? { primary: visual.colors[0], secondary: visual.colors[1] }
    : elementColors;

  const stars = generateStars(cardKey, 40);
  const pattern = generatePattern(visual.pattern, cardKey, cardColors);
  const cardArt = generateCardArt(visual.cardArt, cardColors);

  // Astronomicon characters
  const planetChar =
    planetSymbols[visual.rulingPlanet as keyof typeof planetSymbols] || 'Q';
  const zodiacChar = visual.zodiacSign
    ? zodiacSymbol[visual.zodiacSign as keyof typeof zodiacSymbol]
    : null;

  const romanNumerals = [
    '0',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
    'XIII',
    'XIV',
    'XV',
    'XVI',
    'XVII',
    'XVIII',
    'XIX',
    'XX',
    'XXI',
  ];
  const numeral = romanNumerals[number] || number.toString();

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 100 166'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <defs>
        <linearGradient
          id={`bg-${cardKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor={COLORS.bgDeep} />
          <stop offset='50%' stopColor={COLORS.bg} />
          <stop offset='100%' stopColor={COLORS.bgDeep} />
        </linearGradient>
        <linearGradient
          id={`border-${cardKey}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor={cardColors.primary} stopOpacity='0.6' />
          <stop
            offset='50%'
            stopColor={cardColors.secondary}
            stopOpacity='0.3'
          />
          <stop
            offset='100%'
            stopColor={cardColors.primary}
            stopOpacity='0.6'
          />
        </linearGradient>
        <clipPath id={`clip-${cardKey}`}>
          <rect x='2' y='2' width='96' height='162' rx='6' ry='6' />
        </clipPath>
      </defs>

      {/* Background */}
      <rect
        x='2'
        y='2'
        width='96'
        height='162'
        rx='6'
        ry='6'
        fill={`url(#bg-${cardKey})`}
      />

      {/* Star field */}
      <g clipPath={`url(#clip-${cardKey})`}>
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill={COLORS.text}
            opacity={star.opacity}
          />
        ))}
      </g>

      {/* Background pattern */}
      <g
        clipPath={`url(#clip-${cardKey})`}
        dangerouslySetInnerHTML={{ __html: pattern }}
      />

      {/* Card-specific artwork */}
      <g
        clipPath={`url(#clip-${cardKey})`}
        dangerouslySetInnerHTML={{ __html: cardArt }}
      />

      {/* Border */}
      <rect
        x='2'
        y='2'
        width='96'
        height='162'
        rx='6'
        ry='6'
        fill='none'
        stroke={`url(#border-${cardKey})`}
        strokeWidth='1.5'
      />
      <rect
        x='6'
        y='6'
        width='88'
        height='154'
        rx='4'
        ry='4'
        fill='none'
        stroke={cardColors.primary}
        strokeWidth='0.5'
        opacity='0.3'
      />

      {/* Corner decorations */}
      <g opacity='0.4'>
        <path
          d='M 10 20 L 10 12 L 18 12'
          fill='none'
          stroke={cardColors.primary}
          strokeWidth='1'
        />
        <path
          d='M 90 20 L 90 12 L 82 12'
          fill='none'
          stroke={cardColors.primary}
          strokeWidth='1'
        />
        <path
          d='M 10 146 L 10 154 L 18 154'
          fill='none'
          stroke={cardColors.primary}
          strokeWidth='1'
        />
        <path
          d='M 90 146 L 90 154 L 82 154'
          fill='none'
          stroke={cardColors.primary}
          strokeWidth='1'
        />
      </g>

      {/* Roman numeral at top */}
      <text
        x='50'
        y='22'
        textAnchor='middle'
        fill={cardColors.primary}
        fontSize='8'
        fontFamily='serif'
        opacity='0.8'
      >
        {numeral}
      </text>

      {/* Planet symbol - top left corner */}
      <text
        x='15'
        y='25'
        textAnchor='middle'
        fill={cardColors.secondary}
        fontSize='10'
        fontFamily='var(--font-astro), Astronomicon, serif'
        opacity='0.6'
      >
        {planetChar}
      </text>

      {/* Zodiac symbol - top right corner (if present) */}
      {zodiacChar && (
        <text
          x='85'
          y='25'
          textAnchor='middle'
          fill={cardColors.secondary}
          fontSize='10'
          fontFamily='var(--font-astro), Astronomicon, serif'
          opacity='0.6'
        >
          {zodiacChar}
        </text>
      )}

      {/* Card name at bottom */}
      <text
        x='50'
        y='145'
        textAnchor='middle'
        fill={COLORS.text}
        fontSize='5.5'
        fontFamily='serif'
        fontWeight='500'
        letterSpacing='0.08em'
      >
        {name.toUpperCase()}
      </text>

      {/* Element line */}
      <line
        x1='30'
        y1='152'
        x2='70'
        y2='152'
        stroke={cardColors.primary}
        strokeWidth='1'
        opacity='0.5'
      />
    </svg>
  );
}

export { generateCardArt, generatePattern, generateStars };
