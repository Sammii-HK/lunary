'use client';

type PostHogInstance = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  isFeatureEnabled: (flag: string) => boolean | undefined;
  getFeatureFlag: (flag: string) => string | boolean | undefined;
};

function getPostHog(): PostHogInstance | null {
  if (typeof window === 'undefined') return null;
  const posthog = (window as any).posthog;
  if (!posthog || typeof posthog.capture !== 'function') return null;
  return posthog as PostHogInstance;
}

export function captureEvent(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  const posthog = getPostHog();
  if (!posthog) return;
  posthog.capture(eventName, properties);
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
): void {
  const posthog = getPostHog();
  if (!posthog) return;
  posthog.identify(userId, properties);
}

export function isFeatureEnabled(flag: string): boolean | undefined {
  const posthog = getPostHog();
  if (!posthog) return undefined;
  return posthog.isFeatureEnabled(flag);
}

export function getFeatureFlag(flag: string): string | boolean | undefined {
  const posthog = getPostHog();
  if (!posthog) return undefined;
  return posthog.getFeatureFlag(flag);
}
