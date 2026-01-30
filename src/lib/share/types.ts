import type { ShareFormat } from '@/hooks/useShareModal';

export type { ShareFormat };

export interface ShareRecord {
  shareId: string;
  shareUrl: string;
}

export interface FormatDimensions {
  width: number;
  height: number;
}

export const FORMAT_SIZES: Record<ShareFormat, FormatDimensions> = {
  square: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 630 },
  story: { width: 1080, height: 1920 },
  pinterest: { width: 1000, height: 1500 },
};

export const FORMAT_LABELS: Record<ShareFormat, string> = {
  square: 'Square (Instagram Post)',
  landscape: 'Landscape (X/Twitter)',
  story: 'Story (Instagram Stories)',
  pinterest: 'Tall (Pinterest)',
};

// Safe zones for story format (avoid UI overlaps)
export const STORY_SAFE_ZONES = {
  top: 250, // Profile pic and header
  bottom: 300, // Interaction buttons
  contentHeight: 1370, // Available content area
};
