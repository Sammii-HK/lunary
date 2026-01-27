'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';
import dayjs from 'dayjs';
import { getGeneralHoroscope } from '../../../utils/astrology/generalHoroscope';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { getUpcomingTransits } from '../../../utils/astrology/transitCalendar';
import {
  getPersonalTransitImpacts,
  PersonalTransitImpact,
} from '../../../utils/astrology/personalTransits';
import { useSubscription } from '../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../utils/pricing';
import {
  analyzeLifeThemes,
  hasEnoughDataForThemes,
  LifeThemeInput,
} from '@/lib/life-themes/engine';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';

const getOrdinalSuffix = (n: number): string => {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const formatTransitSentence = (
  transit: PersonalTransitImpact,
  isFirst: boolean,
): string => {
  const houseLabel = transit.house
    ? `in your ${transit.house}${getOrdinalSuffix(transit.house)} house`
    : 'in your chart';
  const eventLabel = transit.event || transit.type || 'moves through';
  const base = `${transit.planet} ${eventLabel} ${houseLabel}`;
  const prefix = isFirst ? '' : 'Meanwhile, ';
  const sentence = `${prefix}${base}`.trim();
  const capitalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return capitalized.endsWith('.') ? capitalized : `${capitalized}.`;
};

export const DailyInsightCard = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  const { currentDate } = useAstronomyContext();
  const selectedDay = useMemo(
    () => (currentDate ? dayjs(currentDate) : dayjs()),
    [currentDate],
  );
  const router = useRouter();
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const birthChart = user?.birthChart;
  const [lifeThemeName, setLifeThemeName] = useState<string | null>(null);
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');

  const hasPersonalizedAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
  );

  const canAccessPersonalized =
    authStatus.isAuthenticated &&
    hasPersonalizedAccess &&
    userBirthday &&
    birthChart;

  useEffect(() => {
    if (!canAccessPersonalized) return;

    async function loadTheme() {
      try {
        const [journalRes, patternsRes] = await Promise.all([
          fetch('/api/journal?limit=30', { credentials: 'include' }).catch(
            () => null,
          ),
          fetch('/api/patterns?days=30', { credentials: 'include' }).catch(
            () => null,
          ),
        ]);

        const journalData = journalRes?.ok
          ? await journalRes.json()
          : { entries: [] };
        const patternsData = patternsRes?.ok ? await patternsRes.json() : null;

        const input: LifeThemeInput = {
          journalEntries: (journalData.entries || []).map((e: any) => ({
            content: e.content || '',
            moodTags: e.moodTags || [],
            createdAt: e.createdAt,
          })),
          tarotPatterns: patternsData
            ? {
                dominantThemes: patternsData.dominantThemes || [],
                frequentCards: patternsData.frequentCards || [],
              }
            : null,
        };

        if (hasEnoughDataForThemes(input)) {
          const themes = analyzeLifeThemes(input, 1);
          if (themes.length > 0) {
            setLifeThemeName(themes[0].name);
          }
        }
      } catch (error) {
        // Silently fail - this is a subtle enhancement
      }
    }

    loadTheme();
  }, [canAccessPersonalized]);

  const insight = useMemo(() => {
    const selectedDate = selectedDay.toDate();

    if (canAccessPersonalized) {
      const horoscope = getEnhancedPersonalizedHoroscope(
        userBirthday!,
        userName || undefined,
        { birthday: userBirthday!, birthChart: birthChart! },
        selectedDate,
      );
      return {
        text: horoscope.personalInsight,
        isPersonalized: true,
      };
    }

    const general = getGeneralHoroscope(selectedDate);
    const firstSentence = general.reading.split('.')[0] + '.';
    return {
      text: firstSentence,
      isPersonalized: false,
    };
  }, [
    canAccessPersonalized,
    userBirthday,
    userName,
    birthChart,
    selectedDay.valueOf(),
  ]);

  // Calculate transit highlights for ALL authenticated users (for preview and paid access)
  const transitHighlights = useMemo<PersonalTransitImpact[]>(() => {
    if (!authStatus.isAuthenticated || !birthChart) return [];
    const todayStart = selectedDay.startOf('day');
    const lookbackDays = 2;
    const windowStart = todayStart.subtract(lookbackDays, 'day');
    const windowEnd = todayStart.add(1, 'day');
    const upcomingTransits = getUpcomingTransits(todayStart);
    const impacts = getPersonalTransitImpacts(upcomingTransits, birthChart, 60);

    const significanceOrder: Record<
      PersonalTransitImpact['significance'],
      number
    > = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const candidateImpacts = impacts.filter((impact) => {
      const impactDayValue = impact.date.startOf('day').valueOf();
      return (
        impactDayValue >= windowStart.valueOf() &&
        impactDayValue <= windowEnd.valueOf() &&
        !Number.isNaN(significanceOrder[impact.significance])
      );
    });
    const relevantImpacts = candidateImpacts.filter((impact) => impact.house);

    console.log('impacts', impacts);

    console.log('relevantImpacts', relevantImpacts);

    const impactsToScore =
      relevantImpacts.length > 0 ? relevantImpacts : candidateImpacts;

    if (impactsToScore.length === 0) return [];

    const daySeed = todayStart.valueOf();
    const prioritized = impactsToScore
      .map((impact) => {
        const nameHash = Array.from(impact.planet).reduce(
          (acc, char) => acc + char.charCodeAt(0),
          0,
        );
        const jitter = ((nameHash + daySeed / 1000) % 10) / 1000;
        const score =
          (significanceOrder[impact.significance] ?? 1) * 100000 +
          impact.date.valueOf() +
          jitter;
        return { impact, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.impact.planet !== b.impact.planet) {
          return a.impact.planet.localeCompare(b.impact.planet);
        }
        return b.impact.date.valueOf() - a.impact.date.valueOf();
      });

    const seenPlanets = new Set<string>();
    const uniqueImpacts: PersonalTransitImpact[] = [];
    const duplicateFallbacks: PersonalTransitImpact[] = [];

    prioritized.forEach(({ impact }) => {
      if (seenPlanets.has(impact.planet)) {
        if (duplicateFallbacks.length < 4) {
          duplicateFallbacks.push(impact);
        }
      } else {
        seenPlanets.add(impact.planet);
        uniqueImpacts.push(impact);
      }
    });

    const todayValue = todayStart.valueOf();
    const todayImpacts = uniqueImpacts.filter(
      (impact) => impact.date.startOf('day').valueOf() === todayValue,
    );
    const otherImpacts = uniqueImpacts.filter(
      (impact) => impact.date.startOf('day').valueOf() !== todayValue,
    );

    const dayIndex = Math.floor(todayStart.valueOf() / 86400000);
    const rotation = otherImpacts.length ? dayIndex % otherImpacts.length : 0;
    const rotatedOthers = [
      ...otherImpacts.slice(rotation),
      ...otherImpacts.slice(0, rotation),
    ];

    const selection: PersonalTransitImpact[] = [];
    const insertImpact = (impact: PersonalTransitImpact) => {
      if (selection.length >= 2) return;
      selection.push(impact);
    };

    todayImpacts.forEach(insertImpact);
    rotatedOthers.forEach(insertImpact);

    let dupIndex = 0;
    while (selection.length < 2 && dupIndex < duplicateFallbacks.length) {
      selection.push(duplicateFallbacks[dupIndex]);
      dupIndex += 1;
    }

    return selection;
  }, [canAccessPersonalized, birthChart, selectedDay.valueOf()]);

  const transitSummaryText = useMemo(() => {
    if (transitHighlights.length === 0) return null;
    return transitHighlights
      .map((transit, index) => formatTransitSentence(transit, index === 0))
      .join(' ');
  }, [transitHighlights]);

  const displayText = transitSummaryText ?? insight.text;

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
    // Use the EXACT content that paid users would see
    // Paid users see: transitSummaryText (if available) OR insight.text
    // We need to show what authenticated users would get with personalization
    let previewContent = '';

    if (transitHighlights.length > 0) {
      // Show the personalized transit highlights that paid users see
      const personalizedTransits = transitHighlights
        .map((transit, index) => formatTransitSentence(transit, index === 0))
        .join(' ');
      previewContent = personalizedTransits;
    } else if (birthChart) {
      // If we have birth chart but no transit highlights, show personalized horoscope
      const personalizedHoroscope = getEnhancedPersonalizedHoroscope(
        userBirthday!,
        userName || undefined,
        { birthday: userBirthday!, birthChart: birthChart },
        selectedDay.toDate(),
      );
      previewContent = personalizedHoroscope.personalInsight;
    } else {
      // Fallback to general insight (shouldn't happen for authenticated users)
      previewContent = insight.text;
    }

    if (variant === 'truncated') {
      // Variant B: Truncated - let the truncation itself create curiosity (1 line)
      return (
        <div className='locked-preview-truncated-single mb-2'>
          <p className='text-xs'>{previewContent}</p>
        </div>
      );
    }

    if (variant === 'redacted') {
      // Variant C: Redacted style - soft blur effect on key terms
      const words = previewContent.split(' ');
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
        <p className='locked-preview-text text-xs'>{previewContent}</p>
      </div>
    );
  };

  if (!insight.isPersonalized) {
    return (
      <Link
        href='/horoscope'
        className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full min-h-20'
      >
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between gap-2 mb-1'>
              <div className='flex items-center gap-2'>
                <Sparkles className='w-4 h-4 text-lunary-primary-300' />
                <span className='text-sm font-medium text-zinc-200'>
                  Today&apos;s Influence
                </span>
              </div>
              <span className='flex items-center gap-1 text-[10px] text-lunary-primary-300 uppercase tracking-wide'>
                Personal <Lock className='w-3 h-3' />
              </span>
            </div>
            <p className='text-sm text-zinc-200 leading-relaxed mb-2'>
              {insight.text}
            </p>

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
              Unlock Full-Chart Readings
            </span>
          </div>
          <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-300 transition-colors flex-shrink-0 mt-1' />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href='/horoscope'
      className='block py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md hover:border-lunary-primary-700/50 transition-colors group h-full min-h-20'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              <Sparkles className='w-4 h-4 text-lunary-primary-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Today's Influence
              </span>
            </div>
            {/* <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
              Personal
            </span> */}
          </div>
          <p className='text-sm text-zinc-300 leading-relaxed'>{displayText}</p>
          {lifeThemeName && (
            <p className='text-xs text-lunary-secondary-200 mt-2'>
              Connects to your theme: {lifeThemeName}
            </p>
          )}
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-300 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
