'use client';

import { useState, useEffect, useCallback } from 'react';
import { betterAuthClient } from '@/lib/auth-client';

export interface UserProfile {
  id?: string;
  userId?: string;
  name?: string;
  birthday?: string;
  birthChart?: any[];
  personalCard?: any;
  location?: any;
  stripeCustomerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileHookResult {
  me: {
    id?: string;
    profile?: UserProfile;
  } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProfile(): ProfileHookResult {
  const [me, setMe] = useState<{ id?: string; profile?: UserProfile } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await betterAuthClient.getSession();
      const user =
        session && typeof session === 'object'
          ? 'user' in session
            ? (session as any).user
            : ((session as any)?.data?.user ?? null)
          : null;

      if (!user?.id) {
        setMe(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/profile', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMe(null);
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      setMe({
        id: user.id,
        profile: data.profile || undefined,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    me,
    loading,
    error,
    refetch: fetchProfile,
  };
}
