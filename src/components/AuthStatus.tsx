'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { betterAuthClient } from '@/lib/auth-client';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  profile: any | null;
  loading: boolean;
}

function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'))
  );
}

function isAuthenticatedTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as any).__PLAYWRIGHT_AUTHENTICATED__ === true;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  profile: null,
  loading: true,
};

const AuthContext = createContext<
  AuthState & { refreshAuth: () => void; signOut: () => void }
>({
  ...defaultAuthState,
  refreshAuth: () => {},
  signOut: () => {},
});

let cachedAuthState: AuthState | null = null;
let authPromise: Promise<AuthState> | null = null;

export function invalidateAuthCache() {
  cachedAuthState = null;
  authPromise = null;
}

interface AuthStatusProviderProps {
  children: ReactNode;
  demoData?: {
    isAuthenticated: boolean;
    user: any;
  };
}

export function AuthStatusProvider({
  children,
  demoData,
}: AuthStatusProviderProps) {
  const isDemoMode = Boolean(demoData);

  const [authState, setAuthState] = useState<AuthState>(() => {
    // If demo mode, return demo auth state immediately
    if (isDemoMode) {
      return {
        isAuthenticated: demoData!.isAuthenticated,
        user: demoData!.user,
        profile: null,
        loading: false,
      };
    }

    if (isAuthenticatedTestMode()) {
      // Return authenticated state for Playwright authenticated tests
      return {
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
        profile: null,
        loading: false,
      };
    }
    if (isTestMode()) {
      return { ...defaultAuthState, loading: false };
    }
    if (cachedAuthState && cachedAuthState.isAuthenticated) {
      return cachedAuthState;
    }
    return defaultAuthState;
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAuth = useCallback(() => {
    invalidateAuthCache();
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Immediately update UI to logged-out state
  const signOut = useCallback(() => {
    const loggedOutState: AuthState = {
      isAuthenticated: false,
      user: null,
      profile: null,
      loading: false,
    };
    cachedAuthState = loggedOutState;
    setAuthState(loggedOutState);
  }, []);

  useEffect(() => {
    if (isDemoMode || isTestMode()) return; // Skip auth check in demo mode

    let isMounted = true;

    const checkAuth = async () => {
      // Skip if we already have a valid cached state
      if (cachedAuthState && !cachedAuthState.loading) {
        if (isMounted) {
          setAuthState(cachedAuthState);
        }
        // Only return early if authenticated - always re-check when logged out
        if (cachedAuthState.isAuthenticated) {
          return;
        }
      }

      if (authPromise) {
        const result = await authPromise;
        if (isMounted) {
          setAuthState(result);
        }
        return;
      }

      authPromise = (async () => {
        // Retry on BOTH thrown errors AND null-user responses. The null-user
        // case matters because immediately after sign-in there's a race
        // between the Set-Cookie commit and the first getSession() call at
        // /app: Better Auth can return `{ data: { user: null } }` as a
        // "successful" response before the session is readable, which would
        // otherwise cache a bogus logged-out state and kick the user back
        // to /auth. Up to 3 attempts with short backoff gives the session
        // time to propagate.
        let lastError: unknown;
        const maxAttempts = 3;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            const session = await betterAuthClient.getSession();

            const user =
              session && typeof session === 'object'
                ? 'user' in session
                  ? (session as any).user
                  : ((session as any)?.data?.user ?? null)
                : null;

            if (user) {
              const newState: AuthState = {
                isAuthenticated: true,
                user,
                profile: user,
                loading: false,
              };
              // Only cache confirmed-authenticated results. A null-user
              // response may be a propagation race, not a true logout —
              // see comment above.
              cachedAuthState = newState;
              return newState;
            }

            // Null-user: could be genuine (logged out) or transient
            // (session not visible yet). Retry up to maxAttempts before
            // accepting it, but never cache so a later mount gets a
            // fresh read.
            if (attempt < maxAttempts - 1) {
              await new Promise((r) => setTimeout(r, 400));
              continue;
            }
            return {
              isAuthenticated: false,
              user: null,
              profile: null,
              loading: false,
            };
          } catch (error) {
            lastError = error;
            if (attempt < maxAttempts - 1) {
              // Brief pause before retry so transient issues can clear.
              await new Promise((r) => setTimeout(r, 800));
            }
          }
        }
        // All attempts failed — log but do NOT cache the failure so the
        // next mount gets a fresh check rather than a persisted
        // "logged out" state.
        console.warn('Auth check failed after retries:', lastError);
        return {
          isAuthenticated: false,
          user: null,
          profile: null,
          loading: false,
        };
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
  }, [refreshTrigger]);

  return (
    <AuthContext.Provider value={{ ...authState, refreshAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStatus() {
  return useContext(AuthContext);
}
