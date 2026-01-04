import type { GrimoireSnippet } from './grimoire-content';
import {
  getSymbolForContent,
  getAttributeString,
} from '../../../utils/og/symbols';

export type ImageFormat = 'square' | 'landscape' | 'portrait' | 'story';

export interface EducationalImageConfig {
  title: string;
  subtitle?: string;
  keyPoints: string[];
  grimoireUrl: string;
  format: ImageFormat;
}

/**
 * Get platform-appropriate image format
 * Uses recommended sizes for each platform:
 * - Landscape (1200x630): Twitter/X, LinkedIn, Bluesky, Facebook
 * - Square (1080x1080): Threads, Pinterest
 * - Story (1080x1920): Instagram, TikTok, Stories, Reels
 * - Story (1080x1920): TikTok, Stories, Reels
 */
export function getPlatformImageFormat(platform: string): ImageFormat {
  const formatMap: Record<string, ImageFormat> = {
    instagram: 'story', // 1080x1920 (9:16)
    twitter: 'landscape', // 1200x630 (1.91:1)
    facebook: 'landscape', // 1200x630
    linkedin: 'landscape', // 1200x627 (1.91:1)
    pinterest: 'square', // 1080x1080
    tiktok: 'story', // 1080x1920 (9:16)
    reddit: 'landscape', // 1200x630
    bluesky: 'landscape', // 1200x630
    threads: 'square', // 1080x1080 (1:1)
  };

  return formatMap[platform.toLowerCase()] || 'landscape';
}

/**
 * Map Grimoire categories to thematic categories
 */
function mapToThematicCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    zodiac: 'zodiac',
    'zodiac-signs': 'zodiac',
    tarot: 'tarot',
    'tarot-cards': 'tarot',
    lunar: 'lunar',
    moon: 'lunar',
    'moon-phases': 'lunar',
    crystals: 'crystals',
    crystal: 'crystals',
    chakras: 'chakras',
    chakra: 'chakras',
    sabbat: 'sabbat',
    sabbats: 'sabbat',
    'wheel-of-the-year': 'sabbat',
    numerology: 'numerology',
    runes: 'runes',
    rune: 'runes',
    planetary: 'planetary',
    planets: 'planetary',
    astronomy: 'planetary',
    ritual: 'lunar',
    closing: 'lunar',
  };

  return categoryMap[category.toLowerCase()] || category.toLowerCase();
}

/**
 * Generate thematic image URL using the new unified endpoint
 */
export function getThematicImageUrl(
  category: string,
  title: string,
  baseUrl: string,
  platform: string,
  slug?: string,
  subtitle?: string,
  cover?: 'tiktok' | 'youtube' | 'true',
  formatOverride?: ImageFormat,
): string {
  const format = formatOverride || getPlatformImageFormat(platform);
  const thematicCategory = mapToThematicCategory(category);
  const normalizedSlug = slug || title.toLowerCase().replace(/\s+/g, '-');

  // Get symbol for this content
  const symbol = getSymbolForContent(thematicCategory, normalizedSlug);

  // Build URL
  const params = new URLSearchParams({
    category: thematicCategory,
    title,
    format,
    slug: normalizedSlug,
  });

  if (subtitle) {
    params.set('subtitle', subtitle);
  }

  if (cover) {
    params.set('cover', cover);
  }

  if (symbol) {
    params.set('symbol', symbol);
  }

  return `${baseUrl}/api/og/thematic?${params.toString()}`;
}

/**
 * Generate educational image URL from Grimoire snippet
 * Uses the new thematic endpoint for better visuals
 */
export function getEducationalImageUrl(
  snippet: GrimoireSnippet,
  baseUrl: string,
  platform: string,
  formatOverride?: ImageFormat,
): string {
  // Use the new thematic endpoint
  return getThematicImageUrl(
    snippet.category,
    snippet.title,
    baseUrl,
    platform,
    snippet.slug,
    undefined,
    undefined,
    formatOverride,
  );
}

/**
 * Generate carousel image URLs for a topic
 */
export function getEducationalCarouselUrls(
  snippet: GrimoireSnippet,
  baseUrl: string,
  platform: string,
  count: number = 3,
): string[] {
  const urls: string[] = [];
  const format = getPlatformImageFormat(platform);
  const thematicCategory = mapToThematicCategory(snippet.category);

  // Overview image
  urls.push(getEducationalImageUrl(snippet, baseUrl, platform));

  // Detail images (one per key point)
  for (let i = 1; i < Math.min(count, snippet.keyPoints.length + 1); i++) {
    const keyPoint = snippet.keyPoints[i - 1] || snippet.summary;
    const partTitle = `${snippet.title} - Part ${i}`;

    const params = new URLSearchParams({
      category: thematicCategory,
      title: partTitle,
      subtitle: keyPoint.substring(0, 100),
      format,
      slug: snippet.slug,
    });

    urls.push(`${baseUrl}/api/og/thematic?${params.toString()}`);
  }

  return urls;
}

/**
 * Get image URL for specific content types
 */
export function getContentTypeImageUrl(
  contentType: 'zodiac' | 'tarot' | 'lunar' | 'sabbat' | 'chakra' | 'crystal',
  identifier: string,
  baseUrl: string,
  platform: string,
): string {
  const format = getPlatformImageFormat(platform);

  switch (contentType) {
    case 'lunar':
      // Use dedicated moon OG route
      return `${baseUrl}/api/og/moon?format=${format}`;

    case 'tarot':
      // Use dedicated tarot OG route for daily card
      return `${baseUrl}/api/og/tarot?format=${format}`;

    default:
      // Use thematic endpoint
      return getThematicImageUrl(contentType, identifier, baseUrl, platform);
  }
}

/**
 * Get symbol for a given category and slug
 */
export function getSymbolForImage(
  category: string,
  slug: string,
): string | null {
  const thematicCategory = mapToThematicCategory(category);
  return getSymbolForContent(thematicCategory, slug);
}

/**
 * Get attribute text for a given category and slug
 */
export function getAttributeForImage(
  category: string,
  slug: string,
): string | null {
  const thematicCategory = mapToThematicCategory(category);
  return getAttributeString(thematicCategory, slug);
}
