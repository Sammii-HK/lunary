'use client';

import { useAccount } from 'jazz-tools/react';
import { getPersonalizedHoroscope } from '../../../utils/astrology/personalizedHoroscope';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { getBirthChartFromProfile } from '../../../utils/astrology/birthChart';

export default function HoroscopePage() {
  const { me } = useAccount();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  const horoscope = getPersonalizedHoroscope(userBirthday, userName);
  const birthChart = getBirthChartFromProfile(me?.profile);

  if (!me) {
    return (
      <div className='h-[91vh] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-zinc-400'>
            Loading your personalized horoscope...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[91vh] space-y-6 pb-4 px-4'>
      <h1 className='py-4 text-lg font-bold'>
        {userName ? `${userName}'s Horoscope` : 'Your Horoscope'}
      </h1>

      {/* Enhanced Daily Horoscope Widget */}
      {/* <div className='space-y-4'>
        <h2 className='text-lg font-semibold text-purple-400'>
          Today&apos;s Cosmic Guidance
        </h2>
        <HoroscopeWidget />
      </div> */}

      {/* Daily Guidance */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-purple-400 mb-3'>
          Today&apos;s Guidance
        </h2>
        <p className='text-zinc-200 leading-relaxed'>
          {horoscope.dailyGuidance}
        </p>
      </div>

      {/* Personal Insight */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-green-400 mb-3'>
          Personal Insight
        </h2>
        <p className='text-zinc-200 leading-relaxed'>
          {horoscope.personalInsight}
        </p>
      </div>

      {/* Lucky Elements */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-pink-400 mb-3'>
          Your Lucky Elements
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {horoscope.luckyElements.map((element, index) => (
            <div key={index} className='bg-zinc-700 rounded p-3 text-center'>
              <p className='text-sm font-medium'>{element}</p>
            </div>
          ))}
        </div>
      </div>

      {!userBirthday && (
        <div className='bg-zinc-800 border border-yellow-600 rounded-lg p-4'>
          <h2 className='text-lg font-semibold text-yellow-400 mb-2'>
            Complete Your Profile
          </h2>
          <p className='text-zinc-300 mb-3'>
            Add your birthday to get more personalized and accurate astrological
            insights.
          </p>
          <a
            href='/profile'
            className='inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors'
          >
            Update Profile
          </a>
        </div>
      )}
    </div>
  );
}
