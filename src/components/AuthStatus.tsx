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
