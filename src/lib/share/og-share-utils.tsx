import { OG_COLORS, generateStarfield, getStarCount } from './og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

// --- Font Loading (cached at module level) ---

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;
let astronomiconPromise: Promise<ArrayBuffer> | null = null;

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

const loadAstronomiconFont = async (request: Request) => {
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

export async function loadShareFonts(
  request: Request,
  options?: { includeAstronomicon?: boolean },
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
      data: await loadAstronomiconFont(request),
      style: 'normal',
      weight: 400,
    });
  }

  return fonts;
}

// --- Size Presets ---

export interface ShareSizes {
  padding: number;
  titleSize: number;
  subtitleSize: number;
  labelSize: number;
  bodySize: number;
  footerIconSize: number;
  footerTextSize: number;
  symbolSize: number;
  isLandscape: boolean;
  isStory: boolean;
}

export function getShareSizes(format: ShareFormat): ShareSizes {
  switch (format) {
    case 'landscape':
      return {
        padding: 48,
        titleSize: 36,
        subtitleSize: 24,
        labelSize: 14,
        bodySize: 18,
        footerIconSize: 24,
        footerTextSize: 16,
        symbolSize: 80,
        isLandscape: true,
        isStory: false,
      };
    case 'story':
      return {
        padding: 60,
        titleSize: 48,
        subtitleSize: 32,
        labelSize: 20,
        bodySize: 24,
        footerIconSize: 28,
        footerTextSize: 20,
        symbolSize: 140,
        isLandscape: false,
        isStory: true,
      };
    default:
      return {
        padding: 60,
        titleSize: 40,
        subtitleSize: 28,
        labelSize: 16,
        bodySize: 20,
        footerIconSize: 24,
        footerTextSize: 16,
        symbolSize: 100,
        isLandscape: false,
        isStory: false,
      };
  }
}

// --- Starfield Rendering ---

export function renderStarfield(shareId: string, format: ShareFormat) {
  const stars = generateStarfield(shareId, getStarCount(format));
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
        opacity: star.opacity,
      }}
    />
  ));
}

// --- Footer ---

export function ShareFooter({
  baseUrl,
  format,
}: {
  baseUrl: string;
  format: ShareFormat;
}) {
  const sizes = getShareSizes(format);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'center',
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
      }}
    >
      <img
        src={`${baseUrl}/icons/moon-phases/full-moon.png`}
        width={sizes.footerIconSize}
        height={sizes.footerIconSize}
        style={{ opacity: 0.6 }}
        alt=''
      />
      <span
        style={{
          fontSize: sizes.footerTextSize,
          opacity: 0.6,
          letterSpacing: '0.1em',
          color: OG_COLORS.textPrimary,
          display: 'flex',
        }}
      >
        lunary.app
      </span>
    </div>
  );
}

// --- Text Truncation ---

export function truncateText(text: string, limit: number): string {
  return text.length > limit ? text.slice(0, limit - 1) + '\u2026' : text;
}

// --- Constants ---

export const SHARE_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

export const SHARE_BORDERS = {
  card: `1px solid ${OG_COLORS.border}`,
  emphasis: '1px solid rgba(255,255,255,0.2)',
} as const;

export const SHARE_CARDS = {
  primary: OG_COLORS.cardBg,
  secondary: 'rgba(255,255,255,0.015)',
} as const;
