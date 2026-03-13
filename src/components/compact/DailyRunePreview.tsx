'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { useCosmicDate } from '../../context/AstronomyContext';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { useCTACopy } from '@/hooks/useCTACopy';
import { shouldRedactWord } from '@/constants/redactedWords';
import { isInDemoMode } from '@/lib/demo-mode';
import { runesList } from '@/constants/runes';
import type { Rune } from '@/constants/runes';
import { Button } from '../ui/button';
import { getLocalDateString } from '@/lib/cache/dailyCache';
import { stringToKebabCase } from '../../../utils/string';
import seedRandom from 'seed-random';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

const runeKeys = Object.keys(runesList).sort();

function getDailyRune(
  dateStr: string,
  userName?: string,
  userBirthday?: string,
): { key: string; rune: Rune; isReversed: boolean } {
  const parts = [dateStr, userName?.trim().toLowerCase(), userBirthday?.trim()]
    .filter(Boolean)
    .join('|');
  const seed = `rune-${parts}`;
  const rand = seedRandom(seed);
  const index = Math.floor(rand() * runeKeys.length);
  const isReversed = rand() > 0.5;
  const key = runeKeys[index];
  return { key, rune: runesList[key], isReversed };
}

export const DailyRunePreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const router = useRouter();
  const subscription = useSubscription();
  const { currentDate } = useCosmicDate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const variant = useFeatureFlagVariant('paywall_preview_style_v1') || 'blur';
  const ctaCopy = useCTACopy();

  const hasPersonalizedAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_rune',
  );

  const userName = user?.name;
  const userBirthday = user?.birthday;

  const canAccessPersonalized =
    authStatus.isAuthenticated &&
    hasPersonalizedAccess &&
    userName &&
    userBirthday;

  const dailyRune = useMemo(() => {
    const dateStr = currentDate || getLocalDateString();
    const selectedDay = dayjs(dateStr);
    const dayOfYearNum = selectedDay.dayOfYear();

    // General rune — same for everyone
    const general = getDailyRune(`cosmic-${dateStr}-${dayOfYearNum}-rune`);

    // Personalised rune — unique per user
    const personalised =
      userName && userBirthday
        ? getDailyRune(`daily-${dateStr}`, userName, userBirthday)
        : null;

    if (canAccessPersonalized && personalised) {
      return {
        ...personalised,
        isPersonalized: true as const,
        general,
        personalised,
      };
    }

    return {
      ...general,
      isPersonalized: false as const,
      general,
      personalised,
    };
  }, [canAccessPersonalized, userName, userBirthday, currentDate]);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, closeModal]);

  const { rune, isReversed } = dailyRune;

  // Blurred/redacted preview for free users
  const renderPreview = () => {
    const personalised = dailyRune.personalised;
    if (!personalised) return null;

    const content = `Your personal rune is ${personalised.rune.name} (${personalised.rune.meaning}). ${personalised.isReversed ? personalised.rune.reversedMeaning.split('.')[0] : personalised.rune.uprightMeaning.split('.')[0]}.`;

    if (variant === 'truncated') {
      return (
        <div className='locked-preview-truncated-single locked-preview-truncated-single-zinc mb-2'>
          <p className='text-xs'>
            Your personal rune is{' '}
            <span
              className='inline-block'
              style={{ filter: 'blur(4px)', userSelect: 'none' }}
            >
              {personalised.rune.name}
            </span>
            . {personalised.isReversed ? 'Reversed' : 'Upright'} —{' '}
            {personalised.rune.keywords[0]?.toLowerCase()}
          </p>
        </div>
      );
    }

    if (variant === 'redacted') {
      const words = content.split(' ');
      const redactedContent = words.map((word, i) => {
        const shouldRedact = shouldRedactWord(word, i, personalised.rune.name);
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
        <div className='locked-preview-redacted locked-preview-redacted-zinc mb-2'>
          <p className='text-xs text-zinc-400'>{contentWithSpaces}</p>
        </div>
      );
    }

    // Default: blur
    return (
      <div className='locked-preview locked-preview-zinc mb-2'>
        <p className='locked-preview-text text-xs'>{content}</p>
      </div>
    );
  };

  const navigateToUpgrade = () => {
    router.push(
      authStatus.isAuthenticated ? '/pricing?nav=app' : '/auth?signup=true',
    );
  };

  return (
    <>
      <div
        role='button'
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        className='w-full h-full py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group text-left min-h-16 cursor-pointer'
        data-testid='rune-card'
      >
        <div className='flex items-start gap-3 h-full'>
          <div className='flex-1 min-w-0 h-full mt-1 flex flex-col justify-between'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2'>
                <span className='text-lg leading-none' aria-hidden='true'>
                  {rune.symbol}
                </span>
                <span className='text-sm text-zinc-200'>Rune of the Day</span>
              </div>
              {dailyRune.isPersonalized && (
                <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                  Personal
                </span>
              )}
            </div>
            <p className='text-sm text-lunary-primary-200'>
              {rune.name}{' '}
              <span className='text-zinc-500'>
                — {isReversed ? 'Reversed' : rune.meaning}
              </span>
            </p>
            <p className='text-xs text-zinc-400 mt-1'>
              {rune.keywords.slice(0, 3).join(' • ')}
            </p>

            {!canAccessPersonalized && (
              <>
                <div className='relative mt-2'>
                  {renderPreview()}
                  <span
                    role='button'
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigateToUpgrade();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        navigateToUpgrade();
                      }
                    }}
                    className='absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300 cursor-pointer hover:bg-lunary-primary-800/80 transition-colors'
                  >
                    <Sparkles className='w-2.5 h-2.5' />
                    Lunary+
                  </span>
                </div>
                <span
                  role='button'
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ctaCopy.trackCTAClick('rune', 'dashboard');
                    navigateToUpgrade();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      ctaCopy.trackCTAClick('rune', 'dashboard');
                      navigateToUpgrade();
                    }
                  }}
                  className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer'
                >
                  {ctaCopy.rune}
                </span>
              </>
            )}
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-200 transition-colors flex-shrink-0 mt-1' />
        </div>
      </div>

      {isModalOpen && (
        <div
          className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50'
          onClick={closeModal}
          data-testid='rune-modal'
        >
          <div
            className='bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full relative max-h-[85vh] overflow-y-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='text-center mb-6'>
              <div className='w-20 h-20 bg-lunary-primary-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-4xl' aria-hidden='true'>
                  {rune.symbol}
                </span>
              </div>
              <h2 className='text-xl font-semibold text-white mb-1'>
                {rune.name}
              </h2>
              <p className='text-sm text-zinc-400'>
                {rune.meaning} · {rune.pronunciation}
              </p>
              {dailyRune.isPersonalized && (
                <p className='text-xs text-lunary-accent mt-1'>
                  Drawn from your chart
                </p>
              )}
              <p className='text-xs text-zinc-500 mt-1'>
                {isReversed ? 'Reversed' : 'Upright'} · {rune.element} ·{' '}
                {rune.aett} Aett
              </p>
            </div>

            <div className='space-y-4'>
              {/* Keywords */}
              <div className='flex flex-wrap gap-1.5'>
                {rune.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className='text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded'
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              {/* Meaning */}
              <div>
                <h3 className='text-xs text-zinc-400 uppercase tracking-wide mb-2'>
                  {isReversed ? 'Reversed meaning' : 'Upright meaning'}
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {isReversed ? rune.reversedMeaning : rune.uprightMeaning}
                </p>
              </div>

              {/* Intention */}
              <div>
                <h3 className='text-xs text-zinc-400 uppercase tracking-wide mb-1'>
                  Affirmation
                </h3>
                <p className='text-sm text-zinc-300 italic'>
                  &ldquo;{rune.affirmation}&rdquo;
                </p>
              </div>

              {/* Upgrade CTA for free users */}
              {!canAccessPersonalized && (
                <Button
                  variant='lunary-soft'
                  onClick={navigateToUpgrade}
                  className='text-xs'
                >
                  <Sparkles className='w-4 h-4' />
                  Get your personal rune with Lunary+
                </Button>
              )}

              {/* Journal prompt */}
              {authStatus.isAuthenticated && (
                <div className='bg-zinc-800/50 rounded-lg p-3'>
                  <h3 className='text-xs text-zinc-400 uppercase tracking-wide mb-1'>
                    Journal prompt
                  </h3>
                  <p className='text-sm text-zinc-300'>
                    {isReversed
                      ? `${rune.name} reversed asks where you might be blocked. What area of your life feels stuck around ${rune.keywords[0]?.toLowerCase()}?`
                      : `${rune.name} invites you to reflect on ${rune.keywords[0]?.toLowerCase()}. Where do you see this energy showing up today?`}
                  </p>
                  <span
                    role='button'
                    tabIndex={0}
                    onClick={() => {
                      router.push('/book-of-shadows/journal');
                      setIsModalOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push('/book-of-shadows/journal');
                        setIsModalOpen(false);
                      }
                    }}
                    className='inline-flex items-center gap-1 text-xs text-lunary-accent hover:text-lunary-accent-300 transition-colors mt-2 cursor-pointer'
                  >
                    <BookOpen className='w-3 h-3' />
                    Write in Book of Shadows
                  </span>
                </div>
              )}

              {/* Grimoire link */}
              {isInDemoMode() ? (
                <button
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('demo-action-blocked', {
                        detail: { action: 'Viewing Grimoire pages' },
                      }),
                    );
                  }}
                  className='block w-full py-2 text-center text-sm text-lunary-accent hover:text-lunary-accent-300 transition-colors cursor-pointer'
                >
                  Explore all runes
                </button>
              ) : (
                <span
                  role='button'
                  tabIndex={0}
                  onClick={() => {
                    router.push(
                      `/grimoire/runes/${stringToKebabCase(dailyRune.key)}`,
                    );
                    setIsModalOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(
                        `/grimoire/runes/${stringToKebabCase(dailyRune.key)}`,
                      );
                      setIsModalOpen(false);
                    }
                  }}
                  className='block w-full py-2 text-center text-sm text-lunary-accent hover:text-lunary-accent-300 transition-colors cursor-pointer'
                >
                  Explore all runes
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
