'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Layers, Lock } from 'lucide-react';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { calculateTransitAspects } from '@/lib/astrology/transit-aspects';
import { generateTarotTransitConnection } from '@/lib/tarot/generate-transit-connection';
import type { TransitInsight } from '@/lib/tarot/generate-transit-connection';

dayjs.extend(utc);
dayjs.extend(dayOfYear);

export const DailyCardPreview = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const router = useRouter();
  const subscription = useSubscription();
  const astronomyContext = useAstronomyContext();
  const currentDate =
    astronomyContext?.currentDate || dayjs().utc().format('YYYY-MM-DD');
  const currentAstrologicalChart =
    astronomyContext?.currentAstrologicalChart || [];
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const variantRaw = useFeatureFlagVariant('paywall_preview_style_v1');
  const variant = variantRaw || 'blur'; // Default to blur if not loaded
  const [firstTransitInsight, setFirstTransitInsight] =
    useState<TransitInsight | null>(null);

  const hasPersonalizedAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personal_tarot',
  );

  const canAccessPersonalized =
    authStatus.isAuthenticated &&
    hasPersonalizedAccess &&
    userName &&
    userBirthday;

  const dailyCard = useMemo(() => {
    const dateStr = currentDate || dayjs().utc().format('YYYY-MM-DD');
    const selectedDay = dayjs(dateStr);

    // Generate general card for all users
    const dayOfYearNum = selectedDay.dayOfYear();
    const generalSeed = `cosmic-${dateStr}-${dayOfYearNum}-energy`;
    const generalCard = getTarotCard(generalSeed);

    // Also generate personalized card for preview (if we have user data)
    const personalizedCard =
      userName && userBirthday
        ? getTarotCard(`daily-${dateStr}`, userName, userBirthday)
        : null;

    if (canAccessPersonalized && personalizedCard) {
      return {
        name: personalizedCard.name,
        keywords: personalizedCard.keywords?.slice(0, 3) || [],
        information: personalizedCard.information || '',
        isPersonalized: true,
        personalizedPreview: personalizedCard.information || '',
      };
    }

    return {
      name: generalCard.name,
      keywords: generalCard.keywords?.slice(0, 3) || [],
      information: generalCard.information || '',
      isPersonalized: false,
      // For blurred preview, use actual personalized card data if available, otherwise general card
      personalizedPreview: personalizedCard?.information
        ? `This card connects to your birth chart placements. ${personalizedCard.information}`
        : `This card speaks to your current journey. ${generalCard.information}`,
    };
  }, [canAccessPersonalized, userName, userBirthday, currentDate]);

  // Calculate first transit insight for authenticated users with access
  useEffect(() => {
    async function calculateTransitInsight() {
      if (
        !canAccessPersonalized ||
        !user?.birthChart ||
        !user.birthChart.length ||
        !dailyCard.name ||
        !currentAstrologicalChart?.length
      ) {
        setFirstTransitInsight(null);
        return;
      }

      try {
        // Calculate transit aspects
        const aspects = calculateTransitAspects(
          user.birthChart as any,
          currentAstrologicalChart as any,
        );

        if (aspects.length === 0) {
          setFirstTransitInsight(null);
          return;
        }

        // Convert birth chart to snapshot format
        const birthChartSnapshot = {
          date: userBirthday || '',
          time: '12:00',
          lat: 0,
          lon: 0,
          placements: user.birthChart.map((p: any) => ({
            planet: p.planet || p.body,
            sign: p.sign,
            house: p.house,
            degree: p.degree,
          })),
        };

        // Generate transit connection
        const connection = await generateTarotTransitConnection(
          dailyCard.name,
          birthChartSnapshot,
          aspects,
        );

        if (
          connection?.perTransitInsights &&
          connection.perTransitInsights.length > 0
        ) {
          setFirstTransitInsight(connection.perTransitInsights[0]);
        } else {
          setFirstTransitInsight(null);
        }
      } catch (err) {
        console.error('Failed to calculate transit insight:', err);
        setFirstTransitInsight(null);
      }
    }

    calculateTransitInsight();
  }, [
    canAccessPersonalized,
    user?.birthChart,
    userBirthday,
    dailyCard.name,
    currentAstrologicalChart,
  ]);

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
    const content = dailyCard.personalizedPreview;

    if (variant === 'truncated') {
      // Variant B: Truncated - let the truncation itself create curiosity
      return (
        <div className='locked-preview-truncated mb-2'>
          <p className='text-xs'>{content}</p>
        </div>
      );
    }

    if (variant === 'redacted') {
      // Variant C: Redacted style - soft blur effect
      const words = content.split(' ');
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

      // Join with spaces
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

  if (!dailyCard.isPersonalized) {
    return (
      <Link
        href='/tarot'
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full'
      >
        <div className='flex items-start justify-between gap-3 h-full'>
          <div className='flex-1 min-w-0 h-full justify-between flex flex-col'>
            <div className='flex items-center justify-between gap-2 mb-1'>
              <div className='flex items-center gap-2'>
                <Layers className='w-4 h-4 text-lunary-accent-300' />
                <span className='text-sm font-medium text-zinc-200'>
                  Tarot for Today
                </span>
              </div>
              <span className='flex items-center gap-1 text-[10px] text-lunary-primary-300 uppercase tracking-wide'>
                Personal <Lock className='w-3 h-3' />
              </span>
            </div>
            <p className='text-sm text-lunary-primary-200 font-medium'>
              {dailyCard.name}
            </p>
            <p className='text-xs text-zinc-400 mb-2'>
              {dailyCard.keywords.join(' • ')}
            </p>
            {dailyCard.information && (
              <p className='hidden md:block text-xs text-zinc-300 mb-2'>
                {dailyCard.information.split('.')[0]}.
              </p>
            )}

            {/* A/B test: Show preview based on variant */}
            {renderPreview()}

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
              <span>Unlock Your Personal Reading</span>
            </span>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-300 transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href='/tarot'
      className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              <Layers className='w-4 h-4 text-lunary-accent-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Tarot for Today
              </span>
            </div>
            <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
              Personal
            </span>
          </div>
          <p className='text-sm text-lunary-primary-200 font-medium'>
            {dailyCard.name}
          </p>
          <p className='text-xs text-zinc-400'>
            {dailyCard.keywords.join(' • ')}
          </p>
          {dailyCard.information && (
            <p className='hidden md:block text-xs text-zinc-400 mt-2 line-clamp-2'>
              {dailyCard.information}
            </p>
          )}
          {firstTransitInsight && (
            <div className='mt-2 pt-2 border-t border-zinc-800/50'>
              <p className='text-xs text-lunary-accent-300'>
                {firstTransitInsight.transit.transitPlanet}{' '}
                {firstTransitInsight.transit.aspectType}{' '}
                {firstTransitInsight.transit.natalPlanet}{' '}
                {firstTransitInsight.relevance}
                {firstTransitInsight.transit.house && (
                  <span className='opacity-70'>
                    {' '}
                    · activates {firstTransitInsight.transit.house}
                    {firstTransitInsight.transit.house === 1
                      ? 'st'
                      : firstTransitInsight.transit.house === 2
                        ? 'nd'
                        : firstTransitInsight.transit.house === 3
                          ? 'rd'
                          : 'th'}{' '}
                    house
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent-300 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
