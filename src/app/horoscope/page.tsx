'use client';

import { useAccount } from 'jazz-tools/react';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { getBirthChartFromProfile } from '../../../utils/astrology/birthChart';
import {
  getUpcomingTransits,
  getSolarReturnInsights,
  TransitEvent,
} from '../../../utils/astrology/transitCalendar';

export default function HoroscopePage() {
  const { me } = useAccount();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  const horoscope = getEnhancedPersonalizedHoroscope(
    userBirthday,
    userName,
    me?.profile,
  );
  const birthChart = getBirthChartFromProfile(me?.profile);

  // Get transit calendar and solar return data
  const upcomingTransits = getUpcomingTransits();
  const solarReturnData = userBirthday
    ? getSolarReturnInsights(userBirthday)
    : null;

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

      {/* Cosmic Highlight */}
      <div className='bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg p-4 border border-purple-700'>
        <h2 className='text-lg font-semibold text-purple-300 mb-3'>
          ✨ Cosmic Highlight
        </h2>
        <p className='text-purple-100 leading-relaxed'>
          {horoscope.cosmicHighlight}
        </p>
      </div>

      {/* Daily Guidance */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-blue-400 mb-3'>
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

      {/* Daily Affirmation */}
      <div className='bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-4 border border-yellow-700'>
        <h2 className='text-lg font-semibold text-yellow-300 mb-3'>
          🌟 Daily Affirmation
        </h2>
        <p className='text-yellow-100 leading-relaxed italic text-center'>
          "{horoscope.dailyAffirmation}"
        </p>
      </div>

      {/* Enhanced Lucky Elements */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-pink-400 mb-3'>
          Your Lucky Elements
        </h2>
        <p className='text-sm text-zinc-400 mb-3'>
          Personalized daily elements based on planetary positions, numerology,
          and your birth chart
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {horoscope.luckyElements.map((element: string, index: number) => (
            <div key={index} className='bg-zinc-700 rounded p-3'>
              <p className='text-sm font-medium text-center'>{element}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Solar Return Insights */}
      {solarReturnData && (
        <div className='bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-lg p-4 border border-orange-700'>
          <h2 className='text-lg font-semibold text-orange-300 mb-3'>
            🌅 Solar Return Insights
          </h2>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-orange-100'>Next Solar Return:</span>
              <span className='text-orange-200 font-medium'>
                {solarReturnData.nextSolarReturn.format('MMM DD, YYYY')}
                <span className='text-sm text-orange-400 ml-2'>
                  ({solarReturnData.daysTillReturn} days)
                </span>
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-orange-100'>Personal Year:</span>
              <span className='text-orange-200 font-medium'>
                {solarReturnData.personalYear}
              </span>
            </div>
            <p className='text-orange-100 leading-relaxed text-sm'>
              {solarReturnData.insights}
            </p>
            <div>
              <h4 className='text-sm font-medium text-orange-200 mb-2'>
                Year Themes:
              </h4>
              <div className='flex flex-wrap gap-2'>
                {solarReturnData.themes.map((theme, index) => (
                  <span
                    key={index}
                    className='bg-orange-800/40 text-orange-200 px-2 py-1 rounded text-xs'
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transit Calendar */}
      <div className='bg-zinc-800 rounded-lg p-4'>
        <h2 className='text-lg font-semibold text-indigo-400 mb-3'>
          🌌 Transit Calendar
        </h2>
        <p className='text-sm text-zinc-400 mb-4'>
          Upcoming planetary events and moon phases over the next 30 days
        </p>
        <div className='space-y-3 max-h-96 overflow-y-auto'>
          {upcomingTransits
            .slice(0, 10)
            .map((transit: TransitEvent, index: number) => (
              <div
                key={index}
                className='bg-zinc-700 rounded p-3 border-l-4 border-indigo-500'
              >
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h4 className='font-medium text-white text-sm'>
                      {transit.planet} {transit.event}
                    </h4>
                    <p className='text-xs text-zinc-400'>
                      {transit.date.format('MMM DD')} •{' '}
                      {transit.type.replace('_', ' ')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      transit.significance === 'high'
                        ? 'bg-red-900/40 text-red-300'
                        : transit.significance === 'medium'
                          ? 'bg-yellow-900/40 text-yellow-300'
                          : 'bg-blue-900/40 text-blue-300'
                    }`}
                  >
                    {transit.significance}
                  </span>
                </div>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {transit.description}
                </p>
              </div>
            ))}
          {upcomingTransits.length === 0 && (
            <p className='text-zinc-400 text-center py-4'>
              No significant transits in the next 30 days
            </p>
          )}
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
