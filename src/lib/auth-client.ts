"use client";

import { createAuthClient } from "better-auth/client";
import { jazzPluginClient } from "jazz-tools/better-auth/auth/client";

// Better Auth client configuration with Jazz plugin
export const betterAuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    jazzPluginClient(),
  ],
});

// Export types for better TypeScript support
export type AuthClient = typeof betterAuthClient;
