/**
 * Social Copy Generator Module
 *
 * Generates social media copy for various platforms with AI assistance.
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Hashtags
export { selectHashtagsForPostType, buildCuratedHashtags } from './hashtags';

// Validation
export { validateSocialCopy } from './validation';

// Formatting
export {
  normalizeHashtagsForPlatform,
  applyPlatformFormatting,
} from './formatting';

// Source pack building
export { buildSourcePack } from './source-pack';

// Fallback
export { buildFallbackCopy } from './fallback';

// Opening variation
export {
  generateOpeningVariation,
  applyOpeningVariation,
} from './opening-variation';

// Main generation
export { generateSocialCopy } from './generation';
