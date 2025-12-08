'use client';

import { useUser } from '@/context/UserContext';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import { FreeHoroscopeView } from './components/FreeHoroscopeView';
import { PaidHoroscopeView } from './components/PaidHoroscopeView';
import { conversionTracking } from '@/lib/analytics';
import { useEffect } from 'react';

export default function HoroscopePage() {
  const { user, loading } = useUser();
  const subscription = useSubscription();
  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  useEffect(() => {
    if (hasChartAccess && user?.id) {
      conversionTracking.horoscopeViewed(user.id);
      conversionTracking.personalizedHoroscopeViewed(user.id);
    }
  }, [hasChartAccess, user?.id]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-lunary-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your horoscope...</p>
        </div>
      </div>
    );
  }

  if (!hasChartAccess) {
    return <FreeHoroscopeView />;
  }

  return (
    <PaidHoroscopeView
      userBirthday={user?.birthday}
      userName={user?.name}
      profile={{ birthday: user?.birthday, birthChart: user?.birthChart }}
    />
  );
}
