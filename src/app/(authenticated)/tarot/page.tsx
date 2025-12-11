'use client';

import dayjs from 'dayjs';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { getTarotCard } from '../../../../utils/tarot/tarot';
import { getImprovedTarotReading } from '../../../../utils/tarot/improvedTarot';
import { getGeneralTarotReading } from '../../../../utils/tarot/generalTarot';
import {
  getMoonPhase,
  type MoonPhaseLabels,
} from '../../../../utils/moon/moonPhases';
import { useSubscription } from '../../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../../utils/pricing';
import { Check, Sparkles, Share2, Lock, X } from 'lucide-react';
import { AdvancedPatterns } from '@/components/tarot/AdvancedPatterns';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { TarotCardModal } from '@/components/TarotCardModal';
import { getTarotCardByName } from '@/utils/tarot/getCardByName';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { conversionTracking } from '@/lib/analytics';
import { useModal } from '@/hooks/useModal';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import {
  SubscriptionStatus,
  TarotSpreadExperience,
} from '@/components/tarot/TarotSpreadExperience';
import type { TarotPlan } from '@/constants/tarotSpreads';
import { HoroscopeSection } from '../horoscope/components/HoroscopeSection';
import { cn } from '@/lib/utils';
import { GuideNudge } from '@/components/GuideNudge';
import { TarotSeasonReading } from '@/components/tarot/TarotSeasonReading';
import { TarotRitualForPatterns } from '@/components/tarot/TarotRitualForPatterns';
import { TarotReflectionPrompts } from '@/components/tarot/TarotReflectionPrompts';
import { PremiumPathway } from '@/components/PremiumPathway';
import Link from 'next/link';

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

