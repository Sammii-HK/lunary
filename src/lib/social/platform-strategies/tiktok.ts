/**
 * TikTok platform strategy
 *
 * Hook-first, video caption format. Short and punchy.
 * Complements video scripts with captions that drive engagement.
 */

import { generateSocialCopy } from '../social-copy/generation';
import type { SourcePack, SocialCopyResult } from '../social-copy/types';
import type { PlatformStrategy } from './types';

const TIKTOK_PROMPT_MODIFIER = `Platform: TikTok caption. Keep under 150 characters.
Hook-first: the first line must grab attention immediately.
Complement the video, don't repeat it. Drive comments and saves.
Use direct address and create curiosity.`;

export const tiktokStrategy: PlatformStrategy = {
  platform: 'tiktok',
  maxLength: 2200,
  promptModifier: TIKTOK_PROMPT_MODIFIER,
  generate: async (pack: SourcePack): Promise<SocialCopyResult> => {
    return generateSocialCopy({
      ...pack,
      platform: 'tiktok',
    });
  },
};
