import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import { HoroscopeSection } from './HoroscopeSection';
import { FeaturePreview } from './FeaturePreview';
import { TransitCard } from './TransitCard';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { Sparkles } from 'lucide-react';

export function FreeHoroscopeView() {
  const generalHoroscope = getGeneralHoroscope();
  const upcomingTransits = getUpcomingTransits();

  return (
    <div className='h-full space-y-6 p-4 overflow-auto'>
      <div className='pt-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          Your Horoscope
        </h1>
        <p className='text-sm text-zinc-400'>
          General cosmic guidance based on universal energies
        </p>
      </div>

      <div className='space-y-6'>
        <HoroscopeSection title="Today's Horoscope" color='purple'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {generalHoroscope.reading}
          </p>
        </HoroscopeSection>

        <HoroscopeSection title='Cosmic Highlight' color='emerald'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {generalHoroscope.generalAdvice}
          </p>
        </HoroscopeSection>

        <FeaturePreview
          title='Personal Insight'
          description='Get insights specifically tailored to your birth chart and cosmic profile'
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

        <FeaturePreview
          title='Personal Transit Impact'
          description='See how planetary transits specifically affect your birth chart'
          blurredContent={
            <div className='rounded-lg border border-lunary-secondary-700 bg-lunary-secondary-950 p-6 opacity-60'>
              <p className='text-sm text-zinc-300 mb-4'>
                ●●● ●●●●● ●●●●●●● ●●●●●● ●●●●●●●●● ●●● ●●●● ●●●●● ●●●●●
                ●●●●●●●●●
              </p>
              <div className='space-y-3'>
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className='rounded border-l-4 border-lunary-secondary-600 bg-zinc-800/50 p-4'
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
                      <span className='bg-lunary-primary-900 text-lunary-accent-300 px-2 py-1 rounded text-xs font-medium border border-lunary-primary-700'>
                        ●●●●●●●●
                      </span>
                    </div>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      ●●●● ●●●●●● ●●● ●●●●●●●●● ●●●●●●● ●●●●●●● ●●● ●●●●●●●●●●
                      ●●●●●●●●●.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <HoroscopeSection title='Cosmic Calendar' color='zinc'>
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
        </HoroscopeSection>

        <HoroscopeSection
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
        </HoroscopeSection>
      </div>
    </div>
  );
}
