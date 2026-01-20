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
  const dateLabel = dayjs(transit.date).format('MMM D');
  const eventLabel = transit.event || transit.type || 'moves through';
  const base = `${transit.planet} ${eventLabel} ${houseLabel} on ${dateLabel}`;
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

    const relevantImpacts = impacts.filter((impact) => {
      const impactDayValue = impact.date.startOf('day').valueOf();
      return (
        impact.house &&
        impactDayValue >= windowStart.valueOf() &&
        impactDayValue <= todayStart.valueOf() &&
        !Number.isNaN(significanceOrder[impact.significance])
      );
    });

    if (relevantImpacts.length === 0) return [];

    const daySeed = todayStart.valueOf();
    const prioritized = relevantImpacts
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

    const selection: PersonalTransitImpact[] = uniqueImpacts.slice(0, 2);
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
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='w-4 h-4 text-lunary-primary-300' />
              <span className='text-sm font-medium text-zinc-200'>
                Your Day
              </span>
            </div>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {insight.text}
            </p>
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
              className='flex items-center gap-1.5 mt-2 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer'
            >
              Unlock full-chart readings with Lunary+
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
                Your Day
              </span>
            </div>
            <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
              Personal
            </span>
          </div>
          <p className='text-sm text-zinc-300 leading-relaxed'>{displayText}</p>
          {transitHighlights.length > 0 && (
            <div className='mt-2 space-y-2 text-zinc-400 text-[11px]'>
              <p className='text-[10px] uppercase tracking-[0.3em] text-lunary-primary-200'>
                Transit highlights
              </p>
              {transitHighlights.map((transit) => (
                <div
                  key={`${transit.planet}-${transit.date.valueOf()}`}
                  className='space-y-0.5'
                >
                  <p className='text-xs text-zinc-200 leading-snug'>
                    {transit.planet} {transit.event}
                    {transit.house
                      ? ` in your ${transit.house}${getOrdinalSuffix(
                          transit.house,
                        )} house`
                      : ''}
                  </p>
                  <p className='text-[11px] text-zinc-500 leading-snug line-clamp-2'>
                    {dayjs(transit.date).format('MMM D')}
                    {transit.personalImpact
                      ? ` · ${transit.personalImpact}`
                      : ''}
                  </p>
                  <p className='text-xs text-zinc-500 mt-1.5'>
                    View your transits
                  </p>
                </div>
              ))}
            </div>
          )}
          {lifeThemeName && (
            <p className='text-xs text-zinc-500 mt-1.5'>
              Connects to your theme: {lifeThemeName}
            </p>
          )}
        </div>
        <ArrowRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-300 transition-colors flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
};
