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
  | 'product_opened'
  | 'page_viewed'
  | 'cta_clicked'
  | 'birth_data_submitted'
  | 'trial_started'
  | 'trial_expired'
  | 'trial_converted'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'subscription_refunded'
  | 'journal_entry_created'
  | 'journal_entry_updated'
  | 'journal_entry_deleted'
  | 'dream_entry_created'
  | 'dream_entry_updated'
  | 'dream_entry_deleted'
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
  | 'grimoire_viewed'
  | 'daily_dashboard_viewed'
  | 'astral_chat_used'
  | 'ritual_started'
  | 'content_shared'
  | 'horoscope_shared'
  | 'tarot_reading_shared'
  | 'birth_chart_shared'
  | 'referral_link_copied'
  | 'referral_link_shared'
  | 'referral_code_generated'
  | 'session_started'
  | 'session_ended'
  | 'feature_first_use'
  | 'grimoire_search_performed'
  | 'grimoire_article_opened'
  | 'preferences_updated'
  | 'settings_changed'
  | 'notification_preference_changed'
  | 'birth_data_completed'
  | 'birth_location_updated'
  | 'payment_failed'
  | 'payment_retry_attempted'
  | 'payment_retry_success'
  | 'payment_method_added'
  | 'checkout_started'
  | 'checkout_abandoned'
  | 'subscription_cancellation_reason'
  | 'subscription_plan_upgraded'
  | 'subscription_plan_downgraded'
  | 'paywall_shown'
  | 'paywall_accepted'
  | 'paywall_dismissed'
  | 'upgrade_motivation_identified'
  | 'user_reactivated'
  | 'login_streak_milestone'
  | 'streak_broken'
  | 'notification_opened'
  | 'notification_clicked'
  | 'help_requested'
  | 'support_ticket_submitted'
  | 'feature_request_submitted'
  | 'bug_report_submitted'
  | 'feedback_submitted';

export interface ConversionEventData {
  event: ConversionEvent;
  eventId?: string;
  userId?: string;
  anonymousId?: string;
  userEmail?: string;
  planType?: 'monthly' | 'yearly' | 'free';
  hub?: string;
  trialDaysRemaining?: number;
  featureName?: string;
  pagePath?: string;
  cta_id?: string;
  cta_location?: string;
  cta_label?: string;
  cta_href?: string;
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
const APP_OPENED_GUARD_KEY = 'lunary_event_guard';
const PRODUCT_OPENED_GUARD_KEY = 'lunary_product_opened_guard';
const DAILY_DASHBOARD_GUARD_PREFIX = 'lunary_daily_dashboard_viewed_guard';
const APP_OPENED_GUARD_TTL_MS = 1000 * 60 * 30; // 30 minutes (for product_opened)

// In-memory fallback for when localStorage is unavailable (private browsing)
// This prevents duplicate events within the same browser session
let inMemoryAppOpenedGuard: number | null = null;
let inMemoryProductOpenedGuard: number | null = null;
let inMemoryDailyDashboardGuard: string | null = null;

// Helper to check if same UTC calendar day
const isSameUTCDay = (timestamp: number): boolean => {
  const lastDate = new Date(timestamp);
  const now = new Date();
  return (
    lastDate.getUTCDate() === now.getUTCDate() &&
    lastDate.getUTCMonth() === now.getUTCMonth() &&
    lastDate.getUTCFullYear() === now.getUTCFullYear()
  );
};

// Daily deduplication for app_opened: one event per user per calendar day (UTC)
// Uses localStorage for persistence across browser sessions, with in-memory fallback
// for private browsing mode to prevent duplicate events within the session
const shouldTrackAppOpened = () => {
  if (typeof window === 'undefined') return true;

  const now = Date.now();

  // First check in-memory guard (catches private browsing + rapid calls)
  if (inMemoryAppOpenedGuard !== null && isSameUTCDay(inMemoryAppOpenedGuard)) {
    return false;
  }

  try {
    const guardKey = 'lunary_app_opened_guard';
    const lastEvent = window.localStorage.getItem(guardKey);

    if (lastEvent) {
      const timestamp = Number(lastEvent);
      if (isSameUTCDay(timestamp)) {
        // Update in-memory guard to match localStorage
        inMemoryAppOpenedGuard = timestamp;
        return false;
      }
    }

    // Record the event
    window.localStorage.setItem(guardKey, String(now));
    inMemoryAppOpenedGuard = now;
    return true;
  } catch {
    // localStorage unavailable (private browsing) - use in-memory only
    // This prevents duplicates within the session but allows one event per session
    if (
      inMemoryAppOpenedGuard !== null &&
      isSameUTCDay(inMemoryAppOpenedGuard)
    ) {
      return false;
    }
    inMemoryAppOpenedGuard = now;
    return true;
  }
};

// Daily deduplication for product_opened: one event per user per calendar day (UTC)
// Uses localStorage for persistence across browser sessions, with in-memory fallback
const shouldTrackProductOpened = () => {
  if (typeof window === 'undefined') return true;

  const now = Date.now();

  // First check in-memory guard
  if (
    inMemoryProductOpenedGuard !== null &&
    isSameUTCDay(inMemoryProductOpenedGuard)
  ) {
    return false;
  }

  try {
    const guardKey = 'lunary_product_opened_guard';
    const lastEvent = window.localStorage.getItem(guardKey);

    if (lastEvent) {
      const timestamp = Number(lastEvent);
      if (isSameUTCDay(timestamp)) {
        inMemoryProductOpenedGuard = timestamp;
        return false;
      }
    }

    window.localStorage.setItem(guardKey, String(now));
    inMemoryProductOpenedGuard = now;
    return true;
  } catch {
    // localStorage unavailable - use in-memory only
    if (
      inMemoryProductOpenedGuard !== null &&
      isSameUTCDay(inMemoryProductOpenedGuard)
    ) {
      return false;
    }
    inMemoryProductOpenedGuard = now;
    return true;
  }
};

const shouldTrackDailyDashboardViewed = () => {
  if (typeof window === 'undefined') return true;

  const today = new Date().toISOString().split('T')[0];

  // Check in-memory guard first
  if (inMemoryDailyDashboardGuard === today) {
    return false;
  }

  try {
    const key = `${DAILY_DASHBOARD_GUARD_PREFIX}:${today}`;
    if (window.localStorage.getItem(key)) {
      inMemoryDailyDashboardGuard = today;
      return false;
    }
    window.localStorage.setItem(key, '1');
    inMemoryDailyDashboardGuard = today;
    return true;
  } catch {
    // localStorage unavailable - use in-memory only
    if (inMemoryDailyDashboardGuard === today) {
      return false;
    }
    inMemoryDailyDashboardGuard = today;
    return true;
  }
};

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
    // SECURITY: Block analytics from demo iframe
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/demo-preview')
    ) {
      return; // Silently skip analytics in demo mode
    }

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
  exampleType?: string;
  exampleText?: string;
  ctaVariant?: string;
  ctaHeadline?: string;
  ctaSubline?: string;
};

