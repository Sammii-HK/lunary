'use client';

import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import Link from 'next/link';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { getGeneralHoroscope } from '../../../utils/astrology/generalHoroscope';
import { HoroscopeWidget } from '@/components/HoroscopeWidget';
import { getBirthChartFromProfile } from '../../../utils/astrology/birthChart';
import {
  getUpcomingTransits,
  getSolarReturnInsights,
  TransitEvent,
} from '../../../utils/astrology/transitCalendar';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';

export default function HoroscopePage() {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const hasChartAccess = hasBirthChartAccess(subscription.status);

  // Get transit calendar data
  const upcomingTransits = getUpcomingTransits();

  if (!me) {
    return (
      <div className='h-[91vh] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your horoscope...</p>
        </div>
      </div>
    );
  }

  // Check subscription access first
  if (!hasChartAccess) {
    const generalHoroscope = getGeneralHoroscope();

    return (
      <div className='h-[91vh] space-y-6 pb-4 px-4'>
        <h1 className='py-4 text-lg font-bold'>Your Horoscope</h1>

        {/* Cosmic Highlight - Same structure as premium */}
        <div className='bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg p-4 border border-purple-700'>
          <h2 className='text-lg font-semibold text-purple-300 mb-3'>
            ✨ Cosmic Highlight
          </h2>
          <p className='text-purple-100 leading-relaxed'>
            {generalHoroscope.generalAdvice}
          </p>
        </div>

        {/* General Cosmic Insight */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-lg font-semibold text-green-400 mb-3'>
            Cosmic Insight
          </h2>
          <p className='text-zinc-200 leading-relaxed'>
            The planetary alignments today create opportunities for growth and
            understanding. Pay attention to synchronicities and trust your
            intuitive insights as they guide you toward meaningful experiences
            and connections.
          </p>
        </div>

        {/* Preview of Personal Insight - Personalised Feature */}
        <div>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-green-400'>
              Personal Insight
            </h2>
            <div className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium'>
              Personalised Feature
            </div>
          </div>
          <div className='relative'>
            {/* Blurred preview content */}
            <div className='filter blur-sm pointer-events-none'>
              <div className='bg-zinc-800 rounded-lg p-4 opacity-60'>
                <p className='text-zinc-200 leading-relaxed'>
                  ●●●●● ●●●●● ●●● ●●●●●●●● ●●●●●●●● ●●● ●●●●●●● ●●●●●●●●●
                  ●●●●●●● ●●● ●●●●●●●●● ●●●●●●●● ●●●●●. ●●●●●● ●●●●●●●● ●●●
                  ●●●●●●●●● ●●●●●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●● ●●●●●●●●
                  ●●●●●●●●● ●●●●●●●●●.
                </p>
              </div>
            </div>

            {/* Overlay with upgrade prompt */}
            <div className='absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-lg'>
              <div className='text-center p-6'>
                <h3 className='text-white font-medium mb-2'>
                  🌟 Personal Insight
                </h3>
                <p className='text-zinc-300 text-sm mb-4'>
                  Get insights specifically tailored to your birth chart and
                  cosmic profile
                </p>
                <SmartTrialButton 
                  size="sm" 
                  variant="primary"
                  className="inline-block"
                >
                  Start Free Trial
                </SmartTrialButton>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Affirmation - Same structure as premium */}
        <div className='bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg p-4 border border-yellow-700'>
          <h2 className='text-lg font-semibold text-yellow-300 mb-3'>
            🌟 Daily Affirmation
          </h2>
          <p className='text-yellow-100 leading-relaxed italic text-center'>
            "I am aligned with the cosmic flow and trust in the wisdom of the
            universe to guide my path."
          </p>
        </div>

        {/* Preview of Personalized Lucky Elements - Personalised Feature */}
        <div>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-pink-400'>
              Your Lucky Elements
            </h2>
            <div className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium'>
              Personalised Feature
            </div>
          </div>
          <div className='relative'>
            {/* Blurred preview content */}
            <div className='filter blur-sm pointer-events-none'>
              <div className='bg-zinc-800 rounded-lg p-4 opacity-60'>
                <p className='text-sm text-zinc-400 mb-3'>
                  ●●●●●●●●●● ●●●●● ●●●●●●● ●●●●● ●● ●●●●●●●● ●●●●●●●●●,
                  ●●●●●●●●●, ●●● ●●●● ●●●●● ●●●●●
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className='bg-zinc-700 rounded p-3'>
                      <p className='text-sm font-medium text-center'>
                        ●●●●●● & ●●●●●●
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay with upgrade prompt */}
            <div className='absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-lg'>
              <div className='text-center p-6'>
                <h3 className='text-white font-medium mb-2'>
                  ✨ Personal Lucky Elements
                </h3>
                <p className='text-zinc-300 text-sm mb-4'>
                  Get colors, crystals, and timing based on your unique birth
                  chart
                </p>
                <SmartTrialButton 
                  size="sm" 
                  variant="primary"
                  className="inline-block"
                >
                  Start Free Trial
                </SmartTrialButton>
              </div>
            </div>
          </div>
        </div>

        {/* General Lucky Elements - Show current cosmic elements */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-lg font-semibold text-pink-400 mb-3'>
            Cosmic Elements
          </h2>
          <p className='text-sm text-zinc-400 mb-3'>
            Universal elements favored by today&apos;s planetary positions
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='bg-zinc-700 rounded p-3'>
              <p className='text-sm font-medium text-center'>Purple & Silver</p>
            </div>
            <div className='bg-zinc-700 rounded p-3'>
              <p className='text-sm font-medium text-center'>
                Amethyst & Moonstone
              </p>
            </div>
            <div className='bg-zinc-700 rounded p-3'>
              <p className='text-sm font-medium text-center'>Evening Hours</p>
            </div>
            <div className='bg-zinc-700 rounded p-3'>
              <p className='text-sm font-medium text-center'>Water Element</p>
            </div>
          </div>
        </div>

        {/* Preview of Solar Return - Personalised Feature */}
        <div>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-orange-300'>
              🌅 Solar Return Insights
            </h2>
            <div className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium'>
              Personalised Feature
            </div>
          </div>
          <div className='relative'>
            {/* Blurred preview content */}
            <div className='filter blur-sm pointer-events-none'>
              <div className='bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-lg p-4 border border-orange-700 opacity-60'>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-orange-100'>●●●● ●●●●● ●●●●●●:</span>
                    <span className='text-orange-200 font-medium'>
                      ●●● ●●, ●●●●
                      <span className='text-sm text-orange-400 ml-2'>
                        (●●● ●●●●)
                      </span>
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-orange-100'>●●●●●●●● ●●●●:</span>
                    <span className='text-orange-200 font-medium'>●</span>
                  </div>
                  <p className='text-orange-100 leading-relaxed text-sm'>
                    ●●●● ●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●●●● ●●● ●●●●●●●●●●
                    ●●●●●●●●●● ●●●●●●●● ●●●●●●●●●●●.
                  </p>
                </div>
              </div>
            </div>

            {/* Overlay with upgrade prompt */}
            <div className='absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-lg'>
              <div className='text-center p-6'>
                <h3 className='text-white font-medium mb-2'>
                  🌅 Solar Return Analysis
                </h3>
                <p className='text-zinc-300 text-sm mb-4'>
                  Discover your personal year themes and birthday insights
                </p>
                <SmartTrialButton 
                  size="sm" 
                  variant="primary"
                  className="inline-block"
                >
                  Start Free Trial
                </SmartTrialButton>
              </div>
            </div>
          </div>
        </div>

        {/* General Transit Calendar - Show upcoming cosmic events */}
        <div className='bg-zinc-800 rounded-lg p-4'>
          <h2 className='text-lg font-semibold text-indigo-400 mb-3'>
            🌌 Cosmic Calendar
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Upcoming planetary events and moon phases affecting everyone
          </p>
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {upcomingTransits
              .slice(0, 6)
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

        {/* Preview of Personal Transit Impact - Personalised Feature */}
        <div>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-indigo-400'>
              🌟 Personal Transit Impact
            </h2>
            <div className='bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium'>
              Personalised Feature
            </div>
          </div>
          <div className='relative'>
            {/* Blurred preview content */}
            <div className='filter blur-sm pointer-events-none'>
              <div className='bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg p-4 border border-indigo-700 opacity-60'>
                <p className='text-sm text-indigo-300 mb-4'>
                  ●●● ●●●●● ●●●●●●● ●●●●●● ●●●●●●●●● ●●● ●●●● ●●●●● ●●●●●
                  ●●●●●●●●●
                </p>
                <div className='space-y-3'>
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className='bg-indigo-800/40 rounded p-3 border-l-4 border-purple-500'
                    >
                      <div className='flex justify-between items-start mb-2'>
                        <div>
                          <h4 className='font-medium text-indigo-200 text-sm'>
                            ●●●●● ●●●●●●● ●●●●●●
                          </h4>
                          <p className='text-xs text-indigo-400'>
                            ●●● ●● • ●●●●●●● ●●●●●●
                          </p>
                        </div>
                        <span className='bg-purple-700/40 text-purple-300 px-2 py-1 rounded text-xs font-medium'>
                          ●●●●●●●●
                        </span>
                      </div>
                      <p className='text-sm text-indigo-300 leading-relaxed'>
                        ●●●● ●●●●●● ●●● ●●●●●●●●● ●●●●●●● ●●●●●●● ●●● ●●●●●●●●●●
                        ●●●●●●●●●.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay with upgrade prompt */}
            <div className='absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-lg'>
              <div className='text-center p-6'>
                <h3 className='text-white font-medium mb-2'>
                  🌟 Personal Transit Impact
                </h3>
                <p className='text-zinc-300 text-sm mb-4'>
                  See how planetary transits specifically affect your birth
                  chart
                </p>
                <SmartTrialButton 
                  size="sm" 
                  variant="primary"
                  className="inline-block"
                >
                  Start Free Trial
                </SmartTrialButton>
              </div>
            </div>
          </div>
        </div>

        {/* Upsell Section */}
        <div className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30'>
          <h3 className='text-white font-medium mb-2'>
            🌟 Unlock Your Complete Cosmic Profile
          </h3>
          <p className='text-zinc-300 text-sm mb-4'>
            Get access to all the personalized features you see previewed above
            - horoscopes based on YOUR birth chart with deep personal insights
            and cosmic guidance tailored specifically to you.
          </p>
          <ul className='text-xs text-zinc-400 space-y-1 mb-4'>
            <li>• Personal insight based on your birth chart</li>
            <li>• Lucky elements customized for you</li>
            <li>• Solar return birthday analysis</li>
            <li>• Personal transit impact reports</li>
            <li>• Enhanced daily guidance</li>
            <li>• Complete cosmic profile features</li>
          </ul>
          <Link
            href='/pricing'
            className='inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-300'
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    );
  }

  // Premium user content
  const horoscope = getEnhancedPersonalizedHoroscope(
    userBirthday,
    userName,
    me?.profile,
  );
  const birthChart = getBirthChartFromProfile(me?.profile);

  // Get solar return data
  const solarReturnData = userBirthday
    ? getSolarReturnInsights(userBirthday)
    : null;

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
          Your Daily Guidance
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
