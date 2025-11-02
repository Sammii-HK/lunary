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
import { Sparkles } from 'lucide-react';

export default function HoroscopePage() {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const hasChartAccess = hasBirthChartAccess(subscription.status);
  const upcomingTransits = getUpcomingTransits();

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
    const generalHoroscope = getGeneralHoroscope();

    return (
      <div className='min-h-screen space-y-6 pb-20 px-4'>
        <div className='pt-6'>
          <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
            Your Horoscope
          </h1>
          <p className='text-sm text-zinc-400'>
            General cosmic guidance based on universal energies
          </p>
        </div>

        <div className='space-y-6'>
          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <h2 className='text-lg font-medium text-zinc-100 mb-3'>
              Cosmic Highlight
            </h2>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {generalHoroscope.generalAdvice}
            </p>
          </div>

          <div className='rounded-lg border border-blue-500/20 bg-blue-500/10 p-6'>
            <h2 className='text-lg font-medium text-zinc-100 mb-3'>
              Cosmic Insight
            </h2>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              The planetary alignments today create opportunities for growth and
              understanding. Pay attention to synchronicities and trust your
              intuitive insights as they guide you toward meaningful experiences
              and connections.
            </p>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-medium text-zinc-100'>
                Personal Insight
              </h2>
              <div className='px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10'>
                <span className='text-xs font-medium text-purple-300/90'>
                  Personalised Feature
                </span>
              </div>
            </div>
            <div className='relative'>
              <div className='filter blur-sm pointer-events-none'>
                <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 opacity-60'>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    ●●●●● ●●●●● ●●● ●●●●●●●● ●●●●●●●● ●●● ●●●●●●● ●●●●●●●●●
                    ●●●●●●● ●●● ●●●●●●●●● ●●●●●●●● ●●●●●. ●●●●●● ●●●●●●●● ●●●
                    ●●●●●●●●● ●●●●●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●● ●●●●●●●●
                    ●●●●●●●●● ●●●●●●●●●.
                  </p>
                </div>
              </div>
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
                <div className='text-center p-6 max-w-sm'>
                  <Sparkles
                    className='w-8 h-8 text-purple-400/80 mx-auto mb-3'
                    strokeWidth={1.5}
                  />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Personal Insight
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
                    Get insights specifically tailored to your birth chart and
                    cosmic profile
                  </p>
                  <SmartTrialButton
                    size='sm'
                    variant='primary'
                    className='inline-block'
                  >
                    Start Free Trial
                  </SmartTrialButton>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-medium text-zinc-100'>
                Your Lucky Elements
              </h2>
              <div className='px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10'>
                <span className='text-xs font-medium text-purple-300/90'>
                  Personalised Feature
                </span>
              </div>
            </div>
            <div className='relative'>
              <div className='filter blur-sm pointer-events-none'>
                <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 opacity-60'>
                  <p className='text-sm text-zinc-400 mb-3'>
                    ●●●●●●●●●● ●●●●● ●●●●●●● ●●●●● ●● ●●●●●●●● ●●●●●●●●●,
                    ●●●●●●●●●, ●●● ●●●● ●●●●● ●●●●●
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className='rounded border border-zinc-700/50 bg-zinc-800/50 p-3'
                      >
                        <p className='text-sm font-medium text-center text-zinc-300'>
                          ●●●●●● & ●●●●●●
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
                <div className='text-center p-6 max-w-sm'>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Personal Lucky Elements
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
                    Get colors, crystals, and timing based on your unique birth
                    chart
                  </p>
                  <SmartTrialButton
                    size='sm'
                    variant='primary'
                    className='inline-block'
                  >
                    Start Free Trial
                  </SmartTrialButton>
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-6'>
            <h2 className='text-lg font-medium text-zinc-100 mb-3'>
              Cosmic Elements
            </h2>
            <p className='text-sm text-zinc-400 mb-4'>
              Universal elements favored by today&apos;s planetary positions
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 hover:bg-indigo-500/15 transition-colors'>
                <p className='text-sm font-medium text-center text-zinc-100'>
                  Purple & Silver
                </p>
              </div>
              <div className='rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 hover:bg-indigo-500/15 transition-colors'>
                <p className='text-sm font-medium text-center text-zinc-100'>
                  Amethyst & Moonstone
                </p>
              </div>
              <div className='rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 hover:bg-indigo-500/15 transition-colors'>
                <p className='text-sm font-medium text-center text-zinc-100'>
                  Evening Hours
                </p>
              </div>
              <div className='rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 hover:bg-indigo-500/15 transition-colors'>
                <p className='text-sm font-medium text-center text-zinc-100'>
                  Water Element
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-medium text-zinc-100'>
                Solar Return Insights
              </h2>
              <div className='px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10'>
                <span className='text-xs font-medium text-purple-300/90'>
                  Personalised Feature
                </span>
              </div>
            </div>
            <div className='relative'>
              <div className='filter blur-sm pointer-events-none'>
                <div className='rounded-lg border border-amber-500/30 bg-amber-500/10 p-6 opacity-60'>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-zinc-300'>
                        ●●●● ●●●●● ●●●●●●●:
                      </span>
                      <span className='text-sm font-medium text-zinc-200'>
                        ●●● ●●, ●●●●
                        <span className='text-xs text-zinc-400 ml-2'>
                          (●●● ●●●●)
                        </span>
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-zinc-300'>
                        ●●●●●●●● ●●●●:
                      </span>
                      <span className='text-sm font-medium text-zinc-200'>
                        ●
                      </span>
                    </div>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      ●●●● ●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●●●● ●●● ●●●●●●●●●●
                      ●●●●●●●●●● ●●●●●●●● ●●●●●●●●●●●.
                    </p>
                  </div>
                </div>
              </div>
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
                <div className='text-center p-6 max-w-sm'>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Solar Return Analysis
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
                    Discover your personal year themes and birthday insights
                  </p>
                  <SmartTrialButton
                    size='sm'
                    variant='primary'
                    className='inline-block'
                  >
                    Start Free Trial
                  </SmartTrialButton>
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <h2 className='text-lg font-medium text-zinc-100 mb-3'>
              Cosmic Calendar
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
                    className='rounded-lg border-l-4 border-indigo-500/50 bg-zinc-800/50 p-4'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h4 className='font-medium text-zinc-100 text-sm mb-1'>
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
                            ? 'bg-red-500/20 text-red-300/90 border border-red-500/30'
                            : transit.significance === 'medium'
                              ? 'bg-amber-500/20 text-amber-300/90 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300/90 border border-blue-500/30'
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
                <p className='text-zinc-400 text-center py-4 text-sm'>
                  No significant transits in the next 30 days
                </p>
              )}
            </div>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-medium text-zinc-100'>
                Personal Transit Impact
              </h2>
              <div className='px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10'>
                <span className='text-xs font-medium text-purple-300/90'>
                  Personalised Feature
                </span>
              </div>
            </div>
            <div className='relative'>
              <div className='filter blur-sm pointer-events-none'>
                <div className='rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-6 opacity-60'>
                  <p className='text-sm text-zinc-300 mb-4'>
                    ●●● ●●●●● ●●●●●●● ●●●●●● ●●●●●●●●● ●●● ●●●● ●●●●● ●●●●●
                    ●●●●●●●●●
                  </p>
                  <div className='space-y-3'>
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className='rounded border-l-4 border-indigo-500/50 bg-zinc-800/50 p-4'
                      >
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <h4 className='font-medium text-zinc-200 text-sm'>
                              ●●●●● ●●●●●●● ●●●●●●
                            </h4>
                            <p className='text-xs text-zinc-400'>
                              ●●● ●● • ●●●●●●● ●●●●●●
                            </p>
                          </div>
                          <span className='bg-purple-500/20 text-purple-300/90 px-2 py-1 rounded text-xs font-medium border border-purple-500/30'>
                            ●●●●●●●●
                          </span>
                        </div>
                        <p className='text-sm text-zinc-300 leading-relaxed'>
                          ●●●● ●●●●●● ●●● ●●●●●●●●● ●●●●●●● ●●●●●●● ●●●
                          ●●●●●●●●●● ●●●●●●●●●.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
                <div className='text-center p-6 max-w-sm'>
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Personal Transit Impact
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
                    See how planetary transits specifically affect your birth
                    chart
                  </p>
                  <SmartTrialButton
                    size='sm'
                    variant='primary'
                    className='inline-block'
                  >
                    Start Free Trial
                  </SmartTrialButton>
                </div>
              </div>
            </div>
          </div>

          <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
              Unlock Your Complete Cosmic Profile
            </h3>
            <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
              Get access to all the personalized features you see previewed
              above - horoscopes based on YOUR birth chart with deep personal
              insights and cosmic guidance tailored specifically to you.
            </p>
            <ul className='text-xs text-zinc-400 space-y-2 mb-4'>
              <li>• Personal insight based on your birth chart</li>
              <li>• Lucky elements customized for you</li>
              <li>• Solar return birthday analysis</li>
              <li>• Personal transit impact reports</li>
              <li>• Enhanced daily guidance</li>
              <li>• Complete cosmic profile features</li>
            </ul>
            <SmartTrialButton
              size='md'
              variant='primary'
              className='inline-block'
            >
              Start Free Trial
            </SmartTrialButton>
          </div>
        </div>
      </div>
    );
  }

  const horoscope = getEnhancedPersonalizedHoroscope(
    userBirthday,
    userName,
    me?.profile,
  );
  const birthChart = getBirthChartFromProfile(me?.profile);
  const solarReturnData = userBirthday
    ? getSolarReturnInsights(userBirthday)
    : null;

  return (
    <div className='min-h-screen space-y-6 pb-20 px-4'>
      <div className='pt-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          {userName ? `${userName}'s Horoscope` : 'Your Horoscope'}
        </h1>
        <p className='text-sm text-zinc-400'>
          Personalized guidance based on your birth chart
        </p>
      </div>

      <div className='space-y-6'>
        <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-6'>
          <h2 className='text-lg font-medium text-zinc-100 mb-3'>
            Cosmic Highlight
          </h2>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {horoscope.cosmicHighlight}
          </p>
        </div>

        <div className='rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6'>
          <h2 className='text-lg font-medium text-zinc-100 mb-3'>
            Personal Insight
          </h2>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {horoscope.personalInsight}
          </p>
        </div>

        <div className='rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-6'>
          <h2 className='text-lg font-medium text-zinc-100 mb-3'>
            Your Lucky Elements
          </h2>
          <p className='text-sm text-zinc-400 mb-4'>
            Personalized daily elements based on planetary positions,
            numerology, and your birth chart
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {horoscope.luckyElements.map((element: string, index: number) => {
              const colors = [
                'border-indigo-500/30 bg-indigo-500/10',
                'border-purple-500/30 bg-purple-500/10',
                'border-violet-500/30 bg-violet-500/10',
                'border-blue-500/30 bg-blue-500/10',
              ];
              return (
                <div
                  key={index}
                  className={`rounded-lg border ${colors[index % colors.length]} p-4 hover:opacity-80 transition-opacity`}
                >
                  <p className='text-sm font-medium text-center text-zinc-100'>
                    {element}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {solarReturnData && (
          <div className='rounded-lg border border-amber-500/30 bg-amber-500/10 p-6'>
            <h2 className='text-lg font-medium text-zinc-100 mb-3'>
              Solar Return Insights
            </h2>
            <div className='space-y-3 pt-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-zinc-300'>
                  Next Solar Return:
                </span>
                <span className='text-sm font-medium text-zinc-100'>
                  {solarReturnData.nextSolarReturn.format('MMM DD, YYYY')}
                  <span className='text-xs text-zinc-400 ml-2'>
                    ({solarReturnData.daysTillReturn} days)
                  </span>
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-zinc-300'>Personal Year:</span>
                <span className='text-sm font-medium text-zinc-100'>
                  {solarReturnData.personalYear}
                </span>
              </div>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {solarReturnData.insights}
              </p>
              <div>
                <h4 className='text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide'>
                  Year Themes
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {solarReturnData.themes.map((theme, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-xs text-zinc-300'
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
          <h2 className='text-lg font-medium text-zinc-100 mb-3'>
            Transit Calendar
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
                  className='rounded-lg border-l-4 border-indigo-500/50 bg-zinc-800/50 p-4'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <h4 className='font-medium text-zinc-100 text-sm mb-1'>
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
                          ? 'bg-red-500/20 text-red-300/90 border border-red-500/30'
                          : transit.significance === 'medium'
                            ? 'bg-amber-500/20 text-amber-300/90 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300/90 border border-blue-500/30'
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
              <p className='text-zinc-400 text-center py-4 text-sm'>
                No significant transits in the next 30 days
              </p>
            )}
          </div>
        </div>

        {!userBirthday && (
          <div className='rounded-lg border border-amber-500/30 bg-amber-500/10 p-6'>
            <h2 className='text-lg font-medium text-zinc-100 mb-2'>
              Complete Your Profile
            </h2>
            <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
              Add your birthday to get more personalized and accurate
              astrological insights.
            </p>
            <Link
              href='/profile'
              className='inline-block rounded-lg border border-amber-500/30 bg-amber-500/15 hover:bg-amber-500/20 text-amber-300/90 px-4 py-2 text-sm font-medium transition-colors'
            >
              Update Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
