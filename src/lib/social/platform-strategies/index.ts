/**
 * Platform strategy router
 *
 * Returns the appropriate content generation strategy for each platform.
 */

import type { PlatformStrategy } from './types';
import { twitterStrategy } from './twitter';
import { blueskyStrategy } from './bluesky';
import { linkedinStrategy } from './linkedin';
import { tiktokStrategy } from './tiktok';
import { instagramStrategy } from './instagram';
import { threadsStrategy } from './threads';
import { pinterestStrategy } from './pinterest';

const STRATEGIES: Record<string, PlatformStrategy> = {
  twitter: twitterStrategy,
  bluesky: blueskyStrategy,
  linkedin: linkedinStrategy,
  tiktok: tiktokStrategy,
  instagram: instagramStrategy,
  threads: threadsStrategy,
  pinterest: pinterestStrategy,
};

/**
 * Get the platform-specific content generation strategy.
 * Falls back to Twitter strategy for unknown platforms.
 */
export function getPlatformStrategy(platform: string): PlatformStrategy {
  return STRATEGIES[platform] || twitterStrategy;
}

export type { PlatformStrategy } from './types';
export {
  twitterStrategy,
  blueskyStrategy,
  linkedinStrategy,
  tiktokStrategy,
  instagramStrategy,
  threadsStrategy,
  pinterestStrategy,
};
