'use client';

import { createAuthClient } from 'better-auth/client';
import { jazzPluginClient } from 'jazz-tools/better-auth/auth/client';

// Better Auth client configuration with Jazz plugin
export const betterAuthClient = createAuthClient({
  // Use environment-appropriate base URL
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  fetchOptions: {
    credentials: 'include', // Include cookies in requests
    cache: 'no-store', // Never cache auth requests (important for iOS)
  },
  plugins: [jazzPluginClient()],
});

// Export types for better TypeScript support
export type AuthClient = typeof betterAuthClient;