const TarotReadings = () => {
  const { user, loading } = useUser();
  const subscription = useSubscription();
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const userId = user?.id;
  const tarotPlan = {
    plan: subscription.plan as TarotPlan,
    status: subscription.status as SubscriptionStatus,
  };
  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const [shareOrigin, setShareOrigin] = useState('https://lunary.app');
  const [sharePopover, setSharePopover] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<number | 'year-over-year'>(
    30,
  );
  const [isMultidimensionalMode, setIsMultidimensionalMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const [expandedSuit, setExpandedSuit] = useState<string | null>(null);

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
    if (hasChartAccess) return null;
    return getGeneralTarotReading();
  }, [hasChartAccess]);

  const shareDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const firstName = useMemo(
    () => (userName ? userName.split(' ')[0] || userName : undefined),
    [userName],
  );

  const previousReadings = useMemo(() => {
    if (hasChartAccess) return [];
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
  }, [hasChartAccess]);

  const timeFrame = typeof selectedView === 'number' ? selectedView : 30;
  const personalizedReading = useMemo(
    () =>
      hasChartAccess && userName && userBirthday
        ? getImprovedTarotReading(userName, true, timeFrame, userBirthday)
        : null,
    [hasChartAccess, userName, timeFrame, userBirthday],
  );

  const truncate = useCallback((value?: string | null, limit = 140) => {
    if (!value) return undefined;
    if (value.length <= limit) return value;
    return `${value.slice(0, limit - 1).trimEnd()}…`;
  }, []);

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

  useEffect(() => {
    if (personalizedReading && userId) {
      conversionTracking.personalizedTarotViewed(userId);
    }
  }, [personalizedReading, userId]);

  const personalizedPreviousReadings = useMemo(() => {
    if (!hasChartAccess || !userName || !userBirthday) return [];
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
  }, [hasChartAccess, userName, userBirthday]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      setShareOrigin(window.location.origin);
    }
  }, []);

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

  const patternShare = useMemo(() => {
    const trends = personalizedReading?.trendAnalysis;
    if (!trends) return null;

    try {
      const themes = trends.dominantThemes.slice(0, 3);
      const headline =
        themes[0] ||
        trends.frequentCards[0]?.name ||
        trends.suitPatterns[0]?.suit ||
        `${trends.timeFrame}-Day Patterns`;
      const totalCards = trends.timeFrame;
      const majorPattern = trends.arcanaPatterns.find(
        (pattern) => pattern.type === 'Major Arcana',
      );
      const minorPattern = trends.arcanaPatterns.find(
        (pattern) => pattern.type === 'Minor Arcana',
      );
      const patternLimit =
        trends.timeFrame >= 90
          ? 8
          : trends.timeFrame >= 30
            ? 6
            : trends.suitPatterns.length || trends.numberPatterns.length || 4;
      const suitBlocks = trends.suitPatterns
        .slice(0, patternLimit)
        .map((pattern) => ({
          suit: pattern.suit,
          count: pattern.count,
          reading: pattern.reading,
        }));
      const numberBlocks = trends.numberPatterns
        .slice(0, patternLimit)
        .map((pattern) => ({
          number: pattern.number,
          count: pattern.count,
          reading: pattern.reading,
          cards: pattern.cards,
        }));
      const cardBlocks = trends.frequentCards
        .slice(0, patternLimit)
        .map((card) => ({
          name: card.name,
          count: card.count,
          reading: card.reading,
        }));
      const topSuitPattern = suitBlocks[0];
      const elementFocus = topSuitPattern
        ? SUIT_ELEMENTS[topSuitPattern.suit]
        : undefined;
      const topNumberPattern = numberBlocks[0];
      const frequentCard = cardBlocks[0];
      const insightPool = [
        frequentCard?.reading
          ? `${frequentCard.name}: ${frequentCard.reading}`
          : undefined,
        topSuitPattern?.reading,
        topNumberPattern?.reading,
        trends.arcanaPatterns[0]?.reading,
      ]
        .map((entry) => (entry ? truncate(entry, 160) : undefined))
        .filter((entry): entry is string => Boolean(entry))
        .map(sanitizeInsightForParam)
        .slice(0, 3);
      const moonPhase = getMoonPhase(new Date());
      const moonTip = MOON_PHASE_TIPS[moonPhase] || undefined;
      const solarSeason = getSolarSeason(dayjs());
      const transitImpact = solarSeason
        ? `${firstName ? `${firstName}, ` : ''}${solarSeason.sign} season ${solarSeason.message.replace(/\.$/, '')}${elementFocus ? ` and syncs with your ${elementFocus.toLowerCase()} flow.` : '.'}`
        : undefined;
      const actionPrompt =
        personalizedReading?.guidance?.actionPoints?.[0] || undefined;

      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', headline);
      if (themes.length) {
        url.searchParams.set('keywords', themes.join(','));
      }
      url.searchParams.set('timeframe', `${trends.timeFrame}-Day`);
      url.searchParams.set('variant', 'pattern');
      url.searchParams.set('date', shareDate);
      if (firstName) {
        url.searchParams.set('name', firstName);
      }
      if (totalCards) {
        url.searchParams.set('total', String(totalCards));
      }
      if (typeof majorPattern?.count === 'number') {
        url.searchParams.set('major', String(majorPattern.count));
      }
      if (typeof minorPattern?.count === 'number') {
        url.searchParams.set('minor', String(minorPattern.count));
      }
      if (topSuitPattern) {
        url.searchParams.set('topSuit', topSuitPattern.suit);
        url.searchParams.set('topSuitCount', String(topSuitPattern.count));
        if (topSuitPattern.reading) {
          url.searchParams.set(
            'suitInsight',
            truncate(topSuitPattern.reading, 160) || topSuitPattern.reading,
          );
        }
      }
      if (elementFocus) {
        url.searchParams.set('element', elementFocus);
      }
      if (insightPool.length) {
        url.searchParams.set('insights', insightPool.join('|'));
      }
      if (moonPhase) {
        url.searchParams.set('moonPhase', moonPhase);
      }
      if (moonTip) {
        url.searchParams.set('moonTip', moonTip);
      }
      if (transitImpact) {
        url.searchParams.set(
          'transit',
          truncate(transitImpact, 180) || transitImpact,
        );
      }
      if (actionPrompt) {
        url.searchParams.set(
          'action',
          truncate(actionPrompt, 140) || actionPrompt,
        );
      }
      if (suitBlocks.length) {
        url.searchParams.set('suits', JSON.stringify(suitBlocks));
      }
      if (numberBlocks.length) {
        url.searchParams.set('numbers', JSON.stringify(numberBlocks));
      }
      if (cardBlocks.length) {
        url.searchParams.set('cards', JSON.stringify(cardBlocks));
      }

      const summary =
        trends.frequentCards[0]?.reading ||
        trends.suitPatterns[0]?.reading ||
        trends.arcanaPatterns[0]?.reading ||
        trends.numberPatterns[0]?.reading ||
        (themes.length ? `Dominant themes: ${themes.join(', ')}` : undefined);

      return {
        url: url.toString(),
        title: `${firstName ? `${firstName}'s` : 'My'} ${trends.timeFrame}-Day Tarot Patterns`,
        text: truncate(summary),
      };
    } catch (error) {
      console.error('Failed to build tarot pattern share URL:', error);
      return null;
    }
  }, [personalizedReading, shareOrigin, shareDate, firstName, truncate]);

  const handleShareClick = useCallback(
    async ({
      id,
      title,
      url,
      text,
    }: {
      id: string;
      title: string;
      url: string;
      text?: string;
    }) => {
      const sharePayload = {
        title,
        text: text || title,
        url,
      };

      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share(sharePayload);
          setSharePopover(null);
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          console.error(
            'Web Share API failed, falling back to share buttons:',
            error,
          );
        }
      }

      setSharePopover((prev) => (prev === id ? null : id));
    },
    [setSharePopover],
  );

  useEffect(() => {
    if (hasChartAccess && personalizedReading && userId) {
      conversionTracking.tarotViewed(userId);
    }
  }, [hasChartAccess, personalizedReading, userId]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your tarot reading...</p>
        </div>
      </div>
    );
  }

  if (!hasChartAccess) {
    if (!generalTarot) return null;

    return (
      <div className='h-full space-y-6 p-4 overflow-auto'>
        <div className='pt-6'>
          <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
            Your Tarot Readings
          </h1>
          <p className='text-sm text-zinc-400'>
            General cosmic guidance based on universal energies
          </p>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={() => {
              const spreadsSection = document.getElementById(
                'tarot-spreads-section-free',
              );
              if (spreadsSection) {
                spreadsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className='flex-1 py-3 px-4 rounded-lg bg-lunary-primary-900/20 border border-lunary-primary-700 text-lunary-primary-300 font-medium hover:bg-lunary-primary-900/30 transition-colors'
          >
            Do a Reading
          </button>
        </div>

        <div className='space-y-6'>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-6'>
            <h2 className='text-xl font-medium text-zinc-100'>
              Your Cosmic Reading
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-sm font-medium text-zinc-400 mb-2'>
                  Daily Card
                </h3>
                <p
                  className='text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                  onClick={() => {
                    const card = getTarotCardByName(generalTarot.daily.name);
                    if (card) setSelectedCard(card);
                  }}
                >
                  {generalTarot.daily.name}
                </p>
                <p className='text-sm text-zinc-400'>
                  {generalTarot.daily.keywords.slice(0, 2).join(', ')}
                </p>

                {generalDailyShare && (
                  <div className='mt-3'>
                    <button
                      type='button'
                      onClick={() =>
                        handleShareClick({
                          id: 'tarot-general-daily',
                          title: generalDailyShare.title,
                          url: generalDailyShare.url,
                          text: generalDailyShare.text,
                        })
                      }
                      className='inline-flex items-center gap-2 text-xs font-medium text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors'
                    >
                      <Share2 className='w-4 h-4' />
                      Share daily card
                    </button>
                    {sharePopover === 'tarot-general-daily' && (
                      <div className='mt-3'>
                        <SocialShareButtons
                          url={generalDailyShare.url}
                          title={generalDailyShare.title}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
                <h3 className='text-sm font-medium text-zinc-400 mb-2'>
                  Weekly Card
                </h3>
                <p
                  className='text-lg font-medium text-zinc-100 mb-1 cursor-pointer hover:text-lunary-primary-300 transition-colors'
                  onClick={() => {
                    const card = getTarotCardByName(generalTarot.weekly.name);
                    if (card) setSelectedCard(card);
                  }}
                >
                  {generalTarot.weekly.name}
                </p>
                <p className='text-sm text-zinc-400'>
                  {generalTarot.weekly.keywords.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>

            <div className='space-y-4 pt-4 border-t border-zinc-800/50'>
              <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-4'>
                <h3 className='text-sm font-medium text-lunary-primary-300/90 mb-2'>
                  Daily Message
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {generalTarot.guidance.dailyMessage}
                </p>
              </div>

              <div className='rounded-lg border border-lunary-secondary-800 bg-zinc-900/50 p-4'>
                <h3 className='text-sm font-medium text-lunary-primary-300 mb-2'>
                  Weekly Energy
                </h3>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  {generalTarot.guidance.weeklyMessage}
                </p>
              </div>

              <div className='rounded-lg border border-lunary-success-800 bg-zinc-900 p-4'>
                <h3 className='text-sm font-medium text-lunary-success-300 mb-2'>
                  Key Guidance
                </h3>
                <ul className='text-sm text-zinc-300 space-y-2'>
                  {generalTarot.guidance.actionPoints.map((point, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <Check
                        className='w-4 h-4 text-lunary-success mt-0.5 flex-shrink-0'
                        strokeWidth={2}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {subscription.hasAccess('tarot_patterns') && (
            <HoroscopeSection
              title={`Your ${timeFrame}-Day Tarot Patterns`}
              color='zinc'
            >
              <AdvancedPatterns
                basicPatterns={undefined}
                selectedView={30}
                isMultidimensionalMode={false}
                onMultidimensionalModeChange={() => {}}
              />
            </HoroscopeSection>
          )}

          <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-2'>
              Unlock Personal Tarot Patterns
            </h3>
            <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
              Get readings based on YOUR name and birthday, plus discover your
              personal tarot patterns and card trends over time.
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

          <div id='tarot-spreads-section-free'>
            <CollapsibleSection title='Tarot Spreads' defaultCollapsed={false}>
              <TarotSpreadExperience
                userId={userId}
                userName={userName}
                subscriptionPlan={tarotPlan}
                onCardPreview={(card) => setSelectedCard(card)}
              />
            </CollapsibleSection>
          </div>

          <div>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-medium text-zinc-100'>
                Recent Daily Cards
              </h2>
              <div className='px-3 py-1 rounded-full border border-lunary-primary-700 bg-lunary-primary-900/10'>
                <span className='text-xs font-medium text-lunary-primary-300/90'>
                  Personalised Feature
                </span>
              </div>
            </div>
            <div className='relative overflow-hidden'>
              <div className='filter blur-sm pointer-events-none'>
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 mb-3 opacity-60'
                  >
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-zinc-100'>●●●●●●●</span>
                      <div className='text-right'>
                        <p className='font-medium text-zinc-100'>●●●●●●●</p>
                        <p className='text-sm text-zinc-400'>●●●●●●●●●</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-zinc-900/90'>
                <div className='text-center p-6 max-w-sm'>
                  <Sparkles
                    className='w-8 h-8 text-lunary-primary-400/80 mx-auto mb-3'
                    strokeWidth={1.5}
                  />
                  <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                    Card History
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
                    Track your personal tarot journey with 7+ days of card
                    history
                  </p>
                  <SmartTrialButton />
                </div>
              </div>
            </div>
          </div>
        </div>
        <UpgradePrompt
          variant='card'
          featureName='personalized_tarot'
          title='Unlock Personalized Tarot Readings'
          description='Get tarot readings based on your name and birthday, plus discover your personal tarot patterns'
          className='max-w-2xl mx-auto'
        />
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
    <div className='h-full space-y-6 p-4 overflow-auto'>
      <div className='pt-6'>
        <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
          {userName ? `${userName}'s Tarot Readings` : 'Your Tarot Readings'}
        </h1>
        <p className='text-sm text-zinc-400'>
          Personalized guidance based on your cosmic signature
        </p>
      </div>

      <div className='flex gap-3'>
        <button
          onClick={() => {
            const spreadsSection = document.getElementById(
              'tarot-spreads-section',
            );
            if (spreadsSection) {
              spreadsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className='flex-1 py-3 px-4 rounded-lg bg-lunary-primary-900/20 border border-lunary-primary-700 text-lunary-primary-300 font-medium hover:bg-lunary-primary-900/30 transition-colors'
        >
          Do a Reading
        </button>
      </div>

      <div className='space-y-6'>
        <HoroscopeSection title='Daily & Weekly Cards' color='purple'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
              <h3 className='text-sm font-medium text-zinc-400 mb-2'>
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
              <p className='text-sm text-zinc-400'>
                {personalizedReading.daily.keywords.slice(0, 2).join(', ')}
              </p>

              {personalizedDailyShare && (
                <div className='mt-3'>
                  <button
                    type='button'
                    onClick={() =>
                      handleShareClick({
                        id: 'tarot-personal-daily',
                        title: personalizedDailyShare.title,
                        url: personalizedDailyShare.url,
                        text: personalizedDailyShare.text,
                      })
                    }
                    className='inline-flex items-center gap-2 text-xs font-medium text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors'
                  >
                    <Share2 className='w-4 h-4' />
                    Share daily card
                  </button>
                  {sharePopover === 'tarot-personal-daily' && (
                    <div className='mt-3'>
                      <SocialShareButtons
                        url={personalizedDailyShare.url}
                        title={personalizedDailyShare.title}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
              <h3 className='text-sm font-medium text-zinc-400 mb-2'>
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
              <p className='text-sm text-zinc-400'>
                {personalizedReading.weekly.keywords.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
        </HoroscopeSection>

        <HoroscopeSection title='Guidance Highlights' color='zinc'>
          <div className='space-y-4'>
            <div className='rounded-lg border border-lunary-primary-700 bg-zinc-900/50 p-4'>
              <h3 className='text-sm font-medium text-lunary-primary-300/90 mb-2'>
                Daily Message
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {personalizedReading.guidance.dailyMessage}
              </p>
            </div>

            <div className='rounded-lg border border-lunary-primary-800 bg-lunary-primary-950 p-4'>
              <h3 className='text-sm font-medium text-lunary-primary-300 mb-2'>
                Weekly Energy
              </h3>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {personalizedReading.guidance.weeklyMessage}
              </p>
            </div>

            <div className='rounded-lg border border-lunary-success-800 bg-lunary-success-950 p-4'>
              <h3 className='text-sm font-medium text-lunary-success-300 mb-2'>
                Key Guidance
              </h3>
              <ul className='text-sm text-zinc-300 space-y-2'>
                {personalizedReading.guidance.actionPoints.map(
                  (point, index) => (
                    <li key={index} className='flex items-start gap-2'>
                      <Check
                        className='w-4 h-4 text-lunary-success mt-0.5 flex-shrink-0'
                        strokeWidth={2}
                      />
                      <span>{point}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </HoroscopeSection>

        <GuideNudge location='tarot' className='mb-2' />

        {subscription.hasAccess('tarot_patterns') && (
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
                const needsAdvancedAccess = days === 180 || days === 365;
                const hasAccess = needsAdvancedAccess
                  ? subscription.hasAccess('advanced_patterns')
                  : subscription.hasAccess('tarot_patterns');
                const isLocked = needsAdvancedAccess && !hasAccess;

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
                        ? 'Upgrade to Lunary+ AI Annual to unlock'
                        : undefined
                    }
                  >
                    {days === 180
                      ? '6 months'
                      : days === 365
                        ? '12 months'
                        : `${days} days`}
                    {isLocked && (
                      <Lock className='w-3 h-3 absolute -top-1 -right-1 text-zinc-600' />
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
                    ? 'Upgrade to Lunary+ AI Annual to unlock'
                    : undefined
                }
              >
                Year-over-Year
                {!subscription.hasAccess('advanced_patterns') && (
                  <Lock className='w-3 h-3 absolute -top-1 -right-1 text-zinc-600' />
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
                    ? 'Upgrade to Lunary+ AI Annual to unlock advanced patterns'
                    : isMultidimensionalMode
                      ? 'Turn off multidimensional analysis'
                      : 'Turn on multidimensional analysis'
                }
              >
                <Sparkles className='w-3 h-3' />
                Advanced
                {!subscription.hasAccess('advanced_patterns') && (
                  <Lock className='w-3 h-3 absolute -top-1 -right-1 text-zinc-600' />
                )}
              </button>
            </div>
            <AdvancedPatterns
              key={`patterns-${selectedView}-${isMultidimensionalMode}`}
              basicPatterns={
                hasChartAccess ? personalizedReading?.trendAnalysis : undefined
              }
              selectedView={selectedView}
              isMultidimensionalMode={isMultidimensionalMode}
              onMultidimensionalModeChange={setIsMultidimensionalMode}
              recentReadings={
                typeof selectedView === 'number' && selectedView === 7
                  ? personalizedPreviousReadings
                  : undefined
              }
              onCardClick={(card: { name: string }) => {
                const tarotCard = getTarotCardByName(card.name);
                if (tarotCard) setSelectedCard(tarotCard);
              }}
            />
          </HoroscopeSection>
        )}

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

        <div id='tarot-spreads-section'>
          <CollapsibleSection title='Tarot Spreads' defaultCollapsed={false}>
            <TarotSpreadExperience
              userId={userId}
              userName={userName}
              subscriptionPlan={tarotPlan}
              onCardPreview={(card) => setSelectedCard(card)}
            />
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
      />

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
              description='Upgrade to Lunary+ AI Annual to access year-over-year comparisons, multi-dimensional analysis, and extended timeline insights.'
              requiredPlan='lunary_plus_ai_annual'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotReadings;
