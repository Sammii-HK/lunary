import Link from 'next/link';
import dayjs from 'dayjs';
import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import { HoroscopeSection } from './HoroscopeSection';
import { FeaturePreview } from './FeaturePreview';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { Sparkles, ChevronRight, Lock } from 'lucide-react';
import { TransitCard } from './TransitCard';

const getDailyNumerology = (
  date: dayjs.Dayjs,
): { number: number; meaning: string } => {
  const dateString = date.format('DDMMYYYY');
  let sum = 0;

  for (let i = 0; i < dateString.length; i++) {
    sum += parseInt(dateString[i]);
  }

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    const digits = sum.toString().split('');
    sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  const numerologyMeanings: Record<number, string> = {
    1: 'leadership energy and new beginnings',
    2: 'cooperation, balance, and partnership',
    3: 'creativity, communication, and joy',
    4: 'stability, hard work, and foundation-building',
    5: 'freedom, adventure, and dynamic change',
    6: 'nurturing, responsibility, and healing',
    7: 'spiritual insight, introspection, and wisdom',
    8: 'material success, power, and achievement',
    9: 'completion, compassion, and universal love',
    11: 'master intuition and spiritual illumination',
    22: 'master builder energy and manifestation power',
    33: 'master teacher vibration and selfless service',
  };

  return {
    number: sum,
    meaning: numerologyMeanings[sum] || 'transformative energy',
  };
};

