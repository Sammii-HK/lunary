'use client';

import { createAuthClient } from 'better-auth/client';

// Detect Playwright e2e test mode (NOT Jest unit tests)
function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;

  const isPlaywrightTest =
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'));

  return isPlaywrightTest;
}

// Better Auth client - NO Jazz plugin (handled server-side with fallback)
const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000',
  fetchOptions: {
    credentials: 'include',
    cache: 'no-store',
  },
  // No plugins - Jazz fallback is handled server-side
  plugins: [],
});

// Proxy for test mode
export const betterAuthClient = new Proxy(authClient, {
  get(target, prop) {
    if (prop === 'getSession' && isTestMode()) {
      return async () => {
        return Promise.resolve({
          data: { user: null },
          error: null,
        });
      };
    }

    return (target as any)[prop];
  },
}) as typeof authClient;

export type AuthClient = typeof betterAuthClient;
