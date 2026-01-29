/**
 * Demo interaction tracking
 * Tracks user interactions with the demo iframe to measure engagement
 */

export type DemoEvent =
  | 'spread_pulled'
  | 'card_clicked'
  | 'crystal_viewed'
  | 'horoscope_viewed'
  | 'numerology_viewed'
  | 'grimoire_blocked'
  | 'upgrade_clicked'
  | 'signup_clicked';

interface DemoTrackingEvent {
  event: DemoEvent;
  metadata?: Record<string, any>;
}

/**
 * Track a demo interaction event
 * This sends events to PostHog for analytics
 */
export function trackDemoEvent(
  event: DemoEvent,
  metadata?: Record<string, any>,
) {
  // Only track in browser
  if (typeof window === 'undefined') return;

  // Check if PostHog is available
  if (typeof window.posthog !== 'undefined') {
    window.posthog.capture(`demo_${event}`, {
      ...metadata,
      demo_mode: true,
    });
  } else {
    // Fallback: log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Demo Tracking]', event, metadata);
    }
  }
}

// TypeScript declaration for PostHog
declare global {
  interface Window {
    posthog?: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
    };
  }
}
