'use client';

import { useEffect, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import { WeeklyUsageCounter } from '@/components/WeeklyUsageCounter';
import { useAccount } from 'jazz-tools/react';
import { conversionTracking } from '@/lib/analytics';
import { useAuthStatus } from '@/components/AuthStatus';
import { usePathname } from 'next/navigation';
import { recordCheckIn } from '@/lib/streak/check-in';

// Critical widgets loaded immediately
import { DateWidget } from '@/components/DateWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { ExploreThisWeek } from '@/components/ExploreThisWeek';
import { QuickCheckIn } from '@/components/QuickCheckIn';
import { QuickTarotCard } from '@/components/QuickTarotCard';
import { QuickCosmicWeather } from '@/components/QuickCosmicWeather';

// Post-trial messaging - lazy loaded since it's conditional (only shows for expired trial users)
const PostTrialMessaging = dynamic(
  () =>
    import('@/components/PostTrialMessaging').then((mod) => ({
      default: mod.PostTrialMessaging,
    })),
  {
    ssr: false, // Client-side only since it depends on user state
  },
);

// Heavy widgets loaded dynamically with lazy loading
// First row widgets (Moon, Crystal) - load with higher priority
const MoonWidget = dynamic(
  () =>
    import('../../components/MoonWidget').then((mod) => ({
      default: mod.MoonWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
    ssr: true, // Enable SSR for first row widgets
  },
);
const CrystalWidget = dynamic(
  () =>
    import('@/components/CrystalWidget').then((mod) => ({
      default: mod.CrystalWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
    ssr: true, // Enable SSR for first row widgets
  },
);

// Second row widgets - load after first row
const TarotWidget = dynamic(
  () =>
    import('@/components/TarotWidget').then((mod) => ({
      default: mod.TarotWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
    ssr: false, // Client-side only for below-fold content
  },
);
const HoroscopeWidget = dynamic(
  () =>
    import('@/components/HoroscopeWidget').then((mod) => ({
      default: mod.HoroscopeWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
    ssr: false, // Client-side only for below-fold content
  },
);

// Third row widgets - lowest priority
const MoonSpellsWidget = dynamic(
  () =>
    import('@/components/MoonSpellsWidget').then((mod) => ({
      default: mod.MoonSpellsWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
    ssr: false,
  },
);
const EphemerisWidget = dynamic(() => import('@/components/EphemerisWidget'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
  ssr: false,
});
const ConditionalWheel = dynamic(
  () => import('@/components/ConditionalWheel'),
  {
    loading: () => null, // ConditionalWheel handles its own loading state
    ssr: false,
  },
);

function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'))
  );
}

export default function AppDashboard() {
  const { me } = useAccount();
  const authState = useAuthStatus();
  const router = useRouter();
  const redirectExecuted = useRef(false);

  useEffect(() => {
    // Skip redirect logic in Playwright e2e test mode
    if (isTestMode()) return;

    if (typeof window === 'undefined') return;
    if (redirectExecuted.current) return;

    // Check if running in PWA mode
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true;

    // Only redirect PWA users who are not authenticated
    if (isPWA && !authState.loading && !authState.isAuthenticated) {
      redirectExecuted.current = true;
      router.replace('/auth');
      return;
    }
  }, [authState.isAuthenticated, authState.loading, router]);

  useEffect(() => {
    // Track app opened event and record check-in
    if (authState.isAuthenticated) {
      const userId = (me as any)?.id;
      conversionTracking.appOpened(userId, '/app');
      recordCheckIn();
    } else if (!authState.loading) {
      conversionTracking.appOpened(undefined, '/app');
    }
  }, [authState.isAuthenticated, authState.loading, me]);

  return (
    <div className='flex h-fit-content w-full flex-col gap-6 max-w-7xl mx-auto px-4'>
      <AstronomyContextProvider>
        {/* Screen reader only H1 for accessibility */}
        <h1 className='sr-only'>Lunary - Your Daily Cosmic Guide</h1>
        {/* Post-trial messaging for expired trial users */}
        <PostTrialMessaging />

        {/* Weekly Usage Counter */}
        <WeeklyUsageCounter />

        {/* Top Row - Date and Astronomy (always full width) - Above the fold, load immediately */}
        <div className='w-full space-y-4'>
          <DateWidget />
          <AstronomyWidget />
          <ExploreThisWeek />

          {/* Quick Action Widgets */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <QuickCheckIn />
            <QuickTarotCard />
            <QuickCosmicWeather />
          </div>
        </div>

        {/* Main Content Grid - Responsive 2-Column Layout */}
        {/* Mobile: Single column maintains natural order */}
        {/* Desktop: 2 columns - flows naturally */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full'>
          <div className='flex flex-col h-full'>
            <MoonWidget />
          </div>
          <div className='flex flex-col h-full'>
            <CrystalWidget />
          </div>
          <div className='flex flex-col h-full'>
            <TarotWidget />
          </div>
          <div className='flex flex-col h-full'>
            <HoroscopeWidget />
          </div>
          <ConditionalWheel />
          <div className='flex flex-col h-full'>
            <MoonSpellsWidget />
          </div>
          <div className='flex flex-col h-full'>
            <EphemerisWidget />
          </div>
        </div>
      </AstronomyContextProvider>
    </div>
  );
}
