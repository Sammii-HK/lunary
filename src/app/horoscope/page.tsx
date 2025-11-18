'use client';

import { useAccount } from 'jazz-tools/react';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import { FreeHoroscopeView } from './components/FreeHoroscopeView';
import { PaidHoroscopeView } from './components/PaidHoroscopeView';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { TrialReminder } from '@/components/TrialReminder';
import { conversionTracking } from '@/lib/analytics';
import { useEffect } from 'react';

export default function HoroscopePage() {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  useEffect(() => {
    if (hasChartAccess) {
      const userId = (me as any)?.id;
      if (userId) {
        conversionTracking.horoscopeViewed(userId);
        conversionTracking.personalizedHoroscopeViewed(userId);
      }
    }
  }, [hasChartAccess, me]);

  if (!me) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your horoscope...</p>
        </div>
      </div>
    );
  }

  if (!hasChartAccess) {
    return (
      <div className='space-y-6'>
        <TrialReminder variant='banner' />
        <FreeHoroscopeView />
        <UpgradePrompt
          variant='card'
          featureName='personalized_horoscope'
          title='Unlock Personalized Horoscopes'
          description='Get daily cosmic guidance tailored to your unique birth chart'
          className='max-w-2xl mx-auto'
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <TrialReminder variant='banner' />
      <PaidHoroscopeView
        userBirthday={userBirthday}
        userName={userName}
        profile={me.profile}
      />
    </div>
  );
}
