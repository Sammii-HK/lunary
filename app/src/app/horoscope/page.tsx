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
      <div className='space-y-4'>
        <h2 className='text-lg font-semibold text-purple-400'>
          Today&apos;s Cosmic Guidance
        </h2>
        <HoroscopeWidget />
      </div>

      {/* Cosmic Profile Section */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-blue-400 mb-3'>
          Your Cosmic Profile
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h3 className='font-medium text-yellow-400 mb-2'>Sun Sign</h3>
            <p className='text-xl font-semibold'>{horoscope.sunSign}</p>
            {userBirthday && (
              <p className='text-sm text-zinc-400 mt-1'>
                Born {new Date(userBirthday).toLocaleDateString()}
              </p>
            )}
          </div>
          <div>
            <h3 className='font-medium text-yellow-400 mb-2'>
              Current Moon Phase
            </h3>
            <p className='text-xl font-semibold'>{horoscope.moonPhase}</p>
            <p className='text-sm text-zinc-400 mt-1'>
              Influencing your emotional energy
            </p>
          </div>
        </div>

        {/* Birth Chart Summary */}
        {birthChart && birthChart.length > 0 && (
          <div className='mt-4 pt-4 border-t border-zinc-700'>
            <h3 className='font-medium text-blue-400 mb-3'>
              Your Birth Chart Highlights
            </h3>
            <div className='grid grid-cols-3 gap-4 text-center'>
              {birthChart.find((p) => p.body === 'Sun') && (
                <div>
                  <p className='text-xs text-zinc-400'>Sun</p>
                  <p className='text-sm font-medium text-yellow-400'>
                    {birthChart.find((p) => p.body === 'Sun')?.sign}
                  </p>
                  <p className='text-xs text-zinc-500'>
                    Identity & Life Purpose
                  </p>
                </div>
              )}
              {birthChart.find((p) => p.body === 'Moon') && (
                <div>
                  <p className='text-xs text-zinc-400'>Moon</p>
                  <p className='text-sm font-medium text-blue-400'>
                    {birthChart.find((p) => p.body === 'Moon')?.sign}
                  </p>
                  <p className='text-xs text-zinc-500'>Emotions & Intuition</p>
                </div>
              )}
              {birthChart.find((p) => p.body === 'Ascendant') && (
                <div>
                  <p className='text-xs text-zinc-400'>Rising</p>
                  <p className='text-sm font-medium text-purple-400'>
                    {birthChart.find((p) => p.body === 'Ascendant')?.sign}
                  </p>
                  <p className='text-xs text-zinc-500'>Outer Personality</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
