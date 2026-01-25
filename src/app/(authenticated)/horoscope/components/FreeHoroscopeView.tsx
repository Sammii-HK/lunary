'use client';

import Link from 'next/link';
import dayjs from 'dayjs';
import { useState } from 'react';
import { getGeneralHoroscope } from '../../../../../utils/astrology/generalHoroscope';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import { HoroscopeSection } from './HoroscopeSection';
import { FeaturePreview } from './FeaturePreview';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { Share2, ChevronRight } from 'lucide-react';
import { TransitCard } from './TransitCard';
import { getNumerologyDetail } from '@/lib/numerology/numerologyDetails';
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

      <div className='rounded-2xl border border-zinc-800/70 bg-zinc-900/70 p-5 space-y-4'>
        <p className='text-[11px] font-semibold tracking-[0.3em] uppercase text-zinc-400'>
          Cosmic Highlight
        </p>
        <p className='text-lg font-light text-zinc-100'>
          {generalHoroscope.generalAdvice}
        </p>
        <p className='text-sm text-zinc-300 leading-relaxed'>
          {generalHoroscope.reading}
        </p>
        <div className='mt-1 grid grid-cols-2 gap-3 text-[11px] text-zinc-300'>
          <div className='relative'>
            <button
              type='button'
              onClick={openUniversalModal}
              className='rounded-lg border border-zinc-700 px-3 py-3 capitalize text-center transition hover:border-lunary-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lunary-primary-400 w-full'
            >
              <div className='text-2xl font-semibold text-lunary-accent-300'>
                {universalDay.number}
              </div>
              <div className='text-[9px] text-zinc-400 uppercase tracking-wide'>
                Universal Day
              </div>
              <p className='text-[11px] mt-1'>{universalDay.meaning}</p>
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
              className='absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/60 text-zinc-300 transition hover:border-lunary-primary-500 hover:text-white'
              aria-label='Share Universal Day'
            >
              <Share2 className='h-3 w-3' />
            </button>
          </div>
          <div className='rounded-lg border border-zinc-700 px-3 py-3 capitalize tracking-wide text-center'>
            <div className='text-md text-semibold md:text-lg mt-1'>
              {generalHoroscope.moonPhase}
            </div>
            <div className='text-[9px] text-zinc-400 uppercase tracking-wide'>
              Moon Phase
            </div>
            <p className='text-[11px] mt-1'>
              {MOON_PHASE_TIPS[generalHoroscope.moonPhase as MoonPhaseLabels]}
            </p>
          </div>
        </div>
        <p className='text-xs text-zinc-400'>
          This highlight refreshes every sunrise—numerology, moon, and transit
          info all rebalance daily.
        </p>
      </div>

      <HoroscopeSection title="Today's Transits" color='zinc'>
        {upcomingTransits.length > 0 ? (
          <>
            <p className='text-sm text-zinc-400 mb-4'>
              Upcoming planetary events happening in the next 30 days affecting
              everyone
            </p>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {upcomingTransits.map((transit, index) => (
                <TransitCard key={index} transit={transit} />
              ))}
            </div>
            <div className='mt-4 pt-4 border-t border-zinc-800/50'>
              <p className='text-xs text-zinc-400 mb-3'>
                See how these transits specifically affect your birth chart with
                personalized insights
              </p>
              <div className='w-full flex justify-center'>
                <SmartTrialButton feature='personalized_transit_readings' />
              </div>
            </div>
          </>
        ) : (
          <>
            <p className='text-sm text-zinc-400 mb-4'>
              No major transits happening today. Check upcoming transits below
              or unlock personalized transit insights for your birth chart.
            </p>
            <div className='mt-4 pt-4 border-t border-zinc-800/50'>
              <p className='text-xs text-zinc-400 mb-3'>
                Get personalized transit insights based on your birth chart
              </p>
              <div className='w-full flex justify-center'>
                <SmartTrialButton feature='personalized_transit_readings' />
              </div>
            </div>
          </>
        )}
      </HoroscopeSection>

      <div className='space-y-6'>
        <HoroscopeSection title='Cosmic Highlight' color='indigo'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-700/50'>
            <div className='text-center my-7'>
              <div className='text-2xl md:text-3xl font-light text-lunary-accent-200 mb-1'>
                {universalDay.number}
              </div>
              <div className='text-xs text-zinc-400 uppercase tracking-wide mb-1'>
                Universal Day
              </div>
              <p className='text-xs text-zinc-300'>{universalDay.meaning}</p>
              <SmartTrialButton
                size='sm'
                className='mx-auto my-8'
                feature='personal_day_number'
              />
            </div>
            <div className='space-y-3'>
              <div className='rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-4 text-center'>
                <div className='text-xs text-zinc-500 uppercase tracking-[0.3em] mb-1'>
                  Personal Day
                </div>
                <div className='text-3xl font-light text-lunary-accent-200'>
                  {personalDay ? personalDay.number : '—'}
                </div>
                <p className='text-xs text-zinc-400 mt-1'>
                  {personalDay
                    ? 'Numbers are free. Upgrade for the interpretation.'
                    : 'Add your birth date to reveal your Personal Day number.'}
                </p>
              </div>
              <div className='rounded-2xl border border-zinc-700/50 bg-zinc-900/30 p-4 text-center'>
                <div className='text-xs text-zinc-500 uppercase tracking-[0.3em] mb-1'>
                  Personal Year
                </div>
                <div className='text-3xl font-light text-lunary-accent-200'>
                  {personalYear ? personalYear.number : '—'}
                </div>
                <p className='text-xs text-zinc-400 mt-1'>
                  {personalYear
                    ? 'Numbers are free. Upgrade for the interpretation.'
                    : 'Add your birth date to reveal your Personal Year number.'}
                </p>
              </div>
            </div>
          </div>
          <p className='text-xs text-zinc-500 mt-2 text-center'>
            Personal Day and Personal Year numbers are free. Interpretations
            unlocked with Lunary+.
          </p>
        </HoroscopeSection>

        <FeaturePreview
          title='Personal Insight'
          description='Get insights specifically tailored to your birth chart and cosmic profile'
          feature='personalized_horoscope'
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
