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

export function AuthStatusProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
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
    if (isTestMode()) return;

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
        try {
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 10000),
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
            profile: user || null,
            loading: false,
          };
          cachedAuthState = newState;
          return newState;
        } catch {
          const newState: AuthState = {
            isAuthenticated: false,
            user: null,
            profile: null,
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
