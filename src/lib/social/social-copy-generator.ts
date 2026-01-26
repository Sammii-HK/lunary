/**
 * Social Copy Generator
 *
 * Re-exports from modular structure for backwards compatibility.
 * For new code, prefer importing directly from:
 * - @/lib/social/social-copy
 * - @/lib/social/shared
 */

// Types
export type {
  SocialPostType,
  SourcePack,
  SocialCopyResult,
  NoveltyContext,
  OpeningIntent,
  OpeningVariation,
  OpeningVariationOptions,
  VideoCaptionValidation,
} from './social-copy/types';

export { OPENING_INTENTS } from './social-copy/types';

// Main functions
export { generateSocialCopy } from './social-copy/generation';
export { validateSocialCopy } from './social-copy/validation';
export { buildSourcePack } from './social-copy/source-pack';
export { buildFallbackCopy } from './social-copy/fallback';
export {
  applyPlatformFormatting,
  normalizeHashtagsForPlatform,
} from './social-copy/formatting';
export { selectHashtagsForPostType } from './social-copy/hashtags';
export {
  generateOpeningVariation,
  applyOpeningVariation,
} from './social-copy/opening-variation';
