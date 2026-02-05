/**
 * Types for video script generation
 */

import { ContentAspect } from '../shared/types';
import type { ContentType } from './content-types';

export interface ScriptSection {
  name: string;
  duration: string;
  content: string;
}

export interface TikTokMetadata {
  theme: string; // Uppercase category e.g. "PLANETS"
  title: string; // Facet title e.g. "The Sun"
  series: string; // Series part e.g. "Part 1 of 3"
  summary: string; // Short description from facet focus
  angle?: string;
  topic?: string;
  aspect?: string;
}

export interface VideoScript {
  id?: number;
  themeId: string;
  themeName: string;
  primaryThemeId?: string;
  secondaryThemeId?: string;
  secondaryFacetSlug?: string;
  secondaryAngleKey?: string;
  secondaryAspectKey?: string;
  facetTitle: string;
  topic?: string;
  angle?: string;
  aspect?: string;
  contentType?: ContentType; // NEW: Content type for secondary videos
  platform: 'tiktok' | 'youtube';
  sections: ScriptSection[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
  scheduledDate: Date;
  status: 'draft' | 'approved' | 'used';
  createdAt?: Date;
  hookText?: string;
  hookVersion?: number;
  // TikTok-specific fields
  metadata?: TikTokMetadata & {
    scheduledHour?: number; // UTC hour for optimal posting
    targetAudience?: 'discovery' | 'consideration' | 'conversion';
  };
  coverImageUrl?: string;
  partNumber?: number; // 1, 2, or 3
  writtenPostContent?: string; // Social media post content for this video
}

export interface WeeklyVideoScripts {
  theme: import('../weekly-themes').WeeklyTheme;
  tiktokScripts: VideoScript[];
  youtubeScript: VideoScript;
  weekStartDate: Date;
}

export interface EnsureVideoHookOptions {
  topic: string;
  category?: string;
  source?: 'generation' | 'db' | 'fallback';
  scriptId?: number;
  scheduledDate?: Date;
}

export interface EnsureVideoHookResult {
  script: string;
  hook: string;
  modified: boolean;
  issues?: string[];
}

export type SanitizeScriptOptions = {
  topic: string;
  category?: string;
  sourceSnippet?: string;
  fallbackSource?: string;
};

// Re-export ContentAspect for convenience
export { ContentAspect };
