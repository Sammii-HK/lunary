'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount } from 'jazz-tools/react';

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

async function syncProfileToPostgres(profile: any, userId: string) {
  try {
    const dataToSync: any = {};

    if (profile?.name) dataToSync.name = profile.name;
    if (profile?.birthday) dataToSync.birthday = profile.birthday;
    if (profile?.stripeCustomerId)
      dataToSync.stripeCustomerId = profile.stripeCustomerId;

    if (Object.keys(dataToSync).length === 0) return;

    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dataToSync),
    });

    if (profile?.birthChart) {
      await fetch('/api/profile/birth-chart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ birthChart: profile.birthChart }),
      });
    }

    if (profile?.personalCard) {
      await fetch('/api/profile/personal-card', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ personalCard: profile.personalCard }),
      });
    }

    if (profile?.location) {
      await fetch('/api/profile/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ location: profile.location }),
      });
    }

    console.log('✅ Auto-migrated profile to PostgreSQL');
  } catch (error) {
    console.error('Failed to sync profile to PostgreSQL:', error);
  }
}

export function useProfile(): ProfileHookResult {
  const { me } = useAccount();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (me === undefined) {
      setLoading(true);
      return;
    }
    setLoading(false);

    const userId = (me as any)?.id;
    if (me?.profile && userId && !hasSynced.current) {
      hasSynced.current = true;
      syncProfileToPostgres(me.profile, userId);
    }
  }, [me]);

  const refetch = useCallback(async () => {
    hasSynced.current = false;
  }, []);

  const profile: UserProfile | undefined = me?.profile
    ? {
        name: (me.profile as any).name,
        birthday: (me.profile as any).birthday,
        birthChart: (me.profile as any).birthChart,
        personalCard: (me.profile as any).personalCard,
        location: (me.profile as any).location,
        stripeCustomerId: (me.profile as any).stripeCustomerId,
      }
    : undefined;

  return {
    me: me
      ? {
          id: (me as any).id,
          profile,
        }
      : null,
    loading,
    error,
    refetch,
  };
}

export function useAutoMigratingAccount() {
  const jazzAccount = useAccount();
  const hasSynced = useRef(false);

  useEffect(() => {
    const me = jazzAccount.me;
    const userId = (me as any)?.id;
    if (me?.profile && userId && !hasSynced.current) {
      hasSynced.current = true;
      syncProfileToPostgres(me.profile, userId);
    }
  }, [jazzAccount.me]);

  return jazzAccount;
}
