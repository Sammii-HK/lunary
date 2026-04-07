'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { TodaysAspects, MoonPhaseCard } from './TodaysAspects';
import { TransitWisdom } from './TransitWisdom';
import { UnifiedTransitList } from './UnifiedTransitList';
import { usePlanetaryChart } from '@/context/AstronomyContext';
import { calculateHouse } from '@/lib/astrology/transit-aspects';
import { ordinal } from '@/lib/copy/transit-copy';
import { useCTACopy } from '@/hooks/useCTACopy';
import { ShareRetrogradeBadge } from '@/components/share/ShareRetrogradeBadge';
import { ShareHoroscope } from '@/components/share/ShareHoroscope';
import { HoroscopeReflectionPrompts } from '@/components/horoscope/HoroscopeReflectionPrompts';
import { HoroscopeSeasonReading } from '@/components/horoscope/HoroscopeSeasonReading';
import { HoroscopeRitualForDay } from '@/components/horoscope/HoroscopeRitualForDay';
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
  const { currentAstrologicalChart } = usePlanetaryChart();

  // House placement chips for free users — shows what's active in their chart (locked)
  const freePlanetTeases = useMemo(() => {
    if (hasPaidAccess || !birthChart || !currentAstrologicalChart?.length)
      return [];
    const ascendant = birthChart.find((p: any) => p.body === 'Ascendant');
    if (!ascendant) return [];
    return ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Mars', 'Sun']
      .map((name) => {
        const planet = currentAstrologicalChart.find(
          (p: any) => p.body === name,
        );
        if (!planet) return null;
        const house = calculateHouse(
          planet.eclipticLongitude,
          ascendant.eclipticLongitude,
        );
        return { planet: name, house };
      })
      .filter((x): x is { planet: string; house: number } => x !== null)
      .slice(0, 4);
  }, [hasPaidAccess, birthChart, currentAstrologicalChart]);

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

  // Load astronomy-engine for Transit Wisdom + Aspects (paid only)
  useEffect(() => {
    if (!hasPaidAccess) return;
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, [hasPaidAccess]);

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

  // Content sources — personalized for paid, general for free
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
        <div className='pt-6'>
          <div className='h-8 bg-surface-card rounded animate-pulse w-48 mb-2' />
          <div className='h-4 bg-surface-card rounded animate-pulse w-64' />
        </div>
        <div className='space-y-4'>
          <div className='h-32 bg-surface-card/50 rounded-xl animate-pulse' />
          <div className='h-24 bg-surface-card/50 rounded-xl animate-pulse' />
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
                : 'Live planetary positions — unlock your personal chart transits'}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <ShareRetrogradeBadge compact />
            {horoscope ? (
              <ShareHoroscope
                sunSign={horoscope.sunSign}
                headline={horoscope.headline}
                overview={horoscope.overview}
                numerologyNumber={personalDay?.number || universalDay.number}
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

      {/* Cosmic Highlight Card */}
      <div className='rounded-xl border border-stroke-subtle/70 bg-gradient-to-br from-surface-elevated/70 via-surface-base/70 to-surface-card p-3 space-y-3'>
        {/* Free users with chart data — show real house teases */}
        {!hasPaidAccess && freePlanetTeases.length > 0 ? (
          <>
            <p className='text-[11px] font-semibold tracking-[0.2em] uppercase text-content-muted'>
              Active in your chart right now
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {freePlanetTeases.map(({ planet, house }) => (
                <span
                  key={planet}
                  className='inline-flex items-center gap-1 rounded-full border border-stroke-subtle bg-surface-elevated px-2.5 py-1 text-xs text-content-muted'
                >
                  {planet}
                  <span className='text-content-muted/50'>·</span>
                  {ordinal(house)} house
                  <Lock className='ml-0.5 h-2.5 w-2.5 text-content-brand' />
                </span>
              ))}
            </div>
            <p className='text-xs text-content-muted leading-relaxed'>
              {dailyGuidance}
            </p>
          </>
        ) : (
          <>
            <Heading variant='h2' as='h2'>
              {cosmicHighlight}
            </Heading>
            <p className='text-xs md:text-sm text-content-secondary leading-relaxed'>
              {dailyGuidance}
            </p>
          </>
        )}

        {personalizedTeaser && (
          <Link href='/pricing?nav=app' className='block space-y-2 group'>
            {/* Line 1: readable start → blur fade */}
            <div className='relative h-[1.25rem] overflow-hidden'>
              {/* Blurred layer underneath */}
              <p className='text-xs text-content-muted blur-sm'>
                {personalizedTeaser.dailyGuidance}
              </p>
              {/* Clear layer on top — bg covers blur bleed, mask fades to reveal blur */}
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
          {/* Personal Day — paid: featured left tile; free: locked right tile */}
          {hasPaidAccess && personalDay ? (
            <div className='relative'>
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
                className='rounded-lg border border-lunary-primary-700/50 px-3 py-2 bg-surface-elevated/60 text-center transition hover:border-lunary-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lunary-primary-400 w-full h-full'
                data-testid='numerology-month'
              >
                <div className='text-xs uppercase tracking-widest text-content-brand'>
                  Personal Day
                </div>
                <div className='text-xl sm:text-2xl font-semibold text-content-success'>
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
                className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-stroke-default bg-surface-base/50 text-content-muted transition hover:border-lunary-primary-500 hover:text-content-primary'
                aria-label='Share Personal Day'
              >
                <Share2 className='h-4 w-4' />
              </button>
            </div>
          ) : null}

          {/* Universal Day — always shown; secondary for paid users */}
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

          {/* Personal Day — free users: locked if birthday set, prompt if not */}
          {!hasPaidAccess &&
            (personalDay ? (
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
            ) : (
              <div className='rounded-lg border border-stroke-default px-4 py-3 bg-surface-elevated/40 text-center'>
                <div className='text-xs uppercase tracking-widest text-content-muted'>
                  Personal Day
                </div>
                <div className='text-xl sm:text-2xl font-semibold text-content-muted'>
                  ?
                </div>
                <p className='text-[11px] text-content-muted'>
                  Add your birthday to unlock this.
                </p>
              </div>
            ))}
        </div>

        {/* <p className='text-xs text-content-muted'>
          {hasPaidAccess
            ? 'Highlight refreshes each sunrise with new numerology, moon, and transit energy—baseline for everything you read today.'
            : 'This highlight refreshes every sunrise—numerology, moon, and transit info all rebalance daily.'}
        </p> */}
      </div>

      {/* GuideNudge — paid only */}
      <GuideNudge location='horoscope' />

      {/* Season & Ritual — paid with horoscope data */}
      {hasPaidAccess && horoscope && (
        <div className='space-y-3' data-testid='ritual-section'>
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

      {/* Season & Ritual preview — free users FOMO */}
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

      {/* Reflection Prompts — all users (component handles its own gating) */}
      <HoroscopeReflectionPrompts
        sunSign={horoscope?.sunSign}
        moonPhase={horoscope?.moonPhase || generalHoroscope?.moonPhase}
      />

      {/* Transit Wisdom — paid: full component; free: locked preview */}
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
          <FeaturePreview
            title='Transit Wisdom'
            description="See how today's planetary shifts are touching your life — intensity, themes, and what to watch for"
            feature='personalized_horoscope'
            ctaKey='horoscope'
            trackingFeature='transit_wisdom'
            page='horoscope'
            blurredContent={
              <div className='space-y-3'>
                <div className='rounded-lg border border-lunary-error-700/50 bg-surface-elevated/40 p-4 space-y-3'>
                  <div className='flex items-start gap-3'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-card text-content-error'>
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
                  <div className='flex flex-wrap gap-1.5'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border tag-identity'>
                      Identity
                    </span>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border tag-work'>
                      Work
                    </span>
                  </div>
                  <p className='text-sm text-content-secondary leading-relaxed'>
                    A period of deep restructuring around your sense of self and
                    long-term commitments. Discipline and patience will unlock
                    lasting transformation.
                  </p>
                </div>
                <div className='rounded-lg border border-lunary-accent-700/50 bg-surface-elevated/40 p-4 space-y-3'>
                  <div className='flex items-start gap-3'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-card text-content-brand-accent'>
                      Noticeable
                    </span>
                    <div className='flex-1'>
                      <h4 className='text-sm font-medium text-content-primary'>
                        Venus flows with your Moon
                      </h4>
                      <p className='text-xs text-content-muted mt-0.5'>
                        Venus in Pisces · Moon in Scorpio
                      </p>
                    </div>
                  </div>
                  <p className='text-sm text-content-secondary leading-relaxed'>
                    Emotional harmony and creative flow. Your intuition is
                    especially sharp — lean into connections that feel
                    nourishing.
                  </p>
                </div>
              </div>
            }
          />
        )
      )}

      {/* Current Lunar Energy — free users only (paid get it inside SeasonReading) */}
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
        </HoroscopeSection>
      )}

      {/* Today's Aspects — paid: full component; free: locked preview */}
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
        !hasPaidAccess && (
          <FeaturePreview
            title="Today's Aspects"
            description='See how the planets are speaking to you right now'
            feature='personalized_horoscope'
            ctaKey='horoscope'
            trackingFeature='todays_aspects'
            page='horoscope'
            blurredContent={
              <div className='space-y-2'>
                <div className='rounded-lg border border-stroke-default bg-surface-card p-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface-elevated border border-stroke-default'>
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
                      <div className='flex items-center gap-2 text-xs mb-2'>
                        <span className='text-content-secondary'>Saturn</span>
                        <span className='text-content-muted'>3°12</span>
                        <span className='text-content-brand'>☌</span>
                        <span className='text-content-secondary'>Sun</span>
                        <span className='text-content-muted'>4°45</span>
                      </div>
                      <p className='text-xs text-content-muted leading-relaxed'>
                        Saturn's energy is blending with yours — a time for
                        grounding and stepping into your own authority.
                      </p>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border border-stroke-default bg-surface-card p-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface-elevated border border-stroke-default'>
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
                      <div className='flex items-center gap-2 text-xs mb-2'>
                        <span className='text-content-secondary'>Venus</span>
                        <span className='text-content-muted'>18°30</span>
                        <span className='text-lunary-success-300'>△</span>
                        <span className='text-content-secondary'>Moon</span>
                        <span className='text-content-muted'>14°52</span>
                      </div>
                      <p className='text-xs text-content-muted leading-relaxed'>
                        Venus is gently lifting your emotional world —
                        connections feel easy and nourishing right now.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        )
      )}

      {/* Upcoming Transits — unified, gated internally */}
      <HoroscopeSection
        title='Upcoming Transits'
        color='zinc'
        id='personal-transits'
      >
        <p className='text-sm text-content-muted mb-2'>
          {hasPaidAccess
            ? 'How upcoming shifts touch your life'
            : 'Planetary events in the next 30 days — unlock personal impact for each'}
        </p>
        <UnifiedTransitList
          transits={upcomingTransits}
          personalImpacts={personalTransitImpacts}
          hasPaidAccess={hasPaidAccess}
        />
      </HoroscopeSection>

      {/* Solar Return — paid: full section; free: locked preview */}
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
                    className='px-2 py-1 rounded border border-stroke-default bg-surface-elevated text-xs text-content-secondary'
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
              <div className='rounded-lg border border-stroke-default bg-surface-elevated p-5 space-y-3'>
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
                  with your deeper purpose — trust the quiet.
                </p>
                <div>
                  <h4 className='text-xs font-medium text-content-muted mb-2 uppercase tracking-wide'>
                    Year Themes
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    <span className='px-2 py-1 rounded border border-stroke-default bg-surface-elevated text-xs text-content-secondary'>
                      Introspection
                    </span>
                    <span className='px-2 py-1 rounded border border-stroke-default bg-surface-elevated text-xs text-content-secondary'>
                      Spiritual Growth
                    </span>
                    <span className='px-2 py-1 rounded border border-stroke-default bg-surface-elevated text-xs text-content-secondary'>
                      Inner Wisdom
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        )
      )}

      {/* Complete Profile prompt — paid only, no birthday */}
      {hasPaidAccess && !userBirthday && (
        <HoroscopeSection title='Complete Your Profile' color='amber'>
          <p className='text-sm text-content-secondary mb-4 leading-relaxed'>
            Add your birthday to get more personalized and accurate astrological
            insights.
          </p>
          <Link
            href='/profile'
            className='inline-block rounded-lg border border-stroke-default bg-surface-elevated hover:bg-surface-card text-content-brand-accent px-4 py-2 text-sm font-medium transition-colors'
          >
            Update Profile
          </Link>
        </HoroscopeSection>
      )}

      {/* PremiumPathway — paid only */}
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
