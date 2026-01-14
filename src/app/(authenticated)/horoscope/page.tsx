'use client';

import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '../../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../../utils/pricing';
import { FreeHoroscopeView } from './components/FreeHoroscopeView';
import { PaidHoroscopeView } from './components/PaidHoroscopeView';
import { conversionTracking } from '@/lib/analytics';
import { useEffect } from 'react';
import { MarketingFooterGate } from '@/components/MarketingFooterGate';

export default function HoroscopePage() {
  const { user, loading } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  // For unauthenticated users, force paid horoscope access to false immediately
  // Don't wait for subscription to resolve
  const hasPersonalHoroscopeAccess = !authStatus.isAuthenticated
    ? false
    : hasFeatureAccess(
        subscription.status,
        subscription.plan,
        'personalized_horoscope',
      );

  useEffect(() => {
    if (hasPersonalHoroscopeAccess && user?.id) {
      conversionTracking.horoscopeViewed(user.id);
      conversionTracking.personalizedHoroscopeViewed(user.id);
    }
  }, [hasPersonalHoroscopeAccess, user?.id]);

  // Simple sequential loading checks - prioritize unauthenticated users
  if (authStatus.loading) {
    // Still checking authentication - show loading
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your horoscope...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, show content immediately (don't wait for useUser)
  // hasChartAccess will be false, so FreeHoroscopeView will be shown
  // Continue to render content below

  // If authenticated but user data is still loading, show loading
  if (authStatus.isAuthenticated && loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your horoscope...</p>
        </div>
      </div>
    );
  }

  // Otherwise, continue to render content

  if (!hasPersonalHoroscopeAccess) {
    return (
      <div className='min-h-screen flex flex-col'>
        <div className='flex-1'>
          <FreeHoroscopeView />
        </div>
        <MarketingFooterGate />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1'>
        <PaidHoroscopeView
          userBirthday={user?.birthday}
          userName={user?.name}
          profile={{ birthday: user?.birthday, birthChart: user?.birthChart }}
        />
      </div>
      <MarketingFooterGate />
    </div>
  );
}