type CtaImpressionPayload = {
  hub?: string;
  ctaId?: string;
  location?: string;
  label?: string;
  href?: string;
  pagePath?: string;
  exampleType?: string;
  exampleText?: string;
  ctaVariant?: string;
  ctaHeadline?: string;
  ctaSubline?: string;
};

export async function trackCtaImpression(
  payload: CtaImpressionPayload,
): Promise<void> {
  try {
    const sanitized = sanitizeEventPayload({
      event: 'cta_clicked',
      featureName: `${payload.ctaId}_impression`,
      pagePath: payload.pagePath,
      hub: payload.hub,
      cta_id: payload.ctaId,
      cta_location: payload.location,
      cta_label: payload.label,
      cta_href: payload.href,
    });

    track('cta_impression', sanitized);

    const body = JSON.stringify({
      hub: payload.hub,
      ctaId: payload.ctaId,
      location: payload.location,
      label: payload.label,
      href: payload.href,
      pagePath: payload.pagePath,
      exampleType: payload.exampleType,
      exampleText: payload.exampleText,
      ctaVariant: payload.ctaVariant,
      ctaHeadline: payload.ctaHeadline,
      ctaSubline: payload.ctaSubline,
      anonymousId: getAnonymousId(),
    });

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry/cta-impression', blob);
      return;
    }

    await fetch('/api/telemetry/cta-impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to track CTA impression:', error);
  }
}

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
      exampleType: payload.exampleType,
      exampleText: payload.exampleText,
      ctaVariant: payload.ctaVariant,
      ctaHeadline: payload.ctaHeadline,
      ctaSubline: payload.ctaSubline,
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

  appOpened: (userId?: string, email?: string) => {
    if (!shouldTrackAppOpened()) return;
    return trackConversion('app_opened', { userId, userEmail: email });
  },

  productOpened: (userId?: string, email?: string) => {
    if (!shouldTrackProductOpened()) return;
    return trackConversion('product_opened', { userId, userEmail: email });
  },

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
  dailyDashboardViewed: (userId?: string, email?: string) => {
    if (!shouldTrackDailyDashboardViewed()) return;
    return trackConversion('daily_dashboard_viewed', {
      userId,
      userEmail: email,
    });
  },
  astralChatUsed: (
    userId?: string,
    email?: string,
    planType?: 'monthly' | 'yearly' | 'free',
  ) =>
    trackConversion('astral_chat_used', { userId, userEmail: email, planType }),
  ritualStarted: (
    userId?: string,
    email?: string,
    planType?: 'monthly' | 'yearly' | 'free',
    metadata?: Record<string, any>,
  ) =>
    trackConversion('ritual_started', {
      userId,
      userEmail: email,
      planType,
      metadata,
    }),

  // Journal & Content Creation
  journalEntryCreated: (userId?: string, metadata?: Record<string, any>) =>
    trackConversion('journal_entry_created', { userId, metadata }),
  journalEntryUpdated: (userId?: string, metadata?: Record<string, any>) =>
    trackConversion('journal_entry_updated', { userId, metadata }),
  journalEntryDeleted: (userId?: string, metadata?: Record<string, any>) =>
    trackConversion('journal_entry_deleted', { userId, metadata }),
  dreamEntryCreated: (userId?: string, metadata?: Record<string, any>) =>
    trackConversion('dream_entry_created', { userId, metadata }),
  dreamEntryUpdated: (userId?: string, metadata?: Record<string, any>) =>
    trackConversion('dream_entry_updated', { userId, metadata }),
  dreamEntryDeleted: (userId?: string, metadata?: Record<string, any>) =>
    trackConversion('dream_entry_deleted', { userId, metadata }),

  // Sharing & Viral
  contentShared: (
    userId?: string,
    contentType?: string,
    platform?: string,
    metadata?: Record<string, any>,
  ) =>
    trackConversion('content_shared', {
      userId,
      metadata: { contentType, platform, ...metadata },
    }),
  horoscopeShared: (userId?: string, platform?: string) =>
    trackConversion('horoscope_shared', { userId, metadata: { platform } }),
  tarotReadingShared: (userId?: string, platform?: string) =>
    trackConversion('tarot_reading_shared', { userId, metadata: { platform } }),
  birthChartShared: (userId?: string, platform?: string) =>
    trackConversion('birth_chart_shared', { userId, metadata: { platform } }),
  referralLinkCopied: (userId?: string) =>
    trackConversion('referral_link_copied', { userId }),
  referralLinkShared: (userId?: string, platform?: string) =>
    trackConversion('referral_link_shared', {
      userId,
      metadata: { platform },
    }),
  referralCodeGenerated: (userId?: string, code?: string) =>
    trackConversion('referral_code_generated', {
      userId,
      metadata: { code },
    }),

  // Session & Engagement
  sessionStarted: (userId?: string, feature?: string) =>
    trackConversion('session_started', {
      userId,
      metadata: { feature, timestamp: Date.now() },
    }),
  sessionEnded: (userId?: string, feature?: string, durationMs?: number) =>
    trackConversion('session_ended', {
      userId,
      metadata: { feature, durationMs },
    }),
  featureFirstUse: (
    userId?: string,
    feature?: string,
    timeFromSignupMs?: number,
  ) =>
    trackConversion('feature_first_use', {
      userId,
      metadata: { feature, timeFromSignupMs },
    }),

  // Search & Discovery
  grimoireSearchPerformed: (userId?: string, query?: string) =>
    trackConversion('grimoire_search_performed', {
      userId,
      metadata: { query },
    }),
  grimoireArticleOpened: (userId?: string, articleId?: string) =>
    trackConversion('grimoire_article_opened', {
      userId,
      metadata: { articleId },
    }),

  // Personalization
  preferencesUpdated: (userId?: string, preferences?: Record<string, any>) =>
    trackConversion('preferences_updated', { userId, metadata: preferences }),
  settingsChanged: (userId?: string, setting?: string, value?: any) =>
    trackConversion('settings_changed', {
      userId,
      metadata: { setting, value },
    }),
  notificationPreferenceChanged: (
    userId?: string,
    preference?: string,
    enabled?: boolean,
  ) =>
    trackConversion('notification_preference_changed', {
      userId,
      metadata: { preference, enabled },
    }),
  birthDataCompleted: (userId?: string) =>
    trackConversion('birth_data_completed', { userId }),
  birthLocationUpdated: (userId?: string, location?: string) =>
    trackConversion('birth_location_updated', {
      userId,
      metadata: { location },
    }),

  // Payment & Revenue
  paymentFailed: (
    userId?: string,
    reason?: string,
    amount?: number,
    planType?: string,
  ) =>
    trackConversion('payment_failed', {
      userId,
      metadata: { reason, amount, planType },
    }),
  paymentRetryAttempted: (userId?: string, attempt?: number) =>
    trackConversion('payment_retry_attempted', {
      userId,
      metadata: { attempt },
    }),
  paymentRetrySuccess: (userId?: string) =>
    trackConversion('payment_retry_success', { userId }),
  paymentMethodAdded: (userId?: string, methodType?: string) =>
    trackConversion('payment_method_added', {
      userId,
      metadata: { methodType },
    }),
  checkoutStarted: (userId?: string, planType?: string, amount?: number) =>
    trackConversion('checkout_started', {
      userId,
      metadata: { planType, amount },
    }),
  checkoutAbandoned: (userId?: string, step?: string) =>
    trackConversion('checkout_abandoned', { userId, metadata: { step } }),

  // Subscription & Lifecycle
  subscriptionCancelled: (userId?: string, planType?: string) =>
    trackConversion('subscription_cancelled', {
      userId,
      metadata: { planType },
    }),
  subscriptionCancellationReason: (
    userId?: string,
    reason?: string,
    reasonCategory?: string,
  ) =>
    trackConversion('subscription_cancellation_reason', {
      userId,
      metadata: { reason, reasonCategory },
    }),
  subscriptionPlanUpgraded: (
    userId?: string,
    fromPlan?: string,
    toPlan?: string,
  ) =>
    trackConversion('subscription_plan_upgraded', {
      userId,
      metadata: { fromPlan, toPlan },
    }),
  subscriptionPlanDowngraded: (
    userId?: string,
    fromPlan?: string,
    toPlan?: string,
  ) =>
    trackConversion('subscription_plan_downgraded', {
      userId,
      metadata: { fromPlan, toPlan },
    }),
  subscriptionRefunded: (userId?: string, amount?: number, reason?: string) =>
    trackConversion('subscription_refunded', {
      userId,
      metadata: { amount, reason },
    }),

  // Paywall & Conversion
  paywallShown: (userId?: string, feature?: string, impressionCount?: number) =>
    trackConversion('paywall_shown', {
      userId,
      metadata: { feature, impressionCount },
    }),
  paywallAccepted: (userId?: string, feature?: string) =>
    trackConversion('paywall_accepted', { userId, metadata: { feature } }),
  paywallDismissed: (userId?: string, feature?: string) =>
    trackConversion('paywall_dismissed', { userId, metadata: { feature } }),
  upgradeMotivationIdentified: (userId?: string, motivation?: string) =>
    trackConversion('upgrade_motivation_identified', {
      userId,
      metadata: { motivation },
    }),

  // Retention & Reactivation
  userReactivated: (userId?: string, dormancyDays?: number, source?: string) =>
    trackConversion('user_reactivated', {
      userId,
      metadata: { dormancyDays, source },
    }),
  loginStreakMilestone: (userId?: string, days?: number) =>
    trackConversion('login_streak_milestone', {
      userId,
      metadata: { days },
    }),
  streakBroken: (userId?: string, previousDays?: number) =>
    trackConversion('streak_broken', { userId, metadata: { previousDays } }),
  notificationOpened: (userId?: string, notificationType?: string) =>
    trackConversion('notification_opened', {
      userId,
      metadata: { notificationType },
    }),
  notificationClicked: (userId?: string, notificationType?: string) =>
    trackConversion('notification_clicked', {
      userId,
      metadata: { notificationType },
    }),

  // Support & Feedback
  helpRequested: (userId?: string, feature?: string) =>
    trackConversion('help_requested', { userId, metadata: { feature } }),
  supportTicketSubmitted: (userId?: string, category?: string) =>
    trackConversion('support_ticket_submitted', {
      userId,
      metadata: { category },
    }),
  featureRequestSubmitted: (userId?: string, request?: string) =>
    trackConversion('feature_request_submitted', {
      userId,
      metadata: { request },
    }),
  bugReportSubmitted: (userId?: string, bugDescription?: string) =>
    trackConversion('bug_report_submitted', {
      userId,
      metadata: { bugDescription },
    }),
  feedbackSubmitted: (userId?: string, rating?: number, feedback?: string) =>
    trackConversion('feedback_submitted', {
      userId,
      metadata: { rating, feedback },
    }),
};
