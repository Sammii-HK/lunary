import { generateStarfield } from '@/lib/share/og-utils';
import type { ThemeCategory } from '@/lib/social/types';
import {
  IG_SIZES,
  IG_SPACING,
  IG_STORY_SAFE,
  IG_TEXT,
  CATEGORY_ACCENT,
  CATEGORY_GRADIENT,
  type IGFormat,
} from './design-system';

// --- Font Loading (module-level cache) ---

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;
let astronomiconPromise: Promise<ArrayBuffer> | null = null;
let notoSansRunicPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    robotoMonoPromise = fetch(
      new URL('/fonts/RobotoMono-Regular.ttf', request.url),
      { cache: 'force-cache' },
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Roboto Mono font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

const loadAstronomicon = async (request: Request) => {
  if (!astronomiconPromise) {
    astronomiconPromise = fetch(
      new URL('/fonts/Astronomicon.ttf', request.url),
      { cache: 'force-cache' },
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Astronomicon font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    });
  }
  return astronomiconPromise;
};

const loadNotoSansRunic = async (request: Request) => {
  if (!notoSansRunicPromise) {
    notoSansRunicPromise = fetch(
      new URL('/fonts/NotoSansRunic-Regular.ttf', request.url),
      { cache: 'force-cache' },
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Noto Sans Runic font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    });
  }
  return notoSansRunicPromise;
};

export async function loadIGFonts(
  request: Request,
  options?: { includeAstronomicon?: boolean; includeRunic?: boolean },
) {
  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    style: 'normal';
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  }> = [
    {
      name: 'Roboto Mono',
      data: await loadRobotoMono(request),
      style: 'normal',
      weight: 400,
    },
  ];

  if (options?.includeAstronomicon) {
    fonts.push({
      name: 'Astronomicon',
      data: await loadAstronomicon(request),
      style: 'normal',
      weight: 400,
    });
  }

  if (options?.includeRunic) {
    fonts.push({
      name: 'Noto Sans Runic',
      data: await loadNotoSansRunic(request),
      style: 'normal',
      weight: 400,
    });
  }

  return fonts;
}

// --- Format Helpers ---

export function getIGDimensions(format: IGFormat = 'square') {
  return IG_SIZES[format];
}

// --- Starfield Rendering ---

