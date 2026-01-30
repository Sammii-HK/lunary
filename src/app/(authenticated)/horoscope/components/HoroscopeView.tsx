'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Share2, Sparkles, Lock } from 'lucide-react';
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
import { useCTACopy } from '@/hooks/useCTACopy';
import { ShareRetrogradeBadge } from '@/components/share/ShareRetrogradeBadge';
import { ShareHoroscope } from '@/components/share/ShareHoroscope';

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
      <div className='h-full space-y-6 p-4 pb-16 md:pb-20 overflow-auto'>
        <div className='pt-6'>
          <div className='h-8 bg-zinc-800 rounded animate-pulse w-48 mb-2' />
          <div className='h-4 bg-zinc-800 rounded animate-pulse w-64' />
        </div>
        <div className='space-y-4'>
          <div className='h-32 bg-zinc-800/50 rounded-xl animate-pulse' />
          <div className='h-24 bg-zinc-800/50 rounded-xl animate-pulse' />
        </div>
      </div>
    );
  }

  return (
    <div className='h-full space-y-6 p-4 pb-16 md:pb-20 overflow-auto'>
      {/* Header */}
      <div className='pt-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex-1'>
            <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
              {hasPaidAccess && userName
                ? `${userName}'s Horoscope`
                : 'Your Horoscope'}
            </h1>
            <p className='text-sm text-zinc-400'>
              {hasPaidAccess
                ? 'Guidance written just for you'
                : 'Universal reading — unlock yours for something personal'}
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
                className='inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-zinc-200 transition hover:border-lunary-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                <Share2 className='h-4 w-4' />
                Share {hasPaidAccess ? 'horoscope' : 'highlight'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cosmic Highlight Card */}
      <div className='rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900/70 via-zinc-950/70 to-lunary-primary-950 p-5 space-y-4'>
        <p className='text-[11px] font-semibold tracking-[0.3em] uppercase text-zinc-400'>
          Cosmic Highlight
        </p>
        <p className='text-2xl font-light text-zinc-100'>{cosmicHighlight}</p>
        <p className='text-sm text-zinc-300 leading-relaxed'>{dailyGuidance}</p>

        {personalizedTeaser && (
          <Link href='/pricing' className='block space-y-2 group'>
            {/* Line 1: readable start → blur fade */}
            <div className='relative h-[1.25rem] overflow-hidden'>
              {/* Blurred layer underneath */}
              <p className='text-xs text-zinc-500 blur-sm'>
                {personalizedTeaser.dailyGuidance}
              </p>
              {/* Clear layer on top — bg covers blur bleed, mask fades to reveal blur */}
              <p
                className='absolute inset-0 text-xs text-zinc-500 bg-zinc-950'
                style={{
                  WebkitMaskImage:
                    'linear-gradient(to right, black 5%, transparent 15%)',
                }}
              >
                {personalizedTeaser.dailyGuidance}
              </p>
            </div>
            {/* Line 2: fully blurred */}
            <p className='text-xs text-zinc-500 blur-sm whitespace-nowrap truncate'>
              {personalizedTeaser.cosmicHighlight}
            </p>
            <span className='inline-flex items-center gap-1.5 text-xs text-lunary-primary-300 group-hover:text-lunary-primary-200 transition-colors'>
              <Sparkles className='w-3 h-3' />
              Get a reading written just for you
            </span>
          </Link>
        )}

        {!hasPaidAccess && !userBirthday && (
          <Link
            href='/pricing'
            className='inline-flex items-center gap-1.5 text-xs text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
          >
            <Sparkles className='w-3 h-3' />
            Get a reading written just for you
          </Link>
        )}

        {/* Numerology Grid */}
        <div className='mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {/* Universal Day — always interactive */}
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
              className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center transition hover:border-lunary-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lunary-primary-400 w-full'
            >
              <div className='text-xs uppercase tracking-widest text-zinc-400'>
                Universal Day
              </div>
              <div className='text-3xl font-semibold text-lunary-accent-300'>
                {universalDay.number}
              </div>
              <p className='text-[11px] text-zinc-300'>
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
              className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/50 text-zinc-400 transition hover:border-lunary-primary-500 hover:text-white'
              aria-label='Share Universal Day'
            >
              <Share2 className='h-4 w-4' />
            </button>
          </div>

          {/* Personal Day — paid: modal + share; free: number + badge */}
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
                    className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center transition hover:border-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300 w-full'
                  >
                    <div className='text-xs uppercase tracking-widest text-zinc-400'>
                      Personal Day
                    </div>
                    <div className='text-3xl font-semibold text-emerald-300'>
                      {personalDay.number}
                    </div>
                    <p className='text-[11px] text-zinc-300'>
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
                    className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/50 text-zinc-400 transition hover:border-emerald-400 hover:text-white'
                    aria-label='Share Personal Day'
                  >
                    <Share2 className='h-4 w-4' />
                  </button>
                </>
              ) : (
                <div className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center'>
                  <div className='text-xs uppercase tracking-widest text-zinc-400'>
                    Personal Day
                  </div>
                  <Lock className='w-4 h-4 text-lunary-primary-300 mx-auto mt-2' />
                  <span className='inline-flex items-center gap-1 mt-1 text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded text-lunary-primary-300'>
                    <Sparkles className='w-2.5 h-2.5' />
                    Lunary+
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center'>
              <div className='text-xs uppercase tracking-widest text-zinc-400'>
                Personal Day
              </div>
              <div className='text-3xl font-semibold text-zinc-500'>?</div>
              <p className='text-[11px] text-zinc-500'>
                Add your birthday to reveal this daily number.
              </p>
            </div>
          )}
        </div>

        <p className='text-xs text-zinc-400'>
          {hasPaidAccess
            ? 'Highlight refreshes each sunrise with new numerology, moon, and transit energy—baseline for everything you read today.'
            : 'This highlight refreshes every sunrise—numerology, moon, and transit info all rebalance daily.'}
        </p>
      </div>

      {/* GuideNudge — paid only */}
      {hasPaidAccess && <GuideNudge location='horoscope' />}

      {/* Transit Wisdom — paid: full component; free: locked preview */}
      {hasPaidAccess && birthChart && currentTransits.length > 0 ? (
        <HoroscopeSection
          title='Transit Wisdom'
          color='indigo'
          id='transit-wisdom'
        >
          <p className='text-sm text-zinc-400 mb-4'>
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
                <div className='rounded-lg border border-lunary-error-700/50 bg-zinc-900/40 p-4 space-y-3'>
                  <div className='flex items-start gap-3'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lunary-error-950/60 text-lunary-error-300'>
                      Highly Prominent
                    </span>
                    <div className='flex-1'>
                      <h4 className='text-sm font-medium text-zinc-100'>
                        Saturn meets your Sun
                      </h4>
                      <p className='text-xs text-zinc-500 mt-0.5'>
                        Saturn in Aquarius · Sun in Aquarius
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border bg-amber-900/40 text-amber-300 border-amber-700/40'>
                      Identity
                    </span>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border bg-blue-900/40 text-blue-300 border-blue-700/40'>
                      Work
                    </span>
                  </div>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
                    A period of deep restructuring around your sense of self and
                    long-term commitments. Discipline and patience will unlock
                    lasting transformation.
                  </p>
                </div>
                <div className='rounded-lg border border-lunary-accent-700/50 bg-zinc-900/40 p-4 space-y-3'>
                  <div className='flex items-start gap-3'>
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lunary-accent-950/60 text-lunary-accent-300'>
                      Noticeable
                    </span>
                    <div className='flex-1'>
                      <h4 className='text-sm font-medium text-zinc-100'>
                        Venus flows with your Moon
                      </h4>
                      <p className='text-xs text-zinc-500 mt-0.5'>
                        Venus in Pisces · Moon in Scorpio
                      </p>
                    </div>
                  </div>
                  <p className='text-sm text-zinc-300 leading-relaxed'>
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

      {/* Moon Phase — free for all users, house placement is paid */}
      <HoroscopeSection
        title='Current Lunar Energy'
        color='purple'
        id='moon-phase'
      >
        <p className='text-sm text-zinc-400 mb-4'>
          The moon&apos;s influence{hasPaidAccess ? ' on your chart' : ''} right
          now
        </p>
        <MoonPhaseCard
          birthChart={birthChart ?? undefined}
          currentTransits={currentTransits}
          showHousePlacement={hasPaidAccess}
        />
      </HoroscopeSection>

      {/* Today's Aspects — paid: full component; free: locked preview */}
      {hasPaidAccess && birthChart && currentTransits.length > 0 ? (
        <HoroscopeSection
          title="Today's Aspects to Your Chart"
          color='zinc'
          id='today-aspects'
        >
          <p className='text-sm text-zinc-400 mb-4'>
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
                <div className='rounded-lg border border-lunary-primary-400/40 bg-lunary-primary-950/40 p-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-lunary-primary-950/40 border border-lunary-primary-400/40'>
                      <span className='text-lg text-lunary-primary-300'>☌</span>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium capitalize text-lunary-primary-200'>
                            merging
                          </span>
                          <span className='text-xs text-zinc-400'>
                            Blending energies
                          </span>
                        </div>
                        <span className='text-xs text-lunary-success-400'>
                          1.2°
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-xs mb-2'>
                        <span className='text-zinc-300'>Saturn</span>
                        <span className='text-zinc-600'>3°12</span>
                        <span className='text-lunary-primary-300'>☌</span>
                        <span className='text-zinc-300'>Sun</span>
                        <span className='text-zinc-600'>4°45</span>
                      </div>
                      <p className='text-xs text-zinc-400 leading-relaxed'>
                        Saturn's energy is blending with yours — a time for
                        grounding and stepping into your own authority.
                      </p>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border border-lunary-success-400/40 bg-lunary-success-950/40 p-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-lunary-success-950/40 border border-lunary-success-400/40'>
                      <span className='text-lg text-lunary-success-300'>△</span>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium capitalize text-lunary-success-200'>
                            flowing
                          </span>
                          <span className='text-xs text-zinc-400'>
                            Easy harmony
                          </span>
                        </div>
                        <span className='text-xs text-lunary-accent-300'>
                          3.8°
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-xs mb-2'>
                        <span className='text-zinc-300'>Venus</span>
                        <span className='text-zinc-600'>18°30</span>
                        <span className='text-lunary-success-300'>△</span>
                        <span className='text-zinc-300'>Moon</span>
                        <span className='text-zinc-600'>14°52</span>
                      </div>
                      <p className='text-xs text-zinc-400 leading-relaxed'>
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
        <p className='text-sm text-zinc-400 mb-4'>
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
              <span className='text-sm text-zinc-300'>Next Solar Return:</span>
              <span className='text-sm font-medium text-zinc-100'>
                {solarReturnData.nextSolarReturn.format('MMM DD, YYYY')}
                <span className='text-xs text-zinc-400 ml-2'>
                  ({solarReturnData.daysTillReturn} days)
                </span>
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-zinc-300'>Personal Year:</span>
              <span className='text-sm font-medium text-zinc-100'>
                {solarReturnData.personalYear}
              </span>
            </div>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {solarReturnData.insights}
            </p>
            <div>
              <h4 className='text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide'>
                Year Themes
              </h4>
              <div className='flex flex-wrap gap-2'>
                {solarReturnData.themes.map((theme, index) => (
                  <span
                    key={index}
                    className='px-2 py-1 rounded border border-lunary-accent-700 bg-lunary-accent-950 text-xs text-zinc-300'
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
              <div className='rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 p-5 space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-300'>
                    Next Solar Return:
                  </span>
                  <span className='text-sm font-medium text-zinc-100'>
                    Mar 14, 2026
                    <span className='text-xs text-zinc-400 ml-2'>
                      (45 days)
                    </span>
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-300'>Personal Year:</span>
                  <span className='text-sm font-medium text-zinc-100'>7</span>
                </div>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  This solar return chart emphasizes introspection and spiritual
                  deepening. A year of withdrawal from noise and reconnection
                  with your deeper purpose — trust the quiet.
                </p>
                <div>
                  <h4 className='text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide'>
                    Year Themes
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    <span className='px-2 py-1 rounded border border-lunary-accent-700 bg-lunary-accent-950 text-xs text-zinc-300'>
                      Introspection
                    </span>
                    <span className='px-2 py-1 rounded border border-lunary-accent-700 bg-lunary-accent-950 text-xs text-zinc-300'>
                      Spiritual Growth
                    </span>
                    <span className='px-2 py-1 rounded border border-lunary-accent-700 bg-lunary-accent-950 text-xs text-zinc-300'>
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
          <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
            Add your birthday to get more personalized and accurate astrological
            insights.
          </p>
          <Link
            href='/profile'
            className='inline-block rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 hover:bg-lunary-accent-900 text-lunary-accent-300 px-4 py-2 text-sm font-medium transition-colors'
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
