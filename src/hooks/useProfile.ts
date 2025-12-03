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

async function checkMigrationStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/profile/migrate', {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.migrationStatus === 'completed';
  } catch {
    return false;
  }
}

async function runMigration(
  profile: any,
  jazzAccountId: string,
): Promise<boolean> {
  try {
    const birthChartData = profile?.birthChart
      ? Array.from(profile.birthChart).map((p: any) => ({
          body: p.body,
          sign: p.sign,
          degree: p.degree,
          minute: p.minute,
          eclipticLongitude: p.eclipticLongitude,
          retrograde: p.retrograde,
        }))
      : null;

    const personalCardData = profile?.personalCard
      ? {
          name: profile.personalCard.name,
          keywords: Array.from(profile.personalCard.keywords || []),
          information: profile.personalCard.information,
          calculatedDate: profile.personalCard.calculatedDate,
          reason: profile.personalCard.reason,
        }
      : null;

    const locationData = profile?.location
      ? {
          latitude: profile.location.latitude,
          longitude: profile.location.longitude,
          city: profile.location.city,
          country: profile.location.country,
          timezone: profile.location.timezone,
        }
      : null;

    const response = await fetch('/api/profile/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: profile?.name || null,
        birthday: profile?.birthday || null,
        birthChart: birthChartData,
        personalCard: personalCardData,
        location: locationData,
        stripeCustomerId: profile?.stripeCustomerId || null,
        jazzAccountId,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function useJazzMigration() {
  const hasMigrated = useRef(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  let me: any = null;
  let jazzAvailable = true;
  try {
    const result = useAccount();
    me = result.me;
  } catch {
    jazzAvailable = false;
  }

  useEffect(() => {
    if (!jazzAvailable || hasMigrated.current) return;

    const profile = me?.profile as any;
    const profileName = profile?.name?.trim();

    // Skip unauthenticated users
    if (!profileName || profileName === 'New User' || profileName === 'New') {
      return;
    }

    // Skip if no data to migrate
    const hasData =
      profile?.birthday || profile?.birthChart || profile?.personalCard;
    if (!hasData) {
      return;
    }

    const doMigration = async () => {
      try {
        const alreadyMigrated = await checkMigrationStatus();
        if (alreadyMigrated) {
          hasMigrated.current = true;
          setMigrationComplete(true);
          return;
        }

        console.log('[Migration] Migrating Jazz data for:', profileName);
        const success = await runMigration(profile, 'from-session');
        if (success) {
          console.log('[Migration] ✅ Success!');
          hasMigrated.current = true;
          setMigrationComplete(true);
        }
      } catch (err) {
        console.error('[Migration] Error:', err);
      }
    };

    doMigration();
  }, [me, jazzAvailable]);

  return { migrationComplete };
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
      runMigration(me.profile, userId);
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
      runMigration(me.profile, userId);
    }
  }, [jazzAccount.me]);

  return jazzAccount;
}
