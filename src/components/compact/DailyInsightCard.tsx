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
import { getAstrologicalChart } from '../../../utils/astrology/astrology';
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
import { useCTACopy } from '@/hooks/useCTACopy';
import { shouldRedactWord } from '@/constants/redactedWords';
import {
  buildTransitDetails,
  TransitAspect,
  TransitDetail,
} from '@/features/horoscope';

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

function calculateAspects(
  birthChart: any[],
  currentTransits: any[],
): TransitAspect[] {
  const aspects: TransitAspect[] = [];
  const aspectDefinitions = [
    { name: 'conjunction', angle: 0, orb: 10 },
    { name: 'opposition', angle: 180, orb: 10 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'sextile', angle: 60, orb: 6 },
  ];

  for (const transit of currentTransits) {
    for (const natal of birthChart) {
      if (['North Node', 'South Node', 'Chiron', 'Lilith'].includes(natal.body))
        continue;

      let diff = Math.abs(transit.eclipticLongitude - natal.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspectDef of aspectDefinitions) {
        const orb = Math.abs(diff - aspectDef.angle);
        if (orb <= aspectDef.orb) {
          const degreeInSign = (longitude: number) => {
            const d = longitude % 30;
            const whole = Math.floor(d);
            const minutes = Math.floor((d - whole) * 60);
            return `${whole}°${minutes.toString().padStart(2, '0')}'`;
          };
          aspects.push({
            transitPlanet: transit.body,
            transitSign: transit.sign,
            transitDegree: `${degreeInSign(transit.eclipticLongitude)} ${transit.sign}`,
            natalPlanet: natal.body,
            natalSign: natal.sign,
            natalDegree: `${degreeInSign(natal.eclipticLongitude)} ${natal.sign}`,
            aspectType: aspectDef.name,
            orbDegrees: Math.round(orb * 10) / 10,
            house: natal.house,
          });
          break;
        }
      }
    }
  }

  return aspects;
}

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
  const [observer, setObserver] = useState<any>(null);
  const variant = useFeatureFlagVariant('paywall_preview_style_v1');
  const ctaCopy = useCTACopy();

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
    if (!authStatus.isAuthenticated || !birthChart) return;
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, [authStatus.isAuthenticated, birthChart]);

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

  // Calculate transit event sentences (enters/leaves)
  const transitHighlights = useMemo<PersonalTransitImpact[]>(() => {
    if (!authStatus.isAuthenticated || !birthChart) return [];
    const todayStart = selectedDay.startOf('day');
    const windowStart = todayStart.subtract(2, 'day');
    const windowEnd = todayStart.add(1, 'day');
    const upcomingTransits = getUpcomingTransits(todayStart);
    const impacts = getPersonalTransitImpacts(upcomingTransits, birthChart, 60);

    const significanceOrder: Record<
      PersonalTransitImpact['significance'],
      number
    > = { high: 3, medium: 2, low: 1 };

    const candidates = impacts.filter((impact) => {
      const val = impact.date.startOf('day').valueOf();
      return (
        val >= windowStart.valueOf() &&
        val <= windowEnd.valueOf() &&
        !Number.isNaN(significanceOrder[impact.significance])
      );
    });

    const withHouse = candidates.filter((impact) => impact.house);
    const pool = withHouse.length > 0 ? withHouse : candidates;
    if (pool.length === 0) return [];

    const sorted = pool
      .map((impact) => ({
        impact,
        score:
          (significanceOrder[impact.significance] ?? 1) * 100000 +
          impact.date.valueOf(),
      }))
      .sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const result: PersonalTransitImpact[] = [];
    for (const { impact } of sorted) {
      if (result.length >= 2) break;
      if (!seen.has(impact.planet)) {
        seen.add(impact.planet);
        result.push(impact);
      }
    }
    return result;
  }, [authStatus.isAuthenticated, birthChart, selectedDay.valueOf()]);

  const transitSummaryText = useMemo(() => {
    if (transitHighlights.length === 0) return null;
    return transitHighlights
      .map((transit, index) => formatTransitSentence(transit, index === 0))
      .join(' ');
  }, [transitHighlights]);

  // Calculate transit aspect titles (short bios) for ALL authenticated users
  const transitDetails = useMemo<TransitDetail[]>(() => {
    if (!authStatus.isAuthenticated || !birthChart || !observer) return [];
    const normalizedDate = new Date(dayjs().format('YYYY-MM-DD') + 'T12:00:00');
    const currentTransits = getAstrologicalChart(normalizedDate, observer);
    const aspects = calculateAspects(birthChart, currentTransits);
    return buildTransitDetails(aspects, { maxItems: 2 });
  }, [authStatus.isAuthenticated, birthChart, observer]);

  const displayText = transitSummaryText ?? insight.text;

  // General (non-personalized) transit text for free users
  const generalTransitText = useMemo(() => {
    const todayStart = selectedDay.startOf('day');
    const windowStart = todayStart.subtract(1, 'day');
    const windowEnd = todayStart.add(1, 'day');
    const transits = getUpcomingTransits(todayStart);

    const significanceOrder: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const relevant = transits.filter((t) => {
      const val = t.date.startOf('day').valueOf();
      return val >= windowStart.valueOf() && val <= windowEnd.valueOf();
    });

    if (relevant.length === 0) return null;

    const sorted = [...relevant].sort(
      (a, b) =>
        (significanceOrder[b.significance] ?? 1) -
        (significanceOrder[a.significance] ?? 1),
    );

    const top2 = sorted.slice(0, 2);
    return top2
      .map((t, i) => {
        const event = t.event.charAt(0).toLowerCase() + t.event.slice(1);
        const sentence = `${t.planet} ${event}`;
        const prefix = i === 0 ? '' : 'Meanwhile, ';
        const full = `${prefix}${sentence}`.trim();
        const cap = full.charAt(0).toUpperCase() + full.slice(1);
        return cap.endsWith('.') ? cap : `${cap}.`;
      })
      .join(' ');
  }, [selectedDay.valueOf()]);

  // Helper to render preview based on A/B test variant
  const renderPreview = () => {
    // Mirror paid view: transit sentence + aspect short bios
    const previewText = transitSummaryText ?? insight.text;
    const aspectBios = transitDetails
      .map((d) => `${d.title} · ${d.header}`)
      .join(' | ');
    const fullContent = aspectBios
      ? `${previewText} ${aspectBios}`
      : previewText;

    if (variant === 'truncated') {
      return (
        <div className='locked-preview-truncated mb-2'>
          <p className='text-xs'>{fullContent}</p>
        </div>
      );
    }

    if (variant === 'redacted') {
      const words = fullContent.split(' ');
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

    // Default: blur
    return (
      <div className='locked-preview mb-2'>
        <p className='locked-preview-text text-xs'>{fullContent}</p>
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
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='w-4 h-4 text-lunary-primary-300' />
              <span className='text-sm text-zinc-200'>
                Today&apos;s Influence
              </span>
            </div>
            <p className='text-sm text-zinc-200 leading-relaxed mb-2'>
              {generalTransitText ?? insight.text}
            </p>

            <div className='relative'>
              {renderPreview()}
              <span className='absolute top-0 right-0 inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/80 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300'>
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
                ctaCopy.trackCTAClick('horoscope', 'dashboard');
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
                  ctaCopy.trackCTAClick('horoscope', 'dashboard');
                  if (router) {
                    router.push(
                      authStatus.isAuthenticated
                        ? '/pricing'
                        : '/auth?signup=true',
                    );
                  }
                }
              }}
              className='flex items-center gap-1.5 text-xs text-lunary-primary-200 hover:text-lunary-primary-100 transition-colors bg-none border-none p-0 cursor-pointer'
            >
              {ctaCopy.horoscope}
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
              <span className='text-sm text-zinc-200'>Today's Influence</span>
            </div>
            {/* <span className='text-xs bg-zinc-800/50 text-lunary-primary-200 px-1.5 py-0.5 rounded'>
              Personal
            </span> */}
          </div>
          <p className='text-sm text-zinc-300 leading-relaxed'>{displayText}</p>
          {transitDetails.length > 0 && (
            <div className='mt-2 space-y-1'>
              {transitDetails.map((detail) => (
                <p key={detail.id} className='text-xs text-zinc-500'>
                  {detail.title} · {detail.header}
                </p>
              ))}
            </div>
          )}
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
