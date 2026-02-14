/**
 * Video Script Generator
 *
 * Re-exports from modular structure for backwards compatibility.
 * For new code, prefer importing directly from:
 * - @/lib/social/video-scripts
 * - @/lib/social/shared
 */

// Types
export type {
  ScriptSection,
  TikTokMetadata,
  VideoScript,
  WeeklyVideoScripts,
  EnsureVideoHookOptions,
  EnsureVideoHookResult,
  SanitizeScriptOptions,
} from './video-scripts/types';

export { ContentAspect } from './video-scripts/types';

// Database functions
export {
  ensureVideoScriptsTable,
  saveVideoScript,
  updateVideoScriptHook,
  getVideoScripts,
  updateVideoScriptStatus,
  updateVideoScriptWrittenPost,
} from './video-scripts/database';

// Rotation functions
export { getAngleForTopic } from './video-scripts/rotation';

// Validation functions
export {
  validateVideoHook,
  validateScriptBody,
} from './video-scripts/validation';

// Hook functions
export {
  buildHookForTopic,
  ensureVideoHook,
  HOOK_TEMPLATES,
} from './video-scripts/hooks';

// Sanitization
export {
  sanitizeVideoScriptLines,
  sanitizeVideoScriptText,
} from './video-scripts/sanitization';

// TikTok generation
export { generateTikTokScript } from './video-scripts/tiktok';

// YouTube generation
export { generateYouTubeScript } from './video-scripts/youtube';

// Main generation
export {
  generateWeeklyVideoScripts,
  generateAndSaveWeeklyScripts,
} from './video-scripts/generation';
