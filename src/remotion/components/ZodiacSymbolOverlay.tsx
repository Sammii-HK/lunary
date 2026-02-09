import React from 'react';
import { useCurrentFrame, interpolate, Easing, staticFile } from 'remotion';

interface SymbolOverlayProps {
  /** Content to extract symbol from (e.g., "Sagittarius", "Saturn", "Life Path 3", "The Fool") */
  content: string;
  /** Opacity (0-1) */
  opacity?: number;
  fps?: number;
}

// Astronomicon font letter mappings for zodiac
const ZODIAC_LETTERS: Record<string, string> = {
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

// Astronomicon font letter mappings for planets
const PLANET_LETTERS: Record<string, string> = {
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
};

// Tarot suits (using Unicode alchemical symbols)
const TAROT_SYMBOLS: Record<string, string> = {
  wands: '🜂',
  cups: '🜄',
  swords: '🜁',
  pentacles: '🜃',
};

// Moon phases (using custom SVG icons from /public/icons/moon-phases/)
const MOON_PHASE_ICONS: Record<string, string> = {
  'new moon': '/icons/moon-phases/new-moon.svg',
  'waxing crescent': '/icons/moon-phases/waxing-cresent-moon.svg', // Note: filename has typo "cresent"
  'first quarter': '/icons/moon-phases/first-quarter.svg',
  'waxing gibbous': '/icons/moon-phases/waxing-gibbous-moon.svg',
  'full moon': '/icons/moon-phases/full-moon.svg',
  'waning gibbous': '/icons/moon-phases/waning-gibbous-moon.svg',
  'last quarter': '/icons/moon-phases/last-quarter.svg',
  'waning crescent': '/icons/moon-phases/waning-cresent-moon.svg', // Note: filename has typo "cresent"
};

interface SymbolResult {
  letters: string[];
  type: 'astronomicon' | 'unicode' | 'number' | 'moon-icon';
}

// Context phrases that indicate the video topic — checked first (highest priority)
// [phrase, letters[], type]
const TOPIC_CONTEXT_PHRASES: [string, string[], SymbolResult['type']][] = [
  // Moon phase topics (highest priority for Lunary brand) - using icon paths
  ['full moon in', ['/icons/moon-phases/full-moon.svg'], 'moon-icon'],
  ['new moon in', ['/icons/moon-phases/new-moon.svg'], 'moon-icon'],
  ['full moon', ['/icons/moon-phases/full-moon.svg'], 'moon-icon'],
  ['new moon', ['/icons/moon-phases/new-moon.svg'], 'moon-icon'],
  [
    'waxing crescent',
    ['/icons/moon-phases/waxing-cresent-moon.svg'],
    'moon-icon',
  ],
  ['first quarter', ['/icons/moon-phases/first-quarter.svg'], 'moon-icon'],
  [
    'waxing gibbous',
    ['/icons/moon-phases/waxing-gibbous-moon.svg'],
    'moon-icon',
  ],
  [
    'waning gibbous',
    ['/icons/moon-phases/waning-gibbous-moon.svg'],
    'moon-icon',
  ],
  ['last quarter', ['/icons/moon-phases/last-quarter.svg'], 'moon-icon'],
  [
    'waning crescent',
    ['/icons/moon-phases/waning-cresent-moon.svg'],
    'moon-icon',
  ],
  // Ranking/List content (show zodiac wheel or list icon)
  ['ranking signs', ['A', 'E', 'I'], 'astronomicon'], // Aries, Leo, Sagittarius (fire signs in triangle)
  ['ranking the signs', ['A', 'E', 'I'], 'astronomicon'],
  ['rank the signs', ['A', 'E', 'I'], 'astronomicon'],
  ['tier list', ['A', 'E', 'I'], 'astronomicon'],
  // Comparisons (show both symbols when comparing)
  ['sun signs vs rising', ['Q', 'a'], 'astronomicon'],
  ['sun sign vs rising', ['Q', 'a'], 'astronomicon'],
  ['rising signs vs sun', ['a', 'Q'], 'astronomicon'],
  ['rising sign vs sun', ['a', 'Q'], 'astronomicon'],
  // Single concepts
  ['sun sign', ['Q'], 'astronomicon'], // Just sun when mentioned alone
  ['sun signs', ['Q'], 'astronomicon'],
  ['rising sign', ['a'], 'astronomicon'], // Ascendant symbol
  ['rising signs', ['a'], 'astronomicon'],
  ['ascendant', ['a'], 'astronomicon'],
  // Modalities
  ['cardinal sign', ['🜍'], 'unicode'],
  ['cardinal signs', ['🜍'], 'unicode'],
  ['cardinal energy', ['🜍'], 'unicode'],
  ['fixed sign', ['🜔'], 'unicode'],
  ['fixed signs', ['🜔'], 'unicode'],
  ['fixed energy', ['🜔'], 'unicode'],
  ['mutable sign', ['🜕'], 'unicode'],
  ['mutable signs', ['🜕'], 'unicode'],
  ['mutable energy', ['🜕'], 'unicode'],
  // Elements
  ['fire sign', ['🜂'], 'unicode'],
  ['fire signs', ['🜂'], 'unicode'],
  ['fire element', ['🜂'], 'unicode'],
  ['earth sign', ['🜃'], 'unicode'],
  ['earth signs', ['🜃'], 'unicode'],
  ['earth element', ['🜃'], 'unicode'],
  ['air sign', ['🜁'], 'unicode'],
  ['air signs', ['🜁'], 'unicode'],
  ['air element', ['🜁'], 'unicode'],
  ['water sign', ['🜄'], 'unicode'],
  ['water signs', ['🜄'], 'unicode'],
  ['water element', ['🜄'], 'unicode'],
  // Planetary topics
  ['solar return', ['Q'], 'astronomicon'],
  ['moon sign', ['R'], 'astronomicon'],
  ['moon signs', ['R'], 'astronomicon'],
  ['lunar', ['R'], 'astronomicon'],
  ['mercury retrograde', ['S'], 'astronomicon'],
  ['mercury return', ['S'], 'astronomicon'],
  ['venus retrograde', ['T'], 'astronomicon'],
  ['venus return', ['T'], 'astronomicon'],
  ['mars retrograde', ['U'], 'astronomicon'],
  ['mars return', ['U'], 'astronomicon'],
  ['jupiter transit', ['V'], 'astronomicon'],
  ['jupiter return', ['V'], 'astronomicon'],
  ['saturn return', ['W'], 'astronomicon'],
  ['saturn transit', ['W'], 'astronomicon'],
];

/**
 * Detect and extract symbols from content string.
 * Priority:
 * 1. Topic phrases (modalities, elements, planetary) — the subject of the video
 * 2. Ranking videos — extract top 3-4 ranked signs for visual anchor
 * 3. Single zodiac sign — show that sign
 * 4. Multiple zodiac signs (2-3) — show all
 * 5. Individual planet mentions
 * 6. Numerology / tarot
 */
function extractSymbols(content: string): SymbolResult | null {
  const lower = content.toLowerCase();

  // Priority 1: Check for topic context phrases first (these indicate the real subject)
  for (const [phrase, letters, type] of TOPIC_CONTEXT_PHRASES) {
    if (lower.includes(phrase)) {
      return { letters, type };
    }
  }

  // Priority 2: For ranking videos, extract the top-tier signs (S tier, A tier, etc.)
  if (lower.includes('tier') || lower.includes('ranking')) {
    const tierMatches: string[] = [];

    // Extract S tier and A tier signs (the best performers in the ranking)
    const sTierMatch = content.match(/S tier[:\s]+([^.]+)/i);
    const aTierMatch = content.match(/A tier[:\s]+([^.]+)/i);

    const topTierText =
      `${sTierMatch?.[1] || ''} ${aTierMatch?.[1] || ''}`.toLowerCase();

    for (const [sign, letter] of Object.entries(ZODIAC_LETTERS)) {
      if (topTierText.includes(sign)) {
        tierMatches.push(letter);
        if (tierMatches.length >= 4) break; // Max 4 symbols for rankings
      }
    }

    if (tierMatches.length > 0) {
      return { letters: tierMatches, type: 'astronomicon' };
    }
  }

  // Priority 3: Check individual planets FIRST (before zodiac signs)
  const matchedPlanets: string[] = [];
  for (const [planet, letter] of Object.entries(PLANET_LETTERS)) {
    if (lower.includes(planet)) {
      matchedPlanets.push(letter);
    }
  }

  // Use planets if any are found
  if (matchedPlanets.length > 0) {
    return { letters: matchedPlanets, type: 'astronomicon' };
  }

  // Priority 4: Check zodiac signs (only if no planets matched)
  const matchedSigns: string[] = [];
  for (const [sign, letter] of Object.entries(ZODIAC_LETTERS)) {
    if (lower.includes(sign)) {
      matchedSigns.push(letter);
    }
  }

  // Only use zodiac signs if there are 1-3 (indicates they're the focus)
  // More than 3 suggests they're just examples or a full list
  if (matchedSigns.length > 0 && matchedSigns.length <= 3) {
    return { letters: matchedSigns, type: 'astronomicon' };
  }

  // Priority 5: Check numerology (Life Path, Angel Number, etc.)
  const numerologyMatch = content.match(
    /(?:Life Path|Angel Number|Master Number)\s+(\d+)/i,
  );
  if (numerologyMatch) {
    return { letters: [numerologyMatch[1]], type: 'number' };
  }

  // Priority 6: Check moon phases (using custom icons)
  for (const [phase, iconPath] of Object.entries(MOON_PHASE_ICONS)) {
    if (lower.includes(phase)) {
      return { letters: [iconPath], type: 'moon-icon' };
    }
  }

  // Priority 7: Check tarot suits
  for (const [suit, symbol] of Object.entries(TAROT_SYMBOLS)) {
    if (lower.includes(suit)) {
      return { letters: [symbol], type: 'unicode' };
    }
  }

  return null;
}

/**
 * Animated Symbol Overlay
 *
 * Detects zodiac, planets, numerology, or tarot from content and displays
 * symbol(s) as a large, semi-transparent overlay:
 * - Single symbol: centered, 600px
 * - 2-3 symbols: row layout, scaled down
 * - 4+ symbols: 2-column grid, scaled down further
 * - Pulses gently and cycles through aurora colors
 */
export const SymbolOverlay: React.FC<SymbolOverlayProps> = ({
  content,
  opacity = 0.25,
  fps = 30,
}) => {
  const frame = useCurrentFrame();
  const symbolData = React.useMemo(() => extractSymbols(content), [content]);

  if (!symbolData) return null;

  const count = symbolData.letters.length;

  // Smooth fade in/out (30 frames = 1 second)
  const fadeInDuration = 30;
  const fadeIn = interpolate(frame, [0, fadeInDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.ease),
  });

  const finalOpacity = opacity * fadeIn;

  // Gentle pulse (12 second cycle)
  const pulsePeriod = 12 * fps;
  const pulseProgress = (frame % pulsePeriod) / pulsePeriod;
  const scale = interpolate(pulseProgress, [0, 0.5, 1], [0.98, 1.02, 0.98], {
    easing: Easing.inOut(Easing.sin),
  });

  // Color cycling (30 seconds per full cycle - very slow and smooth)
  const colorPeriod = 30 * fps;
  const colorProgress = (frame % colorPeriod) / colorPeriod;

  // Aurora palette colors
  const auroraColors = [
    '#3DED97', // vivid green
    '#00E5CC', // teal/cyan
    '#4DA6FF', // electric blue
    '#8458D8', // deep violet
    '#C77DFF', // soft purple
    '#EE789E', // pink/rose
  ];

  // Smooth RGB interpolation between colors
  const totalColors = auroraColors.length;
  const colorPosition = colorProgress * totalColors;
  const colorIndex = Math.floor(colorPosition) % totalColors;
  const nextColorIndex = (colorIndex + 1) % totalColors;
  const blend = colorPosition - Math.floor(colorPosition);

  const easedBlend = interpolate(blend, [0, 1], [0, 1], {
    easing: Easing.inOut(Easing.sin),
  });

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const currentRgb = hexToRgb(auroraColors[colorIndex]);
  const nextRgb = hexToRgb(auroraColors[nextColorIndex]);

  const r = Math.round(currentRgb.r + (nextRgb.r - currentRgb.r) * easedBlend);
  const g = Math.round(currentRgb.g + (nextRgb.g - currentRgb.g) * easedBlend);
  const b = Math.round(currentRgb.b + (nextRgb.b - currentRgb.b) * easedBlend);

  const currentColor = `rgb(${r}, ${g}, ${b})`;

  // Font setup based on symbol type
  const fontUrl = staticFile('/fonts/Astronomicon.ttf');
  const fontFamily =
    symbolData.type === 'astronomicon'
      ? 'Astronomicon, serif'
      : symbolData.type === 'number'
        ? 'Roboto Mono, monospace'
        : 'system-ui, sans-serif';

  // Scale font size based on count (for text-based symbols)
  const baseFontSize = symbolData.type === 'number' ? 400 : 600;
  const fontSize =
    count === 1
      ? baseFontSize
      : count <= 3
        ? Math.round(baseFontSize * 0.5) // 300px for 2-3 symbols
        : Math.round(baseFontSize * 0.35); // 210px for 4+ symbols

  // Icon size for moon phase icons
  const baseIconSize = 400;
  const iconSize =
    count === 1
      ? baseIconSize
      : count <= 3
        ? Math.round(baseIconSize * 0.6) // 240px for 2-3 icons
        : Math.round(baseIconSize * 0.4); // 160px for 4+ icons

  // Layout: row for 2-3, grid for 4+
  const useGrid = count > 3;
  const gap = count === 1 ? 0 : count <= 3 ? 20 : 10;

  return (
    <>
      {symbolData.type === 'astronomicon' && (
        <style>{`
          @font-face {
            font-family: 'Astronomicon';
            src: url('${fontUrl}') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `}</style>
      )}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          display: 'flex',
          flexDirection: useGrid ? 'row' : 'row',
          flexWrap: useGrid ? 'wrap' : 'nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${gap}px`,
          width: useGrid ? `${fontSize * 2.5}px` : undefined,
          zIndex: 3,
          pointerEvents: 'none',
          opacity: finalOpacity,
        }}
      >
        {symbolData.letters.map((letter, i) =>
          symbolData.type === 'moon-icon' ? (
            <img
              key={i}
              src={staticFile(letter)}
              alt='Moon phase'
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                filter: `blur(1px) drop-shadow(0 0 80px ${currentColor}) drop-shadow(0 0 160px ${currentColor})`,
                opacity: 0.9,
              }}
            />
          ) : (
            <div
              key={i}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily,
                fontWeight: symbolData.type === 'number' ? 300 : 400,
                color: currentColor,
                textAlign: 'center',
                lineHeight: 1,
                filter: 'blur(1px)',
                textShadow: `0 0 80px ${currentColor}, 0 0 160px ${currentColor}`,
              }}
            >
              {letter}
            </div>
          ),
        )}
      </div>
    </>
  );
};

// Keep original export name for backwards compatibility
export const ZodiacSymbolOverlay = SymbolOverlay;
