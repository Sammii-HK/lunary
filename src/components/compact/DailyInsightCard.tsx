'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
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

  const transitHighlights = useMemo<PersonalTransitImpact[]>(() => {
    if (!canAccessPersonalized || !birthChart) return [];
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
              <span className='text-[10px] text-lunary-primary-300 uppercase tracking-wide'>
                Personal 🔒
              </span>
            </div>
            <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
              {insight.text}
            </p>

            {/* Blurred preview of personalized full-chart reading */}
            <div className='locked-preview mb-2'>
              <p className='locked-preview-text text-xs'>
                Moon First Quarter in your 7th house brings focus to
                partnerships and collaboration. Meanwhile, Neptune enters Aries
                in your 6th house, inspiring you to reimagine your daily
                routines. This connects to your theme: Creative Emergence. Your
                natal placements suggest this is a pivotal moment for
                transformation...
              </p>
            </div>

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
