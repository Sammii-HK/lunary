'use client';

import { conversionTracking } from '@/lib/analytics';

export type SharePlatform =
  | 'native'
  | 'download'
  | 'clipboard'
  | 'twitter'
  | 'x'
  | 'instagram'
  | 'threads'
  | 'facebook'
  | 'pinterest'
  | 'reddit'
  | 'bluesky';

export type ShareType =
  | 'daily-insight'
  | 'birth-chart'
  | 'numerology'
  | 'weekly-pattern'
  | 'cosmic-state'
  | 'retrograde-badge'
  | 'zodiac-season';

export interface ShareMetrics {
  shareId?: string;
  format?: string;
  personalized?: boolean;
  subscriptionTier?: 'free' | 'premium';
}

export const shareTracking = {
  /**
   * Track when a user initiates a share action (opens share modal)
   */
  shareInitiated: (
    userId?: string,
    shareType?: string,
    metadata?: Record<string, any>,
  ) => {
    return conversionTracking.contentShared(
      userId,
      shareType,
      'initiated',
      metadata,
    );
  },

  /**
   * Track when a share is successfully completed
   */
  shareCompleted: (
    userId?: string,
    shareType?: string,
    platform?: SharePlatform,
    metadata?: ShareMetrics,
  ) => {
    return conversionTracking.contentShared(userId, shareType, platform, {
      ...metadata,
      completed: true,
    });
  },

  /**
   * Track when a shared link is viewed by someone
   */
  shareViewed: (
    shareId: string,
    shareType: string,
    referrer?: string,
    metadata?: Record<string, any>,
  ) => {
    return conversionTracking.contentShared(undefined, shareType, 'view', {
      shareId,
      referrer,
      ...metadata,
    });
  },

  /**
   * Track when a shared link leads to a conversion (signup/upgrade)
   */
  shareConverted: (
    shareId: string,
    shareType: string,
    action: 'signup' | 'upgrade',
    metadata?: Record<string, any>,
  ) => {
    return conversionTracking.contentShared(
      undefined,
      shareType,
      'conversion',
      {
        shareId,
        conversionAction: action,
        ...metadata,
      },
    );
  },

  /**
   * Track format selection (useful for A/B testing)
   */
  formatSelected: (
    userId?: string,
    shareType?: string,
    format?: string,
    metadata?: Record<string, any>,
  ) => {
    return conversionTracking.contentShared(
      userId,
      shareType,
      'format_selected',
      {
        format,
        ...metadata,
      },
    );
  },
};
