'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { useAstronomyContext } from '@/context/AstronomyContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getGeneralHoroscope } from '../../../utils/astrology/generalHoroscope';
import { getEnhancedPersonalizedHoroscope } from '../../../utils/astrology/enhancedHoroscope';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import {
  analyzeLifeThemes,
  hasEnoughDataForThemes,
  LifeThemeInput,
} from '@/lib/life-themes/engine';

export const DailyInsightCard = () => {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const subscription = useSubscription();
  const { currentDate } = useAstronomyContext();
  const router = useRouter();
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const birthChart = user?.birthChart;
  const [lifeThemeName, setLifeThemeName] = useState<string | null>(null);

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  // Birth chart is free but requires account - check authentication
  const canAccessPersonalized =
    authStatus.isAuthenticated && hasChartAccess && userBirthday && birthChart;

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
    const selectedDate = currentDate ? new Date(currentDate) : new Date();

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
  }, [canAccessPersonalized, userBirthday, userName, birthChart, currentDate]);

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
              Unlock personalized readings based on your full birth chart with
              Lunary+
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
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {insight.text}
          </p>
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
