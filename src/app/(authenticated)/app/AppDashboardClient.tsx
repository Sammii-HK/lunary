'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { recordCheckIn } from '@/lib/streak/check-in';
import { conversionTracking } from '@/lib/analytics';
import { useTour } from '@/context/TourContext';
import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';
import { useABTestTracking } from '@/hooks/useABTestTracking';
import { useWidgetSync } from '@/hooks/useWidgetSync';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

import { ShareDailyInsight } from '@/components/ShareDailyInsight';
import { ShareDailyCosmicState } from '@/components/share/ShareDailyCosmicState';
import { ShareZodiacSeason } from '@/components/share/ShareZodiacSeason';
import { TourTrigger } from '@/components/feature-tour/tour-trigger';
import { useMilestones } from '@/hooks/useMilestones';

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
import { isInDemoMode } from '@/lib/demo-mode';

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
    loading: () => (
      <div className='bg-gradient-to-br from-lunary-primary-900/30 to-lunary-accent-900/20 rounded-xl p-4 border border-lunary-primary-800/30 animate-pulse'>
        <div className='h-4 bg-lunary-primary-800/30 rounded w-3/4 mb-3' />
        <div className='h-3 bg-lunary-primary-800/20 rounded w-full mb-2' />
        <div className='h-3 bg-lunary-primary-800/20 rounded w-5/6' />
      </div>
    ),
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

const CosmicScore = dynamic(
  () =>
    import('@/components/CosmicScore').then((m) => ({
      default: m.CosmicScore,
    })),
  {
    loading: () => (
      <div className='h-24 bg-zinc-900/50 rounded-2xl animate-pulse' />
    ),
    ssr: false,
  },
);

const RetrogradeBanner = dynamic(
  () =>
    import('@/components/retrograde/RetrogradeBanner').then((m) => ({
      default: m.RetrogradeBanner,
    })),
  {
    loading: () => <div className='min-h-0' />,
    ssr: false,
  },
);

