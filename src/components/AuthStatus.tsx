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
    const checkAuth = async () => {
      try {
        const session = await betterAuthClient.getSession();
        const user = session?.data?.user || null;

        setAuthState({
          isAuthenticated: !!user,
          user,
          profile: me?.profile || null,
          loading: false,
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          profile: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, [me]);

  return authState;
}
