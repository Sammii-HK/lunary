/**
 * Bluesky platform strategy
 *
 * Authentic conversational tone, similar to Twitter but slightly longer.
 * 50% facts, 30% questions, 20% observations/reflections.
 */

import { generateSocialCopy } from '../social-copy/generation';
import type { SourcePack, SocialCopyResult } from '../social-copy/types';
import type { PlatformStrategy } from './types';

const BLUESKY_PROMPT_MODIFIER = `Platform: Bluesky. Keep under 300 characters.
Authentic, conversational tone. Can be slightly longer than Twitter.
Observations and reflections do well. Be genuine and thoughtful.`;

export const blueskyStrategy: PlatformStrategy = {
  platform: 'bluesky',
  maxLength: 300,
  promptModifier: BLUESKY_PROMPT_MODIFIER,
  generate: async (pack: SourcePack): Promise<SocialCopyResult> => {
    return generateSocialCopy({
      ...pack,
      platform: 'bluesky',
    });
  },
};
