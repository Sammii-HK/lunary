'use client';

import { useState, useEffect, useCallback } from 'react';

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

export function useJazzMigration() {
  return { migrationComplete: true };
}

export function useProfile(): ProfileHookResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setProfile(null);
          setUserId(null);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setUserId(data.profile?.userId || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    me: userId ? { id: userId, profile: profile || undefined } : null,
    loading,
    error,
    refetch: fetchProfile,
  };
}

export function useAutoMigratingAccount() {
  const { me, loading } = useProfile();
  return { me, loading };
}
