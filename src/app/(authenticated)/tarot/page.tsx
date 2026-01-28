'use client';

import dayjs from 'dayjs';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';
import { useAuthStatus } from '@/components/AuthStatus';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { getTarotCard } from '../../../../utils/tarot/tarot';
import { getImprovedTarotReading } from '../../../../utils/tarot/improvedTarot';
import { getGeneralTarotReading } from '../../../../utils/tarot/generalTarot';
import { type MoonPhaseLabels } from '../../../../utils/moon/moonPhases';
import { useSubscription } from '../../../hooks/useSubscription';
import { hasFeatureAccess } from '../../../../utils/pricing';
import {
  Check,
  Sparkles,
  Share2,
  Lock as LockIcon,
  X,
  Download,
  Copy,
  Loader2,
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
import type { SpreadReadingRecord } from '@/components/tarot/TarotSpreadExperience';
import { TAROT_SPREADS } from '@/constants/tarotSpreads';
import type { TarotPlan } from '@/constants/tarotSpreads';
import { FeaturePreview } from '../horoscope/components/FeaturePreview';
import { HoroscopeSection } from '../horoscope/components/HoroscopeSection';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

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
import { TarotSeasonReading } from '@/components/tarot/TarotSeasonReading';
import { TarotRitualForPatterns } from '@/components/tarot/TarotRitualForPatterns';
import { TarotReflectionPrompts } from '@/components/tarot/TarotReflectionPrompts';
import { PremiumPathway } from '@/components/PremiumPathway';
import { RecurringThemesCard } from '@/components/RecurringThemesCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { TarotTransitConnection } from '@/components/tarot/TarotTransitConnection';
import { useFeatureFlagVariant } from '@/hooks/useFeatureFlag';
import { useCTACopy } from '@/hooks/useCTACopy';
import { shouldRedactWord } from '@/constants/redactedWords';
import { FREE_DAILY_TAROT_TRUNCATE_LENGTH } from '../../../../utils/entitlements';
import { captureEvent } from '@/lib/posthog-client';

const SUIT_ELEMENTS: Record<string, string> = {
  Cups: 'Water',
  Wands: 'Fire',
  Swords: 'Air',
  Pentacles: 'Earth',
  'Major Arcana': 'Spirit',
};

const MOON_PHASE_TIPS: Record<MoonPhaseLabels, string> = {
  'New Moon': 'Set intentions and script your next chapter.',
  'Waxing Crescent': 'Feed tiny habits that support the goal.',
  'First Quarter': 'Take decisive action even if it feels messy.',
  'Waxing Gibbous': 'Refine, iterate, and double down on momentum.',
  'Full Moon': 'Celebrate the insight and share it loudly.',
  'Waning Gibbous': 'Release excess and honor what was learned.',
  'Last Quarter': 'Audit systems and trim what isn’t aligned.',
  'Waning Crescent': 'Rest, dream, and let intuition lead the way.',
};

type SolarSeason = {
  sign: string;
  start: string; // MM-DD
  end: string; // MM-DD
  message: string;
};

const SOLAR_SEASONS: SolarSeason[] = [
  {
    sign: 'Capricorn',
    start: '12-22',
    end: '01-19',
    message: 'prioritizes structure and long-term mastery.',
  },
  {
    sign: 'Aquarius',
    start: '01-20',
    end: '02-18',
    message: 'sparks experimentation and community reach.',
  },
  {
    sign: 'Pisces',
    start: '02-19',
    end: '03-20',
    message: 'heightens intuition and dissolves rigid plans.',
  },
  {
    sign: 'Aries',
    start: '03-21',
    end: '04-19',
    message: 'ignites bold moves and rapid acceleration.',
  },
  {
    sign: 'Taurus',
    start: '04-20',
    end: '05-20',
    message: 'grounds desire into repeatable rituals.',
  },
  {
    sign: 'Gemini',
    start: '05-21',
    end: '06-20',
    message: 'amplifies curiosity, content, and conversation.',
  },
  {
    sign: 'Cancer',
    start: '06-21',
    end: '07-22',
    message: 'pulls focus toward emotional safety and home.',
  },
  {
    sign: 'Leo',
    start: '07-23',
    end: '08-22',
    message: 'spotlights creativity, attention, and play.',
  },
  {
    sign: 'Virgo',
    start: '08-23',
    end: '09-22',
    message: 'optimizes workflows and embodied care.',
  },
  {
    sign: 'Libra',
    start: '09-23',
    end: '10-22',
    message: 'balances partnerships, aesthetics, and harmony.',
  },
  {
    sign: 'Scorpio',
    start: '10-23',
    end: '11-21',
    message: 'dives deep into transformation and strategy.',
  },
  {
    sign: 'Sagittarius',
    start: '11-22',
    end: '12-21',
    message: 'opens horizons, publishing, and future plans.',
  },
];

const getSolarSeason = (date: dayjs.Dayjs) => {
  const today = date.format('MM-DD');
  return (
    SOLAR_SEASONS.find(({ start, end }) => {
      if (start <= end) {
        return today >= start && today <= end;
      }
      return today >= start || today <= end;
    }) || null
  );
};

const sanitizeInsightForParam = (value: string) => value.replace(/\|/g, ' / ');

type TarotShareTarget = {
  title: string;
  description?: string;
  pageUrl: string;
  ogUrl: string;
  variant: 'card' | 'spread';
};

const TarotReadings = () => {
  const { user, loading } = useUser();
  const authStatus = useAuthStatus();
  const astronomyContext = useAstronomyContext();
  const currentAstrologicalChart =
    astronomyContext?.currentAstrologicalChart || [];
  const subscription = useSubscription();
  const variantRaw = useFeatureFlagVariant('paywall_preview_style_v1');
  // Default to blur variant if feature flag isn't loaded yet
  const variant = variantRaw || 'blur';
  const ctaCopy = useCTACopy();
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const userId = user?.id;
  const tarotPlan = {
    plan: subscription.plan as TarotPlan,
    status: subscription.status as SubscriptionStatus,
  };
  // For unauthenticated users, force paid tarot access to false immediately
  // Don't wait for subscription to resolve
  const hasPersonalTarotAccess = !authStatus.isAuthenticated
    ? false
    : hasFeatureAccess(
        subscription.status,
        subscription.plan,
        'personal_tarot',
      );

  const [shareOrigin, setShareOrigin] = useState('https://lunary.app');
  const [shareTarget, setShareTarget] = useState<TarotShareTarget | null>(null);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null);
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

  // All hooks must be called before any early returns
  const generalTarot = useMemo(() => {
    if (hasPersonalTarotAccess) return null;
    try {
      return getGeneralTarotReading();
    } catch (error) {
      console.error('Failed to load general tarot reading:', error);
      return null;
    }
  }, [hasPersonalTarotAccess]);

  const shareDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const firstName = useMemo(
    () => (userName ? userName.split(' ')[0] || userName : undefined),
    [userName],
  );

  const previousReadings = useMemo(() => {
    if (hasPersonalTarotAccess) return [];
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
  }, [hasPersonalTarotAccess]);

  const timeFrame = typeof selectedView === 'number' ? selectedView : 30;
  const personalizedReading = useMemo(
    () =>
      hasPersonalTarotAccess && userName && userBirthday
        ? getImprovedTarotReading(userName, true, timeFrame, userBirthday)
        : null,
    [hasPersonalTarotAccess, userName, timeFrame, userBirthday],
  );

  // Build basic 7-day patterns for free users from previousReadings
  const freeBasicPatterns = useMemo(() => {
    if (
      hasPersonalTarotAccess ||
      !previousReadings ||
      previousReadings.length === 0
    )
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
    const suitPatterns = Array.from(suitCounts.entries())
      .map(([suit, data]) => ({
        suit,
        count: data.count,
        cards: Array.from(data.cards.entries()).map(([name, count]) => ({
          name,
          count,
        })),
      }))
      .sort((a, b) => b.count - a.count);
    const themes = frequentCards.slice(0, 3).flatMap((c) => {
      const card = previousReadings.find((r) => r.card.name === c.name);
      return card?.card.keywords?.slice(0, 2) || [];
    });
    return {
      dominantThemes: [...new Set(themes)],
      frequentCards,
      suitPatterns,
      numberPatterns: [] as Array<{
        number: string;
        count: number;
        cards: string[];
      }>,
      arcanaPatterns: [] as Array<{ type: string; count: number }>,
      timeFrame: 7,
    };
  }, [hasPersonalTarotAccess, previousReadings]);

  const guidanceActionPoints =
    personalizedReading?.guidance?.actionPoints ?? [];

  const truncate = useCallback((value?: string | null, limit = 140) => {
    if (!value) return undefined;
    if (value.length <= limit) return value;
    return `${value.slice(0, limit - 1).trimEnd()}…`;
  }, []);

  // Helper to render preview based on A/B test variant
  const renderPreview = useCallback(
    (content: string) => {
      if (variant === 'truncated') {
        // Variant B: Truncated - let the truncation itself create curiosity
        return (
          <div className='locked-preview-truncated mb-2'>
            <p className='text-xs text-zinc-400'>{content}</p>
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
          <p className='locked-preview-text text-xs text-zinc-400'>{content}</p>
        </div>
      );
    },
    [variant],
  );

  const generalDailyShare = useMemo(() => {
    if (!generalTarot) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', generalTarot.daily.name);
      if (generalTarot.daily.keywords?.length) {
        url.searchParams.set(
          'keywords',
          generalTarot.daily.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Daily');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'general');

      return {
        url: url.toString(),
        title: `Today's Tarot Card: ${generalTarot.daily.name}`,
        text: truncate(generalTarot.guidance?.dailyMessage),
      };
    } catch (error) {
      console.error('Failed to build general tarot share URL:', error);
      return null;
    }
  }, [generalTarot, shareOrigin, shareDate, truncate]);

  const generalWeeklyShare = useMemo(() => {
    if (!generalTarot) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', generalTarot.weekly.name);
      if (generalTarot.weekly.keywords?.length) {
        url.searchParams.set(
          'keywords',
          generalTarot.weekly.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Weekly');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'weekly');

      const description =
        generalTarot.guidance?.weeklyMessage ||
        generalTarot.weekly.keywords?.slice(0, 3).join(', ');

      return {
        url: url.toString(),
        title: `Weekly Tarot Card: ${generalTarot.weekly.name}`,
        text: truncate(description),
      };
    } catch (error) {
      console.error('Failed to build general weekly share URL:', error);
      return null;
    }
  }, [generalTarot, shareOrigin, shareDate, truncate]);

  const personalizedWeeklyShare = useMemo(() => {
    if (!personalizedReading) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', personalizedReading.weekly.name);
      if (personalizedReading.weekly.keywords?.length) {
        url.searchParams.set(
          'keywords',
          personalizedReading.weekly.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Weekly');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'weekly');
      if (firstName) {
        url.searchParams.set('name', firstName);
      }

      const description =
        personalizedReading.guidance?.weeklyMessage ||
        personalizedReading.weekly.keywords?.slice(0, 3).join(', ');

      return {
        url: url.toString(),
        title: `${firstName ? `${firstName}'s` : 'My'} Weekly Tarot Card: ${personalizedReading.weekly.name}`,
        text: truncate(description),
      };
    } catch (error) {
      console.error('Failed to build personalized weekly share URL:', error);
      return null;
    }
  }, [personalizedReading, shareOrigin, shareDate, firstName, truncate]);

  useEffect(() => {
    if (personalizedReading && userId) {
      conversionTracking.personalizedTarotViewed(userId, subscription.plan);
    }
  }, [personalizedReading, userId, subscription.plan]);

  const personalizedPreviousReadings = useMemo(() => {
    if (!hasPersonalTarotAccess || !userName || !userBirthday) return [];
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
  }, [hasPersonalTarotAccess, userName, userBirthday]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      setShareOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!shareImageBlob) {
      setSharePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(shareImageBlob);
    setSharePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setSharePreviewUrl(null);
    };
  }, [shareImageBlob]);

  const buildOgUrlFromShareUrl = useCallback(
    (shareUrl: string) => {
      try {
        const url = new URL(shareUrl);
        url.pathname = '/api/og/share/tarot';
        return url.toString();
      } catch (error) {
        console.error('Invalid share URL:', shareUrl, error);
        return `${shareOrigin}/api/og/share/tarot`;
      }
    },
    [shareOrigin],
  );

  const openShareModal = useCallback(async (target: TarotShareTarget) => {
    setShareTarget(target);
    setShareLoading(true);
    setShareError(null);
    setShareImageBlob(null);

    try {
      const response = await fetch(target.ogUrl);
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      const blob = await response.blob();
      setShareImageBlob(blob);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : 'Failed to generate image',
      );
    } finally {
      setShareLoading(false);
    }
  }, []);

  const closeShareModal = useCallback(() => {
    setShareTarget(null);
    setShareImageBlob(null);
    setShareError(null);
    setShareLoading(false);
    setSharePreviewUrl(null);
  }, []);

  const handleDownloadShareImage = useCallback(() => {
    if (!shareImageBlob) return;
    const url = URL.createObjectURL(shareImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lunary-tarot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [shareImageBlob]);

  const handleShareImage = useCallback(async () => {
    if (!shareTarget || !shareImageBlob) return;
    const file = new File([shareImageBlob], 'lunary-tarot.png', {
      type: 'image/png',
    });

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: shareTarget.title,
          text: shareTarget.description,
        });
        return;
      } catch (error) {
        const isAbort = error instanceof Error && error.name === 'AbortError';
        if (!isAbort) {
          console.error('Share failed:', error);
        }
      }
    }

    handleDownloadShareImage();
  }, [shareTarget, shareImageBlob, handleDownloadShareImage]);

  const handleCopyShareLink = useCallback(async () => {
    if (!shareTarget || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(shareTarget.pageUrl);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [shareTarget]);

  const handleCardShare = useCallback(
    (shareData: { url: string; title: string; text?: string }) => {
      openShareModal({
        title: shareData.title,
        description: shareData.text,
        pageUrl: shareData.url,
        ogUrl: buildOgUrlFromShareUrl(shareData.url),
        variant: 'card',
      });
    },
    [buildOgUrlFromShareUrl, openShareModal],
  );

  const buildSpreadOgUrl = useCallback(
    (reading: SpreadReadingRecord) => {
      const url = new URL('/api/og/share/tarot', shareOrigin);
      url.searchParams.set('variant', 'spread');
      url.searchParams.set('card', reading.spreadName);
      if (firstName) {
        url.searchParams.set('name', firstName);
      }
      if (reading.summary) {
        url.searchParams.set('spreadSummary', reading.summary);
        url.searchParams.set('text', reading.summary);
      }
      const snippet =
        reading.highlights?.length > 0
          ? reading.highlights[0]
          : reading.summary;
      if (snippet) {
        url.searchParams.set('spreadSnippet', snippet);
      }

      const cards = reading.cards.map((card) => ({
        positionLabel: card.positionLabel,
        positionPrompt: card.positionPrompt,
        cardName: card.card.name,
        keywords: card.card.keywords.slice(0, 4),
        insight: card.insight,
      }));
      url.searchParams.set('spreadCards', JSON.stringify(cards));

      if (reading.highlights?.length) {
        url.searchParams.set(
          'keywords',
          reading.highlights.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('spreadName', reading.spreadName);
      return url.toString();
    },
    [firstName, shareOrigin],
  );

  const handleShareSpread = useCallback(
    (reading: SpreadReadingRecord) => {
      const ogUrl = buildSpreadOgUrl(reading);
      openShareModal({
        title: reading.spreadName,
        description: reading.summary,
        pageUrl: `${shareOrigin}/tarot`,
        ogUrl,
        variant: 'spread',
      });
    },
    [buildSpreadOgUrl, openShareModal, shareOrigin],
  );

  const personalizedDailyShare = useMemo(() => {
    if (!personalizedReading) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', personalizedReading.daily.name);
      if (personalizedReading.daily.keywords?.length) {
        url.searchParams.set(
          'keywords',
          personalizedReading.daily.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Daily');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'personal');
      if (firstName) {
        url.searchParams.set('name', firstName);
      }

      const description =
        personalizedReading.guidance?.dailyMessage ||
        personalizedReading.daily.keywords?.slice(0, 3).join(', ');

      return {
        url: url.toString(),
        title: `${firstName ? `${firstName}'s` : 'My'} Daily Tarot Card: ${
          personalizedReading.daily.name
        }`,
        text: truncate(description),
      };
    } catch (error) {
      console.error('Failed to build personalized tarot share URL:', error);
      return null;
    }
  }, [personalizedReading, shareOrigin, shareDate, firstName, truncate]);

  const recurringThemeItems = useMemo(() => {
    const trends = personalizedReading?.trendAnalysis;
    if (!trends) return [];

    const themes = trends.dominantThemes ?? [];
    const cards = trends.frequentCards ?? [];

    if (themes.length === 0 && cards.length === 0) return [];

    const themeItems = themes.slice(0, 3).map((theme, index) => ({
      label: theme,
      detail: cards[index]?.name
        ? `${cards[index].name} showing up often`
        : undefined,
    }));

    if (themeItems.length > 0) return themeItems;

    return cards.slice(0, 3).map((card) => ({
      label: card.name,
      detail: typeof card.count === 'number' ? `Seen ${card.count} times` : '',
    }));
  }, [personalizedReading]);

  const router = useRouter();

  useEffect(() => {
    if (hasPersonalTarotAccess && personalizedReading && userId) {
      conversionTracking.tarotViewed(userId, subscription.plan);
    }
  }, [hasPersonalTarotAccess, personalizedReading, userId, subscription.plan]);

  // Simple sequential loading checks - prioritize unauthenticated users
  if (authStatus.loading) {
    // Still checking authentication - show loading
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, show content immediately (don't wait for useUser)
  // hasPersonalTarotAccess will be false because useSubscription returns status: 'free' when !user
  // generalTarot will be calculated correctly
  // Continue to render content below

  // If authenticated but user data is still loading, show loading
  if (authStatus.isAuthenticated && loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  // Otherwise, continue to render content

  if (!hasPersonalTarotAccess) {
    // If generalTarot failed to load, show error state with upsell instead of blank page
    if (!generalTarot) {
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
              We're having trouble loading your tarot reading. Please try
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

    return (
      <div className='h-full w-full space-y-6 p-4 overflow-y-auto overflow-x-hidden pb-32'>
        <div className='pt-6'>
          <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
            Today's Tarot Readings
          </h1>
          <p className='text-xs md:text-sm text-zinc-400'>
            General cosmic guidance based on universal energies
          </p>
        </div>

        {authStatus.isAuthenticated && (
          <div className='flex gap-3'>
            <Button
              onClick={() => {
                const spreadsSection = document.getElementById(
                  'tarot-spreads-section-free',
                );
                if (spreadsSection) {
                  spreadsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              variant='lunary'
              className='w-full'
            >
              Pull a Tarot Spread Reading
            </Button>
          </div>
        )}

        <div className='space-y-6'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-6'>
            <h2 className='text-lg md:text-xl font-medium text-zinc-100'>
              Today's Cosmic Reading
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                  Daily Card
                </h3>
                <p
                  className='text-base md:text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                  onClick={() => {
                    const card = getTarotCardByName(generalTarot.daily.name);
                    if (card) setSelectedCard(card);
                  }}
                >
                  {generalTarot.daily.name}
                </p>
                <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm mb-3'>
                  <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                    {generalTarot.daily.keywords[2] ||
                      generalTarot.daily.keywords[0]}
                  </span>
                  <span className='text-zinc-400'>
                    {generalTarot.daily.keywords
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

              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4 relative overflow-hidden'>
                <div className='blur-md opacity-30 select-none pointer-events-none'>
                  <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                    Weekly Card
                  </h3>
                  <p className='text-lg font-medium text-zinc-100 mb-1'>
                    {generalTarot.weekly.name}
                  </p>
                  <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm mb-3'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                      {generalTarot.weekly.keywords[2] ||
                        generalTarot.weekly.keywords[0]}
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

            <div className='space-y-4 pt-4 border-t border-zinc-800/50'>
              <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-4'>
                <h3 className='text-xs md:text-sm font-medium text-lunary-primary-300/90 mb-2'>
                  Daily Message
                </h3>
                <p className='text-xs md:text-sm text-zinc-300 leading-relaxed'>
                  {generalTarot.guidance.dailyMessage.length >
                  FREE_DAILY_TAROT_TRUNCATE_LENGTH
                    ? generalTarot.guidance.dailyMessage
                        .substring(0, FREE_DAILY_TAROT_TRUNCATE_LENGTH)
                        .trim() + '…'
                    : generalTarot.guidance.dailyMessage}
                </p>
                {generalTarot.guidance.dailyMessage.length >
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
                    {generalTarot.guidance.weeklyMessage}
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

          {subscription.hasAccess('tarot_patterns') &&
            hasPersonalTarotAccess &&
            personalizedReading?.trendAnalysis && (
              <HoroscopeSection
                title={`Your ${timeFrame}-Day Tarot Patterns`}
                color='zinc'
              >
                <RecurringThemesCard
                  className='mb-6'
                  subtitle={`Based on your last ${timeFrame} days of readings`}
                  items={recurringThemeItems}
                />
                <AdvancedPatterns
                  basicPatterns={personalizedReading.trendAnalysis}
                  selectedView={30}
                  isMultidimensionalMode={false}
                  onMultidimensionalModeChange={() => {}}
                />
              </HoroscopeSection>
            )}

          <FeaturePreview
            title='Personal Tarot Patterns'
            description='Discover your personal patterns and trends over time.'
            feature='tarot_patterns'
            ctaKey='chartConnection'
            trackingFeature='tarot_patterns'
            page='tarot'
            blurredContent={
              <div className='space-y-3'>
                <div className='rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-zinc-100'>
                      Suit Balance
                    </span>
                    <span className='text-xs text-zinc-500'>Last 30 days</span>
                  </div>
                  <div className='flex gap-2 mt-3'>
                    <div className='flex-1 text-center'>
                      <div className='text-lg font-semibold text-rose-300'>
                        38%
                      </div>
                      <div className='text-[10px] text-zinc-500 mt-0.5'>
                        Cups
                      </div>
                    </div>
                    <div className='flex-1 text-center'>
                      <div className='text-lg font-semibold text-amber-300'>
                        27%
                      </div>
                      <div className='text-[10px] text-zinc-500 mt-0.5'>
                        Wands
                      </div>
                    </div>
                    <div className='flex-1 text-center'>
                      <div className='text-lg font-semibold text-sky-300'>
                        22%
                      </div>
                      <div className='text-[10px] text-zinc-500 mt-0.5'>
                        Swords
                      </div>
                    </div>
                    <div className='flex-1 text-center'>
                      <div className='text-lg font-semibold text-emerald-300'>
                        13%
                      </div>
                      <div className='text-[10px] text-zinc-500 mt-0.5'>
                        Pentacles
                      </div>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-zinc-100'>
                      Recurring Themes
                    </span>
                  </div>
                  <div className='flex flex-wrap gap-1.5 mt-2'>
                    <span className='px-2 py-1 rounded border border-rose-700/40 bg-rose-900/30 text-[11px] text-rose-300'>
                      Transformation
                    </span>
                    <span className='px-2 py-1 rounded border border-amber-700/40 bg-amber-900/30 text-[11px] text-amber-300'>
                      Creative Flow
                    </span>
                    <span className='px-2 py-1 rounded border border-sky-700/40 bg-sky-900/30 text-[11px] text-sky-300'>
                      Inner Truth
                    </span>
                  </div>
                  <p className='text-xs text-zinc-400 leading-relaxed mt-3'>
                    Cups dominate your readings — emotional processing and
                    intuition are your primary focus. A shift toward action
                    (Wands) is emerging.
                  </p>
                </div>
              </div>
            }
          />

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
                      bring, what they bring, and where the connection is
                      headed.
                    </p>
                  </div>
                </div>
              }
            />
          )}

          {authStatus.isAuthenticated && (
            <div id='tarot-spreads-section-free'>
              <CollapsibleSection
                title='Tarot Spreads'
                defaultCollapsed={false}
              >
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
              </CollapsibleSection>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if user has chart access but is missing birthday
  if (hasPersonalTarotAccess && !userBirthday) {
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

  if (!personalizedReading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full w-full space-y-6 p-4 overflow-y-auto overflow-x-hidden pb-32'>
      <div className='pt-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          {userName ? `${userName}'s Tarot Readings` : 'Your Tarot Readings'}
        </h1>
        <p className='text-xs md:text-sm text-zinc-400'>
          Personalized guidance based on your cosmic signature
        </p>
      </div>

      <div className='flex gap-3'>
        <Button
          onClick={() => {
            const spreadsSection = document.getElementById(
              'tarot-spreads-section',
            );
            if (spreadsSection) {
              spreadsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className='w-full'
          variant='lunary'
        >
          Do a Reading
        </Button>
      </div>

      <div className='space-y-6'>
        <HoroscopeSection title='Daily & Weekly Cards' color='purple'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
              <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                Daily Card
              </h3>
              <p
                className='text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                onClick={() => {
                  const card = getTarotCardByName(
                    personalizedReading.daily.name,
                  );
                  if (card) setSelectedCard(card);
                }}
              >
                {personalizedReading.daily.name}
              </p>
              <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                  {personalizedReading.daily.keywords[2] ||
                    personalizedReading.daily.keywords[0]}
                </span>
                <span className='text-zinc-400'>
                  {personalizedReading.daily.keywords
                    .filter((_, idx) => idx !== 2 && idx < 2)
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
                  cardName={personalizedReading.daily.name}
                  birthChart={user?.birthChart}
                  userBirthday={userBirthday}
                  currentTransits={currentAstrologicalChart}
                  variant='inDepth'
                  userBirthLocation={user?.location?.birthLocation}
                />
              )}
            </div>

            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
              <h3 className='text-xs md:text-sm font-medium text-zinc-400 mb-2'>
                Weekly Card
              </h3>
              <p
                className='text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                onClick={() => {
                  const card = getTarotCardByName(
                    personalizedReading.weekly.name,
                  );
                  if (card) setSelectedCard(card);
                }}
              >
                {personalizedReading.weekly.name}
              </p>
              <div className='flex flex-wrap items-center gap-2 text-xs md:text-sm'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-md bg-lunary-primary-900/50 border border-lunary-primary-700/30 text-lunary-primary-200 font-medium'>
                  {personalizedReading.weekly.keywords[2] ||
                    personalizedReading.weekly.keywords[0]}
                </span>
                <span className='text-zinc-400'>
                  {personalizedReading.weekly.keywords
                    .filter((_, idx) => idx !== 2 && idx < 2)
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

              {/* In Your Chart Today for weekly card */}
              {subscription.hasAccess('personal_tarot') && (
                <TarotTransitConnection
                  cardName={personalizedReading.weekly.name}
                  birthChart={user?.birthChart}
                  userBirthday={user?.birthday}
                  currentTransits={currentAstrologicalChart || []}
                  variant='inDepth'
                  userBirthLocation={user?.location?.birthLocation}
                />
              )}
            </div>
          </div>

          <div className='mt-4'>
            <div className='rounded-lg border border-lunary-success-800 bg-lunary-success-950 p-4'>
              <ul className='space-y-2 text-xs text-zinc-300'>
                {guidanceActionPoints.length > 0 ? (
                  guidanceActionPoints.slice(-1).map((point, index) => (
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

        <GuideNudge location='tarot' className='mb-2' />

        {subscription.hasAccess('tarot_patterns') &&
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
                const needsPatternsAccess = days >= 14; // 14+ requires tarot_patterns
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
                        setUpgradeFeature('advanced_patterns');
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
                  setIsMultidimensionalMode(true); // Year-over-year requires advanced mode
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
                hasPersonalTarotAccess
                  ? personalizedReading?.trendAnalysis
                  : freeBasicPatterns
              }
              selectedView={selectedView}
              isMultidimensionalMode={isMultidimensionalMode}
              onMultidimensionalModeChange={setIsMultidimensionalMode}
              recentReadings={
                typeof selectedView === 'number' && selectedView === 7
                  ? hasPersonalTarotAccess
                    ? personalizedPreviousReadings
                    : previousReadings
                  : undefined
              }
              onCardClick={(card: { name: string }) => {
                const tarotCard = getTarotCardByName(card.name);
                if (tarotCard) setSelectedCard(tarotCard);
              }}
            />
          </HoroscopeSection>
        </CollapsibleSection>

        <div id='tarot-spreads-section'>
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
            <div className='mt-6 space-y-4 border-t border-zinc-800/40 pt-6'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <h3 className='text-lg font-medium text-zinc-100'>
                    Written Spread Guides
                  </h3>
                  <p className='text-xs text-zinc-400'>
                    Read about each spread before you draw cards.
                  </p>
                </div>
                <Link
                  href='/grimoire/tarot/spreads'
                  className='text-xs font-semibold text-lunary-primary-400 transition-colors hover:text-lunary-primary-300'
                >
                  View all spread guides →
                </Link>
              </div>
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {TAROT_SPREADS.map((spread) => (
                  <Link
                    key={spread.slug}
                    href={`/grimoire/tarot/spreads/${spread.slug}`}
                    className='group flex flex-col gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 transition hover:border-lunary-primary-500 hover:bg-zinc-900/50'
                    aria-label={`Read the ${spread.name} spread guide`}
                  >
                    <div className='text-sm font-semibold text-zinc-100'>
                      {spread.name}
                    </div>
                    <p className='text-xs text-zinc-400 leading-relaxed line-clamp-3'>
                      {spread.description}
                    </p>
                    <div className='mt-auto flex justify-between text-[11px] uppercase tracking-wide text-zinc-500'>
                      <span>{spread.cardCount} cards</span>
                      <span>{spread.estimatedTime}</span>
                    </div>
                    <span className='text-[10px] uppercase tracking-[0.3em] text-zinc-500'>
                      {spread.category}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>

        <div className='mt-6 pt-4 border-t border-zinc-800/50 space-y-3'>
          <p className='text-xs text-zinc-500 text-center'>
            Come back tomorrow to see how your patterns evolve.
          </p>
          <div className='flex flex-wrap justify-center gap-4 text-xs'>
            <Link
              href='/horoscope'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              See how this aligns with your horoscope →
            </Link>
            <Link
              href='/grimoire/moon'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              Check today's moon influence →
            </Link>
          </div>
        </div>

        <PremiumPathway variant='tarot' className='mt-6' />
      </div>

      <TarotCardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        birthChart={user?.birthChart}
        userBirthday={userBirthday}
        currentTransits={currentAstrologicalChart}
      />

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
              featureName={upgradeFeature || 'advanced_patterns'}
              title='Unlock Advanced Patterns'
              description='Upgrade to Lunary+ Pro Annual to access year-over-year comparisons, multi-dimensional analysis, and extended timeline insights.'
              requiredPlan='lunary_plus_ai_annual'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotReadings;
