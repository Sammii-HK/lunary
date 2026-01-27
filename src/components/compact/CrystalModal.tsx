'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useRouter } from 'next/navigation';
import { X, Gem, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { getAstrologicalChart } from '../../../utils/astrology/astrology';
import { getGeneralCrystalRecommendation } from '../../../utils/crystals/generalCrystals';
import {
  calculateCrystalRecommendation,
  getCrystalGuidance,
} from '../../../utils/crystals/personalizedCrystals';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import { useAstronomyContext } from '../../context/AstronomyContext';
import dayjs from 'dayjs';
import { Button } from '../ui/button';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';

export const CrystalPreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const router = useRouter();
  const subscription = useSubscription();
  const { currentDateTime } = useAstronomyContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [observer, setObserver] = useState<any>(null);
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');

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

  // Helper to determine if a word should be redacted
  const shouldRedactWord = (
    word: string,
    index: number,
    crystalName?: string,
  ): boolean => {
    // Remove punctuation AND possessive 's
    const cleanWord = word
      .toLowerCase()
      .replace(/[.,!?;:']+/g, '')
      .replace(/s$/, '');

    // MUST redact the personalized crystal name itself (including possessive forms like "Amethyst's")
    if (crystalName) {
      const cleanCrystalName = crystalName.toLowerCase();
      if (
        cleanWord === cleanCrystalName ||
        cleanWord === cleanCrystalName.replace(/s$/, '')
      ) {
        return true;
      }
    }

    // Prioritize crystal names (common crystals)
    const crystals = [
      'amethyst',
      'quartz',
      'citrine',
      'rose',
      'jasper',
      'agate',
      'selenite',
      'obsidian',
      'moonstone',
      'labradorite',
      'carnelian',
      'malachite',
      'turquoise',
      'aventurine',
      'fluorite',
      'hematite',
      'jade',
      'lapis',
      'onyx',
      'peridot',
      'rhodonite',
      'sodalite',
      'tiger',
      'topaz',
      'amazonite',
    ];
    if (crystals.includes(cleanWord)) return true;

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
      'chakra',
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
      'grounding',
      'protection',
      'energy',
      'vibration',
    ];
    if (guidanceTerms.includes(cleanWord)) return true;

    // Redact some other words for variety (every 6th word if not already redacted)
    return index % 6 === 4;
  };

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
            authStatus.isAuthenticated ? '/pricing' : '/auth?signup=true',
          )
        }
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(
              authStatus.isAuthenticated ? '/pricing' : '/auth?signup=true',
            );
          }
        }}
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md w-full h-full hover:border-lunary-primary-700/50 transition-colors group min-h-16 cursor-pointer'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Gem className='w-4 h-4 text-lunary-accent-200' />
            <span className='text-sm text-lunary-primary-200'>
              Unlock personalized crystal guidance
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
      >
        <div className='flex items-start gap-3 h-full'>
          <div className='flex-1 min-w-0 h-full mt-1 flex flex-col justify-between'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2'>
                <Gem className='w-4 h-4 text-lunary-accent-200' />
                <span className='text-sm font-medium text-zinc-200'>
                  {crystalName}
                </span>
              </div>
              {canAccessPersonalized ? (
                <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
                  Personal
                </span>
              ) : (
                <span className='flex items-center gap-1 text-[10px] text-lunary-primary-300 uppercase tracking-wide'>
                  Personal <Lock className='w-3 h-3' />
                </span>
              )}
            </div>
            <p className='text-xs text-white line-clamp-2 mb-2'>
              {crystalReason}
            </p>

            {/* A/B test: Show preview based on variant */}
            {!canAccessPersonalized && renderPreview()}

            {!canAccessPersonalized && (
              <span
                role='button'
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (router) {
                    router.push(
                      authStatus.isAuthenticated
                        ? '/pricing'
                        : '/auth?signup=true',
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (router) {
                      router.push(
                        authStatus.isAuthenticated
                          ? '/pricing'
                          : '/auth?signup=true',
                      );
                    }
                  }
                }}
                className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer font-medium'
              >
                <span>Unlock Your Personal Recommendations</span>
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
                <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2'>
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
                    <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
                      Intention
                    </h3>
                    <p className='text-sm text-zinc-300 italic'>
                      "{crystalData.crystal.intention}"
                    </p>
                  </div>
                  <div>
                    <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1'>
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
                          ? '/pricing'
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
