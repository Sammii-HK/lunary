'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Share2, Sparkles, Lock, Moon } from 'lucide-react';
import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import { getEnhancedPersonalizedHoroscope } from '../../../../../utils/astrology/enhancedHoroscope';
import { getBirthChartFromProfile } from '../../../../../utils/astrology/birthChart';
import { getAstrologicalChart } from '../../../../../utils/astrology/astrology';
import { getSolarReturnInsights } from '../../../../../utils/astrology/transitCalendar';
import { getPersonalTransitImpacts } from '../../../../../utils/astrology/personalTransits';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import { HoroscopeSection } from './HoroscopeSection';
import { FeaturePreview } from './FeaturePreview';
import { TodaysAspects, AspectsTeaser, MoonPhaseCard } from './TodaysAspects';
import { TransitWisdom } from './TransitWisdom';
import { UnifiedTransitList } from './UnifiedTransitList';
import { useCTACopy } from '@/hooks/useCTACopy';
import { ShareRetrogradeBadge } from '@/components/share/ShareRetrogradeBadge';
import { ShareHoroscope } from '@/components/share/ShareHoroscope';
import { ShareTransitReply } from '@/components/share/ShareTransitReply';
import { HoroscopeReflectionPrompts } from '@/components/horoscope/HoroscopeReflectionPrompts';
import { HoroscopeSeasonReading } from '@/components/horoscope/HoroscopeSeasonReading';
import { HoroscopeRitualForDay } from '@/components/horoscope/HoroscopeRitualForDay';
import { Heading } from '@/components/ui/Heading';
import { TrialValueReveal } from '@/components/TrialValueReveal';
import { TransitScrubber } from '@/components/charts/TransitScrubber';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { AutoLinkText } from '@/components/glossary/AutoLinkText';
import { CosmicSkeleton } from '@/components/states/CosmicSkeleton';

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

const SkyNowCard = dynamic(
  () =>
    import('@/components/compact/SkyNowCard').then((m) => ({
      default: m.SkyNowCard,
    })),
  {
    loading: () => (
      <div className='h-16 bg-surface-elevated/50 rounded-lg animate-pulse' />
    ),
    ssr: false,
  },
);
import { PremiumPathway } from '@/components/PremiumPathway';
import { getPersonalDayNumber } from '@/lib/numerology/personalNumbers';
import {
  getNumerologyDetail,
  type NumerologyDetailContext,
} from '@/lib/numerology/numerologyDetails';
import {
  buildHoroscopeNumerologyShareUrl,
  getShareOrigin,
  type NumerologyShareNumber,
} from '@/lib/og/horoscopeShare';
import { useOgShareModal } from '@/hooks/useOgShareModal';
import { ShareImageModal } from '@/components/og/ShareImageModal';
import {
  NumerologyInfoModal,
  type NumerologyModalPayload,
} from '@/components/grimoire/NumerologyInfoModal';

interface HoroscopeViewProps {
  userBirthday?: string;
  userName?: string;
  profile: any;
  hasPaidAccess: boolean;
}

const getDailyNumerology = (
  date: dayjs.Dayjs,
): { number: number; meaning: string } => {
  const dateString = date.format('DDMMYYYY');
  let sum = 0;

  for (let i = 0; i < dateString.length; i++) {
    sum += parseInt(dateString[i]);
  }

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    const digits = sum.toString().split('');
    sum = digits.reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  const numerologyMeanings: Record<number, string> = {
    1: 'leadership energy and new beginnings',
    2: 'cooperation, balance, and partnership',
    3: 'creativity, communication, and joy',
    4: 'stability, hard work, and foundation-building',
    5: 'freedom, adventure, and dynamic change',
    6: 'nurturing, responsibility, and healing',
    7: 'spiritual insight, introspection, and wisdom',
    8: 'material success, power, and achievement',
    9: 'completion, compassion, and universal love',
    11: 'master intuition and spiritual illumination',
    22: 'master builder energy and manifestation power',
    33: 'master teacher vibration and selfless service',
  };

  return {
    number: sum,
    meaning: numerologyMeanings[sum] || 'transformative energy',
  };
};

interface CachedHoroscope {
  sunSign: string;
  moonPhase: string;
  headline: string;
  overview: string;
  focusAreas: Array<{
    area: 'love' | 'work' | 'inner';
    title: string;
    guidance: string;
  }>;
  tinyAction: string;
  dailyGuidance: string;
  personalInsight: string;
  luckyElements: string[];
  cosmicHighlight: string;
  dailyAffirmation: string;
  cached?: boolean;
}

