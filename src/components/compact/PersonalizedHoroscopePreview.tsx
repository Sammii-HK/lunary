'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { getPersonalizedHoroscope } from '../../../utils/astrology/personalizedHoroscope';
import { ArrowRight, Check, Circle, Orbit } from 'lucide-react';
import Link from 'next/link';
import { buildDailyFocusCard } from '../../../utils/astrology/dailyFocus';
import { recordCheckIn, type StreakRecord } from '@/lib/streak/check-in';
import { useRouter } from 'next/navigation';

const FOCUS_COMPLETE_KEY = 'lunary_focus_complete';
const getTodayString = () => new Date().toISOString().split('T')[0];

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

  const router = useRouter();

  const [ritualComplete, setRitualComplete] = useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakRecord | null>(null);
  const todayString = getTodayString();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(FOCUS_COMPLETE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          date: string;
          streak?: StreakRecord;
        };
        setRitualComplete(parsed.date === todayString);
        if (parsed.date === todayString && parsed.streak) {
          setStreakInfo(parsed.streak);
        }
        return;
      } catch {
        localStorage.removeItem(FOCUS_COMPLETE_KEY);
      }
    }
    setRitualComplete(false);
  }, [todayString]);

  useEffect(() => {
    if (!ritualComplete || typeof window === 'undefined') return undefined;
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(now.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const delay = midnight.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      localStorage.removeItem(FOCUS_COMPLETE_KEY);
      window.dispatchEvent(new Event('lunary-focus-complete'));
      setRitualComplete(false);
    }, delay);
    return () => clearTimeout(timeout);
  }, [ritualComplete]);

  if (!canAccessPersonalized) return null;

  const personalizedHoroscope = getPersonalizedHoroscope(user?.birthday);
  const dailyFocusCard = buildDailyFocusCard(personalizedHoroscope);
  const handleJournalClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    router.push('/guide?journal=true');
  };

  const handleRitualCompletion = async (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (ritualComplete) return;
    const result = await recordCheckIn();
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(
        FOCUS_COMPLETE_KEY,
        JSON.stringify({ date: today, streak: result?.streak }),
      );
      window.dispatchEvent(new Event('lunary-focus-complete'));
    }
    setRitualComplete(true);
    if (result?.streak) {
      setStreakInfo(result.streak);
    }
  };
  const focusText = ritualComplete
    ? 'You honoured today’s focus.'
    : dailyFocusCard.focus;
  const streakCopy =
    ritualComplete && streakInfo && streakInfo.current > 0
      ? `${streakInfo.current}-day streak${
          streakInfo.current === streakInfo.longest ? ' · personal best' : ''
        }`
      : null;

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
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              aria-pressed={ritualComplete}
              aria-label='Mark ritual complete'
              onClick={handleRitualCompletion}
              className={`flex h-5 w-5 mr-1 items-center justify-center rounded-full border transition-colors ${
                ritualComplete
                  ? 'border-lunary-accent text-lunary-accent'
                  : 'border-zinc-700 text-zinc-500'
              }`}
            >
              {ritualComplete ? (
                <Check className='h-4 w-4' />
              ) : (
                <Circle className='h-4 w-4' />
              )}
            </button>
            <span
              className={`text-[0.55rem] uppercase tracking-widest ${
                ritualComplete ? 'text-lunary-accent' : 'text-zinc-500'
              }`}
            >
              Complete
            </span>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-300 transition-colors flex-shrink-0 mt-1' />
        </div>
      </div>
      <p className='text-[0.65rem] uppercase tracking-widest text-zinc-500 mb-2'>
        Today's ritual
      </p>
      {!ritualComplete && (
        <p className='text-zinc-300 leading-relaxed'>{focusText}</p>
      )}
      {ritualComplete && (
        <button
          type='button'
          onClick={handleJournalClick}
          className='text-lunary-accent hover:text-lunary-accent-100 transition-colors'
        >
          Journal about this focus.
        </button>
      )}

      {streakCopy && (
        <p className='text-[0.65rem] text-lunary-accent-200 mt-1'>
          {streakCopy}
        </p>
      )}
      <p className='text-lunary-primary-200 leading-relaxed'>
        {ritualComplete
          ? 'Let this focus settle naturally.'
          : dailyFocusCard.prompt}
      </p>
    </Link>
  );
};
