'use client';

import { createAuthClient } from 'better-auth/client';
import { jazzPluginClient } from 'jazz-tools/better-auth/auth/client';

// Detect Playwright e2e test mode (NOT Jest unit tests)
// Only skip auth checks in Playwright e2e tests, not Jest unit tests
function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Jest unit tests run in jsdom (Node.js), not real browser
  // Only skip for Playwright e2e tests which run in real browser
  const isPlaywrightTest =
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    // Check for Playwright-specific indicators
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'));

  return isPlaywrightTest;
}

// Better Auth client configuration with Jazz plugin
const authClient = createAuthClient({
  // Use environment-appropriate base URL
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000',
  fetchOptions: {
    credentials: 'include', // Include cookies in requests
    cache: 'no-store', // Never cache auth requests (important for iOS)
  },
  plugins: [jazzPluginClient()],
});

// Create a proxy that intercepts getSession calls in test mode
export const betterAuthClient = new Proxy(authClient, {
  get(target, prop) {
    // Intercept getSession in test mode
    if (prop === 'getSession' && isTestMode()) {
      return async () => {
        // Return mock session immediately without API call
        return Promise.resolve({
          data: { user: null },
          error: null,
        });
      };
    }
    // Return original property for everything else
    return (target as any)[prop];
  },
}) as typeof authClient;

// Export types for better TypeScript support
export type AuthClient = typeof betterAuthClient;
