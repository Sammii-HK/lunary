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

export function useAuthStatus(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    profile: null,
    loading: true,
  });

  const { me } = useAccount();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Add timeout to prevent hanging in local dev
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Auth check timeout'));
          }, 5000); // 5 second timeout
        });

        const sessionPromise = betterAuthClient.getSession();
        const session = await Promise.race([sessionPromise, timeoutPromise]);
        const user = session?.data?.user || null;

        if (isMounted) {
          setAuthState({
            isAuthenticated: !!user,
            user,
            profile: me?.profile || null,
            loading: false,
          });
        }
      } catch (error) {
        // In local dev, gracefully handle auth failures
        if (isMounted) {
          console.warn(
            'Auth check failed or timed out (local dev safe):',
            error,
          );
          setAuthState({
            isAuthenticated: false,
            user: null,
            profile: me?.profile || null, // Still show profile if available
            loading: false,
          });
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [me]);

  return authState;
}
