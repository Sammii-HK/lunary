/**
 * Performance Configuration for Core Web Vitals Optimization
 * Centralizes caching, static generation, and performance settings
 */

/**
 * Revalidation periods for different content types
 * Values in seconds
 */
export const REVALIDATION_PERIODS = {
  // Static content that rarely changes
  grimoire: 86400 * 30, // 30 days
  glossary: 86400 * 30, // 30 days
  tarot: 86400 * 30, // 30 days
  crystals: 86400 * 30, // 30 days
  zodiac: 86400 * 30, // 30 days
  planets: 86400 * 30, // 30 days

  // Content that changes annually
  events: 86400 * 7, // 7 days
  retrogrades: 86400 * 7, // 7 days
  eclipses: 86400 * 7, // 7 days

  // Dynamic content
  compatibility: 86400, // 1 day
  placements: 86400, // 1 day

  // Frequently updated content
  moonPhase: 3600, // 1 hour
  transits: 3600, // 1 hour
  horoscope: 3600, // 1 hour

  // Real-time content
  birthChart: 0, // No cache
} as const;

/**
 * Cache headers for different content types
 */
export function getCacheHeaders(
  contentType: keyof typeof REVALIDATION_PERIODS,
): {
  'Cache-Control': string;
} {
  const revalidate = REVALIDATION_PERIODS[contentType];

  if (revalidate === 0) {
    return {
      'Cache-Control': 'no-store, must-revalidate',
    };
  }

  return {
    'Cache-Control': `public, s-maxage=${revalidate}, stale-while-revalidate=${revalidate * 2}`,
  };
}

/**
 * Static params for generateStaticParams
 * Centralized list of all static paths to pre-generate
 */
export const STATIC_ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export const STATIC_PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;

export const STATIC_ELEMENTS = ['fire', 'earth', 'air', 'water'] as const;

export const STATIC_MODALITIES = ['cardinal', 'fixed', 'mutable'] as const;

/**
 * Image optimization configuration
 */
export const IMAGE_CONFIG = {
  // Device sizes for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

  // OG image dimensions
  ogImage: {
    width: 1200,
    height: 630,
  },

  // Default quality
  quality: 85,

  // Formats to use
  formats: ['image/webp', 'image/avif'] as const,
} as const;

/**
 * Font optimization configuration
 */
export const FONT_CONFIG = {
  // Fonts to preload
  preload: [{ family: 'AstroFont', weight: 400, style: 'normal' }],

  // Font display strategy
  display: 'swap' as const,

  // Font loading priority
  priority: true,
} as const;

/**
 * Critical CSS classes that should be inlined
 * Used for above-the-fold content optimization
 */
export const CRITICAL_CLASSES = [
  // Layout
  'min-h-screen',
  'max-w-4xl',
  'mx-auto',
  // Typography
  'text-white',
  'text-zinc-100',
  'text-zinc-300',
  'text-zinc-400',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'font-light',
  'font-medium',
  // Spacing
  'p-4',
  'py-6',
  'px-4',
  'mb-4',
  'mb-8',
  'space-y-4',
  'space-y-8',
  // Backgrounds
  'bg-gradient-to-b',
  'from-[#0a0a0f]',
  'via-[#12121a]',
  'to-[#0a0a0f]',
] as const;

/**
 * Lazy loading configuration
 */
export const LAZY_LOAD_CONFIG = {
  // Offset before element enters viewport to start loading
  rootMargin: '200px',

  // Percentage of element visible before loading
  threshold: 0.1,

  // Default placeholder
  placeholder: 'blur',
} as const;

/**
 * Generate dynamic import hints for route prefetching
 */
export function getRoutePrefetchHints(currentPath: string): string[] {
  const hints: string[] = [];

  if (currentPath.startsWith('/grimoire')) {
    hints.push('/grimoire/search');
    hints.push('/grimoire/zodiac');
    hints.push('/grimoire/tarot');
  }

  if (currentPath.startsWith('/grimoire/zodiac')) {
    hints.push('/grimoire/compatibility');
    hints.push('/grimoire/placements');
  }

  if (currentPath.startsWith('/grimoire/astronomy')) {
    hints.push('/grimoire/events');
    hints.push('/grimoire/placements');
  }

  return hints;
}

/**
 * Metadata defaults for SEO optimization
 */
export const METADATA_DEFAULTS = {
  // Title suffix
  titleTemplate: '%s | Lunary',
  defaultTitle: 'Lunary - Personalized Astrology & Cosmic Guidance',

  // Description length targets
  descriptionMinLength: 120,
  descriptionMaxLength: 160,

  // Open Graph defaults
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Lunary',
  },

  // Twitter card type
  twitter: {
    card: 'summary_large_image' as const,
    site: '@lunaryapp',
    creator: '@lunaryapp',
  },

  // Robots defaults
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
  },
} as const;
