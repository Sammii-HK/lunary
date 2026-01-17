'use client';

import { track } from '@vercel/analytics';
import { betterAuthClient } from '@/lib/auth-client';
import {
  getAttributionForTracking,
  getStoredAttribution,
} from '@/lib/attribution';
import { getContextualHub } from '@/lib/grimoire/getContextualNudge';

export type ConversionEvent =
  | 'signup'
  | 'app_opened'
  | 'page_viewed'
  | 'cta_clicked'
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
  | 'weekly_report_sent'
  | 'grimoire_viewed';

export interface ConversionEventData {
  event: ConversionEvent;
  eventId?: string;
  userId?: string;
  anonymousId?: string;
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
const ANON_ID_STORAGE_KEY = 'lunary_anon_id';

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
): Record<string, string | number | boolean | null> {
  return Object.entries(payload).reduce<
    Record<string, string | number | boolean | null>
  >((acc, [key, value]) => {
    // Vercel Analytics only accepts primitives: strings, numbers, booleans, null
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      acc[key] = value;
    }
    // Skip objects, arrays, undefined, and functions
    return acc;
  }, {});
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
      const hostname = referrerUrl.hostname.toLowerCase();
      if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
        utmParams.utm_source = 'tiktok';
        utmParams.referrer = document.referrer;
      }
    } catch {
      // Invalid URL, skip referrer parsing
    }
  }

  return utmParams;
}

export function getAnonymousId(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    let anonId = window.localStorage.getItem(ANON_ID_STORAGE_KEY);
    if (!anonId) {
      anonId = crypto.randomUUID();
      window.localStorage.setItem(ANON_ID_STORAGE_KEY, anonId);
    }
    return anonId;
  } catch (error) {
    console.warn('Unable to access localStorage for anon id:', error);
    return undefined;
  }
}

function getOriginMetadata(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const attribution = getStoredAttribution();
  const pathname = window.location.pathname || '/';
  const originPage = attribution?.landingPage || pathname;
  const originHub = getContextualHub(pathname, 'universal');
  const referrer = attribution?.referrer || document.referrer || '';

  let originType: 'seo' | 'internal' | 'direct' = 'direct';

  if (attribution?.source === 'seo') {
    originType = 'seo';
  } else if (referrer) {
    try {
      const referrerHost = new URL(referrer).hostname.toLowerCase();
      if (referrerHost.includes('lunary.app')) {
        originType = 'internal';
      }
    } catch {
      originType = 'direct';
    }
  }

  return {
    origin_hub: originHub,
    origin_page: originPage,
    origin_type: originType,
  };
}

export async function trackEvent(
  event: ConversionEvent,
  data?: Partial<ConversionEventData>,
): Promise<void> {
  try {
    const utmParams = extractUTMParams();
    const attributionData = getAttributionForTracking();
    const originMetadata = event === 'signup' ? getOriginMetadata() : {};
    const existingMetadata = data?.metadata || {};
    const eventIdValue =
      typeof data?.eventId === 'string' && data.eventId.trim().length > 0
        ? data.eventId.trim()
        : crypto.randomUUID();

    const eventData: ConversionEventData = {
      event,
      ...data,
      eventId: eventIdValue,
      metadata: {
        ...existingMetadata,
        ...utmParams,
        ...attributionData,
        ...originMetadata,
        referrer:
          (typeof document !== 'undefined' ? document.referrer : undefined) ||
          existingMetadata.referrer,
      },
    };

    // Default pagePath from the current browser location (privacy-safe: pathname only).
    if (!eventData.pagePath && typeof window !== 'undefined') {
      eventData.pagePath = window.location.pathname;
    }

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

    if (!eventData.anonymousId) {
      const anonId = getAnonymousId();
      if (anonId) {
        eventData.anonymousId = anonId;
      }
    }

    const normalizedEmail = normalizeEmail(eventData.userEmail);
    if (normalizedEmail) {
      eventData.userEmail = normalizedEmail;
    }

    const payload = sanitizeEventPayload(eventData);
    const apiPayload = {
      ...payload,
      anonymousId: eventData.anonymousId,
      metadata: eventData.metadata ?? undefined,
      eventId: eventData.eventId,
    };

    // Track to Vercel Analytics (web vitals focus)
    track(event, payload);

    const analyticsPromise = fetch('/api/analytics/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
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

export const trackConversion = trackEvent;

type CtaClickPayload = {
  hub?: string;
  ctaId?: string;
  location?: string;
  label?: string;
  href?: string;
  pagePath?: string;
};

export async function trackCtaClick(payload: CtaClickPayload): Promise<void> {
  try {
    const sanitized = sanitizeEventPayload({
      event: 'cta_clicked',
      featureName: payload.ctaId,
      pagePath: payload.pagePath,
      hub: payload.hub,
      cta_id: payload.ctaId,
      cta_location: payload.location,
      cta_label: payload.label,
      cta_href: payload.href,
    });

    track('cta_clicked', sanitized);

    const body = JSON.stringify({
      hub: payload.hub,
      ctaId: payload.ctaId,
      location: payload.location,
      label: payload.label,
      href: payload.href,
      pagePath: payload.pagePath,
      anonymousId: getAnonymousId(),
    });

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry/cta-click', blob);
      return;
    }

    await fetch('/api/telemetry/cta-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to track CTA click:', error);
  }
}

export const conversionTracking = {
  signup: (userId?: string, email?: string) =>
    trackConversion('signup', { userId, userEmail: email }),

  appOpened: (userId?: string, email?: string) =>
    trackConversion('app_opened', { userId, userEmail: email }),

  pageViewed: (pagePath?: string) =>
    trackConversion('page_viewed', { pagePath }),

  ctaClicked: (payload: CtaClickPayload) => trackCtaClick(payload),

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

  horoscopeViewed: (
    userId?: string,
    planType?: 'monthly' | 'yearly' | 'free',
  ) => trackConversion('horoscope_viewed', { userId, planType }),

  tarotViewed: (userId?: string, planType?: 'monthly' | 'yearly' | 'free') =>
    trackConversion('tarot_viewed', { userId, planType }),

  birthChartViewed: (
    userId?: string,
    planType?: 'monthly' | 'yearly' | 'free',
  ) => trackConversion('birth_chart_viewed', { userId, planType }),

  birthDataSubmitted: (userId?: string) =>
    trackConversion('birth_data_submitted', { userId }),

  trialExpired: (userId?: string, email?: string) =>
    trackConversion('trial_expired', { userId, userEmail: email }),

  personalizedTarotViewed: (
    userId?: string,
    planType?: 'monthly' | 'yearly' | 'free',
  ) => trackConversion('personalized_tarot_viewed', { userId, planType }),

  personalizedHoroscopeViewed: (
    userId?: string,
    planType?: 'monthly' | 'yearly' | 'free',
  ) => trackConversion('personalized_horoscope_viewed', { userId, planType }),

  crystalRecommendationsViewed: (
    userId?: string,
    planType?: 'monthly' | 'yearly' | 'free',
  ) => trackConversion('crystal_recommendations_viewed', { userId, planType }),

  grimoireViewed: (userId?: string, metadata?: Record<string, any>) =>
    trackConversion('grimoire_viewed', { userId, metadata }),
};
