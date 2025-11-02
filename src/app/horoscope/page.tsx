'use client';

import { useAccount } from 'jazz-tools/react';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import { FreeHoroscopeView } from './components/FreeHoroscopeView';
import { PaidHoroscopeView } from './components/PaidHoroscopeView';

export default function HoroscopePage() {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const hasChartAccess = hasBirthChartAccess(subscription.status);

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
    return <FreeHoroscopeView />;
  }

  return (
    <PaidHoroscopeView
      userBirthday={userBirthday}
      userName={userName}
      profile={me.profile}
    />
  );
}
