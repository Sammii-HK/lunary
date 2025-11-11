'use client';

import { track } from '@vercel/analytics';

export type ConversionEvent =
  | 'app_opened'
  | 'signup'
  | 'birth_data_submitted'
  | 'trial_started'
  | 'trial_expired'
  | 'trial_converted'
  | 'subscription_started'
  | 'pricing_page_viewed'
  | 'upgrade_prompt_shown'
  | 'upgrade_clicked'
  | 'feature_gated'
  | 'onboarding_completed'
  | 'profile_completed'
  | 'birthday_entered'
  | 'horoscope_viewed'
  | 'tarot_viewed'
  | 'birth_chart_viewed';

export interface ConversionEventData {
  event: ConversionEvent;
  userId?: string;
  userEmail?: string;
  planType?: 'monthly' | 'yearly' | 'free';
  trialDaysRemaining?: number;
  featureName?: string;
  pagePath?: string;
  metadata?: Record<string, any>;
}

export async function trackConversion(
  event: ConversionEvent,
  data?: Partial<ConversionEventData>,
): Promise<void> {
  try {
    const eventData: ConversionEventData = {
      event,
      ...data,
    };

    track(event, eventData);

    const [analyticsResponse, notificationResponse] = await Promise.allSettled([
      fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }),
      fetch('/api/admin/notifications/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: event,
          userId: data?.userId,
          userEmail: data?.userEmail,
          planType: data?.planType,
          metadata: data?.metadata,
        }),
      }),
    ]);

    if (analyticsResponse.status === 'rejected') {
      console.error(
        'Failed to track conversion event:',
        analyticsResponse.reason,
      );
    }
  } catch (error) {
    console.error('Failed to track conversion event:', error);
  }
}

export const conversionTracking = {
  signup: (userId?: string, email?: string) =>
    trackConversion('signup', { userId, userEmail: email }),

  trialStarted: (
    userId?: string,
    email?: string,
    planType?: 'monthly' | 'yearly',
  ) =>
    trackConversion('trial_started', {
      userId,
      userEmail: email,
      planType,
    }),

  trialConverted: (
    userId?: string,
    email?: string,
    planType?: 'monthly' | 'yearly',
  ) =>
    trackConversion('trial_converted', {
      userId,
      userEmail: email,
      planType,
    }),

  subscriptionStarted: (
    userId?: string,
    email?: string,
    planType?: 'monthly' | 'yearly',
  ) =>
    trackConversion('subscription_started', {
      userId,
      userEmail: email,
      planType,
    }),

  pricingPageViewed: () => trackConversion('pricing_page_viewed'),

  upgradePromptShown: (featureName?: string, pagePath?: string) =>
    trackConversion('upgrade_prompt_shown', { featureName, pagePath }),

  upgradeClicked: (featureName?: string, pagePath?: string) =>
    trackConversion('upgrade_clicked', { featureName, pagePath }),

  featureGated: (featureName: string, pagePath?: string) =>
    trackConversion('feature_gated', { featureName, pagePath }),

  onboardingCompleted: (userId?: string) =>
    trackConversion('onboarding_completed', { userId }),

  profileCompleted: (userId?: string) =>
    trackConversion('profile_completed', { userId }),

  birthdayEntered: (userId?: string) =>
    trackConversion('birthday_entered', { userId }),

  horoscopeViewed: (userId?: string) =>
    trackConversion('horoscope_viewed', { userId }),

  tarotViewed: (userId?: string) => trackConversion('tarot_viewed', { userId }),

  birthChartViewed: (userId?: string) =>
    trackConversion('birth_chart_viewed', { userId }),

  appOpened: (userId?: string, pagePath?: string) =>
    trackConversion('app_opened', { userId, pagePath }),

  birthDataSubmitted: (userId?: string) =>
    trackConversion('birth_data_submitted', { userId }),

  trialExpired: (userId?: string, email?: string) =>
    trackConversion('trial_expired', { userId, userEmail: email }),
};
