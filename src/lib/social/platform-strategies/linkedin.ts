/**
 * LinkedIn platform strategy
 *
 * Professional, educational depth. Wellness/mindfulness framing.
 * Longer-form content with structured insights.
 */

import { generateSocialCopy } from '../social-copy/generation';
import type { SourcePack, SocialCopyResult } from '../social-copy/types';
import type { PlatformStrategy } from './types';

const LINKEDIN_PROMPT_MODIFIER = `Platform: LinkedIn. Aim for 150-300 words.
Educational, professional tone. Frame spiritual concepts through wellness,
mindfulness, and personal development lenses. Use structured insights.
Include a practical takeaway. Audience is professionals interested in wellbeing.`;

export const linkedinStrategy: PlatformStrategy = {
  platform: 'linkedin',
  maxLength: 3000,
  promptModifier: LINKEDIN_PROMPT_MODIFIER,
  generate: async (pack: SourcePack): Promise<SocialCopyResult> => {
    return generateSocialCopy({
      ...pack,
      platform: 'linkedin',
    });
  },
};
