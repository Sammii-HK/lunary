'use client';

import { useEffect } from 'react';
import { TarotWidget } from '@/components/TarotWidget';
import { MoonWidget } from '../components/MoonWidget';
import { AstronomyWidget } from '@/components/AstronomyWidget';
import { DateWidget } from '@/components/DateWidget';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { CrystalWidget } from '@/components/CrystalWidget';
import { MoonSpellsWidget } from '@/components/MoonSpellsWidget';
import { AstronomyContextProvider } from '@/context/AstronomyContext';
import EphemerisWidget from '@/components/EphemerisWidget';
import ConditionalWheel from '@/components/ConditionalWheel';
import { PostTrialMessaging } from '@/components/PostTrialMessaging';
import { useAccount } from 'jazz-tools/react';
import { conversionTracking } from '@/lib/analytics';
import { useAuthStatus } from '@/components/AuthStatus';

export default function Home() {
  const { me } = useAccount();
  const authState = useAuthStatus();

  useEffect(() => {
    // Track app opened event
    if (authState.isAuthenticated && me?.id) {
      conversionTracking.appOpened(me.id, '/');
    } else if (!authState.loading) {
      conversionTracking.appOpened(undefined, '/');
    }
  }, [authState.isAuthenticated, authState.loading, me?.id]);

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
