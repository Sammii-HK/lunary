/**
 * Instagram platform strategy
 *
 * Visual-first, carousel-ready. Longer captions work well.
 * Rich hashtags (up to 30, but curated pools keep it focused).
 */

import { generateSocialCopy } from '../social-copy/generation';
import type { SourcePack, SocialCopyResult } from '../social-copy/types';
import type { PlatformStrategy } from './types';

const INSTAGRAM_PROMPT_MODIFIER = `Platform: Instagram. Aim for 100-200 words for the caption.
Visual-first mindset: the caption should complement an image or carousel.
Start with a hook line. Include a call-to-action (save, share, comment).
Educational depth is welcome. Use line breaks for readability.`;

export const instagramStrategy: PlatformStrategy = {
  platform: 'instagram',
  maxLength: 2200,
  promptModifier: INSTAGRAM_PROMPT_MODIFIER,
  generate: async (pack: SourcePack): Promise<SocialCopyResult> => {
    return generateSocialCopy({
      ...pack,
      platform: 'instagram',
    });
  },
};
