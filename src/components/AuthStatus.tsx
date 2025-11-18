'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-tools/react';
import { betterAuthClient } from '@/lib/auth-client';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  profile: any | null;
  loading: boolean;
}

// Skip auth checks ONLY in Playwright e2e tests (NOT Jest unit tests)
function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Jest unit tests run in jsdom (Node.js), not real browser
  // Only skip for Playwright e2e tests which run in real browser
  return (
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'))
  );
}

export function useAuthStatus(): AuthState {
  const { me } = useAccount();

  // Always call hooks - don't return early
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state based on test mode
    if (isTestMode()) {
      return {
        isAuthenticated: false,
        user: null,
        profile: null,
        loading: false,
      };
    }
    return {
      isAuthenticated: false,
      user: null,
      profile: null,
      loading: true,
    };
  });

  useEffect(() => {
    // Skip API call in test mode
    if (isTestMode()) {
      return;
    }

    let isMounted = true;

    const checkAuth = async () => {
      try {
        const session = await betterAuthClient.getSession();
        const user =
          session && typeof session === 'object'
            ? 'user' in session
              ? (session as any).user
              : ((session as any)?.data?.user ?? null)
            : null;

        if (isMounted) {
          setAuthState({
            isAuthenticated: !!user,
            user,
            profile: me?.profile || null,
            loading: false,
          });
        }
      } catch (error) {
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            profile: me?.profile || null,
            loading: false,
          });
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [me]);

  return authState;
}
