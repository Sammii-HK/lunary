'use client';

import { useEffect, useState, useMemo, type MouseEvent } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { usePlanetaryChart } from '@/context/AstronomyContext';
import {
  calculateTransitAspects,
  calculateHouse,
} from '@/lib/astrology/transit-aspects';
import {
  getTransitCopy,
  getDigestIntro,
  ordinal,
} from '@/lib/copy/transit-copy';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { Check, Circle, Orbit, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { mutate } from 'swr';
import Link from 'next/link';
import { recordCheckIn, type StreakRecord } from '@/lib/streak/check-in';
import { useRouter } from 'next/navigation';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { getGeneralHoroscope } from '../../../utils/astrology/generalHoroscope';
import { MoreForToday } from '@/components/horoscope/MoreForToday';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { useProgress } from '@/components/progress/useProgress';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { useCTACopy } from '@/hooks/useCTACopy';
import { shouldRedactWord } from '@/constants/redactedWords';
import { isInDemoMode } from '@/lib/demo-mode';
import { IntentionPrompt } from '@/components/rituals/IntentionPrompt';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { iosLabel } from '@/lib/ios-labels';

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

const SLOW_PLANET_SCORE: Record<string, number> = {
  Pluto: 5,
  Neptune: 5,
  Uranus: 4,
  Saturn: 4,
  Jupiter: 3,
  Mars: 2,
};
const getTodayString = () => new Date().toISOString().split('T')[0];

// Use sessionStorage in demo mode so each visitor gets a fresh view
const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return isInDemoMode() ? sessionStorage : localStorage;
};

export const PersonalizedHoroscopePreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  const isNativeIOS = useIsNativeIOS();
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

  const { currentAstrologicalChart } = usePlanetaryChart();
  const router = useRouter();
  const { progress: skillProgress } = useProgress();
  const ritualSkill = skillProgress.find((p) => p.skillTree === 'ritual');

  const [ritualComplete, setRitualComplete] = useState(false);
  const [streakInfo, setStreakInfo] = useState<StreakRecord | null>(null);
  const [horoscope, setHoroscope] = useState<CachedHoroscope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const todayString = getTodayString();

  // Top 2-3 transit aspects ranked by significance — paid user digest
  const topTransitAspects = useMemo(() => {
    if (!user?.birthChart || !currentAstrologicalChart?.length) return [];
    const aspects = calculateTransitAspects(
      user.birthChart as Parameters<typeof calculateTransitAspects>[0],
      currentAstrologicalChart,
    );
    return aspects
      .map((a) => ({
        ...a,
        score:
          (SLOW_PLANET_SCORE[a.transitPlanet] ?? 1) + (10 - a.orbDegrees) / 10,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  }, [user?.birthChart, currentAstrologicalChart]);

  // House placement chips for free users — real chart data, interpretation locked
  const freePlanetTeases = useMemo(() => {
    if (!user?.birthChart || !currentAstrologicalChart?.length) return [];
    const birthChart = user.birthChart as Array<{
      body: string;
      eclipticLongitude: number;
    }>;
    const ascendant = birthChart.find((p) => p.body === 'Ascendant');
    if (!ascendant) return [];

    return ['Jupiter', 'Saturn', 'Mars', 'Venus', 'Sun']
      .map((name) => {
        const planet = currentAstrologicalChart.find(
          (p: { body: string }) => p.body === name,
        );
        if (!planet) return null;
        const house = calculateHouse(
          planet.eclipticLongitude,
          ascendant.eclipticLongitude,
        );
        return { planet: name, house };
      })
      .filter((x): x is { planet: string; house: number } => x !== null)
      .slice(0, 3);
  }, [user?.birthChart, currentAstrologicalChart]);
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');
  const ctaCopy = useCTACopy();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storage = getStorage();
    if (!storage) return;

    const stored = storage.getItem(FOCUS_COMPLETE_KEY);
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
        storage.removeItem(FOCUS_COMPLETE_KEY);
      }
    }
    setRitualComplete(false);
  }, [todayString]);

  useEffect(() => {
    if (!ritualComplete || typeof window === 'undefined') return undefined;
    const storage = getStorage();
    if (!storage) return undefined;

    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(now.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const delay = midnight.getTime() - now.getTime();
    const timeout = setTimeout(() => {
      storage.removeItem(FOCUS_COMPLETE_KEY);
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
    // CRITICAL: Stop all propagation first to prevent Link navigation
    event.preventDefault();
    event.stopPropagation();

    // Check if in demo mode - show modal instead of navigating
    const demoMode = isInDemoMode();
    if (demoMode) {
      window.dispatchEvent(
        new CustomEvent('demo-action-blocked', {
          detail: { action: 'Accessing journal' },
        }),
      );
      return;
    }

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
      const storage = getStorage();
      if (storage) {
        const today = new Date().toISOString().split('T')[0];
        storage.setItem(
          FOCUS_COMPLETE_KEY,
          JSON.stringify({ date: today, streak: result?.streak }),
        );
        window.dispatchEvent(new Event('lunary-focus-complete'));
      }
    }
    setRitualComplete(true);
    if (result?.streak) {
      setStreakInfo(result.streak);
    }
    mutate('/api/progress');
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
          <p className='text-xs text-content-muted'>{contentWithSpaces}</p>
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
        href='/pricing?nav=app'
        className='group block border border-stroke-subtle rounded-2xl bg-surface-base/70 p-4 shadow-sm transition-colors hover:border-lunary-primary-500 hover:bg-surface-elevated'
        onClick={(e) => {
          // If click target is a button, let button handle it
          const target = e.target as HTMLElement;
          if (target.closest('button')) {
            e.preventDefault();
          }
        }}
      >
        <div className='space-y-3'>
          <div>
            <h3 className='text-sm leading-snug text-content-primary flex items-center'>
              <Orbit className='mr-2 w-4 h-4 text-content-brand-accent' />
              Today's Cosmic Energy
            </h3>
          </div>

          {isLoading ? (
            <div className='space-y-2 text-xs text-content-muted'>
              <div className='h-3 bg-surface-card rounded animate-pulse' />
              <div className='h-3 bg-surface-card rounded animate-pulse w-5/6' />
              <div className='h-3 bg-surface-card rounded animate-pulse w-4/6' />
            </div>
          ) : (
            <>
              {freePlanetTeases.length > 0 ? (
                <div className='space-y-2.5'>
                  <p className='text-[0.6rem] uppercase tracking-[0.2em] text-content-muted'>
                    Active in your chart right now
                  </p>
                  <div className='flex flex-wrap gap-1.5'>
                    {freePlanetTeases.map(({ planet, house }) => (
                      <span
                        key={planet}
                        className='inline-flex items-center gap-1 rounded-full border border-stroke-subtle bg-surface-elevated px-2 py-0.5 text-[0.65rem] text-content-muted'
                      >
                        {planet}
                        <span className='text-content-muted'>·</span>
                        <span className='text-content-muted'>
                          {ordinal(house)} house
                        </span>
                        <Lock className='ml-0.5 h-2.5 w-2.5 text-content-muted' />
                      </span>
                    ))}
                  </div>

                  {topTransitAspects.length > 0 && (
                    <div className='rounded-xl border border-stroke-subtle/60 bg-surface-elevated/40 px-3 py-2 space-y-1'>
                      <p className='text-xs font-medium text-content-primary'>
                        {
                          getTransitCopy({
                            transitPlanet: topTransitAspects[0].transitPlanet,
                            natalPlanet: topTransitAspects[0].natalPlanet,
                            aspectType: topTransitAspects[0].aspectType,
                            userId: user?.id,
                          }).headline
                        }
                      </p>
                      <p className='text-[0.65rem] text-content-muted flex items-center gap-1'>
                        <Lock className='h-2.5 w-2.5' />
                        Interpretation available with Lunary+
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-sm text-content-primary leading-snug mb-2'>
                  {`${generalHoroscope.reading.split('.')[0]}.`}
                </p>
              )}

              <div className='relative mt-1'>
                {renderPreview()}
                <span className='absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] bg-layer-base/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-content-brand'>
                  <Sparkles className='w-2.5 h-2.5' />
                  Lunary+
                </span>
              </div>

              <span className='flex items-center gap-1.5 text-xs text-content-secondary hover:text-content-secondary transition-colors'>
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
      className='group block border border-stroke-subtle rounded-2xl bg-surface-base/70 p-4 shadow-sm transition-colors hover:border-lunary-primary-500 hover:bg-surface-elevated'
      onClick={(e) => {
        // Prevent navigation when clicking interactive elements inside the card
        const target = e.target as HTMLElement;
        if (
          target.closest('button') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('a')
        ) {
          e.preventDefault();
        }
      }}
    >
      <div className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h3 className='text-sm leading-snug text-content-primary flex'>
              <Orbit className='mr-2 w-4 h-4 text-content-brand-accent' />
              {horoscope?.headline || 'Personalized review'}
            </h3>
          </div>
        </div>

        {isLoading ? (
          <div className='space-y-2 text-xs text-content-muted'>
            <div className='h-3 bg-surface-card rounded animate-pulse' />
            <div className='h-3 bg-surface-card rounded animate-pulse w-5/6' />
            <div className='h-3 bg-surface-card rounded animate-pulse w-4/6' />
          </div>
        ) : (
          <>
            {topTransitAspects.length > 0 && !ritualComplete ? (
              <div className='space-y-2.5'>
                <p className='text-[0.6rem] uppercase tracking-[0.2em] text-content-muted'>
                  {getDigestIntro(user?.id)}
                </p>
                {topTransitAspects.map((aspect, i) => {
                  const copy = getTransitCopy({
                    transitPlanet: aspect.transitPlanet,
                    natalPlanet: aspect.natalPlanet,
                    aspectType: aspect.aspectType,
                    remainingDays: aspect.duration?.remainingDays,
                    userId: user?.id,
                    seed: i,
                  });
                  return (
                    <div
                      key={`${aspect.transitPlanet}-${aspect.natalPlanet}-${i}`}
                      className='space-y-0.5'
                    >
                      <p className='text-xs font-medium text-content-primary'>
                        {copy.headline}
                      </p>
                      <p className='text-xs text-content-muted leading-relaxed'>
                        {copy.meaning}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className='text-sm text-content-secondary leading-snug'>
                {focusText || horoscope?.dailyGuidance}
              </p>
            )}

            <div className='rounded-xl border border-stroke-subtle/60 bg-surface-elevated/60 px-3 py-2 text-[0.7rem] uppercase text-content-muted'>
              <div className='flex items-center gap-1 justify-between tracking-[0.25em]'>
                {iosLabel("Today's ritual", isNativeIOS)}
                <div className='flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.3em] text-content-muted'>
                  <button
                    type='button'
                    aria-pressed={ritualComplete}
                    aria-label={iosLabel('Mark ritual complete', isNativeIOS)}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleRitualCompletion(event);
                    }}
                    className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                      ritualComplete
                        ? 'border-lunary-accent text-lunary-accent'
                        : 'border-stroke-default text-content-muted'
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
              <p className='mt-1 text-xs text-content-secondary normal-case'>
                {anchorCopy}
              </p>
            </div>

            {(horoscope?.focusAreas?.length ?? 0) > 0 && (
              <MoreForToday focusAreas={horoscope?.focusAreas ?? []} />
            )}

            {ritualComplete && (
              <>
                <p className='text-[0.65rem] text-content-muted flex flex-wrap items-center gap-2'>
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
                    className='text-[0.65rem] text-lunary-accent hover:text-content-brand-accent transition-colors'
                  >
                    Journal about it
                  </button>
                </p>
                <IntentionPrompt />
              </>
            )}

            {ritualComplete && ritualSkill ? (
              <div className='mt-1'>
                <div className='flex items-center justify-between mb-0.5'>
                  <span className='text-[0.6rem] text-content-muted'>
                    Ritual Keeper · Lv. {ritualSkill.currentLevel}
                  </span>
                  {streakCopy && (
                    <span className='text-[0.6rem] text-content-brand-accent'>
                      {streakCopy}
                    </span>
                  )}
                </div>
                <ProgressBar
                  progress={ritualSkill.progressToNext}
                  level={ritualSkill.currentLevel}
                  size='sm'
                  showLabel={false}
                />
              </div>
            ) : (
              streakCopy && (
                <p className='text-[0.65rem] text-content-brand-accent'>
                  {streakCopy}
                </p>
              )
            )}

            {/* <div className='flex flex-wrap items-center gap-2 text-[0.65rem] text-content-muted'>
              <ReflectionBox />
            </div> */}
          </>
        )}
      </div>
    </Link>
  );
};
