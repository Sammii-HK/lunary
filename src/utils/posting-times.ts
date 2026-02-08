/**
 * Recommended posting times by platform (UTC)
 * Based on POSTING_STRATEGY.md
 */

import {
  CONTENT_TYPE_CONFIGS,
  POSTING_TIME_WINDOWS,
} from '@/lib/social/video-scripts/content-types';
import type { ContentType } from '@/lib/social/video-scripts/content-types';

export interface RecommendedTime {
  hour: number;
  label: string;
  isOptimal: boolean;
}

export interface PlatformPostingTimes {
  platform: string;
  recommendedTimes: RecommendedTime[];
  bestDays: string[];
  note?: string;
}

export const PLATFORM_POSTING_TIMES: Record<string, PlatformPostingTimes> = {
  instagram: {
    platform: 'instagram',
    bestDays: ['Tuesday', 'Thursday', 'Sunday'],
    recommendedTimes: [
      { hour: 15, label: '3:00 PM', isOptimal: true },
      { hour: 16, label: '4:00 PM', isOptimal: true },
      { hour: 17, label: '5:00 PM', isOptimal: true },
      { hour: 18, label: '6:00 PM', isOptimal: true },
      { hour: 19, label: '7:00 PM', isOptimal: true },
      { hour: 14, label: '2:00 PM', isOptimal: false },
      { hour: 20, label: '8:00 PM', isOptimal: false },
    ],
    note: 'End-of-day calm mood',
  },
  twitter: {
    platform: 'twitter',
    bestDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    recommendedTimes: [
      { hour: 16, label: '4:00 PM', isOptimal: true },
      { hour: 20, label: '8:00 PM', isOptimal: true },
      { hour: 13, label: '1:00 PM', isOptimal: false },
      { hour: 12, label: '12:00 PM', isOptimal: false },
      { hour: 11, label: '11:00 AM', isOptimal: false },
    ],
    note: 'US/UK overlap (UTC), text earlier, video later',
  },
  threads: {
    platform: 'threads',
    bestDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    recommendedTimes: [
      { hour: 15, label: '3:00 PM', isOptimal: true },
      { hour: 20, label: '8:00 PM', isOptimal: true },
      { hour: 10, label: '10:00 AM', isOptimal: false },
      { hour: 12, label: '12:00 PM', isOptimal: false },
      { hour: 18, label: '6:00 PM', isOptimal: false },
    ],
    note: 'Text mid-afternoon, video evening (UTC)',
  },
  facebook: {
    platform: 'facebook',
    bestDays: ['Tuesday', 'Thursday', 'Sunday'],
    recommendedTimes: [
      { hour: 15, label: '3:00 PM', isOptimal: true },
      { hour: 16, label: '4:00 PM', isOptimal: true },
      { hour: 17, label: '5:00 PM', isOptimal: true },
      { hour: 18, label: '6:00 PM', isOptimal: true },
      { hour: 19, label: '7:00 PM', isOptimal: true },
    ],
    note: 'Similar to Instagram',
  },
  linkedin: {
    platform: 'linkedin',
    bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
    recommendedTimes: [
      { hour: 8, label: '8:00 AM', isOptimal: true },
      { hour: 9, label: '9:00 AM', isOptimal: true },
      { hour: 12, label: '12:00 PM', isOptimal: true },
      { hour: 13, label: '1:00 PM', isOptimal: true },
      { hour: 17, label: '5:00 PM', isOptimal: false },
    ],
    note: 'Professional hours',
  },
  pinterest: {
    platform: 'pinterest',
    bestDays: ['Saturday', 'Sunday'],
    recommendedTimes: [
      { hour: 14, label: '2:00 PM', isOptimal: true },
      { hour: 15, label: '3:00 PM', isOptimal: true },
      { hour: 16, label: '4:00 PM', isOptimal: true },
      { hour: 17, label: '5:00 PM', isOptimal: true },
      { hour: 18, label: '6:00 PM', isOptimal: true },
    ],
    note: 'Weekend inspiration',
  },
  reddit: {
    platform: 'reddit',
    bestDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    recommendedTimes: [
      { hour: 12, label: '12:00 PM', isOptimal: true },
      { hour: 13, label: '1:00 PM', isOptimal: true },
      { hour: 14, label: '2:00 PM', isOptimal: true },
      { hour: 15, label: '3:00 PM', isOptimal: true },
      { hour: 17, label: '5:00 PM', isOptimal: false },
      { hour: 18, label: '6:00 PM', isOptimal: false },
    ],
    note: 'Active discussion times',
  },
};

