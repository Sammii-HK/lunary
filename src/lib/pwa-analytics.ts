'use client';

/**
 * PWA install funnel analytics.
 *
 * Thin wrapper around the existing `trackEvent` analytics primitive in
 * `src/lib/analytics.ts`. This module deliberately does NOT import posthog
 * directly — it routes everything through the same pipeline as the rest of
 * the app so that PostHog, Vercel Analytics and the internal `/api/ether/cv`
 * funnel all stay in lockstep.
 *
 * Events are written under the `feature_first_use` ConversionEvent type
 * with a stable `featureName` of `pwa_*` so we can filter the install
 * funnel without expanding the union type in `analytics.ts`. The `metadata`
 * carries the structured detail (variant, trigger, platform, source).
 */

import { trackEvent } from '@/lib/analytics';

export type PwaPlatform = 'ios' | 'android' | 'desktop' | 'unknown';
export type PwaInstallSource =
  | 'beforeinstallprompt'
  | 'manual_ios'
  | 'twa'
  | 'unknown';

const SESSION_FLAG_KEY = 'lunary:pwa-session-tracked';

/**
 * Detect the visitor's platform from the user agent + display mode.
 *
 * This is intentionally separate from `src/lib/platform-detect.ts` —
 * that helper returns `'web' | 'android' | 'ios' | 'pwa'` and is biased
 * toward Capacitor native detection. For the PWA install flow we care
 * about which install path to surface (iOS Safari vs Android Chrome vs
 * desktop), so we look at the UA string instead.
 */
export function detectPlatform(): PwaPlatform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent || '';

  // iPad on iOS 13+ reports as Mac — disambiguate via touch points.
  const isIPadOS =
    /Macintosh/i.test(ua) &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1;

  if (/iPhone|iPod/i.test(ua) || isIPadOS || /iPad/i.test(ua)) {
    return 'ios';
  }

  if (/Android/i.test(ua)) {
    return 'android';
  }

  if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) {
    return 'desktop';
  }

  return 'unknown';
}

/**
 * Returns true if the page is currently running as an installed PWA / TWA.
 * Uses the standard display-mode media query plus the iOS Safari fallback.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return true;
    }
  } catch {
    // matchMedia unavailable — fall through to navigator.standalone
  }

  // iOS Safari sets navigator.standalone when launched from home screen
  const navAny = navigator as unknown as { standalone?: boolean };
  if (typeof navAny.standalone === 'boolean' && navAny.standalone) {
    return true;
  }

  // Android TWA injects this referrer
  if (
    typeof document !== 'undefined' &&
    document.referrer &&
    document.referrer.startsWith('android-app://')
  ) {
    return true;
  }

  return false;
}

/** Fired when the install bottom sheet / modal is shown to the user. */
export function trackPwaPromptShown(
  variant: string,
  trigger: string,
  platform: PwaPlatform,
): void {
  trackEvent('feature_first_use', {
    featureName: 'pwa_prompt_shown',
    metadata: {
      pwa_event: 'prompt_shown',
      variant,
      trigger,
      platform,
    },
  });
}

/** Fired when the user clicks Install or "Maybe later" in the prompt. */
export function trackPwaPromptClicked(
  variant: string,
  accepted: boolean,
): void {
  trackEvent('feature_first_use', {
    featureName: 'pwa_prompt_clicked',
    metadata: {
      pwa_event: 'prompt_clicked',
      variant,
      accepted,
    },
  });
}

/** Fired on the `appinstalled` window event (or detected TWA / iOS launch). */
export function trackPwaInstalled(source: PwaInstallSource): void {
  trackEvent('feature_first_use', {
    featureName: 'pwa_installed',
    metadata: {
      pwa_event: 'installed',
      source,
    },
  });
}

/**
 * Fired once per session when a user opens Lunary, capturing whether they're
 * already running it as a PWA. Used to size the "already installed" cohort
 * vs the addressable install audience.
 */
export function trackPwaSessionStarted(standalone: boolean): void {
  if (typeof window === 'undefined') return;

  // Once per session — guarded by sessionStorage so refreshes don't re-fire.
  try {
    if (window.sessionStorage.getItem(SESSION_FLAG_KEY)) return;
    window.sessionStorage.setItem(SESSION_FLAG_KEY, '1');
  } catch {
    // sessionStorage unavailable — emit anyway, dedupe at the dashboard layer
  }

  trackEvent('feature_first_use', {
    featureName: 'pwa_session_started',
    metadata: {
      pwa_event: 'session_started',
      isStandalone: standalone,
      platform: detectPlatform(),
    },
  });
}

/**
 * Wires up the global `appinstalled` event so we capture installs that
 * happen via the Chrome-managed mini-infobar (i.e. when our prompt isn't
 * the trigger). Returns a cleanup function. Safe to call from a `useEffect`.
 */
export function attachAppInstalledListener(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handler = () => {
    trackPwaInstalled('beforeinstallprompt');
  };

  window.addEventListener('appinstalled', handler);
  return () => window.removeEventListener('appinstalled', handler);
}
