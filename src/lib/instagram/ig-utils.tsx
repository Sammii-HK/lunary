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

export function renderIGStarfield(seed: string) {
  const stars = generateStarfield(seed, 60);
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
        opacity: star.opacity * 0.5,
      }}
    />
  ));
}

// --- Brand Tag (subtle watermark) ---

export function IGBrandTag({
  baseUrl,
  mode = 'dark',
}: {
  baseUrl: string;
  mode?: 'dark' | 'light';
}) {
  const color = mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
        position: 'absolute',
        bottom: 32,
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

// --- Story Starfield (taller portrait) ---

export function renderIGStoryStarfield(seed: string) {
  const stars = generateStarfield(seed, 100);
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
        opacity: star.opacity * 0.4,
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
