'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useRouter } from 'next/navigation';
import { X, Gem, ArrowRight, Sparkles } from 'lucide-react';
import { getAstrologicalChart } from '../../../utils/astrology/astrology';
import { getGeneralCrystalRecommendation } from '../../../utils/crystals/generalCrystals';
import {
  calculateCrystalRecommendation,
  getCrystalGuidance,
} from '../../../utils/crystals/personalizedCrystals';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { useCosmicDate } from '../../context/AstronomyContext';
import dayjs from 'dayjs';
import { Button } from '../ui/button';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { useCTACopy } from '@/hooks/useCTACopy';
import { shouldRedactWord } from '@/constants/redactedWords';
import { isInDemoMode } from '@/lib/demo-mode';

export const CrystalPreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const router = useRouter();
  const subscription = useSubscription();
  const { currentDateTime } = useCosmicDate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [observer, setObserver] = useState<any>(null);
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');
  const ctaCopy = useCTACopy();

  const hasPersonalizedAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_crystal_recommendations',
  );

  const normalizedDate = useMemo(() => {
    const dateStr = dayjs(currentDateTime).format('YYYY-MM-DD');
    return new Date(dateStr + 'T12:00:00');
  }, [currentDateTime]);

  useEffect(() => {
    // Async initialization to avoid hydration issues
    const initializeObserver = async () => {
      try {
        const astronomyEngine = await import('astronomy-engine');
        const { Observer } = astronomyEngine;
        if (Observer) {
          try {
            const newObserver = new Observer(51.4769, 0.0005, 0);
            setObserver(newObserver);
          } catch (err) {
            console.warn('Failed to instantiate Observer:', err);
          }
        }
      } catch (err) {
        console.warn('Failed to import astronomy-engine:', err);
      }
    };

    initializeObserver();
  }, []);

  const birthChart = user?.birthChart;
  const userBirthday = user?.birthday;

  // Always compute general crystal for all users (used as fallback or free tier content)
  const generalCrystal = useMemo(() => {
    return getGeneralCrystalRecommendation(normalizedDate);
  }, [normalizedDate]);

  // Compute personalized crystal for ALL authenticated users (for paid users AND blurred preview)
  const crystalData = useMemo(() => {
    if (!birthChart || !observer || !userBirthday) return null;

    const currentTransits = getAstrologicalChart(normalizedDate, observer);
    const { crystal, reasons } = calculateCrystalRecommendation(
      birthChart,
      currentTransits,
      normalizedDate,
      userBirthday,
    );

    const guidance = getCrystalGuidance(crystal, birthChart);

    return {
      crystal,
      reasons,
      guidance,
    };
  }, [birthChart, observer, normalizedDate, userBirthday]);

  const canAccessPersonalized =
    authStatus.isAuthenticated &&
    hasPersonalizedAccess &&
    birthChart &&
    userBirthday;

  const crystalName = canAccessPersonalized
    ? crystalData?.crystal.name
    : generalCrystal?.name;

  const crystalReason = canAccessPersonalized
    ? crystalData?.reasons?.join('. ') || crystalData?.guidance
    : generalCrystal?.reason;

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, closeModal]);

  // Helper to render preview based on A/B test variant
  const renderPreview = () => {
    if (!crystalData) return null;

    if (variant === 'truncated') {
      // Variant B: Truncated with BLURRED name - let the truncation itself create curiosity (1 line)
      // Blur the crystal name but show the rest of the text to create mystery
      return (
        <div className='locked-preview-truncated-single locked-preview-truncated-single-zinc mb-2'>
          <p className='text-xs'>
            Your personalized recommendation is{' '}
            <span
              className='inline-block'
              style={{ filter: 'blur(4px)', userSelect: 'none' }}
            >
              {crystalData.crystal.name}
            </span>
            . Aligned with your {crystalData.reasons[0]?.toLowerCase() || ''}
          </p>
        </div>
      );
    }

    if (variant === 'redacted') {
      // Variant C: Redacted style - soft blur effect on key terms
      const content = `Your personalized recommendation is ${crystalData.crystal.name}. ${crystalData.reasons[0]}. ${crystalData.reasons[1] || ''} ${crystalData.guidance}`;
      const words = content.split(' ');
      const redactedContent = words.map((word, i) => {
        // CRITICAL: Pass crystal name to ensure it's always redacted
        const shouldRedact = shouldRedactWord(
          word,
          i,
          crystalData.crystal.name,
        );
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

    // Variant A: Blur Effect (default)
    const content = `Your personalized recommendation is ${crystalData.crystal.name}. ${crystalData.reasons[0]}. ${crystalData.reasons[1] || ''} ${crystalData.guidance}`;
    return (
      <div className='locked-preview locked-preview-zinc mb-2'>
        <p className='locked-preview-text text-xs'>{content}</p>
      </div>
    );
  };

  // Only show loading state if we're actually waiting for authenticated user data
  if (!crystalName && authStatus.loading && authStatus.isAuthenticated) {
    return (
      <div className='py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md animate-pulse min-h-16'>
        <div className='h-5 w-24 bg-zinc-800 rounded' />
      </div>
    );
  }

  // If no crystal name and not loading, show general crystal or upsell
  if (!crystalName) {
    return (
      <div
        onClick={() =>
          router.push(
            authStatus.isAuthenticated
              ? '/pricing?nav=app'
              : '/auth?signup=true',
          )
        }
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(
              authStatus.isAuthenticated
                ? '/pricing?nav=app'
                : '/auth?signup=true',
            );
          }
        }}
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group min-h-16 cursor-pointer'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Gem className='w-4 h-4 text-lunary-accent-200' />
            <span className='text-sm text-lunary-primary-200'>
              {ctaCopy.crystal}
            </span>
          </div>
          <ArrowRight className='w-4 h-4 text-lunary-secondary-200' />
        </div>
      </div>
    );
  }

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
        data-testid='crystal-card'
      >
        <div className='flex items-start gap-3 h-full'>
          <div className='flex-1 min-w-0 h-full mt-1 flex flex-col justify-between'>
            <div className='flex items-center gap-2 mb-1'>
              <Gem className='w-4 h-4 text-lunary-accent-200' />
              <span className='text-sm text-zinc-200'>{crystalName}</span>
            </div>
            <p className='text-xs text-zinc-300 line-clamp-4 mb-2'>
              {crystalReason}
            </p>

            {!canAccessPersonalized && (
              <div className='relative'>
                {renderPreview()}
                <span
                  role='button'
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(
                      authStatus.isAuthenticated
                        ? '/pricing?nav=app'
                        : '/auth?signup=true',
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(
                        authStatus.isAuthenticated
                          ? '/pricing?nav=app'
                          : '/auth?signup=true',
                      );
                    }
                  }}
                  className='absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300 cursor-pointer hover:bg-lunary-primary-800/80 transition-colors'
                >
                  <Sparkles className='w-2.5 h-2.5' />
                  Lunary+
                </span>
              </div>
            )}

            {!canAccessPersonalized && (
              <span
                role='button'
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  ctaCopy.trackCTAClick('crystal', 'dashboard');
                  if (router) {
                    router.push(
                      authStatus.isAuthenticated
                        ? '/pricing?nav=app'
                        : '/auth?signup=true',
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    ctaCopy.trackCTAClick('crystal', 'dashboard');
                    if (router) {
                      router.push(
                        authStatus.isAuthenticated
                          ? '/pricing?nav=app'
                          : '/auth?signup=true',
                      );
                    }
                  }
                }}
                className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer'
              >
                {ctaCopy.crystal}
              </span>
            )}
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-200 transition-colors flex-shrink-0 mt-1' />
        </div>
      </div>

      {isModalOpen && (
        <div
          className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50'
          onClick={closeModal}
          data-testid='crystal-modal'
        >
          <div
            className='bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full relative'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-lunary-primary-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Gem className='w-8 h-8 text-lunary-accent' />
              </div>
              <h2 className='text-xl font-semibold text-white mb-1'>
                {crystalName}
              </h2>
              {canAccessPersonalized && (
                <p className='text-xs text-lunary-accent'>
                  Personalized for your chart
                </p>
              )}
            </div>

            <div className='space-y-4'>
              <div>
                <h3 className='text-xs text-zinc-400 uppercase tracking-wide mb-2'>
                  Why this crystal today
                </h3>
                {canAccessPersonalized && crystalData?.reasons ? (
                  <ul className='space-y-1.5'>
                    {crystalData.reasons.map((reason, idx) => (
                      <li
                        key={idx}
                        className='text-sm text-zinc-300 flex items-center gap-2'
                      >
                        <span className='w-1.5 h-1.5 bg-lunary-accent rounded-full flex-shrink-0' />
                        {reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm text-zinc-300'>{crystalReason}</p>
                )}
              </div>

              {crystalData?.crystal && (
                <>
                  <div>
                    <h3 className='text-xs text-zinc-400 uppercase tracking-wide mb-1'>
                      Intention
                    </h3>
                    <p className='text-sm text-zinc-300 italic'>
                      "{crystalData.crystal.intention}"
                    </p>
                  </div>
                  <div>
                    <h3 className='text-xs text-zinc-400 uppercase tracking-wide mb-1'>
                      Properties
                    </h3>
                    <p className='text-sm text-zinc-400'>
                      {crystalData.crystal.properties.join(' • ')} •{' '}
                      {crystalData.crystal.chakra} Chakra
                    </p>
                  </div>
                </>
              )}

              {!canAccessPersonalized && (
                <Button
                  variant='lunary-soft'
                  onClick={() => {
                    if (router) {
                      router.push(
                        authStatus.isAuthenticated
                          ? '/pricing?nav=app'
                          : '/auth?signup=true',
                      );
                    }
                  }}
                  className='text-xs'
                >
                  <Sparkles className='w-4 h-4' />
                  Get personalized recommendations with Lunary+
                </Button>
              )}

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
                  Explore all crystals
                </button>
              ) : (
                <span
                  role='button'
                  tabIndex={0}
                  onClick={() => {
                    router.push('/grimoire/crystals');
                    setIsModalOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push('/grimoire/crystals');
                      setIsModalOpen(false);
                    }
                  }}
                  className='block w-full py-2 text-center text-sm text-lunary-accent hover:text-lunary-accent-300 transition-colors cursor-pointer'
                >
                  Explore all crystals
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
