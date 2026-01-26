'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { Check, Circle, Orbit } from 'lucide-react';
import Link from 'next/link';
import { recordCheckIn, type StreakRecord } from '@/lib/streak/check-in';
import { useRouter } from 'next/navigation';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { MoreForToday } from '@/components/horoscope/MoreForToday';

type FocusArea = {
  area: 'love' | 'work' | 'inner';
  title: string;
  guidance: string;
};

interface CachedHoroscope {
  sunSign: string;
  moonPhase: string;
  headline: string;
  overview: string;
  focusAreas?: FocusArea[];
  tinyAction: string;
  dailyGuidance: string;
}

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
  const [horoscope, setHoroscope] = useState<CachedHoroscope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (!canAccessPersonalized) return;
    let active = true;
    setIsLoading(true);
    const profile =
      user?.birthChart && typeof user.birthChart === 'object'
        ? { birthChart: user.birthChart }
        : undefined;

    const fetchHoroscope = async () => {
      try {
        const response = await fetch('/api/horoscope/daily');
        if (response.ok) {
          const data = (await response.json()) as CachedHoroscope;
          if (active) {
            setHoroscope(data);
            setIsLoading(false);
          }
          return;
        }
      } catch (error) {
        console.error(
          '[PersonalizedHoroscopePreview] Failed to fetch daily horoscope',
          error,
        );
      }

      const fallback = getEnhancedPersonalizedHoroscope(
        user?.birthday,
        user?.name,
        profile,
      );
      if (active) {
        setHoroscope(fallback);
        setIsLoading(false);
      }
    };

    fetchHoroscope();
    return () => {
      active = false;
    };
  }, [canAccessPersonalized, user?.birthday, user?.name, user?.birthChart]);

  if (!canAccessPersonalized) return null;

  const journalPrompt = horoscope?.dailyGuidance
    ? horoscope.dailyGuidance.replace(/\n+/g, ' ')
    : '';
  const handleJournalClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const promptKey = Date.now();
    router.push(
      `/book-of-shadows?prompt=${encodeURIComponent(
        `${journalPrompt}`,
      )}&tab=journal&promptKey=${promptKey}`,
    );
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
    : horoscope?.overview || horoscope?.dailyGuidance || '';
  const anchorCopy = ritualComplete
    ? 'Ritual complete for today.'
    : horoscope?.tinyAction ||
      'Honor one grounded ritual before the day deepens.';
  const streakCopy =
    ritualComplete && streakInfo && streakInfo.current > 0
      ? `${streakInfo.current}-day streak${
          streakInfo.current === streakInfo.longest ? ' · personal best' : ''
        }`
      : null;

  return (
    <Link
      href='/horoscope'
      className='group block border border-zinc-800 rounded-2xl bg-zinc-950/70 p-4 shadow-sm transition-colors hover:border-lunary-primary-500 hover:bg-zinc-900'
    >
      <div className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h3 className='text-sm font-semibold leading-snug text-zinc-100 flex'>
              <Orbit className='mr-2 w-4 h-4 text-lunary-accent-300' />
              {horoscope?.headline || 'Personalized review'}
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className='space-y-2 text-xs text-zinc-500'>
            <div className='h-3 bg-zinc-800 rounded animate-pulse' />
            <div className='h-3 bg-zinc-800 rounded animate-pulse w-5/6' />
            <div className='h-3 bg-zinc-800 rounded animate-pulse w-4/6' />
          </div>
        ) : (
          <>
            <p className='text-sm text-zinc-300 leading-snug'>
              {focusText || horoscope?.dailyGuidance}
            </p>

            <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-3 py-2 text-[0.7rem] uppercase text-zinc-400'>
              <div className='flex items-center gap-1 justify-between tracking-[0.25em]'>
                Today's ritual
                <div className='flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.3em] text-zinc-500'>
                  <button
                    type='button'
                    aria-pressed={ritualComplete}
                    aria-label='Mark ritual complete'
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleRitualCompletion(event);
                    }}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
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
                  <span className='ml-1'>Complete</span>
                </div>
              </div>
              <p className='mt-1 text-xs text-lunary-primary-200 normal-case'>
                {anchorCopy}
              </p>
            </div>

            {(horoscope?.focusAreas?.length ?? 0) > 0 && (
              <MoreForToday focusAreas={horoscope?.focusAreas ?? []} />
            )}

            {ritualComplete && (
              <p className='text-[0.65rem] text-zinc-400 flex flex-wrap items-center gap-2'>
                <span className='whitespace-nowrap'>
                  Capture this ritual inside your Book of Shadows.
                </span>
                <button
                  type='button'
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleJournalClick(event);
                  }}
                  className='text-[0.65rem] font-medium text-lunary-accent hover:text-lunary-accent-100 transition-colors'
                >
                  Journal about it
                </button>
              </p>
            )}

            {streakCopy && (
              <p className='text-[0.65rem] text-lunary-accent-200'>
                {streakCopy}
              </p>
            )}

            {/* <div className='flex flex-wrap items-center gap-2 text-[0.65rem] text-zinc-500'>
              <ReflectionBox />
            </div> */}
          </>
        )}
      </div>
    </Link>
  );
};
