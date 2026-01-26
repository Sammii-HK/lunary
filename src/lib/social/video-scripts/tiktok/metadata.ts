/**
 * TikTok metadata and cover image generation
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import type { TikTokMetadata } from '../types';
import { THEME_DISPLAY_MAP } from '../constants';
import { capitalizeThematicTitle } from '../../../../../utils/og/text';

/**
 * Generate TikTok overlay metadata
 */
export function generateTikTokMetadata(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  totalParts: number,
): TikTokMetadata {
  return {
    theme: THEME_DISPLAY_MAP[theme.category] || theme.category.toUpperCase(),
    title: facet.title,
    series: `Part ${partNumber} of ${totalParts}`,
    summary: facet.focus,
  };
}

/**
 * Generate cover image URL for TikTok video
 */
export function generateCoverImageUrl(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  baseUrl: string = '',
  totalParts: number,
): string {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 7;
  const slug =
    facet.grimoireSlug.split('/').pop() ||
    facet.title.toLowerCase().replace(/\s+/g, '-');
  const subtitle = encodeURIComponent(
    `Part ${safePartNumber} of ${safeTotalParts}`,
  );
  const title = encodeURIComponent(capitalizeThematicTitle(facet.title));

  // cover=tiktok triggers larger text sizes for TikTok thumbnail legibility
  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=story&cover=tiktok`;
}
