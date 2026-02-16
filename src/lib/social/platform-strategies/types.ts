/**
 * Platform strategy types
 */

import type { SourcePack, SocialCopyResult } from '../social-copy/types';

export interface PlatformStrategy {
  platform: string;
  /** Max character length for the platform */
  maxLength: number;
  /** Generate content for this platform */
  generate: (pack: SourcePack) => Promise<SocialCopyResult>;
  /** Platform-specific prompt modifiers */
  promptModifier?: string;
}
