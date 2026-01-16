import { getPostHogServer } from './posthog-server';

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

type EventCaptureArgs = {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
};

export function forwardEventToPostHog(args: EventCaptureArgs): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  try {
    posthog.capture({
      distinctId: args.distinctId,
      event: args.event,
      properties: {
        ...(args.properties || {}),
        posthog_api_host: POSTHOG_HOST,
      },
    });
  } catch (error) {
    console.error('[PostHog Forward] Failed to capture event', {
      event: args.event,
      distinctId: args.distinctId,
      error,
    });
  }
}

export function aliasPostHogUser(userId: string, anonymousId: string): void {
  const posthog = getPostHogServer();
  if (!posthog) return;
  if (!anonymousId || anonymousId === userId) return;

  try {
    posthog.alias({
      distinctId: userId,
      alias: anonymousId,
    });
  } catch (error) {
    console.error('[PostHog Forward] Failed to alias user', {
      userId,
      anonymousId,
      error,
    });
  }
}
