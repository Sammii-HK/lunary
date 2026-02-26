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
        padding: 80,
        titleSize: 64,
        subtitleSize: 40,
        labelSize: 24,
        bodySize: 28,
        footerIconSize: 32,
        footerTextSize: 22,
        symbolSize: 220,
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

// --- Footer (viral CTA) ---
// In-flow footer — place as the last child of a flex-column wrapper.
// Content above it should use flex: 1 to fill remaining space.

export function ShareFooter({ format }: { format: ShareFormat }) {
  const sizes = getShareSizes(format);
  const isStory = format === 'story';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        justifyContent: 'center',
        paddingTop: isStory ? 40 : 24,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: Math.max(12, sizes.footerTextSize - 4),
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.05em',
          display: 'flex',
        }}
      >
        What does yours say?
      </span>
      <span
        style={{
          fontSize: Math.max(14, sizes.footerTextSize),
          color: '#A78BFA',
          letterSpacing: '0.05em',
          display: 'flex',
        }}
      >
        Get yours free → lunary.app
      </span>
    </div>
  );
}

// --- Text Truncation (word-boundary aware) ---

export function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text;

  const slice = text.slice(0, limit);

  // Try to find sentence-ending punctuation for a clean break
  const sentenceEnd = Math.max(
    slice.lastIndexOf('.'),
    slice.lastIndexOf('!'),
    slice.lastIndexOf('?'),
  );
  if (sentenceEnd > 40) {
    return slice.slice(0, sentenceEnd + 1);
  }

  // Otherwise break at last space
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > 40) {
    return slice.slice(0, lastSpace) + '\u2026';
  }

  // Fallback: hard cut (very short limits)
  return slice.slice(0, limit - 1) + '\u2026';
}

// --- Constants ---

export const SHARE_IMAGE_BORDER = '1px solid rgba(167, 139, 250, 0.3)';

export const SHARE_TITLE_GLOW = '0 0 20px rgba(167, 139, 250, 0.3)';

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
