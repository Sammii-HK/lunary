/**
 * Platform-specific limits for social content
 */

export const MAX_CHARS: Record<string, number> = {
  twitter: 280,
  threads: 320,
  bluesky: 350,
  instagram: 2200,
  facebook: 2200,
  linkedin: 1200,
  pinterest: 1200,
  tiktok: 2200,
  youtube: 2200,
  reddit: 3000,
};

export const PLATFORM_HASHTAG_LIMITS: Record<string, number> = {
  tiktok: 4,
  instagram: 4,
  threads: 0,
  twitter: 2,
  bluesky: 2,
  facebook: 4,
  linkedin: 3,
  pinterest: 3,
  youtube: 3,
  reddit: 3,
};

export const getHashtagLimit = (platform: string): number =>
  PLATFORM_HASHTAG_LIMITS[platform] ?? 4;

export const getMaxChars = (platform: string): number =>
  MAX_CHARS[platform] ?? 450;
