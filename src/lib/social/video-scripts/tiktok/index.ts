/**
 * TikTok video script generation module
 */

export { generateTikTokScript } from './generation';
export { buildTikTokPrompt, buildGrimoireContext } from './prompts';
export {
  buildFallbackShortScript,
  buildTikTokHook,
  buildTikTokIntro,
  buildTikTokCore,
  buildTikTokTakeaway,
  generateTikTokScriptFallback,
} from './fallback';
export { generateTikTokMetadata, generateCoverImageUrl } from './metadata';
