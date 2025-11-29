import Link from 'next/link';
import { getEnhancedPersonalizedHoroscope } from '../../../../utils/astrology/enhancedHoroscope';
import { getBirthChartFromProfile } from '../../../../utils/astrology/birthChart';
import { getSolarReturnInsights } from '../../../../utils/astrology/transitCalendar';
import { getPersonalTransitImpacts } from '../../../../utils/astrology/personalTransits';
import { getUpcomingTransits } from '../../../../utils/astrology/transitCalendar';
import { HoroscopeSection } from './HoroscopeSection';
import { LuckyElements } from './LuckyElements';
import { PersonalTransitImpactCard } from './PersonalTransitImpact';

interface PaidHoroscopeViewProps {
  userBirthday?: string;
  userName?: string;
  profile: any;
}

export function PaidHoroscopeView({
  userBirthday,
  userName,
  profile,
}: PaidHoroscopeViewProps) {
  const horoscope = getEnhancedPersonalizedHoroscope(
    userBirthday,
    userName,
    profile,
  );
  const birthChart = getBirthChartFromProfile(profile);
  const solarReturnData = userBirthday
    ? getSolarReturnInsights(userBirthday)
    : null;
  const upcomingTransits = getUpcomingTransits();
  const personalTransitImpacts = birthChart
    ? getPersonalTransitImpacts(upcomingTransits, birthChart, 10)
    : [];

  return (
    <div className='h-full space-y-6 p-4 overflow-auto'>
      <div className='pt-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          {userName ? `${userName}'s Horoscope` : 'Your Horoscope'}
        </h1>
        <p className='text-sm text-zinc-400'>
          Personalized guidance based on your birth chart
        </p>
      </div>

      <div className='space-y-6'>
        <HoroscopeSection title='Personal Insight' color='emerald'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {horoscope.personalInsight}
          </p>
        </HoroscopeSection>

        <HoroscopeSection title='Cosmic Highlight' color='purple'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {horoscope.cosmicHighlight}
          </p>
        </HoroscopeSection>

        <HoroscopeSection title='Your Lucky Elements' color='indigo'>
          <p className='text-sm text-zinc-400 mb-4'>
            Personalized daily elements based on planetary positions,
            numerology, and your birth chart
          </p>
          <LuckyElements elements={horoscope.luckyElements} />
        </HoroscopeSection>

        <HoroscopeSection title='Personal Transit Impact' color='indigo'>
          <p className='text-sm text-zinc-400 mb-4'>
            How upcoming transits specifically affect your birth chart
          </p>
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {personalTransitImpacts.length > 0 ? (
              personalTransitImpacts.map((impact, index) => (
                <PersonalTransitImpactCard key={index} impact={impact} />
              ))
            ) : (
              <p className='text-zinc-400 text-center py-4 text-sm'>
                No significant personal transits in the next 30 days
              </p>
            )}
          </div>
        </HoroscopeSection>

        {!userBirthday && (
          <HoroscopeSection title='Complete Your Profile' color='amber'>
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
          </HoroscopeSection>
        )}

        {solarReturnData && (
          <HoroscopeSection title='Solar Return Insights' color='amber'>
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
          </HoroscopeSection>
        )}
      </div>
    </div>
  );
}
