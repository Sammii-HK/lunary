import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { getPersonalizedHoroscope } from '../../../utils/astrology/personalizedHoroscope';
import { ArrowRight, Orbit } from 'lucide-react';
import Link from 'next/link';
import { buildDailyFocusCard } from '../../../utils/astrology/dailyFocus';

export const PersonalizedHoroscopePreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  const hasPersonalizedAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
  );
  const canAccessPersonalized =
    authStatus.isAuthenticated &&
    hasPersonalizedAccess &&
    user?.birthday &&
    user?.birthChart;

  if (!canAccessPersonalized) return null;

  const personalizedHoroscope = getPersonalizedHoroscope(
    user?.birthday,
    user?.name,
  );
  const dailyFocusCard = buildDailyFocusCard(personalizedHoroscope);
  console.log('dailyFocusCard', dailyFocusCard);

  return (
    <Link
      href='/horoscope'
      className='py-3 px-4 border border-stone-800 hover:border-lunary-primary-700/50 transition-colors rounded-md w-full min-h-fit h-auto group'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              <Orbit className='w-4 h-4 text-lunary-primary-300' />
              <span className='text-sm font-medium text-zinc-200'>
                {dailyFocusCard.title}
              </span>
              {/* <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                {dailyFocusCard.tag}
              </span> */}
              <span className='text-xs bg-zinc-800/50 text-lunary-secondary-200 px-1.5 py-0.5 rounded'>
                {dailyFocusCard.headline}
              </span>
            </div>
            <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
              Personal
            </span>
          </div>
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-300 transition-colors flex-shrink-0 mt-1' />
      </div>
      <p className='text-zinc-300 leading-relaxed'>{dailyFocusCard.focus}</p>
      <p className='text-lunary-primary-200 leading-relaxed'>
        {dailyFocusCard.prompt}
      </p>
    </Link>
  );
};
