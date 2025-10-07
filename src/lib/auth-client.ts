'use client';

import { createAuthClient } from 'better-auth/client';
import { jazzPluginClient } from 'jazz-tools/better-auth/auth/client';

// Better Auth client configuration with Jazz plugin
export const betterAuthClient = createAuthClient({
  // Use the correct port for development
  baseURL: 'http://localhost:3000',
  fetchOptions: {
    credentials: 'include', // Include cookies in requests
  },
  plugins: [jazzPluginClient()],
});

// Export types for better TypeScript support
export type AuthClient = typeof betterAuthClient;
