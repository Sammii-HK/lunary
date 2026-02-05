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
  Moon,
  BookOpen,
} from 'lucide-react';
import { AdvancedPatterns } from '@/components/tarot/AdvancedPatterns';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { TarotCardModal } from '@/components/TarotCardModal';
import { getTarotCardByName } from '@/utils/tarot/getCardByName';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { conversionTracking } from '@/lib/analytics';
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
import { getTarotCard } from '../../../../../utils/tarot/tarot';
import { getImprovedTarotReading } from '../../../../../utils/tarot/improvedTarot';
import { getGeneralTarotReading } from '../../../../../utils/tarot/generalTarot';
import { useSubscription } from '../../../../hooks/useSubscription';
import { useTarotShare } from '@/hooks/useTarotShare';
import { useAstronomyContext } from '@/context/AstronomyContext';
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
  const authStatus = useAuthStatus();
  const astronomyContext = useAstronomyContext();
  const currentAstrologicalChart =
    astronomyContext?.currentAstrologicalChart || [];
  const subscription = useSubscription();
  const variantRaw = useFeatureFlagVariant('paywall_preview_style_v1');
  const variant = variantRaw || 'blur';
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

  // General tarot for free users
  const generalTarot = useMemo(() => {
    if (hasPaidAccess) return null;
    try {
      return getGeneralTarotReading();
    } catch (error) {
      console.error('Failed to load general tarot reading:', error);
      return null;
    }
  }, [hasPaidAccess]);

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

  // Tracking effects
  useEffect(() => {
    if (personalizedReading && userId) {
      conversionTracking.personalizedTarotViewed(userId, subscription.plan);
    }
  }, [personalizedReading, userId, subscription.plan]);

  useEffect(() => {
    if (hasPaidAccess && personalizedReading && userId) {
      conversionTracking.tarotViewed(userId, subscription.plan);
    }
  }, [hasPaidAccess, personalizedReading, userId, subscription.plan]);

  // Helper to render preview based on A/B test variant
  const renderPreview = useCallback(
    (content: string) => {
      if (variant === 'truncated') {
        return (
          <div className='locked-preview-truncated mb-2'>
            <p className='text-xs text-zinc-400'>{content}</p>
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
            <p className='text-xs text-zinc-400'>{contentWithSpaces}</p>
          </div>
        );
      }

      // Variant A: Blur Effect (default)
      return (
        <div className='locked-preview mb-2'>
          <p className='locked-preview-text text-xs text-zinc-400'>{content}</p>
        </div>
      );
    },
    [variant],
  );

  const truncate = useCallback((value?: string | null, limit = 140) => {
    if (!value) return undefined;
    if (value.length <= limit) return value;
    return `${value.slice(0, limit - 1).trimEnd()}…`;
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
      <div className='h-full w-full space-y-6 p-4 overflow-y-auto overflow-x-hidden pb-32'>
        <div className='pt-6'>
          <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
            Your Tarot Readings
          </h1>
          <p className='text-xs md:text-sm text-zinc-400'>
            General cosmic guidance based on universal energies
          </p>
        </div>

        <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-2'>
            Unable to load tarot reading
          </h3>
          <p className='text-xs md:text-sm text-zinc-300 mb-4 leading-relaxed'>
            We&apos;re having trouble loading your tarot reading. Please try
            refreshing the page, or unlock personalized readings with a birth
            chart.
          </p>
          <SmartTrialButton feature='tarot_patterns' />
        </div>

        <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-2'>
            Unlock Personal Tarot Readings
          </h3>
          <p className='text-xs md:text-sm text-zinc-300 mb-4 leading-relaxed'>
            Get personalized readings, plus discover your personal tarot
            patterns and card trends over time.
          </p>
          <ul className='text-xs text-zinc-400 space-y-2 mb-4'>
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
            <h2 className='text-2xl font-light text-zinc-100'>
              Complete Your Profile
            </h2>
            <p className='text-xs md:text-sm text-zinc-400 leading-relaxed'>
              To get personalized tarot readings, we need your birthday to
              calculate your cosmic signature.
            </p>
          </div>
          <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-6 space-y-4'>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium text-zinc-100'>
                Add Your Birthday
              </h3>
              <p className='text-xs md:text-sm text-zinc-300 leading-relaxed'>
                Your birthday helps us personalize your tarot readings and
                provide more accurate cosmic insights.
              </p>
            </div>
            <Link
              href='/profile'
              className='inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-lunary-primary-900/20 border border-lunary-primary-700 text-lunary-primary-300 font-medium hover:bg-lunary-primary-900/30 transition-colors'
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
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
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

  return (
    <div className='h-full w-full space-y-6 p-4 overflow-y-auto overflow-x-hidden pb-32'>
      {/* Header */}
      <div>
        <Heading variant='h1' as='h1'>
          {hasPaidAccess && userName
            ? `${userName}'s Tarot Readings`
            : hasPaidAccess
              ? 'Your Tarot Readings'
              : "Today's Tarot Readings"}
        </Heading>
        <p className='text-xs md:text-sm text-zinc-400'>
          {hasPaidAccess
            ? 'Personalized guidance based on your cosmic signature'
            : 'General cosmic guidance based on universal energies'}
        </p>
      </div>
      {/* Moon Phase
      <div className='rounded-lg border border-lunary-secondary-800 bg-lunary-secondary-950/40 p-3'>
        <div className='flex items-center gap-3'>
          <img
            src={cosmicContext.moonPhase.icon.src}
            alt={cosmicContext.moonPhase.icon.alt}
            className='w-10 h-10 flex-shrink-0'
          />
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-lunary-secondary-300 mb-1'>
              {cosmicContext.moonPhase.name}
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {cosmicContext.moonPhase.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className='text-xs px-2 py-0.5 rounded-full bg-lunary-secondary-900/50 text-lunary-secondary-400 border border-lunary-secondary-800'
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div> */}
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
      <div className='space-y-6'>
        {/* Daily & Weekly Cards section */}
        {hasPaidAccess ? (
          <HoroscopeSection title='Daily & Weekly Cards' color='purple'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Daily Card - Paid */}
              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                  Daily Card
                </h3>
                <p
                  className='text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                  onClick={() => {
                    const card = getTarotCardByName(
                      personalizedReading!.daily.name,
                    );
                    if (card) setSelectedCard(card);
                  }}
                >
                  {personalizedReading!.daily.name}
                </p>
                <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                    {personalizedReading!.daily.keywords[2] ||
                      personalizedReading!.daily.keywords[0]}
                  </span>
                  <span className='text-zinc-400'>
                    {personalizedReading!.daily.keywords
                      .filter((_: string, idx: number) => idx !== 2 && idx < 2)
                      .join(', ')}
                  </span>
                </div>

                {personalizedDailyShare && (
                  <div className='mt-3 flex flex-wrap items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => handleCardShare(personalizedDailyShare)}
                      className='inline-flex items-center gap-2 text-xs font-medium text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors'
                    >
                      <Share2 className='w-4 h-4' />
                      Share daily card
                    </button>
                  </div>
                )}

                {/* Transit connection for daily card */}
                {subscription.hasAccess('personal_tarot') && (
                  <TarotTransitConnection
                    cardName={personalizedReading!.daily.name}
                    birthChart={user?.birthChart}
                    userBirthday={userBirthday}
                    currentTransits={currentAstrologicalChart}
                    variant='inDepth'
                    userBirthLocation={user?.location?.birthLocation}
                  />
                )}
              </div>

              {/* Weekly Card - Paid */}
              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                  Weekly Card
                </h3>
                <p
                  className='text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                  onClick={() => {
                    const card = getTarotCardByName(
                      personalizedReading!.weekly.name,
                    );
                    if (card) setSelectedCard(card);
                  }}
                >
                  {personalizedReading!.weekly.name}
                </p>
                <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                    {personalizedReading!.weekly.keywords[2] ||
                      personalizedReading!.weekly.keywords[0]}
                  </span>
                  <span className='text-zinc-400'>
                    {personalizedReading!.weekly.keywords
                      .filter((_: string, idx: number) => idx !== 2 && idx < 2)
                      .join(', ')}
                  </span>
                </div>
                {personalizedWeeklyShare && (
                  <div className='mt-3 flex flex-wrap items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => handleCardShare(personalizedWeeklyShare)}
                      className='inline-flex items-center gap-2 text-xs font-medium text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors'
                    >
                      <Share2 className='w-4 h-4' />
                      Share weekly card
                    </button>
                  </div>
                )}

                {/* Transit connection for weekly card */}
                {subscription.hasAccess('personal_tarot') && (
                  <TarotTransitConnection
                    cardName={personalizedReading!.weekly.name}
                    birthChart={user?.birthChart}
                    userBirthday={user?.birthday}
                    currentTransits={currentAstrologicalChart || []}
                    variant='inDepth'
                    userBirthLocation={user?.location?.birthLocation}
                  />
                )}
              </div>
            </div>

            {/* Guidance action points - paid only */}
            <div className='mt-4'>
              <div className='rounded-lg border border-lunary-success-800 bg-lunary-success-950 p-4'>
                <ul className='space-y-2 text-xs text-zinc-300'>
                  {guidanceActionPoints.length > 0 ? (
                    guidanceActionPoints
                      .slice(-1)
                      .map((point: string, index: number) => (
                        <li key={index} className='flex items-start gap-2'>
                          <span>{point}</span>
                        </li>
                      ))
                  ) : (
                    <li className='text-xs text-zinc-400'>
                      Key insight drives your next move—save a spread to capture
                      the message.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </HoroscopeSection>
        ) : (
          /* Free user: Daily & Weekly Cards with locked overlays */
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-6'>
            <h2 className='text-lg md:text-xl font-medium text-zinc-100'>
              Today&apos;s Cosmic Reading
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Daily Card - Free */}
              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                  Daily Card
                </h3>
                <p
                  className='text-base md:text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                  onClick={() => {
                    const card = getTarotCardByName(generalTarot!.daily.name);
                    if (card) setSelectedCard(card);
                  }}
                >
                  {generalTarot!.daily.name}
                </p>
                <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm mb-3'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                    {generalTarot!.daily.keywords[2] ||
                      generalTarot!.daily.keywords[0]}
                  </span>
                  <span className='text-zinc-400'>
                    {generalTarot!.daily.keywords
                      .filter((_, idx) => idx !== 2 && idx < 2)
                      .join(', ')}
                  </span>
                </div>

                {generalDailyShare && (
                  <div className='mt-3 flex flex-wrap items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => handleCardShare(generalDailyShare)}
                      className='inline-flex items-center gap-2 text-xs font-medium text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors'
                    >
                      <Share2 className='w-4 h-4' />
                      Share daily card
                    </button>
                  </div>
                )}

                {/* Locked preview of transit insights */}
                <div className='mt-4 pt-4 border-t border-zinc-800'>
                  <div className='flex items-center gap-2 mb-2'>
                    <LockIcon className='w-3 h-3 text-lunary-primary-300' />
                    <span className='text-xs font-medium text-lunary-primary-200'>
                      In Your Chart Today
                    </span>
                  </div>
                  {renderPreview(
                    "Mars supports your path today. See how the sky connects to this card's message for you.",
                  )}
                  <button
                    type='button'
                    onClick={() => router.push('/pricing')}
                    className='mt-2 text-xs text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors font-medium'
                  >
                    Unlock personalized insights
                  </button>
                </div>
              </div>

              {/* Weekly Card - Free (locked overlay) */}
              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4 relative overflow-hidden'>
                <div className='blur-md opacity-30 select-none pointer-events-none'>
                  <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                    Weekly Card
                  </h3>
                  <p className='text-lg font-medium text-zinc-100 mb-1'>
                    {generalTarot!.weekly.name}
                  </p>
                  <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm mb-3'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                      {generalTarot!.weekly.keywords[2] ||
                        generalTarot!.weekly.keywords[0]}
                    </span>
                  </div>
                </div>
                <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 p-4'>
                  <LockIcon className='w-6 h-6 text-lunary-primary-300' />
                  <h4 className='text-sm font-semibold text-zinc-100 text-center'>
                    Weekly Card
                  </h4>
                  <p className='text-xs text-zinc-400 text-center max-w-[200px]'>
                    Deeper weekly guidance, written just for you
                  </p>
                  <span className='inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-lunary-primary-300'>
                    <Sparkles className='w-2.5 h-2.5' />
                    Lunary+ Feature
                  </span>
                  <button
                    type='button'
                    onClick={() => {
                      ctaCopy.trackCTAClick('tarotWeekly', 'tarot');
                      captureEvent('locked_content_clicked', {
                        feature: 'weekly_tarot_card',
                        tier: 'free',
                      });
                      router.push('/pricing');
                    }}
                    className='mt-1 inline-flex items-center gap-1.5 rounded-lg border border-lunary-primary-700 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-lunary-primary-300 hover:bg-zinc-900 transition-colors'
                  >
                    {ctaCopy.tarotWeekly}
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Message & Weekly Energy - Free */}
            <div className='space-y-4 pt-4 border-t border-zinc-800/50'>
              <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-4'>
                <h3 className='text-xs md:text-sm font-medium text-lunary-primary-300/90 mb-2'>
                  Daily Message
                </h3>
                <p className='text-xs md:text-sm text-zinc-300 leading-relaxed'>
                  {generalTarot!.guidance.dailyMessage.length >
                  FREE_DAILY_TAROT_TRUNCATE_LENGTH
                    ? generalTarot!.guidance.dailyMessage
                        .substring(0, FREE_DAILY_TAROT_TRUNCATE_LENGTH)
                        .trim() + '…'
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
                      });
                      router.push('/pricing');
                    }}
                    className='mt-2 text-xs text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors font-medium'
                  >
                    {ctaCopy.tarotDaily}
                  </button>
                )}
              </div>

              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4 relative overflow-hidden'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xs md:text-sm font-medium text-lunary-primary-300'>
                    Weekly Energy
                  </h3>
                  <span className='inline-flex items-center gap-1 text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded text-lunary-primary-300'>
                    <Sparkles className='w-2.5 h-2.5' />
                    Lunary+
                  </span>
                </div>
                <div className='blur-sm opacity-40 select-none pointer-events-none'>
                  <p className='text-xs md:text-sm text-zinc-300 leading-relaxed'>
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
                    });
                    router.push('/pricing');
                  }}
                  className='mt-3 text-xs text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors font-medium'
                >
                  {ctaCopy.tarotWeekly}
                </button>
              </div>
            </div>
          </div>
        )}

        <GuideNudge location='tarot' className='mb-2' />

        {/* Season/Ritual/Reflection prompts - paid with tarot_patterns access */}
        {hasPaidAccess &&
          subscription.hasAccess('tarot_patterns') &&
          personalizedReading?.trendAnalysis && (
            <div className='space-y-3'>
              <TarotSeasonReading
                trendAnalysis={personalizedReading.trendAnalysis}
                period={timeFrame as 7 | 14 | 30 | 90 | 180 | 365}
              />
              <TarotRitualForPatterns
                trendAnalysis={personalizedReading.trendAnalysis}
              />
              <TarotReflectionPrompts
                trendAnalysis={personalizedReading.trendAnalysis}
              />
            </div>
          )}

        {/* Season/Ritual/Reflection prompts preview - free users FOMO */}
        {!hasPaidAccess && (
          <FeaturePreview
            title='Your Tarot Season & Rituals'
            description='Unlock personalized season readings, ritual prompts, and reflection exercises based on your tarot patterns.'
            feature='tarot_patterns'
            ctaKey='chartConnection'
            trackingFeature='tarot_season_rituals'
            page='tarot'
            blurredContent={
              <div className='space-y-3'>
                <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
                  <div className='flex items-center justify-between p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-lunary-primary-900/30'>
                        <Sparkles className='w-4 h-4 text-lunary-primary-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-zinc-100'>
                          Your Tarot Season: Emotional Depths
                        </p>
                        <p className='text-xs text-zinc-400'>
                          30-day pattern reading
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
                  <div className='flex items-center justify-between p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-lunary-secondary-900/30'>
                        <Moon className='w-4 h-4 text-lunary-secondary-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-zinc-100'>
                          Cups Ritual: Water Meditation
                        </p>
                        <p className='text-xs text-zinc-400'>
                          Ritual for your patterns
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 overflow-hidden'>
                  <div className='flex items-center justify-between p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-lunary-accent-900/30'>
                        <BookOpen className='w-4 h-4 text-lunary-accent-400' />
                      </div>
                      <div>
                        <p className='text-sm font-medium text-zinc-100'>
                          Reflection Prompts
                        </p>
                        <p className='text-xs text-zinc-400'>
                          5 prompts for your journal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        )}

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
                <div className='rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-10 h-10 rounded-lg bg-zinc-800/60 border border-zinc-700 flex items-center justify-center'>
                      <span className='text-lg'>🌙</span>
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-zinc-100'>
                        Celtic Cross
                      </h4>
                      <p className='text-xs text-zinc-500'>
                        10-card spread · Deep insight
                      </p>
                    </div>
                  </div>
                  <p className='text-xs text-zinc-400 leading-relaxed'>
                    Draw 10 cards and explore how past influences, present
                    challenges, and future possibilities weave together into a
                    single narrative.
                  </p>
                </div>
                <div className='rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 p-4'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-10 h-10 rounded-lg bg-zinc-800/60 border border-zinc-700 flex items-center justify-center'>
                      <span className='text-lg'>💫</span>
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-zinc-100'>
                        Love Triangle
                      </h4>
                      <p className='text-xs text-zinc-500'>
                        3-card spread · Relationship focus
                      </p>
                    </div>
                  </div>
                  <p className='text-xs text-zinc-400 leading-relaxed'>
                    Explore the dynamics between you and another — what you
                    bring, what they bring, and where the connection is headed.
                  </p>
                </div>
              </div>
            }
          />
        )}

        {/* Tarot Patterns section - always shown */}
        <CollapsibleSection title='Tarot Patterns' defaultCollapsed={false}>
          <HoroscopeSection
            title={
              selectedView === 'year-over-year'
                ? 'Year-over-Year Patterns'
                : timeFrame === 365
                  ? '12-Month Patterns'
                  : timeFrame === 180
                    ? '6-Month Patterns'
                    : timeFrame === 90
                      ? '90-Day Patterns'
                      : timeFrame === 30
                        ? '30-Day Patterns'
                        : timeFrame === 14
                          ? '14-Day Patterns'
                          : '7-Day Patterns'
            }
            color='zinc'
          >
            <div className='mb-4 flex flex-wrap gap-2'>
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
                        ? 'bg-zinc-800/30 text-zinc-600 border border-zinc-700/30 cursor-not-allowed opacity-50'
                        : selectedView === days
                          ? 'bg-lunary-primary-900/20 text-lunary-primary-300 border border-lunary-primary-700'
                          : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70',
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
                      <LockIcon className='w-3 h-3 absolute -top-1 -right-1 text-zinc-600' />
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
                    ? 'bg-zinc-800/30 text-zinc-600 border border-zinc-700/30 cursor-not-allowed opacity-50'
                    : selectedView === 'year-over-year'
                      ? 'bg-lunary-primary-900 text-lunary-primary-300 border border-lunary-primary-700'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70',
                )}
                title={
                  !subscription.hasAccess('advanced_patterns')
                    ? 'Upgrade to Lunary+ Pro Annual to unlock'
                    : undefined
                }
              >
                Year-over-Year
                {!subscription.hasAccess('advanced_patterns') && (
                  <LockIcon className='w-3 h-3 absolute -top-1 -right-1 text-zinc-600' />
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
                    ? 'bg-zinc-800/30 text-zinc-600 border border-zinc-700/30 cursor-not-allowed opacity-50'
                    : isMultidimensionalMode
                      ? 'bg-lunary-primary-900/20 text-lunary-primary-300 border border-lunary-primary-700'
                      : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800/70',
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
                  <LockIcon className='w-3 h-3 absolute -top-1 -right-1 text-zinc-600' />
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
          </HoroscopeSection>
        </CollapsibleSection>

        {/* Tarot Spreads section - always shown for authenticated users */}
        {authStatus.isAuthenticated && (
          <div
            id={
              hasPaidAccess
                ? 'tarot-spreads-section'
                : 'tarot-spreads-section-free'
            }
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

              <p className='text-xs text-zinc-400 p-2'>
                Read about{' '}
                <Link
                  href='/grimoire/tarot/spreads'
                  className='text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
                >
                  each spread
                </Link>{' '}
                before you draw cards for the best results.
              </p>
            </CollapsibleSection>
          </div>
        )}

        {/* Footer */}
        <div className='mt-6 pt-4 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-500 text-center'>
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
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
          aria-modal='true'
          role='dialog'
          onClick={closeShareModal}
        >
          <div
            className='relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl'
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={closeShareModal}
              className='absolute right-4 top-4 text-zinc-400 hover:text-zinc-100'
            >
              <X className='w-5 h-5' />
            </button>

            <h2 className='text-lg font-medium text-white'>
              Share {shareTarget.title}
            </h2>
            {shareTarget.description && (
              <p className='text-xs text-zinc-400'>{shareTarget.description}</p>
            )}

            {shareLoading && (
              <div className='flex flex-col items-center justify-center py-8'>
                <Loader2 className='h-8 w-8 animate-spin text-lunary-primary-400' />
                <p className='mt-3 text-sm text-zinc-400'>
                  Generating the share image…
                </p>
              </div>
            )}

            {shareError && (
              <p className='mt-4 text-sm text-red-400'>{shareError}</p>
            )}

            {sharePreviewUrl && (
              <div className='mt-4 overflow-hidden rounded-xl border border-zinc-800'>
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
                className='flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                <Download className='h-4 w-4' />
                Save image
              </button>
              <button
                type='button'
                onClick={handleCopyShareLink}
                className='flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800/80'
              >
                <Copy className='h-4 w-4' />
                Copy share link
              </button>
            </div>

            <p className='mt-4 text-xs text-zinc-500'>
              Share this cosmic insight anywhere you like.
            </p>
          </div>
        </div>
      )}
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className='relative w-full max-w-md bg-zinc-900 rounded-lg border border-zinc-800/50 p-6'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUpgradeModal(false)}
              className='absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors'
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
