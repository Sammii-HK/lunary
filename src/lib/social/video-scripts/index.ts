/**
 * Video Script Generator Module
 *
 * Generates TikTok (30-45s) and YouTube (3-4min) scripts from weekly themes.
 * Scripts are complete, flowing narratives that can be read naturally.
 */

// Types
export * from './types';

// Constants
export {
  VIDEO_ANGLE_OPTIONS,
  SECONDARY_THEME_COOLDOWN_DAYS,
  mapAngleToAspect,
  aspectLabel,
  CATEGORY_SLUG_PREFIXES,
  THEME_DISPLAY_MAP,
} from './constants';

// Database
export {
  ensureVideoScriptsTable,
  saveVideoScript,
  updateVideoScriptHook,
  getVideoScripts,
  updateVideoScriptStatus,
  updateVideoScriptWrittenPost,
} from './database';

// Rotation
export {
  ensureContentRotationSecondaryTable,
  getAngleForTopic,
  selectSecondaryTheme,
  selectSecondaryAspect,
  recordSecondaryThemeUsage,
} from './rotation';

// Grimoire helpers
export {
  getGrimoireDataForFacet,
  isAllowedSlugForCategory,
  getSafeGrimoireDataForFacet,
} from './grimoire-helpers';

// Validation
export {
  validateVideoHook,
  validateScriptBody,
  isHookLikeLine,
  hasRepeatedAdjacentBigrams,
  findSoWhatLineIndex,
} from './validation';

// Hooks
export {
  HOOK_TEMPLATES,
  selectHookStyle,
  buildHookForTopic,
  ensureVideoHook,
} from './hooks';

// Sanitization
export {
  sanitizeVideoScriptLines,
  sanitizeVideoScriptText,
} from './sanitization';

// TikTok generation
export { generateTikTokScript } from './tiktok';

// YouTube generation
export { generateYouTubeScript } from './youtube';

// Main generation
export {
  generateWeeklyVideoScripts,
  generateAndSaveWeeklyScripts,
} from './generation';