export function HoroscopeView({
  userBirthday,
  userName,
  profile,
  hasPaidAccess,
}: HoroscopeViewProps) {
  const router = useRouter();
  const ctaCopy = useCTACopy();
  const [observer, setObserver] = useState<any>(null);
  const [currentTransits, setCurrentTransits] = useState<any[]>([]);
  const [horoscope, setHoroscope] = useState<CachedHoroscope | null>(null);
  const [isLoading, setIsLoading] = useState(hasPaidAccess);
  const [skyNowExpanded, setSkyNowExpanded] = useState(false);
  const [numerologyModal, setNumerologyModal] =
    useState<NumerologyModalPayload | null>(null);
  const {
    shareTarget,
    sharePreviewUrl,
    shareLoading,
    shareError,
    isOpen: isShareModalOpen,
    openShareModal,
    closeShareModal,
    handleShareImage,
    handleDownloadShareImage,
    handleCopyShareLink,
  } = useOgShareModal();

  const generalHoroscope = getGeneralHoroscope();
  const birthChart = getBirthChartFromProfile(profile);

  // Fetch personalized horoscope (paid only)
  useEffect(() => {
    if (!hasPaidAccess) return;

    async function fetchHoroscope() {
      try {
        const response = await fetch('/api/horoscope/daily');
        if (response.ok) {
          const data = await response.json();
          setHoroscope(data);
        } else {
          const fallback = getEnhancedPersonalizedHoroscope(
            userBirthday,
            userName,
            profile,
          );
          setHoroscope(fallback);
        }
      } catch (error) {
        console.error('[Horoscope] API fetch failed, using fallback:', error);
        const fallback = getEnhancedPersonalizedHoroscope(
          userBirthday,
          userName,
          profile,
        );
        setHoroscope(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHoroscope();
  }, [hasPaidAccess, userBirthday, userName, profile]);

  // Load astronomy-engine: always for paid users; for free users only when they
  // have a birth chart so we can compute real data for the teaser sections.
  useEffect(() => {
    if (!hasPaidAccess && !birthChart) return;
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, [hasPaidAccess, birthChart]);

  useEffect(() => {
    if (!observer || !birthChart) return;
    const normalizedDate = new Date(dayjs().format('YYYY-MM-DD') + 'T12:00:00');
    const transits = getAstrologicalChart(normalizedDate, observer);
    setCurrentTransits(transits);
  }, [observer, birthChart]);

  const today = dayjs();
  const universalDay = getDailyNumerology(today);
  const personalDay = userBirthday
    ? getPersonalDayNumber(userBirthday, today)
    : null;

  // Personalized teaser for free users with a birthday
  const personalizedTeaser =
    !hasPaidAccess && userBirthday
      ? getEnhancedPersonalizedHoroscope(userBirthday, userName, profile)
      : null;

  const openNumerologyModal = (
    contextLabel: string,
    number: number,
    meaning: string,
    contextDetail?: string,
    contextType: NumerologyDetailContext = 'lifePath',
  ) => {
    const detail = getNumerologyDetail(contextType, number);
    setNumerologyModal({
      number,
      contextLabel,
      meaning,
      contextDetail,
      description: detail?.description,
      energy: detail?.energy,
      energyLabel: contextType === 'lifePath' ? 'Daily energy' : undefined,
      keywords: detail?.keywords,
      sections: detail?.sections,
      extraNote: detail?.extraNote,
    });
  };

  const getPageUrl = () =>
    typeof window !== 'undefined'
      ? window.location.href
      : `${getShareOrigin()}/horoscope`;

  const handleShareHoroscope = () => {
    const numbers: NumerologyShareNumber[] = [
      {
        label: 'Universal Day',
        value: universalDay.number,
        meaning: universalDay.meaning,
      },
    ];
    if (hasPaidAccess && personalDay) {
      numbers.push({
        label: 'Personal Day',
        value: personalDay.number,
        meaning: personalDay.meaning,
      });
    }

    const highlight =
      hasPaidAccess && horoscope
        ? horoscope.cosmicHighlight
        : generalHoroscope.generalAdvice;
    const subtitle =
      hasPaidAccess && horoscope
        ? horoscope.dailyGuidance
        : generalHoroscope.reading;
    const title =
      hasPaidAccess && userName ? `${userName}'s Horoscope` : 'Your Horoscope';

    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: title,
      highlight,
      highlightSubtitle: subtitle,
      date: dayjs().format('MMMM D, YYYY'),
      name: hasPaidAccess ? userName : undefined,
      variant: 'horoscope',
      numbers,
    });
    openShareModal({
      title,
      description: highlight,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };

  const shareNumberTile = (label: string, number: number, meaning?: string) => {
    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: label,
      highlight: meaning ?? label,
      date: dayjs().format('MMMM D, YYYY'),
      variant: 'numerology-card',
      numbers: [{ label, value: number, meaning }],
    });
    openShareModal({
      title: label,
      description: meaning ?? label,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };

  const solarReturnData =
    hasPaidAccess && userBirthday ? getSolarReturnInsights(userBirthday) : null;
  const upcomingTransits = getUpcomingTransits();
  const nonLunarTransits = upcomingTransits.filter(
    (transit) => transit.type !== 'lunar_phase',
  );
  const personalTransitImpacts =
    hasPaidAccess && birthChart
      ? getPersonalTransitImpacts(
          nonLunarTransits.length > 0 ? nonLunarTransits : upcomingTransits,
          birthChart,
          15,
        )
      : [];

  // Content sources, personalized for paid, general for free
  const cosmicHighlight =
    hasPaidAccess && horoscope
      ? horoscope.cosmicHighlight
      : generalHoroscope.generalAdvice;
  const dailyGuidance =
    hasPaidAccess && horoscope
      ? horoscope.dailyGuidance
      : // Free: trim to first 2 sentences so it stays scannable
        (() => {
          const sentences = generalHoroscope.reading
            .split('. ')
            .filter(Boolean);
          return sentences.slice(0, 2).join('. ') + '.';
        })();

  // Loading skeleton (paid only, while fetching personalized horoscope)
  if (hasPaidAccess && isLoading) {
    return (
      <div className='h-full space-y-4 p-4 pb-16 md:pb-20 overflow-auto'>
        <div className='pt-6 space-y-2'>
          <CosmicSkeleton variant='text' width={192} height={32} />
          <CosmicSkeleton variant='text' width={256} height={16} />
        </div>
        <div className='space-y-4'>
          <CosmicSkeleton height={128} radius={12} />
          <CosmicSkeleton height={96} radius={12} />
        </div>
      </div>
    );
  }

  return (
    <div className='h-full space-y-4 p-4 pb-16 md:pb-20 overflow-auto'>
      {/* Header */}
      <div>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex-1'>
            <Heading variant='h1' as='h1'>
              {hasPaidAccess && userName
                ? `${userName}'s Transits`
                : 'Your Transits'}
            </Heading>
            <p className='text-sm text-content-muted'>
              {hasPaidAccess
                ? 'How the planets are moving through your chart right now'
                : 'Live planetary positions, unlock your personal chart transits'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {birthChart && birthChart.length > 0 && (
              <ShareTransitReply birthChart={birthChart} compact />
            )}
            <ShareRetrogradeBadge compact />
            {horoscope ? (
              <ShareHoroscope
                sunSign={horoscope.sunSign}
                headline={horoscope.headline}
                overview={horoscope.overview}
              />
            ) : (
              <button
                type='button'
                disabled
                className='inline-flex items-center gap-2 rounded-full border border-stroke-default px-3 py-2 sm:px-4 text-xs font-semibold tracking-wide uppercase text-content-primary transition hover:border-lunary-primary-500 hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Share2 className='h-4 w-4' />
                <span className='hidden sm:inline'>
                  Share {hasPaidAccess ? 'horoscope' : 'highlight'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Animated transit scrubber, natal inner, transit outer, scrub through time */}
      {birthChart && birthChart.length > 0 && (
        <div className='rounded-2xl border border-stroke-subtle/70 bg-gradient-to-br from-surface-elevated/70 via-surface-base/70 to-layer-deep p-4'>
          <TransitScrubber birthChart={birthChart} />
        </div>
      )}

      {/* Sky Now — current planetary positions, expandable */}
      <SkyNowCard
        isExpanded={skyNowExpanded}
        onToggle={(expanded) => setSkyNowExpanded(expanded)}
        showNatalHouses={hasPaidAccess}
      />

      {/* Cosmic Highlight Card */}
      <div className='rounded-xl border border-stroke-subtle/70 bg-gradient-to-br from-surface-elevated/70 via-surface-base/70 to-layer-deep p-3 space-y-3'>
        {/* <p className='text-[11px] font-semibold tracking-[0.3em] uppercase text-content-muted'>
          Cosmic Highlight
        </p> */}
        <div className='flex items-start justify-between gap-3'>
          <Heading variant='h2' as='h2'>
            {cosmicHighlight}
          </Heading>
          {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
          {/* <AudioNarrator
            text={`${cosmicHighlight}. ${dailyGuidance}`}
            title="Today's reading"
            compactVariant='inline'
          /> */}
        </div>
        {/* Paid users get the full personalised reading; free users get only
            the teaser — generic guidance is deliberately withheld so the
            personalised preview creates clear FOMO rather than giving away free content */}
        {hasPaidAccess && (
          <AutoLinkText
            as='p'
            className='text-xs md:text-sm text-content-secondary leading-relaxed'
          >
            {dailyGuidance}
          </AutoLinkText>
        )}

        {personalizedTeaser && (
          <Link href='/pricing?nav=app' className='block space-y-2 group'>
            {/* Line 1: readable start → blur fade */}
            <div className='relative h-[1.25rem] overflow-hidden'>
              {/* Blurred layer underneath */}
              <p className='text-xs text-content-muted blur-sm'>
                {personalizedTeaser.dailyGuidance}
              </p>
              {/* Clear layer on top, bg covers blur bleed, mask fades to reveal blur */}
              <p
                className='absolute inset-0 text-xs text-content-muted bg-surface-base'
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to right, black 5%, transparent 15%)',
                }}
              >
                {personalizedTeaser.dailyGuidance}
              </p>
            </div>
            {/* Line 2: fully blurred */}
            <p className='text-xs text-content-muted blur-sm whitespace-nowrap truncate'>
              {personalizedTeaser.cosmicHighlight}
            </p>
            <span className='inline-flex items-center gap-1.5 text-xs text-content-brand group-hover:text-content-secondary transition-colors'>
              <Sparkles className='w-3 h-3' />
              Get a reading written just for you
            </span>
          </Link>
        )}

        {!hasPaidAccess && !userBirthday && (
          <Link
            href='/pricing?nav=app'
            className='inline-flex items-center gap-1.5 text-xs text-content-brand hover:text-content-secondary transition-colors'
          >
            <Sparkles className='w-3 h-3' />
            Get a reading written just for you
          </Link>
        )}

        {/* Numerology Grid */}
        <div
          className='mt-2 grid grid-cols-2 gap-3 items-stretch'
          data-testid='numerology-section'
        >
          {/* Universal Day, always interactive */}
          <div className='relative'>
            <button
              type='button'
              onClick={() =>
                openNumerologyModal(
                  'Universal Day',
                  universalDay.number,
                  universalDay.meaning,
                  'Daily universal numerology energy',
                )
              }
              className='rounded-lg border border-stroke-default px-3 py-2 bg-surface-elevated/40 text-center transition hover:border-lunary-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lunary-primary-400 w-full h-full'
              data-testid='numerology-day'
            >
              <div className='text-xs uppercase tracking-widest text-content-muted'>
                Universal Day
              </div>
              <div className='text-xl sm:text-2xl font-semibold text-content-brand-accent'>
                {universalDay.number}
              </div>
              <p className='text-[11px] text-content-secondary'>
                {universalDay.meaning}
              </p>
            </button>
            <button
              type='button'
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                shareNumberTile(
                  'Universal Day',
                  universalDay.number,
                  universalDay.meaning,
                );
              }}
              className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-stroke-default bg-surface-base/50 text-content-muted transition hover:border-lunary-primary-500 hover:text-content-primary'
              aria-label='Share Universal Day'
            >
              <Share2 className='h-4 w-4' />
            </button>
          </div>

          {/* Personal Day, paid: modal + share; free: number + badge */}
          {personalDay ? (
            <div className='relative'>
              {hasPaidAccess ? (
                <>
                  <button
                    type='button'
                    onClick={() =>
                      openNumerologyModal(
                        'Personal Day',
                        personalDay.number,
                        personalDay.meaning,
                        'Your personal day numerology focus',
                      )
                    }
                    className='rounded-lg border border-stroke-default px-3 py-2 bg-surface-elevated/40 text-center transition hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 w-full h-full'
                    data-testid='numerology-month'
                  >
                    <div className='text-xs uppercase tracking-widest text-content-muted'>
                      Personal Day
                    </div>
                    <div className='text-xl sm:text-2xl font-semibold text-emerald-300'>
                      {personalDay.number}
                    </div>
                    <p className='text-[11px] text-content-secondary'>
                      {personalDay.meaning}
                    </p>
                  </button>
                  <button
                    type='button'
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      shareNumberTile(
                        'Personal Day',
                        personalDay.number,
                        personalDay.meaning,
                      );
                    }}
                    className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-stroke-default bg-surface-base/50 text-content-muted transition hover:border-emerald-400 hover:text-content-primary'
                    aria-label='Share Personal Day'
                  >
                    <Share2 className='h-4 w-4' />
                  </button>
                </>
              ) : (
                <div className='rounded-lg border border-stroke-default px-4 py-3 bg-surface-elevated/40 text-center'>
                  <div className='text-xs uppercase tracking-widest text-content-muted'>
                    Personal Day
                  </div>
                  <Lock className='w-4 h-4 text-content-brand mx-auto mt-2' />
                  <span className='inline-flex items-center gap-1 mt-1 text-[10px] bg-layer-base/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded text-content-brand'>
                    <Sparkles className='w-2.5 h-2.5' />
                    Lunary+
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className='rounded-lg border border-stroke-default px-4 py-3 bg-surface-elevated/40 text-center'>
              <div className='text-xs uppercase tracking-widest text-content-muted'>
                Personal Day
              </div>
              <div className='text-xl sm:text-2xl font-semibold text-content-muted'>
                ?
              </div>
              <p className='text-[11px] text-content-muted'>
                Add your birthday to reveal this daily number.
              </p>
            </div>
          )}
        </div>

        {/* <p className='text-xs text-content-muted'>
          {hasPaidAccess
            ? 'Highlight refreshes each sunrise with new numerology, moon, and transit energy—baseline for everything you read today.'
            : 'This highlight refreshes every sunrise—numerology, moon, and transit info all rebalance daily.'}
        </p> */}
      </div>

      {/* GuideNudge, paid only */}
      <GuideNudge location='horoscope' />

      {/* Season & Ritual, paid with horoscope data */}
      {hasPaidAccess && horoscope && (
        <div className='space-y-3' data-testid='ritual-section'>
          {/* One-time trial value reveal — only renders on a real personalised
              horoscope, gated internally on active trial + birth data + a shared
              one-time flag (shows on horoscope OR tarot first-view, not both). */}
          <TrialValueReveal surface='horoscope' />
          <HoroscopeSeasonReading
            sunSign={horoscope.sunSign}
            moonPhase={horoscope.moonPhase}
            focusAreas={horoscope.focusAreas}
          />
          <HoroscopeRitualForDay
            sunSign={horoscope.sunSign}
            moonPhase={horoscope.moonPhase}
            dailyAffirmation={horoscope.dailyAffirmation}
          />
        </div>
      )}

      {/* Season & Ritual preview, free users FOMO */}
      {!hasPaidAccess && (
        <FeaturePreview
          title='Your Cosmic Season & Rituals'
          description='Unlock personalized season readings and moon-timed rituals based on your horoscope.'
          feature='personalized_horoscope'
          ctaKey='horoscope'
          trackingFeature='horoscope_season_rituals'
          page='horoscope'
          blurredContent={
            <div className='space-y-3'>
              {/* Mock season reading header */}
              <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden'>
                <div className='flex items-center justify-between p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-layer-base/30'>
                      <Sparkles className='w-4 h-4 text-lunary-primary-400' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-content-primary'>
                        Your Cosmic Season: Emotional Depth
                      </p>
                      <p className='text-xs text-content-muted'>
                        Moon-guided energy reading
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mock ritual header */}
              <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden'>
                <div className='flex items-center justify-between p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-layer-base/30'>
                      <Moon className='w-4 h-4 text-lunary-secondary-400' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-content-primary'>
                        Full Moon Release Ritual
                      </p>
                      <p className='text-xs text-content-muted'>
                        Today&apos;s moon-timed ritual
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* Reflection Prompts, all users (component handles its own gating) */}
      <HoroscopeReflectionPrompts
        sunSign={horoscope?.sunSign}
        moonPhase={horoscope?.moonPhase || generalHoroscope?.moonPhase}
      />

      {/* Transit Wisdom: paid = full list; free + real transits = top-1 teaser;
          free + no transits = static blurred mock */}
      {hasPaidAccess && birthChart && currentTransits.length > 0 ? (
        <HoroscopeSection
          title='Transit Wisdom'
          color='indigo'
          id='transit-wisdom'
        >
          <p className='text-sm text-content-muted mb-2'>
            What the sky is stirring up for you today
          </p>
          <TransitWisdom
            birthChart={birthChart}
            currentTransits={currentTransits}
            maxItems={3}
          />
        </HoroscopeSection>
      ) : (
        !hasPaidAccess && (
          <HoroscopeSection
            title='Transit Wisdom'
            color='indigo'
            id='transit-wisdom'
          >
            <p className='text-sm text-content-muted mb-2'>
              What the sky is stirring up for you today
            </p>
            {birthChart && currentTransits.length > 0 ? (
              <>
                {/* Real top-1 transit — the user can see exactly what they had on trial */}
                <TransitWisdom
                  birthChart={birthChart}
                  currentTransits={currentTransits}
                  maxItems={1}
                />
                {/* Ghost cards to hint at the remaining transits */}
                <div className='relative mt-2'>
                  <div className='filter blur-sm opacity-40 pointer-events-none space-y-2'>
                    <div className='rounded-lg border border-stroke-default bg-surface-elevated/40 p-4 h-24' />
                    <div className='rounded-lg border border-stroke-default bg-surface-elevated/40 p-4 h-16' />
                  </div>
                  <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-transparent to-surface-base rounded-lg'>
                    <span className='inline-flex items-center gap-1 text-[10px] bg-layer-base/50 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-content-brand'>
                      <Sparkles className='w-2.5 h-2.5' />
                      Lunary+
                    </span>
                    <Link
                      href='/pricing?nav=app'
                      className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-surface-elevated/80 px-4 py-2 text-xs font-medium text-content-brand hover:bg-surface-elevated transition-colors'
                    >
                      <Sparkles className='w-3 h-3' />
                      See all transit insights
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* No real data yet — static blurred preview */
              <div className='relative'>
                <div className='filter blur-sm opacity-60 pointer-events-none rounded-lg overflow-hidden space-y-3'>
                  <div className='rounded-lg border border-lunary-error-700/50 bg-surface-elevated/40 p-4 space-y-3'>
                    <div className='flex items-start gap-3'>
                      <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-layer-deep/60 text-lunary-error-300'>
                        Highly Prominent
                      </span>
                      <div className='flex-1'>
                        <h4 className='text-sm font-medium text-content-primary'>
                          Saturn meets your Sun
                        </h4>
                        <p className='text-xs text-content-muted mt-0.5'>
                          Saturn in Aquarius · Sun in Aquarius
                        </p>
                      </div>
                    </div>
                    <p className='text-sm text-content-secondary leading-relaxed'>
                      A period of deep restructuring. Discipline and patience
                      will unlock lasting transformation.
                    </p>
                  </div>
                  <div className='rounded-lg border border-lunary-accent-700/50 bg-surface-elevated/40 p-4 h-20' />
                </div>
                <div className='absolute inset-0 rounded-lg bg-gradient-to-b from-surface-base/0 via-surface-base/60 to-surface-base flex flex-col items-center justify-center gap-3'>
                  <span className='inline-flex items-center gap-1 text-[10px] bg-layer-base/50 border border-lunary-primary-700/50 px-2 py-0.5 rounded text-content-brand'>
                    <Sparkles className='w-2.5 h-2.5' />
                    Lunary+
                  </span>
                  <Link
                    href='/pricing?nav=app'
                    className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-surface-elevated/80 px-4 py-2 text-xs font-medium text-content-brand hover:bg-surface-elevated transition-colors'
                  >
                    <Sparkles className='w-3 h-3' />
                    Unlock Transit Wisdom
                  </Link>
                </div>
              </div>
            )}
          </HoroscopeSection>
        )
      )}

      {/* Current Lunar Energy, free users only (paid get it inside SeasonReading) */}
      {!hasPaidAccess && (
        <HoroscopeSection
          title='Current Lunar Energy'
          color='purple'
          id='moon-phase'
        >
          <p className='text-sm text-content-muted mb-2'>
            The moon&apos;s influence right now
          </p>
          <MoonPhaseCard
            birthChart={birthChart ?? undefined}
            currentTransits={currentTransits}
            showHousePlacement={false}
          />
          {/* Tease the natal house placement */}
          <div className='mt-2 flex items-center justify-between rounded-lg border border-stroke-subtle/40 bg-surface-elevated/30 px-3 py-2.5 gap-3'>
            <div>
              <p className='text-xs font-medium text-content-secondary'>
                Moon house placement hidden
              </p>
              <p className='text-[11px] text-content-muted'>
                See which natal house the Moon is activating for you — Pro only.
              </p>
            </div>
            <Link
              href='/pricing?nav=app'
              className='shrink-0 inline-flex items-center gap-1 rounded-full border border-lunary-primary-700/50 bg-lunary-primary/10 px-3 py-1 text-[11px] font-medium text-content-brand transition hover:border-lunary-primary-500'
            >
              <Sparkles className='w-2.5 h-2.5' />
              Unlock
            </Link>
          </div>
        </HoroscopeSection>
      )}

      {/* Today's Aspects: paid = full list; free + real transits = top-1 real teaser;
          free + no transits = static blurred mock */}
      {hasPaidAccess && birthChart && currentTransits.length > 0 ? (
        <HoroscopeSection
          title="Today's Aspects to Your Chart"
          color='zinc'
          id='today-aspects'
        >
          <p className='text-sm text-content-muted mb-2'>
            How today&apos;s sky connects to your story
          </p>
          <TodaysAspects
            birthChart={birthChart}
            currentTransits={currentTransits}
          />
        </HoroscopeSection>
      ) : (
        !hasPaidAccess &&
        (birthChart && currentTransits.length > 0 ? (
          <HoroscopeSection
            title="Today's Aspects to Your Chart"
            color='zinc'
            id='today-aspects'
          >
            <p className='text-sm text-content-muted mb-2'>
              How today&apos;s sky connects to your story
            </p>
            {/* Real top-1 aspect + house grid — the user sees their actual chart data */}
            <AspectsTeaser
              birthChart={birthChart}
              currentTransits={currentTransits}
            />
          </HoroscopeSection>
        ) : (
          <FeaturePreview
            title="Today's Aspects"
            description='See how the planets are speaking to you right now'
            feature='personalized_horoscope'
            ctaKey='horoscope'
            trackingFeature='todays_aspects'
            page='horoscope'
            blurredContent={
              <div className='space-y-2'>
                {/* Mock active houses grid */}
                <div className='mb-1'>
                  <p className='text-xs text-content-muted mb-2'>
                    Houses being activated
                  </p>
                  <div className='grid grid-cols-6 gap-1.5'>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                      const isTransit = [3, 7, 10].includes(h);
                      const isNatal = h === 5;
                      const labels: Record<number, string> = {
                        3: 'communication',
                        5: 'creativity',
                        7: 'partnerships',
                        10: 'career',
                      };
                      return (
                        <div
                          key={h}
                          className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 text-center ${
                            isTransit
                              ? 'border-lunary-primary-700/50 bg-lunary-primary/10 text-content-brand'
                              : isNatal
                                ? 'border-stroke-subtle bg-surface-elevated/60 text-content-secondary'
                                : 'border-stroke-subtle bg-surface-base text-content-muted opacity-25'
                          }`}
                        >
                          <span className='text-xs font-semibold'>{h}</span>
                          {(isTransit || isNatal) && labels[h] && (
                            <span className='text-[8px] leading-tight text-content-muted line-clamp-1'>
                              {labels[h]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className='rounded-lg border border-lunary-primary-400/40 bg-layer-deep/40 p-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-layer-deep/40 border border-lunary-primary-400/40'>
                      <span className='text-lg text-content-brand'>☌</span>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium capitalize text-content-secondary'>
                            merging
                          </span>
                          <span className='text-xs text-content-muted'>
                            Blending energies
                          </span>
                        </div>
                        <span className='text-xs text-lunary-success-400'>
                          1.2°
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-xs mb-2 flex-wrap'>
                        <span className='text-content-secondary'>Saturn</span>
                        <span className='text-content-muted'>3°12</span>
                        <span className='text-content-brand'>☌</span>
                        <span className='text-content-secondary'>Sun</span>
                        <span className='text-content-muted'>4°45</span>
                        <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border border-lunary-primary-700/40 bg-lunary-primary/10 text-content-brand'>
                          7th house
                        </span>
                      </div>
                      <p className='text-xs text-content-muted leading-relaxed'>
                        Saturn in Aquarius conjoins natal Sun in Aquarius,
                        activating your 7th house of partnerships.
                      </p>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border border-lunary-success-400/40 bg-layer-deep/40 p-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-layer-deep/40 border border-lunary-success-400/40'>
                      <span className='text-lg text-lunary-success-300'>△</span>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium capitalize text-lunary-success-200'>
                            flowing
                          </span>
                          <span className='text-xs text-content-muted'>
                            Easy harmony
                          </span>
                        </div>
                        <span className='text-xs text-content-brand-accent'>
                          3.8°
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-xs mb-2 flex-wrap'>
                        <span className='text-content-secondary'>Venus</span>
                        <span className='text-content-muted'>18°30</span>
                        <span className='text-lunary-success-300'>△</span>
                        <span className='text-content-secondary'>Moon</span>
                        <span className='text-content-muted'>14°52</span>
                        <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border border-lunary-success-700/40 bg-lunary-success-900/20 text-lunary-success-300'>
                          3rd house
                        </span>
                      </div>
                      <p className='text-xs text-content-muted leading-relaxed'>
                        Venus in Pisces trines natal Moon in Scorpio, activating
                        your 3rd house of communication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        ))
      )}

      {/* Upcoming Transits, unified, gated internally */}
      <HoroscopeSection
        title='Upcoming Transits'
        color='zinc'
        id='personal-transits'
      >
        <p className='text-sm text-content-muted mb-2'>
          {hasPaidAccess
            ? 'How upcoming shifts touch your life'
            : 'Planetary events in the next 30 days, unlock personal impact for each'}
        </p>
        <UnifiedTransitList
          transits={upcomingTransits}
          personalImpacts={personalTransitImpacts}
          hasPaidAccess={hasPaidAccess}
        />
      </HoroscopeSection>

      {/* Solar Return, paid: full section; free: locked preview */}
      {hasPaidAccess && solarReturnData ? (
        <HoroscopeSection title='Solar Return Insights' color='amber'>
          <div className='space-y-3 pt-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-content-secondary'>
                Next Solar Return:
              </span>
              <span className='text-sm font-medium text-content-primary'>
                {solarReturnData.nextSolarReturn.format('MMM DD, YYYY')}
                <span className='text-xs text-content-muted ml-2'>
                  ({solarReturnData.daysTillReturn} days)
                </span>
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-content-secondary'>
                Personal Year:
              </span>
              <span className='text-sm font-medium text-content-primary'>
                {solarReturnData.personalYear}
              </span>
            </div>
            <p className='text-sm text-content-secondary leading-relaxed'>
              {solarReturnData.insights}
            </p>
            <div>
              <h4 className='text-xs font-medium text-content-muted mb-2 uppercase tracking-wide'>
                Year Themes
              </h4>
              <div className='flex flex-wrap gap-2'>
                {solarReturnData.themes.map((theme, index) => (
                  <span
                    key={index}
                    className='px-2 py-1 rounded border border-lunary-accent-700 bg-layer-deep text-xs text-content-secondary'
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </HoroscopeSection>
      ) : (
        !hasPaidAccess && (
          <FeaturePreview
            title='Solar Return Insights'
            description='Discover your personal year themes and birthday insights'
            feature='solar_return'
            ctaKey='horoscope'
            trackingFeature='solar_return_insights'
            page='horoscope'
            blurredContent={
              <div className='rounded-lg border border-lunary-accent-700 bg-layer-deep p-5 space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-content-secondary'>
                    Next Solar Return:
                  </span>
                  <span className='text-sm font-medium text-content-primary'>
                    Mar 14, 2026
                    <span className='text-xs text-content-muted ml-2'>
                      (45 days)
                    </span>
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-content-secondary'>
                    Personal Year:
                  </span>
                  <span className='text-sm font-medium text-content-primary'>
                    7
                  </span>
                </div>
                <p className='text-sm text-content-secondary leading-relaxed'>
                  This solar return chart emphasizes introspection and spiritual
                  deepening. A year of withdrawal from noise and reconnection
                  with your deeper purpose, trust the quiet.
                </p>
                <div>
                  <h4 className='text-xs font-medium text-content-muted mb-2 uppercase tracking-wide'>
                    Year Themes
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    <span className='px-2 py-1 rounded border border-lunary-accent-700 bg-layer-deep text-xs text-content-secondary'>
                      Introspection
                    </span>
                    <span className='px-2 py-1 rounded border border-lunary-accent-700 bg-layer-deep text-xs text-content-secondary'>
                      Spiritual Growth
                    </span>
                    <span className='px-2 py-1 rounded border border-lunary-accent-700 bg-layer-deep text-xs text-content-secondary'>
                      Inner Wisdom
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        )
      )}

      {/* Complete Profile prompt, paid only, no birthday */}
      {hasPaidAccess && !userBirthday && (
        <HoroscopeSection title='Complete Your Profile' color='amber'>
          <p className='text-sm text-content-secondary mb-4 leading-relaxed'>
            Add your birthday to get more personalized and accurate astrological
            insights.
          </p>
          <Link
            href='/profile'
            className='inline-block rounded-lg border border-lunary-accent-700 bg-layer-deep hover:bg-layer-base text-content-brand-accent px-4 py-2 text-sm font-medium transition-colors'
          >
            Update Profile
          </Link>
        </HoroscopeSection>
      )}

      {/* PremiumPathway, paid only */}
      {hasPaidAccess && <PremiumPathway variant='transits' className='mt-6' />}

      {/* Modals */}
      <NumerologyInfoModal
        isOpen={!!numerologyModal}
        onClose={() => setNumerologyModal(null)}
        number={numerologyModal?.number ?? 0}
        contextLabel={numerologyModal?.contextLabel ?? ''}
        meaning={numerologyModal?.meaning ?? ''}
        energy={numerologyModal?.energy}
        keywords={numerologyModal?.keywords}
      />
      <ShareImageModal
        isOpen={isShareModalOpen}
        target={shareTarget}
        previewUrl={sharePreviewUrl}
        loading={shareLoading}
        error={shareError}
        onClose={closeShareModal}
        onShare={handleShareImage}
        onDownload={handleDownloadShareImage}
        onCopy={handleCopyShareLink}
      />
    </div>
  );
}