export function renderIGStarfield(seed: string, count = 90) {
  const stars = generateStarfield(seed, count);
  return stars.map((star, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        borderRadius: '50%',
        background: '#fff',
        opacity: Math.min(1, star.opacity * 2.2),
        ...(star.size > 2
          ? { boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.6)` }
          : {}),
      }}
    />
  ));
}

// --- Brand Tag (subtle watermark) ---

export function IGBrandTag({
  baseUrl,
  mode = 'dark',
  bottom = 32,
  isStory = false,
}: {
  baseUrl: string;
  mode?: 'dark' | 'light';
  bottom?: number;
  isStory?: boolean;
}) {
  const color = mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  const resolvedBottom = isStory ? 80 : bottom;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
        position: 'absolute',
        bottom: resolvedBottom,
        left: 0,
        right: 0,
      }}
    >
      <img
        src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
        width={20}
        height={20}
        style={{ opacity: 0.5 }}
        alt=''
      />
      <span
        style={{
          fontSize: IG_TEXT.dark.footer,
          color,
          letterSpacing: '0.1em',
          display: 'flex',
        }}
      >
        lunary.app
      </span>
    </div>
  );
}

// --- Category Badge ---

export function IGCategoryBadge({
  category,
  label,
  mode = 'dark',
}: {
  category: ThemeCategory;
  label?: string;
  mode?: 'dark' | 'light';
}) {
  const accent = CATEGORY_ACCENT[category];
  const displayLabel =
    label || category.charAt(0).toUpperCase() + category.slice(1);
  const bgColor = mode === 'dark' ? `${accent}20` : `${accent}15`;
  const textColor = mode === 'dark' ? accent : accent;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 20px',
        borderRadius: 100,
        background: bgColor,
        border: `1px solid ${accent}40`,
      }}
    >
      <span
        style={{
          fontSize: IG_TEXT.dark.caption,
          color: textColor,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'flex',
        }}
      >
        {displayLabel}
      </span>
    </div>
  );
}

// --- Dark Cosmic Background ---

export function IGDarkBackground({
  category,
  seed,
  children,
  format = 'square',
}: {
  category: ThemeCategory;
  seed: string;
  children: React.ReactNode;
  format?: IGFormat;
}) {
  const { width, height } = IG_SIZES[format];
  const gradient = CATEGORY_GRADIENT[category];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: gradient,
        padding: `${IG_SPACING.padding}px`,
        position: 'relative',
        fontFamily: 'Roboto Mono',
      }}
    >
      {renderIGStarfield(seed)}
      {children}
    </div>
  );
}

// --- Progress Dots (for carousels) ---

export function IGProgressDots({
  current,
  total,
  accent,
}: {
  current: number;
  total: number;
  accent: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 10,
            height: 10,
            borderRadius: 5,
            background: i === current ? accent : 'rgba(255,255,255,0.2)',
          }}
        />
      ))}
    </div>
  );
}

// --- Text Truncation ---

export function truncateIG(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit - 1) + '\u2026' : text;
}

// --- Seeded Random (deterministic per date) ---

export function seededRandom(seed: string) {
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

export function seededPick<T>(items: T[], seed: string): T {
  const rng = seededRandom(seed);
  return items[Math.floor(rng() * items.length)];
}

// --- Meteor Streaks ---
//
// Static simulation of shooting stars at different "speeds":
//   fast  → long (250-380px), thin (2-3px), high opacity, near-white
//   medium → mid length (110-200px), semi-transparent
//   slow  → short (50-100px), faint, accent-coloured
//
// "Speed" is implied through length + opacity + width — the classic
// motion-blur shorthand photographers use for stars.

type MeteorClass = 'fast' | 'medium' | 'slow';

const METEOR_COLORS = {
  fast: ['#ffffff', '#e8e8ff', '#f0f0ff'],
  medium: ['#c8c8ff', '#b8b8e8', '#d0d0ff'],
  slow: null, // uses accent
};

export function renderMeteors(
  seed: string,
  accent: string,
): React.ReactElement[] {
  const rng = seededRandom(`meteors-${seed}`);

  // Mix of 6-8 meteors with weighted speed class distribution
  const speedPattern: MeteorClass[] = [
    'fast',
    'fast',
    'medium',
    'medium',
    'medium',
    'slow',
    'slow',
  ];
  // Shuffle so each image has a different mix
  const shuffled = [...speedPattern].sort(() => rng() - 0.5);
  const count = 5 + Math.floor(rng() * 3); // 5-7

  return shuffled.slice(0, count).map((cls, i) => {
    let length: number, thickness: number, opacity: number, color: string;

    if (cls === 'fast') {
      length = 250 + rng() * 130; // 250-380px
      thickness = 2 + rng() * 1.2; // 2-3.2px
      opacity = 0.72 + rng() * 0.22; // 0.72-0.94
      const palette = METEOR_COLORS.fast;
      color = palette[Math.floor(rng() * palette.length)];
    } else if (cls === 'medium') {
      length = 110 + rng() * 90; // 110-200px
      thickness = 1.4 + rng() * 0.6; // 1.4-2px
      opacity = 0.35 + rng() * 0.25; // 0.35-0.6
      const palette = METEOR_COLORS.medium;
      color = palette[Math.floor(rng() * palette.length)];
    } else {
      length = 50 + rng() * 55; // 50-105px
      thickness = 1 + rng() * 0.5; // 1-1.5px
      opacity = 0.14 + rng() * 0.14; // 0.14-0.28
      color = accent;
    }

    // Angle: mostly -30° to -45° (classic top-right→bottom-left)
    // with a few outliers for variety
    const angle = -(26 + rng() * 22);

    // Position: spread across canvas, bias toward upper half
    const top = rng() * 70; // 0-70%
    const left = 5 + rng() * 80; // 5-85%

    // Gradient: transparent tail (left) → bright head (right)
    // Sharp build-up at the tip simulates a luminous head
    const gradient = `linear-gradient(to right, transparent 0%, ${color}18 45%, ${color}70 80%, ${color} 95%, white 100%)`;

    return (
      <div
        key={`meteor-${i}`}
        style={{
          position: 'absolute',
          top: `${top}%`,
          left: `${left}%`,
          width: Math.round(length),
          height: Math.max(1, Math.round(thickness)),
          background: gradient,
          opacity,
          transform: `rotate(${angle}deg)`,
          borderRadius: thickness,
        }}
      />
    );
  });
}

// --- Constellation Overlay ---
// Normalized [x, y] coords (0–1) based on major stars of each constellation.
// Designed to span roughly 40–55% of the frame for a balanced overlay.

const CONSTELLATION_DATA: Record<
  string,
  { stars: [number, number][]; lines: [number, number][] }
> = {
  aries: {
    stars: [
      [0.34, 0.46],
      [0.44, 0.38],
      [0.56, 0.44],
      [0.66, 0.5],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  taurus: {
    stars: [
      [0.28, 0.56],
      [0.4, 0.46],
      [0.5, 0.5],
      [0.6, 0.4],
      [0.72, 0.38],
      [0.5, 0.62],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [2, 5],
    ],
  },
  gemini: {
    stars: [
      [0.36, 0.24],
      [0.52, 0.24],
      [0.34, 0.42],
      [0.5, 0.42],
      [0.32, 0.58],
      [0.48, 0.58],
      [0.28, 0.74],
      [0.44, 0.74],
    ],
    lines: [
      [0, 2],
      [2, 4],
      [4, 6],
      [1, 3],
      [3, 5],
      [5, 7],
      [2, 3],
    ],
  },
  cancer: {
    stars: [
      [0.42, 0.36],
      [0.54, 0.44],
      [0.36, 0.58],
      [0.62, 0.56],
      [0.5, 0.64],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4],
    ],
  },
  leo: {
    stars: [
      [0.5, 0.24],
      [0.38, 0.36],
      [0.3, 0.5],
      [0.38, 0.64],
      [0.54, 0.68],
      [0.66, 0.58],
      [0.64, 0.4],
      [0.54, 0.26],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
    ],
  },
  virgo: {
    stars: [
      [0.5, 0.24],
      [0.5, 0.4],
      [0.36, 0.5],
      [0.62, 0.5],
      [0.5, 0.6],
      [0.42, 0.72],
      [0.58, 0.72],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
      [1, 4],
      [4, 5],
      [4, 6],
    ],
  },
  libra: {
    stars: [
      [0.5, 0.38],
      [0.34, 0.54],
      [0.66, 0.54],
      [0.5, 0.54],
      [0.36, 0.7],
      [0.64, 0.7],
    ],
    lines: [
      [0, 3],
      [3, 1],
      [3, 2],
      [1, 4],
      [2, 5],
      [1, 2],
    ],
  },
  scorpio: {
    stars: [
      [0.3, 0.32],
      [0.38, 0.42],
      [0.44, 0.5],
      [0.5, 0.56],
      [0.56, 0.62],
      [0.62, 0.66],
      [0.68, 0.7],
      [0.72, 0.62],
      [0.74, 0.52],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
    ],
  },
  sagittarius: {
    stars: [
      [0.5, 0.28],
      [0.38, 0.42],
      [0.32, 0.58],
      [0.44, 0.68],
      [0.58, 0.62],
      [0.66, 0.48],
      [0.56, 0.38],
    ],
    lines: [
      [0, 6],
      [6, 5],
      [5, 4],
      [4, 3],
      [3, 2],
      [2, 1],
      [1, 0],
      [1, 6],
    ],
  },
  capricorn: {
    stars: [
      [0.28, 0.38],
      [0.42, 0.32],
      [0.56, 0.38],
      [0.66, 0.48],
      [0.66, 0.62],
      [0.52, 0.72],
      [0.38, 0.68],
      [0.3, 0.54],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 0],
    ],
  },
  aquarius: {
    stars: [
      [0.28, 0.42],
      [0.42, 0.38],
      [0.52, 0.48],
      [0.64, 0.42],
      [0.74, 0.38],
      [0.34, 0.58],
      [0.48, 0.62],
      [0.58, 0.55],
      [0.7, 0.6],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [5, 6],
      [6, 7],
      [7, 8],
      [1, 6],
    ],
  },
  pisces: {
    stars: [
      [0.28, 0.35],
      [0.38, 0.28],
      [0.48, 0.35],
      [0.48, 0.5],
      [0.38, 0.62],
      [0.28, 0.56],
      [0.58, 0.48],
      [0.68, 0.42],
      [0.76, 0.52],
      [0.66, 0.62],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [3, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 6],
    ],
  },
};

/**
 * Renders the constellation pattern for a zodiac sign as an SVG overlay.
 * Lines are faint; stars are slightly brighter dots. Both use the sign's accent colour.
 */
export function renderConstellation(
  sign: string,
  accent: string,
  width: number,
  height: number,
): React.ReactElement | null {
  const data = CONSTELLATION_DATA[sign.toLowerCase()];
  if (!data) return null;

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Connecting lines */}
      {data.lines.map(([a, b], i) => (
        <line
          key={`line-${i}`}
          x1={data.stars[a][0] * width}
          y1={data.stars[a][1] * height}
          x2={data.stars[b][0] * width}
          y2={data.stars[b][1] * height}
          stroke={accent}
          stroke-width='1.5'
          opacity='0.3'
        />
      ))}
      {/* Star dots — slightly brighter */}
      {data.stars.map(([x, y], i) => (
        <circle
          key={`star-${i}`}
          cx={x * width}
          cy={y * height}
          r={i === 0 ? 5 : 3.5}
          fill={accent}
          opacity={i === 0 ? '0.9' : '0.65'}
        />
      ))}
    </svg>
  );
}

/**
 * Renders 3 concentric depth rings centred on the canvas.
 * Returns an array — spread into the parent JSX.
 */
export function renderDepthRings(
  accent: string,
  width: number,
  height: number,
): React.ReactElement[] {
  const base = Math.min(width, height);
  const rings = [
    { scale: 0.55, opacity: 0.07 },
    { scale: 0.72, opacity: 0.045 },
    { scale: 0.9, opacity: 0.025 },
  ];

  return rings.map((ring, i) => {
    const dim = base * ring.scale;
    return (
      <div
        key={`ring-${i}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: dim,
            height: dim,
            borderRadius: '50%',
            border: `1px solid ${accent}`,
            opacity: ring.opacity,
            display: 'flex',
          }}
        />
      </div>
    );
  });
}

