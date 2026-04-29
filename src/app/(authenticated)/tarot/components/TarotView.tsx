'use client';

import dayjs from 'dayjs';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Check,
  Sparkles,
  Share2,
  Lock as LockIcon,
  X,
  Download,
  Copy,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { AdvancedPatterns } from '@/components/tarot/AdvancedPatterns';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { TarotCardModal } from '@/components/TarotCardModal';
import { getTarotCardByName } from '@/utils/tarot/getCardByName';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { trackCtaImpression } from '@/lib/analytics';
import { useModal } from '@/hooks/useModal';
import {
  SubscriptionStatus,
  TarotSpreadExperience,
} from '@/components/tarot/TarotSpreadExperience';
import type { TarotPlan } from '@/constants/tarotSpreads';
import { FeaturePreview } from '../../horoscope/components/FeaturePreview';
import { HoroscopeSection } from '../../horoscope/components/HoroscopeSection';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { useIsNativeIOS } from '@/hooks/useNativePlatform';
import { iosLabel } from '@/lib/ios-labels';
import { getTarotCard } from '../../../../../utils/tarot/tarot';
import { getImprovedTarotReading } from '../../../../../utils/tarot/improvedTarot';
import { getGeneralTarotReading } from '../../../../../utils/tarot/generalTarot';
import { useSubscription } from '../../../../hooks/useSubscription';
import { useTarotShare } from '@/hooks/useTarotShare';
import { usePlanetaryChart } from '@/context/AstronomyContext';
import { TarotTransitConnection } from '@/components/tarot/TarotTransitConnection';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { useCTACopy } from '@/hooks/useCTACopy';
import { shouldRedactWord } from '@/constants/redactedWords';
import { FREE_DAILY_TAROT_TRUNCATE_LENGTH } from '../../../../../utils/entitlements';
import { captureEvent } from '@/lib/posthog-client';
import { TarotSeasonReading } from '@/components/tarot/TarotSeasonReading';
import { TarotRitualForPatterns } from '@/components/tarot/TarotRitualForPatterns';
import { TarotReflectionPrompts } from '@/components/tarot/TarotReflectionPrompts';
import Link from 'next/link';
import { useAuthStatus } from '@/components/AuthStatus';
import { getCosmicContextForDate } from '@/lib/cosmic/cosmic-context-utils';
import { Heading } from '@/components/ui/Heading';

