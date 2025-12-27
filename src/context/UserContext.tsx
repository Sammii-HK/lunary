'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuthStatus } from '@/components/AuthStatus';
import { createBirthChartWithMetadata } from 'utils/astrology/birthChartService';

export interface BirthChartPlacement {
  body: string;
  sign: string;
  degree: number;
  minute: number;
  eclipticLongitude: number;
  retrograde: boolean;
  house?: number;
}

export interface PersonalCard {
  name: string;
  keywords: string[];
  information: string;
  calculatedDate: string;
  reason: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
  birthTime?: string;
  birthLocation?: string;
  birthTimezone?: string;
}

export interface UserData {
  id: string;
  name?: string;
  email?: string;
  birthday?: string;
  birthChart?: BirthChartPlacement[];
  personalCard?: PersonalCard;
  location?: UserLocation;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  hasBirthChart: boolean;
  hasPersonalCard: boolean;
  isPaid: boolean;
}

interface UserContextValue {
  user: UserData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateProfile: (
    data: Partial<Pick<UserData, 'name' | 'birthday' | 'location'>>,
  ) => Promise<boolean>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const authStatus = useAuthStatus();
  const isAuthenticated = authStatus.isAuthenticated;
  const userId = authStatus.user?.id;
  const userEmail = authStatus.user?.email;
  const userName = authStatus.user?.name;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const birthChartRefreshRef = useRef(false);
  const BIRTH_CHART_VERSION = 3;

  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      const profile = data.profile;
      const subscription = data.subscription;

      const birthChart = profile?.birthChart as
        | BirthChartPlacement[]
        | undefined;
      const personalCard = profile?.personalCard as PersonalCard | undefined;
      const status = subscription?.status || 'free';

      setUser({
        id: userId,
        name: profile?.name || userName || undefined,
        email: userEmail || undefined,
        birthday: profile?.birthday || undefined,
        birthChart,
        personalCard,
        location: profile?.location || undefined,
        stripeCustomerId: subscription?.stripeCustomerId || undefined,
        subscriptionStatus: status,
        subscriptionPlan: subscription?.planType || undefined,
        hasBirthChart: !!(birthChart && birthChart.length > 0),
        hasPersonalCard: !!personalCard,
        isPaid: ['active', 'trial', 'trialing'].includes(status),
      });
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Still set basic user info even if profile fetch fails
      setUser({
        id: userId,
        name: userName || undefined,
        email: userEmail || undefined,
        hasBirthChart: false,
        hasPersonalCard: false,
        isPaid: false,
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, userEmail, userName]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const refreshBirthChart = async () => {
      if (!user || birthChartRefreshRef.current) return;

      const location = (user.location || {}) as Record<string, any>;
      const birthLocation = location?.birthLocation;
      const birthTimezone = location?.birthTimezone;
      const birthTime = location?.birthTime;
      const birthChartVersion = location?.birthChartVersion;

      if (!user.birthday || !user.birthChart?.length) return;
      if (!birthLocation) return;

      const needsVersionUpdate = birthChartVersion !== BIRTH_CHART_VERSION;
      const needsTimezoneUpdate = !birthTimezone;

      if (!needsVersionUpdate && !needsTimezoneUpdate) return;

      birthChartRefreshRef.current = true;
      try {
        const { birthChart, timezone, timezoneSource } =
          await createBirthChartWithMetadata({
            birthDate: user.birthday,
            birthTime: birthTime || undefined,
            birthLocation,
            fallbackTimezone:
              Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
          });

        const resolvedTimezone =
          timezoneSource === 'location' ? timezone : birthTimezone;

        await fetch('/api/profile/birth-chart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ birthChart }),
        });

        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            location: {
              ...location,
              birthTimezone: resolvedTimezone,
              birthChartVersion: BIRTH_CHART_VERSION,
            },
          }),
        });

        await fetchUserData();
      } catch (err) {
        console.warn('Failed to refresh birth chart:', err);
      } finally {
        birthChartRefreshRef.current = false;
      }
    };

    refreshBirthChart();
  }, [user, fetchUserData]);

  const updateProfile = useCallback(
    async (
      data: Partial<Pick<UserData, 'name' | 'birthday' | 'location'>>,
    ): Promise<boolean> => {
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        if (!response.ok) return false;

        await fetchUserData();
        return true;
      } catch {
        return false;
      }
    },
    [fetchUserData],
  );

  return (
    <UserContext.Provider
      value={{ user, loading, error, refetch: fetchUserData, updateProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function useUserProfile() {
  const { user, loading } = useUser();
  return {
    name: user?.name,
    birthday: user?.birthday,
    birthChart: user?.birthChart,
    personalCard: user?.personalCard,
    location: user?.location,
    hasBirthChart: user?.hasBirthChart ?? false,
    hasPersonalCard: user?.hasPersonalCard ?? false,
    loading,
  };
}

export function useSubscriptionStatus() {
  const { user, loading } = useUser();
  return {
    status: user?.subscriptionStatus || 'free',
    plan: user?.subscriptionPlan,
    isPaid: user?.isPaid ?? false,
    loading,
  };
}
