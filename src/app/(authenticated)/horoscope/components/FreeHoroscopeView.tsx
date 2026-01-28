'use client';

import Link from 'next/link';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import { HoroscopeSection } from './HoroscopeSection';
import { FeaturePreview } from './FeaturePreview';
import { UnifiedTransitList } from './UnifiedTransitList';
import { Share2, ChevronRight, Sparkles } from 'lucide-react';
import { getNumerologyDetail } from '@/lib/numerology/numerologyDetails';
import { useCTACopy } from '@/hooks/useCTACopy';
import { captureEvent } from '@/lib/posthog-client';
import {
  buildHoroscopeNumerologyShareUrl,
  getShareOrigin,
} from '@/lib/og/horoscopeShare';
import { useOgShareModal } from '@/hooks/useOgShareModal';
import { ShareImageModal } from '@/components/og/ShareImageModal';
import {
  NumerologyInfoModal,
  type NumerologyModalPayload,
} from '@/components/grimoire/NumerologyInfoModal';
import { useUser } from '@/context/UserContext';
import {
  getPersonalDayNumber,
  getPersonalYearNumber,
} from '@/lib/numerology/personalNumbers';
import { MoonPhaseLabels } from 'utils/moon/moonPhases';

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

export function FreeHoroscopeView() {
  const generalHoroscope = getGeneralHoroscope();
  const upcomingTransits = getUpcomingTransits();
  const today = dayjs();
  const router = useRouter();
  const ctaCopy = useCTACopy();
  const { user } = useUser();
  const birthday = user?.birthday;
  const personalDay = birthday ? getPersonalDayNumber(birthday, today) : null;
  const personalYear = birthday ? getPersonalYearNumber(birthday, today) : null;
  const universalDay = getDailyNumerology(today);
  const [numberModal, setNumberModal] = useState<NumerologyModalPayload | null>(
    null,
  );
  const universalDetails = getNumerologyDetail('lifePath', universalDay.number);
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

  const getPageUrl = () =>
    typeof window !== 'undefined'
      ? window.location.href
      : `${getShareOrigin()}/horoscope`;

  const handleShareHoroscope = () => {
    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: 'Your Horoscope',
      highlight: generalHoroscope.generalAdvice,
      highlightSubtitle: generalHoroscope.reading,
      variant: 'horoscope',
      date: today.format('MMMM D, YYYY'),
      numbers: [
        {
          label: 'Universal Day',
          value: universalDay.number,
          meaning: universalDay.meaning,
        },
      ],
    });
    openShareModal({
      title: 'Your Horoscope',
      description: generalHoroscope.generalAdvice,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };

  const shareNumberTile = (label: string, number: number, meaning?: string) => {
    const shareUrl = buildHoroscopeNumerologyShareUrl({
      shareOrigin: getShareOrigin(),
      highlightTitle: label,
      highlight: meaning ?? label,
      variant: 'numerology-card',
      date: today.format('MMMM D, YYYY'),
      numbers: [
        {
          label,
          value: number,
          meaning,
        },
      ],
    });
    openShareModal({
      title: label,
      description: meaning ?? label,
      pageUrl: getPageUrl(),
      ogUrl: shareUrl,
    });
  };

  const openUniversalModal = () => {
    setNumberModal({
      number: universalDay.number,
      contextLabel: 'Universal Day',
      meaning: universalDay.meaning,
      contextDetail: 'Daily universal numerology energy',
      energy: universalDetails?.energy,
      keywords: universalDetails?.keywords,
      description: universalDetails?.description,
      sections: universalDetails?.sections,
      extraNote: universalDetails?.extraNote,
    });
  };

  // // Filter transits for today
  // const todaysTransits = upcomingTransits.filter((transit) => {
  //   const transitDate = dayjs(transit.date);
  //   return transitDate.isSame(today, 'day');
  // });

  return (
    <div className='h-full space-y-6 p-4 pb-16 md:pb-20 overflow-auto'>
      <div className='pt-6'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h1 className='text-2xl md:text-3xl font-light text-zinc-100 mb-2'>
              Your Horoscope
            </h1>
            <p className='text-sm text-zinc-400'>
              General cosmic guidance based on universal energies
            </p>
          </div>
          <button
            type='button'
            onClick={handleShareHoroscope}
            className='inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-lunary-primary-500 hover:text-white'
          >
            <Share2 className='h-4 w-4' />
            Share highlight
          </button>
        </div>
        <div className='flex gap-3 mt-3'>
          <Link
            href='/grimoire/horoscopes/today'
            className='inline-flex items-center gap-1 text-xs text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
          >
            See all daily horoscopes <ChevronRight className='w-3 h-3' />
          </Link>
          <Link
            href='/grimoire/horoscopes/weekly'
            className='inline-flex items-center gap-1 text-xs text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
          >
            Browse weekly horoscopes <ChevronRight className='w-3 h-3' />
          </Link>
        </div>
      </div>

      <div className='rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900/70 via-zinc-950/70 to-lunary-primary-950 p-5 space-y-4'>
        <p className='text-[11px] font-semibold tracking-[0.3em] uppercase text-zinc-400'>
          Cosmic Highlight
        </p>
        <p className='text-2xl font-light text-zinc-100'>
          {generalHoroscope.generalAdvice}
        </p>
        <p className='text-sm text-zinc-300 leading-relaxed'>
          {generalHoroscope.reading}
        </p>
        <div className='mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='relative'>
            <button
              type='button'
              onClick={openUniversalModal}
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
          <div className='rounded-lg border border-zinc-700 px-4 py-3 bg-zinc-900/40 text-center'>
            <div className='text-xs uppercase tracking-widest text-zinc-400'>
              Moon Phase
            </div>
            <div className='text-lg font-medium text-zinc-100 mt-0.5'>
              {generalHoroscope.moonPhase}
            </div>
            <p className='text-[11px] text-zinc-300 mt-0.5'>
              {MOON_PHASE_TIPS[generalHoroscope.moonPhase as MoonPhaseLabels]}
            </p>
          </div>
        </div>
        <p className='text-xs text-zinc-400'>
          This highlight refreshes every sunrise—numerology, moon, and transit
          info all rebalance daily.
        </p>
      </div>

      <HoroscopeSection title='Upcoming Transits' color='zinc'>
        <p className='text-sm text-zinc-400 mb-4'>
          Planetary events in the next 30 days — unlock personal impact for each
        </p>
        <UnifiedTransitList transits={upcomingTransits} hasPaidAccess={false} />
      </HoroscopeSection>

      <div className='space-y-6'>
        <HoroscopeSection title='Your Numbers' color='indigo'>
          <div className='space-y-3'>
            <div className='rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-4 text-center'>
              <div className='text-xs text-zinc-500 uppercase tracking-[0.3em] mb-1'>
                Personal Day
              </div>
              <div className='text-3xl font-semibold text-lunary-accent-300'>
                {personalDay ? personalDay.number : '—'}
              </div>
              <p className='text-xs text-zinc-400 mt-1'>
                {personalDay
                  ? 'Numbers are free. Upgrade for the interpretation.'
                  : 'Add your birth date to reveal your Personal Day number.'}
              </p>
            </div>
            <div className='rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-4 text-center'>
              <div className='text-xs text-zinc-500 uppercase tracking-[0.3em] mb-1'>
                Personal Year
              </div>
              <div className='text-3xl font-semibold text-lunary-accent-300'>
                {personalYear ? personalYear.number : '—'}
              </div>
              <p className='text-xs text-zinc-400 mt-1'>
                {personalYear
                  ? 'Numbers are free. Upgrade for the interpretation.'
                  : 'Add your birth date to reveal your Personal Year number.'}
              </p>
            </div>
            <div className='pt-3 text-center'>
              <button
                type='button'
                onClick={() => {
                  ctaCopy.trackCTAClick('horoscope', 'horoscope');
                  captureEvent('locked_content_clicked', {
                    feature: 'personal_numbers_interpretation',
                    tier: 'free',
                  });
                  router.push('/pricing');
                }}
                className='inline-flex items-center gap-1.5 rounded-lg border border-lunary-primary-700 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-lunary-primary-300 hover:bg-zinc-900 transition-colors'
              >
                <Sparkles className='w-3 h-3' />
                {ctaCopy.horoscope}
                <span className='text-[10px] bg-lunary-primary-900/50 border border-lunary-primary-700/50 px-1.5 py-0.5 rounded'>
                  Lunary+
                </span>
              </button>
            </div>
          </div>
        </HoroscopeSection>

        <FeaturePreview
          title='Personal Insight'
          description='Get insights specifically tailored to your birth chart and cosmic profile'
          feature='personalized_horoscope'
          ctaKey='horoscope'
          trackingFeature='personal_horoscope_insight'
          page='horoscope'
          blurredContent={
            <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 opacity-60 h-150'>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                ●●●●● ●●●●● ●●● ●●●●●●●● ●●●●●●●● ●●● ●●●●●●● ●●●●●●●●● ●●●●●●●
                ●●● ●●●●●●●●● ●●●●●●●● ●●●●●. ●●●●●● ●●●●●●●● ●●● ●●●●●●●●●
                ●●●●●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●● ●●●●●●●● ●●●●●●●●● ●●●
                ●●●●●●●●● ●●●●●●●● ●●●●●. ●●●●●● ●●●●●●●● ●●● ●●●●●●●●● ●●●
                ●●●●●●●●● ●●●●●●●● ●●●●●. ●●●●●● ●●●●●●●● ●●● ●●●●●●●●●
                ●●●●●●●●●.
              </p>
            </div>
          }
        />

        <FeaturePreview
          title='Solar Return Insights'
          description='Discover your personal year themes and birthday insights'
          feature='solar_return'
          ctaKey='horoscope'
          trackingFeature='solar_return_insights'
          page='horoscope'
          blurredContent={
            <div className='rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 p-6 opacity-60'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-300'>
                    ●●●● ●●●●● ●●●●●●●:
                  </span>
                  <span className='text-sm font-medium text-zinc-200'>
                    ●●● ●●, ●●●●
                    <span className='text-xs text-zinc-400 ml-2'>
                      (●●● ●●●●)
                    </span>
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-300'>●●●●●●●● ●●●●:</span>
                  <span className='text-sm font-medium text-zinc-200'>●</span>
                </div>
                <p className='text-sm text-zinc-300 leading-relaxed'>
                  ●●●● ●●●●● ●●●●●●● ●●●●●●●●● ●●●●●●●●●● ●●● ●●●●●●●●●●
                  ●●●●●●●●●● ●●●●●●●● ●●●●●●●●●●●.
                </p>
              </div>
            </div>
          }
        />

        {/* <HoroscopeSection title='Cosmic Calendar' color='zinc'>
          <p className='text-sm text-zinc-400 mb-4'>
            Upcoming planetary events and moon phases affecting everyone
          </p>
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {upcomingTransits.slice(0, 6).map((transit, index) => (
              <TransitCard key={index} transit={transit} />
            ))}
            {upcomingTransits.length === 0 && (
              <p className='text-zinc-400 text-center py-4 text-sm'>
                No significant transits in the next 30 days
              </p>
            )}
          </div>
        </HoroscopeSection> */}

        {/* <HoroscopeSection
          title='Unlock Your Complete Cosmic Profile'
          color='purple'
        >
          <p className='text-sm text-zinc-300 mb-4 leading-relaxed'>
            Get access to all the personalized features you see previewed above
            - horoscopes based on YOUR birth chart with deep personal insights
            and cosmic guidance tailored specifically to you.
          </p>
          <ul className='text-xs text-zinc-400 space-y-2 mb-4'>
            <li>• Personal insight based on your birth chart</li>
            <li>• Solar return birthday analysis</li>
            <li>• Personal transit impact reports</li>
            <li>• Complete cosmic profile features</li>
          </ul>
          <SmartTrialButton />
        </HoroscopeSection> */}
      </div>
      <NumerologyInfoModal
        isOpen={!!numberModal}
        onClose={() => setNumberModal(null)}
        number={numberModal?.number ?? 0}
        contextLabel={numberModal?.contextLabel ?? ''}
        meaning={numberModal?.meaning ?? ''}
        energy={numberModal?.energy}
        keywords={numberModal?.keywords}
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
