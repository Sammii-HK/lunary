/**
 * Threads platform strategy
 *
 * Conversational, question-ending. Community-building tone.
 * No hashtags on Threads (handled by selectHashtagsForPostType returning []).
 */

import { generateSocialCopy } from '../social-copy/generation';
import type { SourcePack, SocialCopyResult } from '../social-copy/types';
import type { PlatformStrategy } from './types';

const THREADS_PROMPT_MODIFIER = `Platform: Threads. Keep under 450 characters.
Conversational and community-focused. End with a question to drive replies.
No hashtags needed. Think of this as starting a conversation, not broadcasting.
Threads rewards authentic, discussion-starting content.`;

export const threadsStrategy: PlatformStrategy = {
  platform: 'threads',
  maxLength: 500,
  promptModifier: THREADS_PROMPT_MODIFIER,
  generate: async (pack: SourcePack): Promise<SocialCopyResult> => {
    return generateSocialCopy({
      ...pack,
      platform: 'threads',
    });
  },
};