const GuideNudge = dynamic(
  () =>
    import('@/components/GuideNudge').then((m) => ({
      default: m.GuideNudge,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

export interface TarotViewProps {
  hasPaidAccess: boolean;
  userName?: string;
  userBirthday?: string;
  user?: any;
}

export function TarotView({
  hasPaidAccess,
  userName,
  userBirthday,
  user,
}: TarotViewProps) {
  const router = useRouter();
  const isNativeIOS = useIsNativeIOS();
  const authStatus = useAuthStatus();
  const { currentAstrologicalChart } = usePlanetaryChart();
  const subscription = useSubscription();
  const variantRaw = useFeatureFlagVariant('paywall_preview_style_v1');
  const variant = variantRaw || 'blur';
  const weeklyLockVariantRaw = useFeatureFlagVariant('weekly-lock-style');
  const weeklyLockVariant =
    typeof weeklyLockVariantRaw === 'string' ? weeklyLockVariantRaw : 'blur';
  const tarotTruncationVariantRaw = useFeatureFlagVariant(
    'tarot-truncation-length',
  );
  const tarotTruncationVariant =
    typeof tarotTruncationVariantRaw === 'string'
      ? tarotTruncationVariantRaw
      : 'medium';
  const ctaCopy = useCTACopy();
  const userId = user?.id;
  const tarotPlan = {
    plan: subscription.plan as TarotPlan,
    status: subscription.status as SubscriptionStatus,
  };

  const [selectedView, setSelectedView] = useState<number | 'year-over-year'>(
    30,
  );
  const [isMultidimensionalMode, setIsMultidimensionalMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const [expandedSuit, setExpandedSuit] = useState<string | null>(null);
  const generalTarot = useMemo(() => {
    if (hasPaidAccess) return null;
    try {
      return getGeneralTarotReading();
    } catch (error) {
      console.error('Failed to load general tarot reading:', error);
      return null;
    }
  }, [hasPaidAccess]);

  useEffect(() => {
    if (hasPaidAccess) return;

    void trackCtaImpression({
      ctaId: 'weekly_tarot_lock',
      location: 'tarot_weekly_lock',
      label: ctaCopy.tarotWeekly,
      href: '/pricing?nav=app',
      pagePath: '/tarot',
      abTest: 'weekly_lock',
      abVariant: weeklyLockVariant,
    });
  }, [hasPaidAccess, ctaCopy.tarotWeekly, weeklyLockVariant]);

  useEffect(() => {
    if (hasPaidAccess) return;
    const dailyMsgLen = generalTarot?.guidance.dailyMessage?.length ?? 0;
    if (dailyMsgLen <= FREE_DAILY_TAROT_TRUNCATE_LENGTH) {
      return;
    }

    void trackCtaImpression({
      ctaId: 'daily_tarot_truncation',
      location: 'tarot_daily_truncation',
      label: ctaCopy.tarotDaily,
      href: '/pricing?nav=app',
      pagePath: '/tarot',
      abTest: 'tarot_truncation',
      abVariant: tarotTruncationVariant,
    });
  }, [
    hasPaidAccess,
    generalTarot?.guidance.dailyMessage,
    ctaCopy.tarotDaily,
    tarotTruncationVariant,
  ]);

  // Free users are limited to 7-day patterns view
  useEffect(() => {
    if (
      !subscription.hasAccess('tarot_patterns') &&
      typeof selectedView === 'number' &&
      selectedView > 7
    ) {
      setSelectedView(7);
    }
  }, [subscription, selectedView]);

  // Handle ESC key to close upgrade modal
  useModal({
    isOpen: showUpgradeModal,
    onClose: () => setShowUpgradeModal(false),
    closeOnClickOutside: false,
  });

  const [selectedCard, setSelectedCard] = useState<{
    name: string;
    keywords: string[];
    information: string;
  } | null>(null);

  const firstName = useMemo(
    () => (userName ? userName.split(' ')[0] || userName : undefined),
    [userName],
  );

  // Previous readings for free users (general, seed-based)
  const previousReadings = useMemo(() => {
    if (hasPaidAccess) return [];
    const currentDate = dayjs();
    const previousWeek = () => {
      let week = [];
      for (let i = 0; i < 7; i++) {
        week.push(currentDate.subtract(i, 'day'));
      }
      return week;
    };
    const week = previousWeek();

    return week.map((day) => {
      const dayOfYear = day.dayOfYear();
      const seed = `cosmic-${day.format('YYYY-MM-DD')}-${dayOfYear}-energy`;
      return {
        day: day.format('dddd'),
        date: day.format('MMM D'),
        card: getTarotCard(seed),
      };
    });
  }, [hasPaidAccess]);

  const timeFrame = typeof selectedView === 'number' ? selectedView : 30;

  // Fetch personalized reading with actual database data
  const [personalizedReading, setPersonalizedReading] = useState<any>(null);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);

  useEffect(() => {
    async function fetchPersonalizedReading() {
      if (!hasPaidAccess || !userName || !userBirthday) {
        setPersonalizedReading(null);
        return;
      }

      setIsLoadingPatterns(true);
      try {
        // Fetch actual database readings from API
        let userReadings = null;
        try {
          const response = await fetch(
            `/api/patterns/user-readings?days=${timeFrame}`,
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.readings) {
              userReadings = data.readings;
            }
          }
        } catch (apiError) {
          console.warn(
            'Failed to fetch user readings, falling back to seeded generation:',
            apiError,
          );
        }

        // Generate reading with database data (or seeded fallback)
        const reading = await getImprovedTarotReading(
          userName,
          true,
          timeFrame,
          userBirthday,
          userReadings,
        );
        setPersonalizedReading(reading);
      } catch (error) {
        console.error('Error fetching personalized reading:', error);
        setPersonalizedReading(null);
      } finally {
        setIsLoadingPatterns(false);
      }
    }

    fetchPersonalizedReading();
  }, [hasPaidAccess, userName, userBirthday, timeFrame]);

  // Build basic 7-day patterns for free users from previousReadings
  const freeBasicPatterns = useMemo(() => {
    if (hasPaidAccess || !previousReadings || previousReadings.length === 0)
      return undefined;
    const cardCounts = new Map<string, number>();
    const suitCounts = new Map<
      string,
      { count: number; cards: Map<string, number> }
    >();
    previousReadings.forEach(({ card }) => {
      cardCounts.set(card.name, (cardCounts.get(card.name) || 0) + 1);
      const suit = card.name.includes('Wands')
        ? 'Wands'
        : card.name.includes('Cups')
          ? 'Cups'
          : card.name.includes('Swords')
            ? 'Swords'
            : card.name.includes('Pentacles')
              ? 'Pentacles'
              : 'Major Arcana';
      const suitData = suitCounts.get(suit) || { count: 0, cards: new Map() };
      suitData.count++;
      suitData.cards.set(card.name, (suitData.cards.get(card.name) || 0) + 1);
      suitCounts.set(suit, suitData);
    });
    const frequentCards = Array.from(cardCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Include ALL suits, even if count is 0 (important for visualizations)
    const allSuits = ['Cups', 'Wands', 'Swords', 'Pentacles', 'Major Arcana'];
    const suitPatterns = allSuits.map((suit) => {
      const data = suitCounts.get(suit);
      return {
        suit,
        count: data?.count || 0,
        cards: data
          ? Array.from(data.cards.entries()).map(([name, count]) => ({
              name,
              count,
            }))
          : [],
      };
    });

    const themes = frequentCards.slice(0, 3).flatMap((c) => {
      const card = previousReadings.find((r) => r.card.name === c.name);
      return card?.card.keywords?.slice(0, 2) || [];
    });
    // Calculate arcana counts (Major Arcana vs Minor Arcana)
    const majorArcanaCount = suitCounts.get('Major Arcana')?.count || 0;
    const minorArcanaCount =
      (suitCounts.get('Cups')?.count || 0) +
      (suitCounts.get('Wands')?.count || 0) +
      (suitCounts.get('Swords')?.count || 0) +
      (suitCounts.get('Pentacles')?.count || 0);

    return {
      dominantThemes: [...new Set(themes)],
      frequentCards,
      suitPatterns,
      numberPatterns: [] as Array<{
        number: string;
        count: number;
        cards: string[];
      }>,
      arcanaPatterns: [
        { type: 'Major Arcana', count: majorArcanaCount },
        { type: 'Minor Arcana', count: minorArcanaCount },
      ],
      timeFrame: 7,
    };
  }, [hasPaidAccess, previousReadings]);

  const guidanceActionPoints =
    personalizedReading?.guidance?.actionPoints ?? [];

  // Personalized previous readings for paid users
  const personalizedPreviousReadings = useMemo(() => {
    if (!hasPaidAccess || !userName || !userBirthday) return [];
    const currentDate = dayjs();
    const previousWeek = () => {
      let week = [];
      for (let i = 1; i < 8; i++) {
        week.push(currentDate.subtract(i, 'day'));
      }
      return week;
    };
    const week = previousWeek();

    return week.map((day) => {
      return {
        day: day.format('dddd'),
        date: day.format('MMM D'),
        card: getTarotCard(
          `daily-${day.format('YYYY-MM-DD')}`,
          userName,
          userBirthday,
        ),
      };
    });
  }, [hasPaidAccess, userName, userBirthday]);

  // Share hook
  const {
    shareTarget,
    shareImageBlob,
    shareLoading,
    shareError,
    sharePreviewUrl,
    generalDailyShare,
    generalWeeklyShare,
    personalizedDailyShare,
    personalizedWeeklyShare,
    closeShareModal,
    handleDownloadShareImage,
    handleShareImage,
    handleCopyShareLink,
    handleCardShare,
    handleShareSpread,
  } = useTarotShare({
    generalTarot,
    personalizedReading,
    firstName,
  });

  // Helper to render preview based on A/B test variant
  const renderPreview = useCallback(
    (content: string) => {
      if (variant === 'truncated') {
        return (
          <div className='locked-preview-truncated mb-2'>
            <p className='text-xs text-content-muted'>{content}</p>
          </div>
        );
      }

      if (variant === 'redacted') {
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
          <p className='locked-preview-text text-xs text-content-muted'>
            {content}
          </p>
        </div>
      );
    },
    [variant],
  );

  const truncate = useCallback((value?: string | null, limit = 140) => {
    if (!value) return undefined;
    if (value.length <= limit) return value;
    return `${value.slice(0, limit - 1).trimEnd()}...`;
  }, []);

  const recurringThemeItems = useMemo(() => {
    const trends = personalizedReading?.trendAnalysis;
    if (!trends) return [];

    const themes = trends.dominantThemes ?? [];
    const cards = trends.frequentCards ?? [];

    if (themes.length === 0 && cards.length === 0) return [];

    const themeItems = themes
      .slice(0, 3)
      .map((theme: string, index: number) => ({
        label: theme,
        detail: cards[index]?.name
          ? `${cards[index].name} showing up often`
          : undefined,
      }));

    if (themeItems.length > 0) return themeItems;

    return cards.slice(0, 3).map((card: any) => ({
      label: card.name,
      detail: typeof card.count === 'number' ? `Seen ${card.count} times` : '',
    }));
  }, [personalizedReading]);

  // --- Error state: free user but generalTarot failed to load ---
  if (!hasPaidAccess && !generalTarot) {
    return (
      <div className='h-full w-full space-y-4 p-4 overflow-y-auto overflow-x-hidden pb-32'>
        <div className='pt-2'>
          <h1 className='text-xl md:text-2xl font-light text-content-primary mb-1'>
            Your Tarot Readings
          </h1>
          <p className='text-xs md:text-sm text-content-muted'>
            General cosmic guidance based on universal energies
          </p>
        </div>

        <div className='rounded-lg border border-lunary-primary-700 bg-surface-elevated/50 p-4'>
          <h3 className='text-lg font-medium text-content-primary mb-2'>
            Unable to load tarot reading
          </h3>
          <p className='text-xs md:text-sm text-content-secondary mb-4 leading-relaxed'>
            We&apos;re having trouble loading your tarot reading. Please try
            refreshing the page, or unlock personalized readings with a birth
            chart.
          </p>
          <SmartTrialButton feature='tarot_patterns' />
        </div>

        <div className='rounded-lg border border-lunary-primary-700 bg-surface-elevated/50 p-4'>
          <h3 className='text-lg font-medium text-content-primary mb-2'>
            Unlock Personal Tarot Readings
          </h3>
          <p className='text-xs md:text-sm text-content-secondary mb-4 leading-relaxed'>
            Get personalized readings, plus discover your personal tarot
            patterns and card trends over time.
          </p>
          <ul className='text-xs text-content-muted space-y-2 mb-4'>
            <li className='flex items-start gap-2'>
              <Check
                className='w-3 h-3 text-lunary-primary-400/80 mt-0.5 flex-shrink-0'
                strokeWidth={2}
              />
              <span>Cards chosen specifically for you</span>
            </li>
            <li className='flex items-start gap-2'>
              <Check
                className='w-3 h-3 text-lunary-primary-400/80 mt-0.5 flex-shrink-0'
                strokeWidth={2}
              />
              <span>30-90 day pattern analysis</span>
            </li>
            <li className='flex items-start gap-2'>
              <Check
                className='w-3 h-3 text-lunary-primary-400/80 mt-0.5 flex-shrink-0'
                strokeWidth={2}
              />
              <span>Personal card frequency tracking</span>
            </li>
            <li className='flex items-start gap-2'>
              <Check
                className='w-3 h-3 text-lunary-primary-400/80 mt-0.5 flex-shrink-0'
                strokeWidth={2}
              />
              <span>Suit and number pattern insights</span>
            </li>
          </ul>
          <SmartTrialButton />
        </div>
      </div>
    );
  }

  // --- Paid user but missing birthday ---
  if (hasPaidAccess && !userBirthday) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4 mb-10'>
        <div className='text-center max-w-md space-y-6'>
          <div className='space-y-2'>
            <h2 className='text-2xl font-light text-content-primary'>
              Complete Your Profile
            </h2>
            <p className='text-xs md:text-sm text-content-muted leading-relaxed'>
              To get personalized tarot readings, we need your birthday to
              {iosLabel('calculate your cosmic signature', isNativeIOS)}.
            </p>
          </div>
          <div className='rounded-lg border border-lunary-primary-700 bg-surface-elevated/50 p-4 space-y-4'>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium text-content-primary'>
                Add Your Birthday
              </h3>
              <p className='text-xs md:text-sm text-content-secondary leading-relaxed'>
                Your birthday helps us personalize your tarot readings and{' '}
                {iosLabel('provide more accurate cosmic insights', isNativeIOS)}
                .
              </p>
            </div>
            <Link
              href='/profile'
              className='inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-layer-base/20 border border-lunary-primary-700 text-content-brand font-medium hover:bg-layer-base/30 transition-colors'
            >
              Add details to your profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Paid user but personalizedReading not yet ready ---
  if (hasPaidAccess && !personalizedReading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-stroke-strong border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-content-muted'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  // Determine which card data to show
  const dailyCard = hasPaidAccess
    ? personalizedReading?.daily
    : generalTarot?.daily;
  const weeklyCard = hasPaidAccess
    ? personalizedReading?.weekly
    : generalTarot?.weekly;
  const dailyShare = hasPaidAccess ? personalizedDailyShare : generalDailyShare;
  const weeklyShare = hasPaidAccess
    ? personalizedWeeklyShare
    : generalWeeklyShare;

  const cosmicContext = getCosmicContextForDate(new Date());
  const moonKeywords = cosmicContext.moonPhase.keywords.slice(0, 3);
  const dailyCardName = dailyCard?.name ?? '';
  const weeklyCardName = weeklyCard?.name ?? '';
  const dailyCardKeywords = dailyCard?.keywords ?? [];
  const weeklyCardKeywords = weeklyCard?.keywords ?? [];
  const patternSource = hasPaidAccess
    ? personalizedReading?.trendAnalysis
    : freeBasicPatterns;

  const getCardRepeat = (cardName: string) => {
    if (!cardName || !patternSource?.frequentCards) return null;

    const match = patternSource.frequentCards.find(
      (card: { name: string; count?: number }) => card.name === cardName,
    );

    if (!match?.count || match.count < 2) return null;

    return {
      count: match.count,
      window: patternSource.timeFrame ?? timeFrame,
    };
  };

  const dailyRepeat = getCardRepeat(dailyCardName);
  const weeklyRepeat = getCardRepeat(weeklyCardName);

  const openCardByName = (cardName: string) => {
    const card = getTarotCardByName(cardName);
    if (card) setSelectedCard(card);
  };

  const renderCardGlyph = (name: string, index: number) => {
    const symbols = ['✦', '✧', '◇', '✶', '✴'];
    const symbol =
      symbols[
        Math.abs(
          name.split('').reduce((total, char) => total + char.charCodeAt(0), 0),
        ) % symbols.length
      ];

    return (
      <div className='relative flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] border border-white/15 bg-gradient-to-b from-lunary-primary-900/70 via-layer-deep/80 to-surface-base shadow-[0_18px_45px_rgba(0,0,0,0.28)] sm:h-32 sm:w-24'>
        <div className='absolute inset-x-3 top-3 h-px bg-white/20' />
        <div className='absolute -left-6 top-6 h-16 w-16 rounded-full bg-lunary-rose-500/15 blur-2xl' />
        <div className='absolute -right-8 bottom-4 h-20 w-20 rounded-full bg-lunary-highlight-500/15 blur-2xl' />
        <div className='relative flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-surface-elevated/45 text-3xl text-content-brand-accent'>
          {symbol}
        </div>
        <span className='absolute bottom-3 text-[10px] uppercase tracking-[0.3em] text-content-muted'>
          {index === 0 ? 'Daily' : 'Weekly'}
        </span>
      </div>
    );
  };

  const renderPremiumTarotCard = ({
    label,
    cardName,
    keywords,
    share,
    onOpen,
    children,
    isMuted = false,
    index,
    repeat,
  }: {
    label: string;
    cardName: string;
    keywords: string[];
    share?: typeof dailyShare;
    onOpen?: () => void;
    children?: React.ReactNode;
    isMuted?: boolean;
    index: number;
    repeat?: { count: number; window: number } | null;
  }) => {
    const primaryKeyword = keywords[2] || keywords[0];
    const supportingKeywords = keywords
      .filter((_: string, keywordIndex: number) => keywordIndex !== 2)
      .slice(0, 2);

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-[1.5rem] border border-lunary-primary-700/30 bg-gradient-to-br from-surface-elevated/80 via-layer-deep/50 to-surface-base/80 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)]',
          isMuted && 'min-h-[18rem]',
        )}
      >
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(238,120,158,0.16),transparent_34%),radial-gradient(circle_at_90%_25%,rgba(132,88,216,0.18),transparent_36%)]' />
        <div className='relative flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            {renderCardGlyph(cardName, index)}
            <div className='min-w-0'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-content-brand-accent/85'>
                {label}
              </p>
              <button
                type='button'
                onClick={onOpen}
                disabled={!onOpen}
                className='mt-2 text-left text-xl font-semibold leading-tight text-content-primary transition-colors hover:text-content-brand disabled:cursor-default disabled:hover:text-content-primary sm:text-2xl'
              >
                {cardName}
              </button>
              <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                {primaryKeyword && (
                  <span className='inline-flex items-center rounded-full border border-lunary-primary-600/35 bg-layer-base/55 px-2.5 py-1 font-medium text-content-brand-accent'>
                    {primaryKeyword}
                  </span>
                )}
                {supportingKeywords.length > 0 && (
                  <span className='text-content-muted'>
                    {supportingKeywords.join(' · ')}
                  </span>
                )}
              </div>
              {repeat && (
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  <span className='inline-flex items-center rounded-full border border-lunary-success-700/35 bg-lunary-success-950/20 px-2.5 py-1 text-[11px] text-lunary-success-200'>
                    Seen before: {repeat.count} times in {repeat.window} days
                  </span>
                </div>
              )}
            </div>
          </div>
          {share && (
            <button
              type='button'
              onClick={() => handleCardShare(share)}
              className='inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stroke-subtle/60 bg-surface-elevated/60 px-3 py-1.5 text-xs font-medium text-content-brand transition-colors hover:bg-surface-elevated'
            >
              <Share2 className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>Share</span>
            </button>
          )}
        </div>
        {children && <div className='relative mt-4'>{children}</div>}
      </div>
    );
  };

  return (
    <div className='h-full w-full space-y-4 overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(132,88,216,0.14),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(238,120,158,0.10),transparent_30%)] p-3 pb-32 sm:space-y-6 sm:p-4'>
      <div className='relative overflow-hidden rounded-[1.5rem] border border-lunary-primary-700/30 bg-gradient-to-br from-layer-deep/90 via-surface-base/85 to-lunary-secondary-950/40 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.25)] sm:rounded-[1.75rem] sm:p-6'>
        <div className='pointer-events-none absolute -right-20 -top-24 hidden h-56 w-56 rounded-full border border-white/10 bg-lunary-primary-500/10 blur-xl lg:block' />
        <div className='pointer-events-none absolute -bottom-24 left-8 hidden h-48 w-48 rounded-full bg-lunary-rose-500/10 blur-3xl lg:block' />
        <div className='relative grid gap-5 lg:grid-cols-[1.4fr,1fr] lg:items-end'>
          <div>
            <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-lunary-primary-700/40 bg-layer-base/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-content-brand-accent'>
              <Sparkles className='h-3.5 w-3.5' />
              Tarot room
            </div>
            <Heading variant='h1' as='h1'>
              {hasPaidAccess && userName
                ? `${firstName || userName}'s tarot reading`
                : hasPaidAccess
                  ? 'Your tarot reading'
                  : "Today's tarot reading"}
            </Heading>
            <p className='mt-2 hidden max-w-2xl text-sm leading-relaxed text-content-secondary sm:block'>
              {hasPaidAccess
                ? iosLabel(
                    'Personalized card guidance woven with your cosmic signature and current sky.',
                    isNativeIOS,
                  )
                : iosLabel(
                    'A clear daily card with a preview of the deeper pattern work waiting inside Lunary+.',
                    isNativeIOS,
                  )}
            </p>
          </div>

          <div className='hidden rounded-2xl border border-white/10 bg-surface-elevated/35 p-4 backdrop-blur lg:block'>
            <div className='rounded-2xl border border-lunary-secondary-700/30 bg-layer-base/35 p-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-lunary-primary-700/40 bg-surface-base/40 p-2'>
                  <Image
                    src={cosmicContext.moonPhase.icon.src}
                    alt={cosmicContext.moonPhase.icon.alt}
                    width={30}
                    height={30}
                    className='h-7 w-7 object-contain'
                  />
                </div>
                <div className='min-w-0'>
                  <p className='text-[11px] uppercase tracking-[0.18em] text-content-muted'>
                    Moon context
                  </p>
                  <p className='text-sm font-medium text-content-primary'>
                    {cosmicContext.moonPhase.name}
                  </p>
                </div>
              </div>
              {moonKeywords.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {moonKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className='rounded-full border border-lunary-secondary-700/40 bg-surface-base/35 px-2 py-0.5 text-xs text-content-secondary'
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-3 rounded-[1.35rem] border border-stroke-subtle/50 bg-surface-elevated/45 p-3 sm:grid-cols-3'>
        <Link
          href='/horoscope'
          className='group flex items-center justify-between rounded-2xl border border-transparent bg-layer-base/25 px-3 py-2 transition-colors hover:border-lunary-primary-700/40 hover:bg-layer-base/40'
        >
          <span>
            <span className='block text-xs font-medium text-content-primary'>
              Read the sky
            </span>
            <span className='block text-[11px] text-content-muted'>
              Match cards to today&apos;s astrology
            </span>
          </span>
          <ArrowRight className='h-4 w-4 text-content-muted transition-transform group-hover:translate-x-0.5 group-hover:text-content-brand' />
        </Link>
        <button
          type='button'
          onClick={() => {
            const spreadsSection = document.getElementById(
              hasPaidAccess
                ? 'tarot-spreads-section'
                : 'tarot-spreads-section-free',
            );
            spreadsSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className='group flex items-center justify-between rounded-2xl border border-transparent bg-layer-base/25 px-3 py-2 text-left transition-colors hover:border-lunary-primary-700/40 hover:bg-layer-base/40'
        >
          <span>
            <span className='block text-xs font-medium text-content-primary'>
              Pull a spread
            </span>
            <span className='block text-[11px] text-content-muted'>
              Choose a shape for the question
            </span>
          </span>
          <ArrowRight className='h-4 w-4 text-content-muted transition-transform group-hover:translate-x-0.5 group-hover:text-content-brand' />
        </button>
        <button
          type='button'
          onClick={() =>
            document
              .querySelector('[data-testid="pattern-analysis-section"]')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
          className='group flex items-center justify-between rounded-2xl border border-transparent bg-layer-base/25 px-3 py-2 text-left transition-colors hover:border-lunary-primary-700/40 hover:bg-layer-base/40'
        >
          <span>
            <span className='block text-xs font-medium text-content-primary'>
              Trace patterns
            </span>
            <span className='block text-[11px] text-content-muted'>
              See what keeps repeating
            </span>
          </span>
          <ArrowRight className='h-4 w-4 text-content-muted transition-transform group-hover:translate-x-0.5 group-hover:text-content-brand' />
        </button>
      </div>

      {/* CTA button to scroll to spreads */}
      {/* {authStatus.isAuthenticated && (
        <div className='flex gap-3'>
          <Button
            onClick={() => {
              const spreadsId = hasPaidAccess
                ? 'tarot-spreads-section'
                : 'tarot-spreads-section-free';
              const spreadsSection = document.getElementById(spreadsId);
              if (spreadsSection) {
                spreadsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            variant='lunary'
            className='w-full'
          >
            {hasPaidAccess ? 'Do a Reading' : 'Pull a Tarot Spread Reading'}
          </Button>
        </div>
      )} */}
      <div className='space-y-4'>
        {/* Daily & Weekly Cards section */}
        {hasPaidAccess ? (
          <HoroscopeSection title='Daily & Weekly Cards' color='purple'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5'>
              {renderPremiumTarotCard({
                label: 'Daily card',
                cardName: dailyCardName,
                keywords: dailyCardKeywords,
                share: dailyShare,
                index: 0,
                repeat: dailyRepeat,
                onOpen: () => openCardByName(personalizedReading!.daily.name),
                children: (
                  <>
                    {subscription.hasAccess('personal_tarot') && (
                      <TarotTransitConnection
                        cardName={personalizedReading!.daily.name}
                        birthChart={user?.birthChart}
                        userBirthday={userBirthday}
                        currentTransits={currentAstrologicalChart}
                        variant='compact'
                        userBirthLocation={user?.location?.birthLocation}
                        onReadMore={() =>
                          openCardByName(personalizedReading!.daily.name)
                        }
                      />
                    )}
                  </>
                ),
              })}

              {renderPremiumTarotCard({
                label: 'Weekly card',
                cardName: weeklyCardName,
                keywords: weeklyCardKeywords,
                share: weeklyShare,
                index: 1,
                repeat: weeklyRepeat,
                onOpen: () => openCardByName(personalizedReading!.weekly.name),
                children: (
                  <>
                    {subscription.hasAccess('personal_tarot') && (
                      <TarotTransitConnection
                        cardName={personalizedReading!.weekly.name}
                        birthChart={user?.birthChart}
                        userBirthday={user?.birthday}
                        currentTransits={currentAstrologicalChart || []}
                        variant='compact'
                        userBirthLocation={user?.location?.birthLocation}
                        onReadMore={() =>
                          openCardByName(personalizedReading!.weekly.name)
                        }
                      />
                    )}
                  </>
                ),
              })}
            </div>

            {recurringThemeItems.length > 0 && (
              <div className='mt-4 grid gap-2 rounded-2xl border border-stroke-subtle/50 bg-surface-base/35 p-3 sm:grid-cols-3'>
                {recurringThemeItems.map(
                  (item: { label: string; detail?: string }) => (
                    <div key={item.label} className='min-w-0'>
                      <p className='truncate text-xs font-medium text-content-primary'>
                        {item.label}
                      </p>
                      {item.detail && (
                        <p className='mt-0.5 text-[11px] text-content-muted'>
                          {item.detail}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Guidance action points - paid only */}
            <div className='mt-4 rounded-2xl border border-lunary-success-800/45 bg-gradient-to-r from-layer-deep/80 to-surface-elevated/40 p-4'>
              <div className='flex items-start gap-3'>
                <Sparkles className='mt-0.5 h-4 w-4 shrink-0 text-lunary-success-400' />
                <ul className='space-y-2 text-xs text-content-secondary'>
                  {guidanceActionPoints.length > 0 ? (
                    guidanceActionPoints
                      .slice(-1)
                      .map((point: string, index: number) => (
                        <li key={index}>{point}</li>
                      ))
                  ) : (
                    <li className='text-xs text-content-muted'>
                      Key insight drives your next move. Save a spread to
                      capture the message.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </HoroscopeSection>
        ) : (
          /* Free user: Daily & Weekly Cards with teaser overlays */
          <div className='rounded-[1.5rem] border border-stroke-subtle/50 bg-gradient-to-br from-surface-elevated/60 to-layer-deep/30 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-5'>
            <div className='mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-brand-accent'>
                  Open reading
                </p>
                <h2 className='text-lg font-semibold text-content-primary'>
                  Today&apos;s cosmic reading
                </h2>
              </div>
              <p className='text-xs text-content-muted'>
                Daily card visible. Weekly depth is previewed.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5'>
              {renderPremiumTarotCard({
                label: 'Daily card',
                cardName: dailyCardName,
                keywords: dailyCardKeywords,
                share: dailyShare,
                index: 0,
                repeat: dailyRepeat,
                onOpen: () => openCardByName(generalTarot!.daily.name),
                children: (
                  <div className='rounded-2xl border border-stroke-subtle/50 bg-surface-base/35 p-3'>
                    <div className='mb-2 flex items-center gap-2'>
                      <Sparkles className='h-3.5 w-3.5 text-content-brand' />
                      <span className='text-xs font-medium text-content-secondary'>
                        In your chart today
                      </span>
                    </div>
                    {renderPreview(
                      "Mars supports your path today. See how the sky connects to this card's message for you.",
                    )}
                    <button
                      type='button'
                      onClick={() => router.push('/pricing?nav=app')}
                      className='mt-2 text-xs font-medium text-content-brand transition-colors hover:text-content-secondary'
                    >
                      See the personalised layer
                    </button>
                  </div>
                ),
              })}

              <div className='relative'>
                {renderPremiumTarotCard({
                  label: 'Weekly card preview',
                  cardName: weeklyCardName,
                  keywords: weeklyCardKeywords,
                  index: 1,
                  isMuted: true,
                  repeat: weeklyRepeat,
                  children: (
                    <div className='rounded-2xl border border-stroke-subtle/50 bg-surface-base/30 p-3'>
                      <p className='text-xs leading-relaxed text-content-muted blur-[2px]'>
                        {generalTarot!.guidance.weeklyMessage}
                      </p>
                    </div>
                  ),
                })}
                <div className='absolute inset-0 flex flex-col items-center justify-center rounded-[1.5rem] bg-surface-base/55 p-4 text-center backdrop-blur-[2px]'>
                  <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-lunary-primary-700/50 bg-layer-base/70'>
                    <LockIcon className='h-5 w-5 text-content-brand' />
                  </div>
                  <h4 className='text-sm font-semibold text-content-primary'>
                    Weekly tarot layer
                  </h4>
                  <p className='mt-1 max-w-[220px] text-xs leading-relaxed text-content-muted'>
                    Preview the card now. Lunary+ adds the personal weekly
                    message and chart connection.
                  </p>
                  <button
                    type='button'
                    onClick={() => {
                      ctaCopy.trackCTAClick('tarotWeekly', 'tarot');
                      captureEvent('locked_content_clicked', {
                        feature: 'weekly_tarot_card',
                        tier: 'free',
                        weekly_lock_variant: weeklyLockVariant,
                      });
                      router.push('/pricing?nav=app');
                    }}
                    className='mt-3 inline-flex items-center gap-1.5 rounded-full border border-lunary-primary-700/60 bg-surface-elevated/85 px-3 py-1.5 text-xs font-medium text-content-brand transition-colors hover:bg-surface-elevated'
                  >
                    {ctaCopy.tarotWeekly}
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Message & Weekly Energy - Free */}
            <div className='mt-5 space-y-4 border-t border-stroke-subtle/50 pt-4'>
              <div className='rounded-2xl border border-lunary-primary-700/45 bg-surface-elevated/45 p-4'>
                <h3 className='mb-2 text-xs font-medium text-content-brand/90 md:text-sm'>
                  Daily message
                </h3>
                <p className='text-xs leading-relaxed text-content-secondary md:text-sm'>
                  {generalTarot!.guidance.dailyMessage.length >
                  FREE_DAILY_TAROT_TRUNCATE_LENGTH
                    ? generalTarot!.guidance.dailyMessage
                        .substring(0, FREE_DAILY_TAROT_TRUNCATE_LENGTH)
                        .trim() + '...'
                    : generalTarot!.guidance.dailyMessage}
                </p>
                {generalTarot!.guidance.dailyMessage.length >
                  FREE_DAILY_TAROT_TRUNCATE_LENGTH && (
                  <button
                    type='button'
                    onClick={() => {
                      ctaCopy.trackCTAClick('tarotDaily', 'tarot');
                      captureEvent('locked_content_clicked', {
                        feature: 'daily_tarot_interpretation',
                        tier: 'free',
                        tarot_truncation_variant: tarotTruncationVariant,
                      });
                      router.push('/pricing?nav=app');
                    }}
                    className='mt-2 text-xs font-medium text-content-brand transition-colors hover:text-content-secondary'
                  >
                    {ctaCopy.tarotDaily}
                  </button>
                )}
              </div>

              <div className='relative overflow-hidden rounded-2xl border border-stroke-subtle/50 bg-surface-elevated/45 p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='text-xs font-medium text-content-brand md:text-sm'>
                    Weekly energy
                  </h3>
                  <button
                    type='button'
                    onClick={() => router.push('/pricing?nav=app')}
                    className='inline-flex items-center gap-1 rounded-full border border-lunary-primary-700/50 bg-layer-base/50 px-2 py-0.5 text-[10px] text-content-brand transition-colors hover:bg-layer-raised/50'
                  >
                    <Sparkles className='h-2.5 w-2.5' />
                    Lunary+
                  </button>
                </div>
                <div className='select-none blur-sm'>
                  <p className='text-xs leading-relaxed text-content-secondary md:text-sm'>
                    {generalTarot!.guidance.weeklyMessage}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    ctaCopy.trackCTAClick('tarotWeekly', 'tarot');
                    captureEvent('locked_content_clicked', {
                      feature: 'weekly_tarot',
                      tier: 'free',
                      weekly_lock_variant: weeklyLockVariant,
                    });
                    router.push('/pricing?nav=app');
                  }}
                  className='mt-3 text-xs font-medium text-content-brand transition-colors hover:text-content-secondary'
                >
                  {ctaCopy.tarotWeekly}
                </button>
              </div>
            </div>
          </div>
        )}

        <GuideNudge location='tarot' className='mb-2' />

        {/* Season/Ritual - paid with tarot_patterns access */}
        {hasPaidAccess &&
          subscription.hasAccess('tarot_patterns') &&
          personalizedReading?.trendAnalysis && (
            <div className='space-y-3' data-testid='rituals-prompts-section'>
              <TarotSeasonReading
                trendAnalysis={personalizedReading.trendAnalysis}
                period={timeFrame as 7 | 14 | 30 | 90 | 180 | 365}
              />
              <TarotRitualForPatterns
                trendAnalysis={personalizedReading.trendAnalysis}
              />
            </div>
          )}

        {/* Season/Ritual preview - free users FOMO */}
        {!hasPaidAccess && (
          <FeaturePreview
            title='Your Tarot Season & Rituals'
            description='Unlock personalized season readings and ritual prompts based on your tarot patterns.'
            feature='tarot_patterns'
            ctaKey='chartConnection'
            trackingFeature='tarot_season_rituals'
            page='tarot'
            blurredContent={
              <div className='space-y-3'>
                <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden'>
                  <div className='flex items-center justify-between p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-layer-base/30'>
                        <Sparkles className='w-4 h-4 text-lunary-primary-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-content-primary'>
                          Your Tarot Season: Emotional Depths
                        </p>
                        <p className='text-xs text-content-muted'>
                          30-day pattern reading
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden'>
                  <div className='flex items-center justify-between p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-layer-base/30'>
                        <Image
                          src={cosmicContext.moonPhase.icon.src}
                          alt={cosmicContext.moonPhase.icon.alt}
                          width={18}
                          height={18}
                          className='h-[18px] w-[18px] object-contain'
                        />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-content-primary'>
                          Cups Ritual: Water Meditation
                        </p>
                        <p className='text-xs text-content-muted'>
                          Ritual for your patterns
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        )}

        {/* Reflection prompts, all users (component handles its own gating) */}
        <TarotReflectionPrompts
          trendAnalysis={personalizedReading?.trendAnalysis ?? null}
        />

        {/* All patterns are now consolidated in the Tarot Patterns collapsible section below */}

        {/* Feature preview for spreads - unauthenticated only */}
        {!authStatus.isAuthenticated && (
          <FeaturePreview
            title='Guided Tarot Spreads'
            description='Choose a spread, draw cards instantly, and save your insights.'
            feature='tarot_patterns'
            ctaKey='chartConnection'
            trackingFeature='tarot_spreads'
            page='tarot'
            blurredContent={
              <div className='space-y-3'>
                <div className='rounded-lg border border-lunary-accent-700 bg-layer-deep p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-10 h-10 rounded-lg bg-surface-card/60 border border-stroke-default flex items-center justify-center'>
                      <Image
                        src={cosmicContext.moonPhase.icon.src}
                        alt={cosmicContext.moonPhase.icon.alt}
                        width={22}
                        height={22}
                        className='h-5 w-5 object-contain'
                      />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-content-primary'>
                        Celtic Cross
                      </h4>
                      <p className='text-xs text-content-muted'>
                        10-card spread · Deep insight
                      </p>
                    </div>
                  </div>
                  <p className='text-xs text-content-muted leading-relaxed'>
                    Draw 10 cards and explore how past influences, present
                    challenges, and future possibilities weave together into a
                    single narrative.
                  </p>
                </div>
                <div className='rounded-lg border border-lunary-accent-700 bg-layer-deep p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-10 h-10 rounded-lg bg-surface-card/60 border border-stroke-default flex items-center justify-center'>
                      <Sparkles className='h-4 w-4 text-content-brand' />
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-content-primary'>
                        Love Triangle
                      </h4>
                      <p className='text-xs text-content-muted'>
                        3-card spread · Relationship focus
                      </p>
                    </div>
                  </div>
                  <p className='text-xs text-content-muted leading-relaxed'>
                    Explore the dynamics between you and another, what you
                    bring, what they bring, and where the connection is headed.
                  </p>
                </div>
              </div>
            }
          />
        )}

        {/* Tarot Patterns section - always shown */}
        <div data-testid='pattern-analysis-section'>
          <CollapsibleSection title='Tarot Patterns' defaultCollapsed={false}>
            <div
              className='mb-4 flex flex-wrap gap-2'
              data-testid='pattern-timeframe-selector'
            >
              {[7, 14, 30, 90, 180, 365].map((days) => {
                const needsAdvancedAccess = days === 365;
                const needsPatternsAccess = days >= 14;
                const hasAccess = needsAdvancedAccess
                  ? subscription.hasAccess('advanced_patterns')
                  : needsPatternsAccess
                    ? subscription.hasAccess('tarot_patterns')
                    : true; // 7-day is free
                const isLocked = !hasAccess;

                return (
                  <button
                    key={days}
                    data-testid={`pattern-${days}days`}
                    onClick={() => {
                      if (isLocked) {
                        setUpgradeFeature(
                          needsAdvancedAccess
                            ? 'advanced_patterns'
                            : 'tarot_patterns',
                        );
                        setShowUpgradeModal(true);
                        return;
                      }
                      setSelectedView(days);
                    }}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-colors relative',
                      isLocked
                        ? 'bg-surface-card/30 text-content-muted border border-stroke-default/30 cursor-not-allowed opacity-50'
                        : selectedView === days
                          ? 'bg-layer-base/20 text-content-brand border border-lunary-primary-700'
                          : 'bg-surface-card/50 text-content-muted border border-stroke-default/50 hover:bg-surface-card/70',
                    )}
                    title={
                      isLocked
                        ? needsAdvancedAccess
                          ? 'Upgrade to Lunary+ Pro to unlock'
                          : 'Upgrade to Lunary+ to unlock'
                        : undefined
                    }
                  >
                    {days === 180
                      ? '6 months'
                      : days === 365
                        ? '12 months'
                        : `${days} days`}
                    {isLocked && (
                      <LockIcon className='w-3 h-3 absolute -top-1 -right-1 text-content-muted' />
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  const hasAccess = subscription.hasAccess('advanced_patterns');
                  if (!hasAccess) {
                    setUpgradeFeature('advanced_patterns');
                    setShowUpgradeModal(true);
                    return;
                  }
                  setSelectedView('year-over-year');
                  setIsMultidimensionalMode(true);
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors relative',
                  !subscription.hasAccess('advanced_patterns')
                    ? 'bg-surface-card/30 text-content-muted border border-stroke-default/30 cursor-not-allowed opacity-50'
                    : selectedView === 'year-over-year'
                      ? 'bg-layer-base text-content-brand border border-lunary-primary-700'
                      : 'bg-surface-card/50 text-content-muted border border-stroke-default/50 hover:bg-surface-card/70',
                )}
                title={
                  !subscription.hasAccess('advanced_patterns')
                    ? 'Upgrade to Lunary+ Pro Annual to unlock'
                    : undefined
                }
              >
                Year-over-Year
                {!subscription.hasAccess('advanced_patterns') && (
                  <LockIcon className='w-3 h-3 absolute -top-1 -right-1 text-content-muted' />
                )}
              </button>
              <button
                onClick={() => {
                  const hasAccess = subscription.hasAccess('advanced_patterns');
                  if (!hasAccess) {
                    setUpgradeFeature('advanced_patterns');
                    setShowUpgradeModal(true);
                    return;
                  }
                  setIsMultidimensionalMode(!isMultidimensionalMode);
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors relative flex items-center gap-1.5',
                  !subscription.hasAccess('advanced_patterns')
                    ? 'bg-surface-card/30 text-content-muted border border-stroke-default/30 cursor-not-allowed opacity-50'
                    : isMultidimensionalMode
                      ? 'bg-layer-base/20 text-content-brand border border-lunary-primary-700'
                      : 'bg-surface-card/50 text-content-muted border border-stroke-default/50 hover:bg-surface-card/70',
                )}
                title={
                  !subscription.hasAccess('advanced_patterns')
                    ? 'Upgrade to Lunary+ Pro Annual to unlock advanced patterns'
                    : isMultidimensionalMode
                      ? 'Turn off multidimensional analysis'
                      : 'Turn on multidimensional analysis'
                }
              >
                <Sparkles className='w-3 h-3' />
                Advanced
                {!subscription.hasAccess('advanced_patterns') && (
                  <LockIcon className='w-3 h-3 absolute -top-1 -right-1 text-content-muted' />
                )}
              </button>
            </div>
            <AdvancedPatterns
              key={`patterns-${selectedView}-${isMultidimensionalMode}`}
              basicPatterns={
                hasPaidAccess
                  ? personalizedReading?.trendAnalysis
                  : freeBasicPatterns
              }
              selectedView={selectedView}
              isMultidimensionalMode={isMultidimensionalMode}
              onMultidimensionalModeChange={setIsMultidimensionalMode}
              recentReadings={
                typeof selectedView === 'number' && selectedView === 7
                  ? hasPaidAccess
                    ? personalizedPreviousReadings
                    : previousReadings
                  : undefined
              }
              onCardClick={(card: { name: string }) => {
                const tarotCard = getTarotCardByName(card.name);
                if (tarotCard) setSelectedCard(tarotCard);
              }}
              birthChart={user?.birthChart}
              userBirthday={userBirthday}
              currentTransits={currentAstrologicalChart}
              userBirthLocation={user?.birthLocation}
            />
          </CollapsibleSection>
        </div>

        {/* Tarot Spreads section - always shown for authenticated users */}
        {authStatus.isAuthenticated && (
          <div
            id={
              hasPaidAccess
                ? 'tarot-spreads-section'
                : 'tarot-spreads-section-free'
            }
            data-testid='tarot-spreads-section'
          >
            <CollapsibleSection title='Tarot Spreads' defaultCollapsed={false}>
              <TarotSpreadExperience
                userId={userId}
                userName={userName}
                userBirthday={userBirthday}
                birthChart={user?.birthChart}
                userBirthLocation={user?.location?.birthLocation}
                subscriptionPlan={tarotPlan}
                onCardPreview={(card) => setSelectedCard(card)}
                onShareReading={handleShareSpread}
              />

              <p className='text-xs text-content-muted p-2'>
                Read about{' '}
                <Link
                  href='/grimoire/tarot/spreads'
                  className='text-content-brand hover:text-content-secondary transition-colors'
                >
                  each spread
                </Link>{' '}
                before you draw cards for the best results.
              </p>
            </CollapsibleSection>
          </div>
        )}

        {/* Footer */}
        <div className='mt-6 pt-4 border-t border-stroke-subtle/50'>
          <p className='text-xs text-content-muted text-center'>
            Come back tomorrow to see how your patterns evolve.
          </p>
        </div>
      </div>
      {/* Modals */}
      <TarotCardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        birthChart={user?.birthChart}
        userBirthday={userBirthday}
        currentTransits={currentAstrologicalChart}
      />
      {/* Share Modal */}
      {shareTarget && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-sm'
          aria-modal='true'
          role='dialog'
          onClick={closeShareModal}
        >
          <div
            className='relative w-full max-w-md rounded-2xl border border-stroke-subtle bg-surface-elevated p-6 text-content-primary shadow-2xl'
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closeShareModal}
              className='absolute right-4 top-4 text-content-muted hover:text-content-primary'
            >
              <X className='w-5 h-5' />
            </button>

            <h2 className='text-lg font-medium text-content-primary'>
              Share {shareTarget.title}
            </h2>
            {shareTarget.description && (
              <p className='text-xs text-content-muted'>
                {shareTarget.description}
              </p>
            )}

            {shareLoading && (
              <div className='flex flex-col items-center justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin text-lunary-primary-400' />
                <p className='mt-3 text-sm text-content-muted'>
                  Generating the share image...
                </p>
              </div>
            )}

            {shareError && (
              <p className='mt-4 text-sm text-red-400'>{shareError}</p>
            )}

            {sharePreviewUrl && (
              <div className='mt-4 overflow-hidden rounded-xl border border-stroke-subtle'>
                <Image
                  src={sharePreviewUrl}
                  alt={shareTarget.title}
                  width={1080}
                  height={600}
                  className='w-full h-auto'
                  unoptimized
                />
              </div>
            )}

            <div className='mt-5 space-y-2'>
              <button
                type='button'
                onClick={handleShareImage}
                disabled={!shareImageBlob || shareLoading}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-lunary-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-lunary-primary-500 disabled:cursor-not-allowed disabled:opacity-60'
              >
                <Share2 className='h-4 w-4' />
                Share image
              </button>
              <button
                type='button'
                onClick={handleDownloadShareImage}
                disabled={!shareImageBlob}
                className='flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-subtle px-4 py-3 text-sm font-semibold text-content-primary transition hover:border-stroke-default disabled:cursor-not-allowed disabled:opacity-60'
              >
                <Download className='h-4 w-4' />
                Save image
              </button>
              <button
                type='button'
                onClick={handleCopyShareLink}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-surface-card px-4 py-3 text-sm font-semibold text-content-primary transition hover:bg-surface-card/80'
              >
                <Copy className='h-4 w-4' />
                Copy share link
              </button>
            </div>

            <p className='mt-4 text-xs text-content-muted'>
              Share this cosmic insight anywhere you like.
            </p>
          </div>
        </div>
      )}
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-sm'
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className='relative w-full max-w-md bg-surface-elevated rounded-lg border border-stroke-subtle/50 p-6'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUpgradeModal(false)}
              className='absolute top-4 right-4 text-content-muted hover:text-content-primary transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
            <UpgradePrompt
              variant='card'
              featureName={upgradeFeature || 'tarot_patterns'}
              title={
                upgradeFeature === 'advanced_patterns'
                  ? 'Unlock Advanced Patterns'
                  : 'Unlock Tarot Patterns'
              }
              description={
                upgradeFeature === 'advanced_patterns'
                  ? 'Upgrade to Lunary+ Pro Annual to access year-over-year comparisons, multi-dimensional analysis, and extended timeline insights.'
                  : 'Upgrade to Lunary+ to access extended pattern analysis up to 6 months of tarot readings.'
              }
              requiredPlan={
                upgradeFeature === 'advanced_patterns'
                  ? 'lunary_plus_ai_annual'
                  : 'lunary_plus'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
