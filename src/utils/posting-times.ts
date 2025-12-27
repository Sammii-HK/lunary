/**
 * Recommended posting times by platform (UTC)
 * Based on POSTING_STRATEGY.md
 */

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
