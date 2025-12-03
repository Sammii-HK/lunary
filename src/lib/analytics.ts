'use client';

import { track } from '@vercel/analytics';
import { betterAuthClient } from '@/lib/auth-client';
import { captureEvent } from '@/lib/posthog-client';

export type ConversionEvent =
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
  | 'birth_chart_viewed'
  | 'personalized_tarot_viewed'
  | 'personalized_horoscope_viewed'
  | 'crystal_recommendations_viewed'
  | 'cosmic_pulse_opened'
  | 'cosmic_pulse_sent'
  | 'moon_circle_opened'
  | 'moon_circle_sent'
  | 'weekly_report_opened'
  | 'weekly_report_sent';

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

type AuthContext = {
  userId?: string;
  userEmail?: string;
};

const AUTH_CACHE_TTL = 1000 * 60; // 1 minute

let cachedAuthContext: AuthContext | null = null;
let cachedAuthContextAt = 0;

function extractEmailFromMetadata(
  metadata?: Record<string, any>,
): string | undefined {
  if (!metadata) {
    return undefined;
  }

  const candidate =
    metadata.userEmail ||
    metadata.email ||
    metadata.customerEmail ||
    metadata.customer_email;

  if (typeof candidate === 'string') {
    return candidate;
  }

  return undefined;
}

async function getAuthContext(): Promise<AuthContext> {
  const now = Date.now();
  if (cachedAuthContext && now - cachedAuthContextAt < AUTH_CACHE_TTL) {
    return cachedAuthContext;
  }

  try {
    const session = await betterAuthClient.getSession();
    const user =
      session && typeof session === 'object'
        ? 'user' in session
          ? (session as any).user
          : ((session as any)?.data?.user ?? null)
        : null;

    cachedAuthContext = user
      ? {
          userId: user.id,
          userEmail: typeof user.email === 'string' ? user.email : undefined,
        }
      : {};
  } catch (error) {
    console.warn('Unable to load auth context for analytics tracking:', error);
    cachedAuthContext = {};
  } finally {
    cachedAuthContextAt = now;
  }

  return cachedAuthContext;
}

function normalizeEmail(email?: string | null): string | undefined {
  if (!email || typeof email !== 'string') {
    return undefined;
  }

  const trimmed = email.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
}

function sanitizeEventPayload(
  payload: ConversionEventData,
): Record<string, any> {
  return Object.entries(payload).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );
}

function extractUTMParams(): Record<string, string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];

  for (const key of utmKeys) {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  }

  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.hostname.includes('tiktok.com')) {
        utmParams.utm_source = 'tiktok';
        utmParams.referrer = document.referrer;
      }
    } catch {
      if (document.referrer.includes('tiktok.com')) {
        utmParams.utm_source = 'tiktok';
        utmParams.referrer = document.referrer;
      }
    }
  }

  return utmParams;
}

export async function trackConversion(
  event: ConversionEvent,
  data?: Partial<ConversionEventData>,
): Promise<void> {
  try {
    const utmParams = extractUTMParams();
    const existingMetadata = data?.metadata || {};

    const eventData: ConversionEventData = {
      event,
      ...data,
      metadata: {
        ...existingMetadata,
        ...utmParams,
        referrer:
          (typeof document !== 'undefined' ? document.referrer : undefined) ||
          existingMetadata.referrer,
      },
    };

    const metadataEmail = extractEmailFromMetadata(eventData.metadata);
    if (metadataEmail && !eventData.userEmail) {
      eventData.userEmail = metadataEmail;
    }

    const authContext = await getAuthContext();

    if (!eventData.userId && authContext.userId) {
      eventData.userId = authContext.userId;
    }

    if (!eventData.userEmail && authContext.userEmail) {
      eventData.userEmail = authContext.userEmail;
    }

    const normalizedEmail = normalizeEmail(eventData.userEmail);
    if (normalizedEmail) {
      eventData.userEmail = normalizedEmail;
    }

    const payload = sanitizeEventPayload(eventData);

    // Track to Vercel Analytics (web vitals focus)
    track(event, payload);

    // Track to PostHog (product analytics)
    captureEvent(event, {
      ...payload,
      $set: eventData.userId ? { user_id: eventData.userId } : undefined,
    });

    const analyticsPromise = fetch('/api/analytics/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const notificationPromise = fetch('/api/admin/notifications/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType: event,
        userId: eventData.userId,
        userEmail: eventData.userEmail,
        planType: eventData.planType,
        metadata: eventData.metadata,
      }),
    });

    const settledResults = await Promise.allSettled([
      analyticsPromise,
      notificationPromise,
    ]);

    if (settledResults[0].status === 'rejected') {
      console.error(
        'Failed to track conversion event:',
        settledResults[0].reason,
      );
    }

    if (settledResults[1].status === 'rejected') {
      console.error(
        'Failed to send conversion notification:',
        settledResults[1].reason,
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

  birthDataSubmitted: (userId?: string) =>
    trackConversion('birth_data_submitted', { userId }),

  trialExpired: (userId?: string, email?: string) =>
    trackConversion('trial_expired', { userId, userEmail: email }),

  personalizedTarotViewed: (userId?: string) =>
    trackConversion('personalized_tarot_viewed', { userId }),

  personalizedHoroscopeViewed: (userId?: string) =>
    trackConversion('personalized_horoscope_viewed', { userId }),

  crystalRecommendationsViewed: (userId?: string) =>
    trackConversion('crystal_recommendations_viewed', { userId }),
};
