/**
 * Pinterest platform strategy
 *
 * Aesthetic-focused, evergreen content. SEO-friendly descriptions.
 * Pins should work as standalone reference content.
 */

import { generateSocialCopy } from '../social-copy/generation';
import type { SourcePack, SocialCopyResult } from '../social-copy/types';
import type { PlatformStrategy } from './types';

const PINTEREST_PROMPT_MODIFIER = `Platform: Pinterest. Aim for 150-300 words.
Evergreen, reference-style content that works as a standalone pin.
SEO-friendly: include the topic name naturally 2-3 times. Informative and specific.
Think "save for later" — deep enough that people bookmark and return to it.
Structure with short paragraphs or a list for scannability. No questions, no vague hooks.`;

export const pinterestStrategy: PlatformStrategy = {
  platform: 'pinterest',
  maxLength: 500,
  promptModifier: PINTEREST_PROMPT_MODIFIER,
  generate: async (pack: SourcePack): Promise<SocialCopyResult> => {
    return generateSocialCopy({
      ...pack,
      platform: 'pinterest',
    });
  },
};
