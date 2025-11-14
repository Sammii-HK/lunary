'use client';

import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import { PostTrialMessaging } from '@/components/PostTrialMessaging';
import { useAccount } from 'jazz-tools/react';
import { conversionTracking } from '@/lib/analytics';
import { useAuthStatus } from '@/components/AuthStatus';
import { usePathname } from 'next/navigation';

// Critical widgets loaded immediately
import { DateWidget } from '@/components/DateWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';

// Heavy widgets loaded dynamically with lazy loading
const TarotWidget = dynamic(
  () =>
    import('@/components/TarotWidget').then((mod) => ({
      default: mod.TarotWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
  },
);
const MoonWidget = dynamic(
  () =>
    import('../components/MoonWidget').then((mod) => ({
      default: mod.MoonWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
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
  },
);
const MoonSpellsWidget = dynamic(
  () =>
    import('@/components/MoonSpellsWidget').then((mod) => ({
      default: mod.MoonSpellsWidget,
    })),
  {
    loading: () => (
      <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
    ),
  },
);
const EphemerisWidget = dynamic(() => import('@/components/EphemerisWidget'), {
  loading: () => (
    <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse' />
  ),
});
const ConditionalWheel = dynamic(
  () => import('@/components/ConditionalWheel'),
  {
    loading: () => null, // ConditionalWheel handles its own loading state
  },
);

export default function Home() {
  const { me } = useAccount();
  const authState = useAuthStatus();

  useEffect(() => {
    // Track app opened event
    if (authState.isAuthenticated) {
      const userId = (me as any)?.id;
      conversionTracking.appOpened(userId, '/');
    } else if (!authState.loading) {
      conversionTracking.appOpened(undefined, '/');
    }
  }, [authState.isAuthenticated, authState.loading, me]);

  return (
    <div className='flex h-fit-content w-full flex-col gap-6 max-w-7xl mx-auto px-4'>
      <AstronomyContextProvider>
        {/* Post-trial messaging for expired trial users */}
        <PostTrialMessaging />

        {/* Top Row - Date and Astronomy (always full width) */}
        <div className='w-full space-y-4'>
          <DateWidget />
          <AstronomyWidget />
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
