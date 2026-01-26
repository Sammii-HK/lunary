/**
 * Platform configuration for hashtag usage
 */

export interface PlatformHashtagConfig {
  useHashtags: boolean;
  count: number;
}

/**
 * Platform-specific hashtag configuration
 * All platforms now use exactly 2-3 hashtags
 */
export const PLATFORM_HASHTAG_CONFIG: Record<string, PlatformHashtagConfig> = {
  instagram: { useHashtags: true, count: 3 },
  pinterest: { useHashtags: true, count: 3 },
  tiktok: { useHashtags: true, count: 3 },
  facebook: { useHashtags: true, count: 3 },
  linkedin: { useHashtags: true, count: 3 },
  twitter: { useHashtags: true, count: 2 },
  bluesky: { useHashtags: true, count: 1 },
  threads: { useHashtags: true, count: 2 },
  reddit: { useHashtags: true, count: 3 },
};

/**
 * Get hashtag config for a platform with sensible defaults
 */
export const getHashtagConfig = (platform: string): PlatformHashtagConfig =>
  PLATFORM_HASHTAG_CONFIG[platform] || { useHashtags: true, count: 3 };