export function FreeHoroscopeView() {
  const generalHoroscope = getGeneralHoroscope();
  const upcomingTransits = getUpcomingTransits();
  const today = dayjs();
  const universalDay = getDailyNumerology(today);

  // // Filter transits for today
  // const todaysTransits = upcomingTransits.filter((transit) => {
  //   const transitDate = dayjs(transit.date);
  //   return transitDate.isSame(today, 'day');
  // });

  return (
    <div className='h-full space-y-6 p-4 overflow-auto'>
      <div className='pt-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Your Horoscope
        </h1>
        <p className='text-sm text-zinc-400'>
          General cosmic guidance based on universal energies
        </p>
        <div className='flex gap-3 mt-3'>
          <Link
            href='/horoscope/today'
            className='inline-flex items-center gap-1 text-xs text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
          >
            See all daily horoscopes <ChevronRight className='w-3 h-3' />
          </Link>
          <Link
            href='/horoscope/weekly'
            className='inline-flex items-center gap-1 text-xs text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
          >
            Browse weekly horoscopes <ChevronRight className='w-3 h-3' />
          </Link>
        </div>
      </div>

      <HoroscopeSection title="Today's Transits" color='zinc'>
        {upcomingTransits.length > 0 ? (
          <>
            <p className='text-sm text-zinc-400 mb-4'>
              Upcoming planetary events happening in the next 30 days affecting
              everyone
            </p>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {upcomingTransits.map((transit, index) => (
                <TransitCard key={index} transit={transit} />
              ))}
            </div>
            <div className='mt-4 pt-4 border-t border-zinc-800/50'>
              <p className='text-xs text-zinc-400 mb-3'>
                See how these transits specifically affect your birth chart with
                personalized insights
              </p>
              <div className='w-full flex justify-center'>
                <SmartTrialButton />
              </div>
            </div>
          </>
        ) : (
          <>
            <p className='text-sm text-zinc-400 mb-4'>
              No major transits happening today. Check upcoming transits below
              or unlock personalized transit insights for your birth chart.
            </p>
            <div className='mt-4 pt-4 border-t border-zinc-800/50'>
              <p className='text-xs text-zinc-400 mb-3'>
                Get personalized transit insights based on your birth chart
              </p>
              <div className='w-full flex justify-center'>
                <SmartTrialButton />
              </div>
            </div>
          </>
        )}
      </HoroscopeSection>

      <div className='space-y-6'>
        <HoroscopeSection title="Today's Horoscope" color='purple'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {generalHoroscope.reading}
          </p>
        </HoroscopeSection>

        <HoroscopeSection title='Cosmic Highlight' color='emerald'>
          <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
            {generalHoroscope.generalAdvice}
          </p>
          <div className='grid grid-cols-2 gap-4 pt-3 border-t border-zinc-700/50'>
            <div className='text-center'>
              <div className='text-2xl font-light text-emerald-400 mb-1'>
                {universalDay.number}
              </div>
              <div className='text-xs text-zinc-400 uppercase tracking-wide mb-1'>
                Universal Day
              </div>
              <p className='text-xs text-zinc-300'>{universalDay.meaning}</p>
            </div>
            <div className='text-center border border-zinc-700/50 rounded-lg p-4 bg-zinc-900/30'>
              <div className='flex items-center justify-center mb-2'>
                <Lock className='w-4 h-4 text-zinc-500 mr-1' />
                <div className='text-2xl font-light text-zinc-500 mb-1'>?</div>
              </div>
              <div className='text-xs text-zinc-500 uppercase tracking-wide mb-1'>
                Personal Day
              </div>
              <p className='text-xs text-zinc-500 mb-3'>
                Sign up for free to get your Personal Day number with a birth
                chart
              </p>
              {/* <SmartTrialButton
                feature='birth_chart'
                hasRequiredData={false}
                size='xs'
                className='max-w-10'
              /> */}
            </div>
          </div>
        </HoroscopeSection>

        <FeaturePreview
          title='Personal Insight'
          description='Get insights specifically tailored to your birth chart and cosmic profile'
          feature='personalized_horoscope'
          icon={
            <Sparkles
              className='w-8 h-8 text-lunary-accent-400 mx-auto'
              strokeWidth={1.5}
            />
          }
          blurredContent={
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 opacity-60'>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                ●●●●● ●●●●● ●●● ●●●●●●●● ●●●●●●●● ●●● ●●●●●●● ●●●●●●●●● ●●●●●●●
                ●●● ●●●●●●●●● ●●●●●●●● ●●●●●. ●●●●●● ●●●●●●●● ●●● ●●●●●●●●●
                ●●●●●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●● ●●●●●●●● ●●●●●●●●●
                ●●●●●●●●●.
              </p>
            </div>
          }
        />

        <FeaturePreview
          title='Solar Return Insights'
          description='Discover your personal year themes and birthday insights'
          feature='solar_return'
          blurredContent={
            <div className='rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 p-6 opacity-60'>
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
                  <span className='text-sm text-zinc-300'>●●●●●●●● ●●●●:</span>
                  <span className='text-sm font-medium text-zinc-200'>●</span>
                </div>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  ●●●● ●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●●●● ●●● ●●●●●●●●●●
                  ●●●●●●●●●● ●●●●●●●● ●●●●●●●●●●●.
                </p>
              </div>
            </div>
          }
        />

        {/* <HoroscopeSection title='Cosmic Calendar' color='zinc'>
          <p className='text-sm text-zinc-400 mb-4'>
            Upcoming planetary events and moon phases affecting everyone
          </p>
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {upcomingTransits.slice(0, 6).map((transit, index) => (
              <TransitCard key={index} transit={transit} />
            ))}
            {upcomingTransits.length === 0 && (
              <p className='text-zinc-400 text-center py-4 text-sm'>
                No significant transits in the next 30 days
              </p>
            )}
          </div>
        </HoroscopeSection> */}

        {/* <HoroscopeSection
          title='Unlock Your Complete Cosmic Profile'
          color='purple'
        >
          <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
            Get access to all the personalized features you see previewed above
            - horoscopes based on YOUR birth chart with deep personal insights
            and cosmic guidance tailored specifically to you.
          </p>
          <ul className='text-xs text-zinc-400 space-y-2 mb-4'>
            <li>• Personal insight based on your birth chart</li>
            <li>• Solar return birthday analysis</li>
            <li>• Personal transit impact reports</li>
            <li>• Complete cosmic profile features</li>
          </ul>
          <SmartTrialButton />
        </HoroscopeSection> */}
      </div>
    </div>
  );
}
