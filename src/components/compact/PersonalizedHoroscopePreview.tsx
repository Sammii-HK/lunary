'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { Check, Circle, Orbit, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { recordCheckIn, type StreakRecord } from '@/lib/streak/check-in';
import { useRouter } from 'next/navigation';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { getGeneralHoroscope } from '../../../utils/astrology/generalHoroscope';
import { MoreForToday } from '@/components/horoscope/MoreForToday';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { useCTACopy } from '@/hooks/useCTACopy';

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
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');
  const ctaCopy = useCTACopy();

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
    // Generate horoscope for ALL authenticated users (free and paid)
    if (!authStatus.isAuthenticated || !user?.birthday) return;
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
  }, [
    authStatus.isAuthenticated,
    user?.birthday,
    user?.name,
    user?.birthChart,
  ]);

  // Don't show at all for unauthenticated users or users without birthday
  if (!authStatus.isAuthenticated || !user?.birthday) return null;

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
    ? "You honoured today's focus."
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

  // Helper to determine if a word should be redacted
  const shouldRedactWord = (word: string, index: number): boolean => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');

    // Prioritize house numbers (1st, 2nd, 3rd, 12th, etc.)
    if (/^\d+(st|nd|rd|th)$/.test(cleanWord)) return true;

    // Redact planet names
    const planets = [
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
    ];
    if (planets.includes(cleanWord)) return true;

    // Redact zodiac signs
    const signs = [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'libra',
      'scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces',
    ];
    if (signs.includes(cleanWord)) return true;

    // Redact chart-related terms
    const chartTerms = [
      'house',
      'placement',
      'natal',
      'chart',
      'transit',
      'aspect',
      'ritual',
    ];
    if (chartTerms.includes(cleanWord)) return true;

    // Redact guidance/conclusion phrases
    const guidanceTerms = [
      'authentically',
      'instincts',
      'transformation',
      'healing',
      'manifestation',
      'intuition',
      'wisdom',
      'strength',
      'clarity',
      'balance',
      'harmony',
      'power',
      'growth',
      'abundance',
      'passion',
      'creativity',
      'connection',
      'release',
      'embrace',
      'illuminate',
    ];
    if (guidanceTerms.includes(cleanWord)) return true;

    // Redact some other words for variety (every 6th word if not already redacted)
    return index % 6 === 4;
  };

  // Helper to render preview based on A/B test variant
  const renderPreview = () => {
    // For free users, show PERSONALIZED horoscope preview (what they're missing)
    // Use the horoscope that was already fetched (personalized for authenticated users)
    const content = horoscope?.overview || horoscope?.dailyGuidance || '';
    const ritualText = horoscope?.tinyAction || 'Honor one grounded ritual';

    if (!content) return null;

    if (variant === 'truncated') {
      // Variant B: Truncated - 1 line for horoscope, 1 line for ritual hint
      // Show first 1-2 words of ritual, let gradient fade handle the rest
      const ritualWords = ritualText.split(' ');
      const preview = `Today's ritual: ${ritualWords.slice(0, 2).join(' ')} ${ritualWords.slice(2).join(' ')}`;

      return (
        <div className='space-y-1 mb-2'>
          <div className='locked-preview-truncated-single'>
            <p className='text-xs'>{content}</p>
          </div>
          <div className='locked-preview-ritual'>
            <p className='text-xs'>{preview}</p>
          </div>
        </div>
      );
    }

    if (variant === 'redacted') {
      // Variant C: Redacted style - soft blur effect on key terms
      const fullText = `${content} Today's ritual: ${ritualText}`;
      const words = fullText.split(' ');
      const redactedContent = words.map((word, i) => {
        const shouldRedact = shouldRedactWord(word, i);
        return shouldRedact ? (
          <span key={i} className='redacted-word'>
            {word}
          </span>
        ) : (
          <span key={i}>{word}</span>
        );
      });

      const contentWithSpaces: React.ReactNode[] = [];
      redactedContent.forEach((element, i) => {
        contentWithSpaces.push(element);
        if (i < redactedContent.length - 1) {
          contentWithSpaces.push(' ');
        }
      });

      return (
        <div className='locked-preview-redacted mb-2'>
          <p className='text-xs text-zinc-400'>{contentWithSpaces}</p>
        </div>
      );
    }

    // Variant A: Blur Effect (default)
    return (
      <div className='locked-preview mb-2'>
        <p className='locked-preview-text text-xs'>{content}</p>
      </div>
    );
  };

  // Show locked preview for free users
  if (!canAccessPersonalized) {
    // Use general horoscope for free users instead of personalized
    const generalHoroscope = getGeneralHoroscope(new Date());

    return (
      <Link
        href='/pricing'
        className='group block border border-zinc-800 rounded-2xl bg-zinc-950/70 p-4 shadow-sm transition-colors hover:border-lunary-primary-500 hover:bg-zinc-900'
      >
        <div className='space-y-3'>
          <div>
            <h3 className='text-sm font-semibold leading-snug text-zinc-100 flex items-center'>
              <Orbit className='mr-2 w-4 h-4 text-lunary-accent-300' />
              Today's Cosmic Energy
            </h3>
          </div>

          {isLoading ? (
            <div className='space-y-2 text-xs text-zinc-500'>
              <div className='h-3 bg-zinc-800 rounded animate-pulse' />
              <div className='h-3 bg-zinc-800 rounded animate-pulse w-5/6' />
              <div className='h-3 bg-zinc-800 rounded animate-pulse w-4/6' />
            </div>
          ) : (
            <>
              <p className='text-sm text-zinc-200 leading-snug mb-2'>
                {generalHoroscope.reading.split('.')[0]}.
              </p>

              <div className='relative'>
                {renderPreview()}
                <span className='absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300'>
                  <Sparkles className='w-2.5 h-2.5' />
                  Lunary+
                </span>
              </div>

              <span className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors font-medium'>
                <span>{ctaCopy.horoscope}</span>
                <ArrowRight className='w-4 h-4' />
              </span>
            </>
          )}
        </div>
      </Link>
    );
  }

  // Full personalized horoscope for paid users
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
