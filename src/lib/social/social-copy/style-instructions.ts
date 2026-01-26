/**
 * Style instructions for social post generation
 */

import type { SocialPostType } from './types';

/**
 * Get style instruction based on platform and post type
 */
export const SOCIAL_POST_STYLE_INSTRUCTION = (
  platform: string,
  postType?: SocialPostType,
): string => {
  const baseGuidance = `Write naturally and conversationally. Share insights like you're explaining to a curious friend - clear, grounded, and genuinely helpful. Avoid marketing language, rigid formulas, or teaching from a distance.`;

  if (platform === 'threads') {
    return `${baseGuidance}

For Threads: Keep it tight and punchy - 220-320 characters max. Lead with something interesting or unexpected. No need for formal structures or repeated patterns. Just share one solid insight that makes someone pause and think.`;
  }

  const videoNote =
    postType === 'video_caption'
      ? 'Pair with the video naturally - complement it without repeating it verbatim.'
      : '';

  return `${baseGuidance} ${videoNote}

Mix up your approach: sometimes lead with context, sometimes with a question, sometimes with a surprising observation. Stay conversational and specific. If something matters practically, show how - don't just say it matters.`;
};
