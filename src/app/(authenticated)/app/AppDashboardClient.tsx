'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { recordCheckIn } from '@/lib/streak/check-in';
import { conversionTracking } from '@/lib/analytics';
import { useTour } from '@/context/TourContext';

import { ShareDailyInsight } from '@/components/ShareDailyInsight';
import { TourTrigger } from '@/components/feature-tour/tour-trigger';

const DateWidget = dynamic(
  () =>
    import('@/components/DateWidget').then((m) => ({
      default: m.DateWidget,
    })),
  {
    loading: () => (
      <div className='h-6 w-48 bg-zinc-800/50 rounded animate-pulse mx-auto' />
    ),
    ssr: false,
  },
);
import dayjs from 'dayjs';

const MoonPreview = dynamic(
  () =>
    import('@/components/compact/MoonPreview').then((m) => ({
      default: m.MoonPreview,
    })),
  {
    loading: () => (
      <div className='h-20 bg-zinc-900/50 rounded-md animate-pulse' />
    ),
    ssr: false,
  },
);

const TransitOfTheDay = dynamic(
  () =>
    import('@/components/TransitOfTheDay').then((m) => ({
      default: m.TransitOfTheDay,
    })),
  {
    loading: () => (
      <div className='h-16 bg-zinc-900/50 rounded-md animate-pulse' />
    ),
    ssr: false,
  },
);

const DailyInsightCard = dynamic(
  () =>
    import('@/components/compact/DailyInsightCard').then((m) => ({
      default: m.DailyInsightCard,
    })),
  {
    loading: () => (
      <div className='h-20 bg-zinc-900/50 rounded-md animate-pulse' />
    ),
    ssr: false,
  },
);

const DailyCardPreview = dynamic(
  () =>
    import('@/components/compact/DailyCardPreview').then((m) => ({
      default: m.DailyCardPreview,
    })),
  {
    loading: () => (
      <div className='h-20 bg-zinc-900/50 rounded-md animate-pulse' />
    ),
    ssr: false,
  },
);

const PersonalizedHoroscopePreview = dynamic(
  () =>
    import('@/components/compact/PersonalizedHoroscopePreview').then((m) => ({
      default: m.PersonalizedHoroscopePreview,
    })),
  {
    loading: () => <div className='min-h-0' />,
    ssr: false,
  },
);

const CrystalPreview = dynamic(
  () =>
    import('@/components/compact/CrystalModal').then((m) => ({
      default: m.CrystalPreview,
    })),
  {
    loading: () => (
      <div className='h-16 bg-zinc-900/50 rounded-md animate-pulse' />
    ),
    ssr: false,
  },
);

const SkyNowCard = dynamic(
  () =>
    import('@/components/compact/SkyNowCard').then((m) => ({
      default: m.SkyNowCard,
    })),
  {
    loading: () => (
      <div className='h-24 bg-zinc-900/50 rounded-md animate-pulse' />
    ),
    ssr: false,
  },
);

const PostTrialMessaging = dynamic(
  () =>
    import('@/components/PostTrialMessaging').then((m) => ({
      default: m.PostTrialMessaging,
    })),
  {
    ssr: false,
    loading: () => <div className='min-h-0' />,
  },
);

const ConditionalWheel = dynamic(
  () => import('@/components/ConditionalWheel'),
  {
    loading: () => <div className='min-h-0' />,
    ssr: false,
  },
);

export default function AppDashboardClient() {
  const { user } = useUser();
  const authState = useAuthStatus();
  const { startTour, hasSeenOnboarding } = useTour();
  const [focusHonoured, setFocusHonoured] = useState(false);
  const firstName = user?.name?.trim() ? user.name.split(' ')[0] : null;

  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      recordCheckIn();
    }
  }, [authState.isAuthenticated, authState.loading]);

  const today = new Date().toISOString().split('T')[0];
  useEffect(() => {
    if (!authState.isAuthenticated || authState.loading) return;
    if (typeof window === 'undefined') return;

    const userId = authState.user?.id ? String(authState.user.id) : 'anon';
    const key = `lunary_daily_dashboard_viewed:${userId}:${today}`;

    if (localStorage.getItem(key)) {
      return;
    }

    localStorage.setItem(key, '1');
    conversionTracking.dailyDashboardViewed(
      authState.user?.id,
      authState.user?.email,
    );
  }, [
    authState.isAuthenticated,
    authState.loading,
    authState.user?.id,
    authState.user?.email,
    today,
  ]);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setFocusHonoured(false);
      return;
    }
    if (typeof window === 'undefined') return;

    const key = 'lunary_focus_complete_date';
    const todayString = new Date().toISOString().split('T')[0];

    const updateCompletion = () => {
      setFocusHonoured(localStorage.getItem(key) === todayString);
    };

    updateCompletion();
    window.addEventListener('lunary-focus-complete', updateCompletion);

    return () => {
      window.removeEventListener('lunary-focus-complete', updateCompletion);
    };
  }, [authState.isAuthenticated]);

  const greeting = () => {
    const hasBirthday = Boolean(user?.birthday);
    const isBirthday =
      hasBirthday &&
      dayjs(user!.birthday).format('MM-DD') === dayjs(today).format('MM-DD');
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (isBirthday) return 'Happy birthday';
    return 'Good evening';
  };

  return (
    <div className='dashboard-container flex w-full flex-col gap-4 max-w-2xl md:max-w-4xl mx-auto p-4 mb-10'>
      <h1 className='sr-only'>Lunary - Your Daily Cosmic Guide</h1>

      <PostTrialMessaging />

      <header className='py-4'>
        <div className='flex items-center justify-between mb-2'>
          <div className='w-16' />
          <p className='text-lg text-zinc-300 text-center flex-1'>
            {greeting()}
            {firstName && (
              <>
                ,{' '}
                <Link
                  href='/profile'
                  className='text-lunary-accent hover:text-lunary-accent-300 transition-colors'
                >
                  {firstName}
                </Link>
              </>
            )}
          </p>
          <div className='w-16 flex justify-end'>
            <ShareDailyInsight />
          </div>
        </div>
        <div className='text-center'>
          <DateWidget />
          <div className='mt-2'>
            <TourTrigger
              onStartTour={() => startTour('first_time_onboarding')}
              hasSeenOnboarding={hasSeenOnboarding}
            />
          </div>
        </div>
      </header>

      <PersonalizedHoroscopePreview />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <MoonPreview />
        <SkyNowCard />

        <DailyInsightCard />
        <DailyCardPreview />

        <TransitOfTheDay />
        <CrystalPreview />

        <div className='md:col-span-2'>
          <ConditionalWheel />
        </div>
      </div>
      {authState.isAuthenticated && (
        <p className='text-xs text-zinc-500 text-center mt-4'>
          {focusHonoured
            ? "You've honoured today's focus."
            : "You've checked in with today's sky."}
        </p>
      )}
      {authState.isAuthenticated && focusHonoured && (
        <p className='text-[0.65rem] text-zinc-400 text-center'>
          Tomorrow feels calm, steady light.
        </p>
      )}
    </div>
  );
}
