/**
 * YouTube video script generation module
 */

export { generateYouTubeScript } from './generation';
export { buildYouTubePrompt, buildFacetContext } from './prompts';
export {
  buildYouTubeIntro,
  buildYouTubeOverview,
  buildYouTubeFoundations,
  buildYouTubeDeeperMeaning,
  buildYouTubePractical,
  buildYouTubeSummary,
  buildYouTubeOutro,
  generateYouTubeScriptFallback,
} from './fallback';