const EveningRitualSheet = dynamic(
  () =>
    import('@/components/rituals/EveningRitualSheet').then((m) => ({
      default: m.EveningRitualSheet,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

const ConditionalWheel = dynamic(
  () => import('@/components/ConditionalWheel'),
  {
    loading: () => <div className='min-h-0' />,
    ssr: false,
  },
);

const MilestoneCelebration = dynamic(
  () =>
    import('@/components/milestones/MilestoneCelebration').then((m) => ({
      default: m.MilestoneCelebration,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

const WeeklyChallengeCard = dynamic(
  () =>
    import('@/components/challenges/WeeklyChallengeCard').then((m) => ({
      default: m.WeeklyChallengeCard,
    })),
  {
    loading: () => (
      <div className='h-24 bg-zinc-900/50 rounded-xl animate-pulse' />
    ),
    ssr: false,
  },
);

export default function AppDashboardClient() {
  const { user } = useUser();
  const authState = useAuthStatus();
  const { startTour, hasSeenOnboarding } = useTour();
  const [focusHonoured, setFocusHonoured] = useState(false);
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    router.refresh();
    // Small delay so the user sees the refresh indicator
    await new Promise((resolve) => setTimeout(resolve, 600));
  }, [router]);

  const { containerRef, pullDistance, isRefreshing, progress } =
    usePullToRefresh({ onRefresh: handleRefresh });

  // Track dashboard view with A/B test data (cta-copy-test)
  useABTestTracking('dashboard', 'app_opened', ['cta-copy-test']);

  // Sync widget data when dashboard loads (native platforms only)
  useWidgetSync({ enabled: authState.isAuthenticated });
  const firstName = user?.name?.trim() ? user.name.split(' ')[0] : null;
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [moonExpanded, setMoonExpanded] = useState<boolean>(false);
  const [skyNowExpanded, setSkyNowExpanded] = useState<boolean>(false);
  const [showEveningRitual, setShowEveningRitual] = useState(false);
  const isEvening = new Date().getHours() >= 18;
  const { uncelebrated: uncelebratedMilestone, celebrate: celebrateMilestone } =
    useMilestones();

  // Defer heavy components for faster initial render
  const [showHoroscope, setShowHoroscope] = useState(false);

  // Detect demo mode from context OR DOM (for reliability on tab changes)
  useEffect(() => {
    const checkDemoMode = () => {
      setIsDemoMode(isInDemoMode());
    };

    checkDemoMode();
  }, []);

  // Auto-expand logic
  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: scroll to Sky Now, expand it, then collapse after a few seconds
      const scrollTimeout = setTimeout(() => {
        const skyNowEl = document.getElementById('sky-now');
        skyNowEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
      const expandTimeout = setTimeout(() => {
        setSkyNowExpanded(true);
      }, 1500);
      const collapseTimeout = setTimeout(() => {
        setSkyNowExpanded(false);
      }, 5000);
      return () => {
        clearTimeout(scrollTimeout);
        clearTimeout(expandTimeout);
        clearTimeout(collapseTimeout);
      };
    } else {
      // Non-demo mode: auto-expand moon and sky now on desktop immediately
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (isDesktop) {
        setMoonExpanded(true);
        setSkyNowExpanded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  // Handle moon preview toggle
  const handleMoonToggle = (isExpanded: boolean) => {
    setMoonExpanded(isExpanded);
  };

  // Handle push notification deep links
  useNotificationDeepLink();

  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      recordCheckIn();
      // Auto-join community spaces (fire-and-forget, once per session)
      const joined = sessionStorage.getItem('community_auto_joined');
      if (!joined) {
        fetch('/api/community/auto-join', { method: 'POST' }).catch(() => {});
        sessionStorage.setItem('community_auto_joined', '1');
      }
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

  // Prefetch horoscope data early, but defer component render
  useEffect(() => {
    if (authState.isAuthenticated && user?.birthday) {
      // Prefetch the API in background
      fetch('/api/horoscope/daily', { credentials: 'include' }).catch(() => {
        // Silent fail - component will handle fallback
      });
    }
  }, [authState.isAuthenticated, user?.birthday]);

  // Defer PersonalizedHoroscopePreview for faster initial load
  useEffect(() => {
    // Wait for page to be interactive before loading heavy component
    const timer = setTimeout(() => {
      setShowHoroscope(true);
    }, 100); // Small delay to prioritize above-the-fold content

    return () => clearTimeout(timer);
  }, []);

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
    <div ref={containerRef}>
      {/* Pull-to-refresh indicator */}
      <div
        className='flex items-center justify-center overflow-hidden transition-all duration-200'
        style={{ height: pullDistance > 0 || isRefreshing ? pullDistance : 0 }}
      >
        <div
          className='text-zinc-400'
          style={{
            opacity: progress,
            transform: `rotate(${progress * 360}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s ease',
          }}
        >
          <svg
            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M21 12a9 9 0 1 1-6.22-8.56' />
          </svg>
        </div>
      </div>

      <div
        id='dashboard-container'
        className='dashboard-container flex w-full flex-col gap-4 max-w-2xl md:max-w-4xl mx-auto p-4 mb-10'
      >
        <h1 className='sr-only'>Lunary - Your Daily Cosmic Guide</h1>

        <PostTrialMessaging />

        <header>
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
            <div className='flex justify-end gap-2'>
              <ShareDailyInsight />
              <ShareDailyCosmicState compact />
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

        {/* Zodiac Season Banner */}
        <ShareZodiacSeason />

        <CosmicScore />

        <RetrogradeBanner />

        {authState.isAuthenticated && isEvening && (
          <button
            onClick={() => setShowEveningRitual(true)}
            className='w-full bg-gradient-to-r from-lunary-primary-900/40 to-indigo-900/30 border border-lunary-primary-800/30 rounded-xl p-3 flex items-center gap-3 hover:border-lunary-primary-700/50 transition-colors'
          >
            <span className='text-lg'>🌙</span>
            <div className='text-left flex-1'>
              <p className='text-sm text-white font-medium'>Evening Ritual</p>
              <p className='text-xs text-zinc-400'>
                Reflect on your day with a quick mood check-in
              </p>
            </div>
          </button>
        )}

        {showHoroscope && <PersonalizedHoroscopePreview />}

        <div
          id='dashboard-main-grid'
          className={`grid gap-3 ${isDemoMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
        >
          <div id='moon-phase' className='scroll-mt-20'>
            <MoonPreview
              isExpanded={moonExpanded}
              onToggle={handleMoonToggle}
            />
          </div>
          <div id='sky-now' className='scroll-mt-20'>
            <SkyNowCard
              isExpanded={skyNowExpanded}
              onToggle={(expanded) => setSkyNowExpanded(expanded)}
            />
          </div>
          <DailyInsightCard />
          <DailyCardPreview />

          <div id='transit-of-day' className='scroll-mt-20'>
            <TransitOfTheDay />
          </div>
          <CrystalPreview />

          {authState.isAuthenticated && <WeeklyChallengeCard />}

          <div className={isDemoMode ? '' : 'md:col-span-2'}>
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

      {authState.isAuthenticated && (
        <EveningRitualSheet
          isOpen={showEveningRitual}
          onClose={() => setShowEveningRitual(false)}
        />
      )}

      {authState.isAuthenticated && uncelebratedMilestone && (
        <MilestoneCelebration
          milestone={uncelebratedMilestone}
          onCelebrate={celebrateMilestone}
        />
      )}
    </div>
  );
}