/**
 * Get recommended posting times for a platform
 */
export function getRecommendedTimes(platform: string): RecommendedTime[] {
  return (
    PLATFORM_POSTING_TIMES[platform.toLowerCase()]?.recommendedTimes ?? [
      { hour: 12, label: '12:00 PM', isOptimal: true },
      { hour: 15, label: '3:00 PM', isOptimal: true },
      { hour: 18, label: '6:00 PM', isOptimal: false },
    ]
  );
}

/**
 * Get the best/default posting time for a platform
 */
export function getDefaultPostingTime(platform: string): number {
  const times = getRecommendedTimes(platform);
  const optimal = times.find((t) => t.isOptimal);
  return optimal?.hour || times[0]?.hour || 15; // Default to 3 PM
}

/**
 * Get platform posting info
 */
export function getPlatformPostingInfo(
  platform: string,
): PlatformPostingTimes | null {
  return PLATFORM_POSTING_TIMES[platform.toLowerCase()] || null;
}

/**
 * Video posting times (UTC) — 3-slot daily schedule
 *
 * | Slot         | UTC  | Purpose                                  |
 * |--------------|------|------------------------------------------|
 * | primary      | 12   | Educational (grimoire themes)            |
 * | engagementA  | 17   | Engagement format (UK evening / US lunch)|
 * | engagementB  | 20   | Engagement format (UK leisure / US peak) |
 */
export const VIDEO_POSTING_HOURS = {
  primary: 12,
  engagementA: 17,
  engagementB: 20,
  /** @deprecated Use engagementB — kept for backward compatibility */
  secondary: 20,
} as const;

export type VideoSlot = 'primary' | 'engagementA' | 'engagementB';

export function getVideoSlotHour(slot: VideoSlot): number {
  return VIDEO_POSTING_HOURS[slot];
}

/** @deprecated Use getVideoSlotHour — kept for backward compatibility */
export function getVideoPostingHour(isSecondary: boolean): number {
  return isSecondary
    ? VIDEO_POSTING_HOURS.engagementB
    : VIDEO_POSTING_HOURS.primary;
}

/**
 * Instagram Reels posting times for engagement video cross-posts (UTC)
 * Staggered from TikTok times to hit Instagram's optimal hours.
 */
export const INSTAGRAM_REELS_HOURS = {
  engagementA: 15,
  engagementB: 19,
} as const;

export function getInstagramReelsHour(
  slot: 'engagementA' | 'engagementB',
): number {
  return INSTAGRAM_REELS_HOURS[slot];
}

/**
 * Get optimal posting hour using deterministic rotation through time windows.
 *
 * Same inputs always produce the same output (reproducible for debugging),
 * but different dates naturally rotate through the window hours, providing
 * built-in A/B comparison data.
 */
export function getOptimalPostingHour(params: {
  contentType: ContentType;
  scheduledDate: Date;
  topic?: string;
}): number {
  const config = CONTENT_TYPE_CONFIGS[params.contentType];
  const window = POSTING_TIME_WINDOWS[config.targetAudience];

  const dateStr = params.scheduledDate.toISOString().split('T')[0];
  const seed = simplePostingHash(
    `posting-${params.contentType}-${dateStr}-${params.topic || ''}`,
  );

  const isWeekend = [0, 6].includes(params.scheduledDate.getDay());
  const adjust = isWeekend ? window.weekendAdjust : 0;
  const hour = window.windowHours[seed % window.windowHours.length] + adjust;

  return Math.max(0, Math.min(23, hour));
}

function simplePostingHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

/**
 * Threads posting schedule (UTC)
 * Research-backed schedule for optimal engagement:
 * - 12:00 UTC: Question/engagement post (morning scroll, algorithm boost)
 * - 17:00 UTC: Educational deep-dive (UK evening, US lunch - value content)
 * - 20:00 UTC: Dear-style beta CTA (peak app usage, leisure time = signups)
 */
export const THREADS_POST_HOURS = {
  question: 12,
  deepDive: 17,
  betaCta: 20,
} as const;

export type ThreadsPostType = 'question' | 'deepDive' | 'betaCta';

export function getThreadsPostingHour(postType: ThreadsPostType): number {
  return THREADS_POST_HOURS[postType];
}