// --- Story Starfield (taller portrait) ---

export function renderIGStoryStarfield(seed: string) {
  const stars = generateStarfield(seed, 140);
  return stars.map((star, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        borderRadius: '50%',
        background: '#fff',
        opacity: Math.min(1, star.opacity * 1.1),
      }}
    />
  ));
}

// --- Story Brand Tag (positioned in bottom safe zone) ---

export function IGStoryBrandTag({ baseUrl }: { baseUrl: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
        position: 'absolute',
        bottom: IG_STORY_SAFE.bottom + 20,
        left: 0,
        right: 0,
      }}
    >
      <img
        src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
        width={20}
        height={20}
        style={{ opacity: 0.5 }}
        alt=''
      />
      <span
        style={{
          fontSize: IG_TEXT.story.footer,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.1em',
          display: 'flex',
        }}
      >
        lunary.app
      </span>
    </div>
  );
}

// --- Story Dark Background ---

export function IGStoryBackground({
  category,
  seed,
  children,
}: {
  category: ThemeCategory;
  seed: string;
  children: React.ReactNode;
}) {
  const gradient = CATEGORY_GRADIENT[category];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: gradient,
        padding: `${IG_STORY_SAFE.top}px ${IG_STORY_SAFE.sidePadding}px ${IG_STORY_SAFE.bottom}px`,
        position: 'relative',
        fontFamily: 'Roboto Mono',
      }}
    >
      {renderIGStoryStarfield(seed)}
      {children}
    </div>
  );
}
