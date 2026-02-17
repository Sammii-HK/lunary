/**
 * Twitter platform strategy
 *
 * Short, punchy, thread-style. Questions outperform statements 13-27x.
 * Optimal length: 70-100 chars. Max 280 chars.
 */

import { generateSocialCopy } from '../social-copy/generation';
import type { SourcePack, SocialCopyResult } from '../social-copy/types';
import type { PlatformStrategy } from './types';

const TWITTER_PROMPT_MODIFIER = `Platform: Twitter/X. Keep under 200 characters if possible (max 280).
Short, punchy. Questions outperform statements 13-27x on this platform.
Use fragments and direct address. No long explanations.`;

export const twitterStrategy: PlatformStrategy = {
  platform: 'twitter',
  maxLength: 280,
  promptModifier: TWITTER_PROMPT_MODIFIER,
  generate: async (pack: SourcePack): Promise<SocialCopyResult> => {
    return generateSocialCopy({
      ...pack,
      platform: 'twitter',
    });
  },
};
