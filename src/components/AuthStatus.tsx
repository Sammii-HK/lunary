'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
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

  return (
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'))
  );
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  profile: null,
  loading: true,
};

const AuthContext = createContext<AuthState>(defaultAuthState);

// Cache for auth state to prevent duplicate requests
let cachedAuthState: AuthState | null = null;
let authPromise: Promise<AuthState> | null = null;

export function AuthStatusProvider({ children }: { children: ReactNode }) {
  const { me } = useAccount();

  const [authState, setAuthState] = useState<AuthState>(() => {
    if (isTestMode()) {
      return { ...defaultAuthState, loading: false };
    }
    // Return cached state if available
    if (cachedAuthState) {
      return cachedAuthState;
    }
    return defaultAuthState;
  });

  useEffect(() => {
    if (isTestMode()) return;

    let isMounted = true;

    const checkAuth = async () => {
      // Only use cache if user is already authenticated
      // This ensures we re-check after sign-in
      if (
        cachedAuthState &&
        !cachedAuthState.loading &&
        cachedAuthState.isAuthenticated
      ) {
        if (isMounted) {
          setAuthState({
            ...cachedAuthState,
            profile: me?.profile || cachedAuthState.profile,
          });
        }
        return;
      }

      // If there's already a request in flight, wait for it
      if (authPromise) {
        const result = await authPromise;
        if (isMounted) {
          setAuthState({
            ...result,
            profile: me?.profile || result.profile,
          });
        }
        return;
      }

      // Make the actual request with timeout
      authPromise = (async () => {
        try {
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 5000),
          );

          const session = await Promise.race([
            betterAuthClient.getSession(),
            timeoutPromise,
          ]);

          const user =
            session && typeof session === 'object'
              ? 'user' in session
                ? (session as any).user
                : ((session as any)?.data?.user ?? null)
              : null;

          const newState: AuthState = {
            isAuthenticated: !!user,
            user,
            profile: me?.profile || null,
            loading: false,
          };
          cachedAuthState = newState;
          return newState;
        } catch {
          const newState: AuthState = {
            isAuthenticated: false,
            user: null,
            profile: me?.profile || null,
            loading: false,
          };
          cachedAuthState = newState;
          return newState;
        } finally {
          authPromise = null;
        }
      })();

      const result = await authPromise;
      if (isMounted) {
        setAuthState(result);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [me]);

  // Update profile when me changes
  useEffect(() => {
    if (me?.profile && authState.profile !== me.profile) {
      setAuthState((prev) => ({ ...prev, profile: me.profile }));
    }
  }, [me?.profile, authState.profile]);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

export function useAuthStatus(): AuthState {
  return useContext(AuthContext);
}
