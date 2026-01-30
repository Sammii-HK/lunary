'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { isInDemoMode } from '@/lib/demo-mode';
import { getTarotCard } from '../../utils/tarot/tarot';
import { getGeneralCrystalRecommendation } from '../../utils/crystals/generalCrystals';
import {
  calculateCrystalRecommendation,
  getCrystalGuidance,
} from '../../utils/crystals/personalizedCrystals';
import { getAstrologicalChart } from '../../utils/astrology/astrology';
import { getGeneralHoroscope } from '../../utils/astrology/generalHoroscope';
import { getUpcomingTransits } from '../../utils/astrology/transitCalendar';
import {
  getPersonalTransitImpacts,
  PersonalTransitImpact,
} from '../../utils/astrology/personalTransits';
import { useSubscription } from '../hooks/useSubscription';
import { hasFeatureAccess } from '../../utils/pricing';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './share/ShareModal';
import { SharePreview } from './share/SharePreview';
import { ShareActions } from './share/ShareActions';
import { ShareFormatSelector } from './share/ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';

dayjs.extend(utc);
dayjs.extend(dayOfYear);

export function ShareDailyInsight() {
  const [observer, setObserver] = useState<any>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const { user } = useUser();
  const subscription = useSubscription();
  const isDemoMode = isInDemoMode();

  const userName = user?.name;
  const userBirthday = user?.birthday;
  const firstName = userName?.trim() ? userName.split(' ')[0] : '';
  const birthChart = user?.birthChart;

  const hasPersonalTarotAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personal_tarot',
  );
  const hasPersonalCrystalAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_crystal_recommendations',
  );
  const hasPersonalTransitAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_transit_readings',
  );

  const {
    isOpen,
    format,
    loading,
    error,
    openModal,
    closeModal,
    setFormat,
    setLoading,
    setError,
  } = useShareModal('square');

  useEffect(() => {
    import('astronomy-engine').then((module) => {
      const { Observer } = module;
      setObserver(new Observer(51.4769, 0.0005, 0));
    });
  }, []);

  const today = useMemo(() => dayjs(), []);
  const dateStr = today.format('YYYY-MM-DD');
  const normalizedDate = useMemo(() => {
    return new Date(dateStr + 'T12:00:00');
  }, [dateStr]);

  const tarotData = useMemo(() => {
    if (hasPersonalTarotAccess && userName && userBirthday) {
      const card = getTarotCard(`daily-${dateStr}`, userName, userBirthday);
      return {
        name: card.name,
        keywords: card.keywords?.slice(0, 3) || [],
        isPersonalized: true,
      };
    }

    const dayOfYearLocal = today.dayOfYear();
    const generalSeed = `cosmic-${dateStr}-${dayOfYearLocal}-energy`;
    const card = getTarotCard(generalSeed);
    return {
      name: card.name,
      keywords: card.keywords?.slice(0, 3) || [],
      isPersonalized: false,
    };
  }, [hasPersonalTarotAccess, userName, userBirthday, dateStr, today]);

  const crystalData = useMemo(() => {
    if (!hasPersonalCrystalAccess || !birthChart || !observer) {
      const general = getGeneralCrystalRecommendation(normalizedDate);
      return {
        name: general.name,
        reason: general.reason,
        isPersonalized: false,
      };
    }

    const currentTransits = getAstrologicalChart(normalizedDate, observer);
    const { crystal, reasons } = calculateCrystalRecommendation(
      birthChart,
      currentTransits,
      normalizedDate,
      userBirthday,
    );

    const guidance = getCrystalGuidance(crystal, birthChart);

    return {
      name: crystal.name,
      reason: guidance || crystal.properties?.slice(0, 2).join(', ') || '',
      isPersonalized: true,
    };
  }, [
    hasPersonalCrystalAccess,
    birthChart,
    observer,
    normalizedDate,
    userBirthday,
  ]);

  const horoscope = useMemo(() => {
    const general = getGeneralHoroscope(normalizedDate);
    return general.reading.split('.').slice(0, 2).join('.') + '.';
  }, [normalizedDate]);

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

  const transitData = useMemo((): {
    planet: string;
    title: string;
    desc: string;
    date: string;
  } | null => {
    if (!hasPersonalTransitAccess || !birthChart || birthChart.length === 0) {
      return null;
    }

    const upcomingTransits = getUpcomingTransits();
    const personalImpacts = getPersonalTransitImpacts(
      upcomingTransits,
      birthChart,
      20,
    );

    if (personalImpacts.length === 0) return null;

    const todayDayjs = dayjs().startOf('day');
    const nextWeek = todayDayjs.add(7, 'day');

    const relevantTransits = personalImpacts.filter((t) => {
      const transitDate = dayjs(t.date);
      return (
        transitDate.isAfter(todayDayjs.subtract(1, 'day')) &&
        transitDate.isBefore(nextWeek)
      );
    });

    let transit: PersonalTransitImpact;
    if (relevantTransits.length === 0) {
      transit = personalImpacts[0];
    } else {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sorted = relevantTransits.sort((a, b) => {
        const priorityDiff =
          priorityOrder[b.significance] - priorityOrder[a.significance];
        if (priorityDiff !== 0) return priorityDiff;
        return dayjs(a.date).diff(dayjs(b.date));
      });
      transit = sorted[0];
    }

    const transitDate = dayjs(transit.date);
    const isToday = transitDate.isSame(dayjs(), 'day');
    const isTomorrow = transitDate.isSame(dayjs().add(1, 'day'), 'day');
    const dateLabel = isToday
      ? 'Today'
      : isTomorrow
        ? 'Tomorrow'
        : transitDate.format('MMM D').toUpperCase();

    const title =
      transit.planet === 'Moon'
        ? `${transit.event}${transit.house ? ` → your ${transit.house}${getOrdinalSuffix(transit.house)} house` : ''}`
        : `${transit.event}${transit.house ? ` → your ${transit.house}${getOrdinalSuffix(transit.house)} house` : ''}`;

    return {
      planet: transit.planet,
      title,
      desc: transit.actionableGuidance,
      date: dateLabel,
    };
  }, [hasPersonalTransitAccess, birthChart]);

  const isPersonalized =
    hasPersonalTarotAccess &&
    tarotData.isPersonalized &&
    hasPersonalCrystalAccess &&
    crystalData.isPersonalized &&
    hasPersonalTransitAccess;

  const generateCard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ogParams = new URLSearchParams({
        name: firstName,
        tarot: tarotData.name,
        tarotKeywords: tarotData.keywords.join(' • '),
        crystal: crystalData.name,
        crystalReason: crystalData.reason.substring(0, 100),
        insight: horoscope.substring(0, 200),
        personalized: isPersonalized ? 'true' : 'false',
        transitDate: transitData?.date || today.format('MMM D').toUpperCase(),
        transitPlanet: transitData?.planet || 'Moon',
        transitTitle: transitData?.title || 'Full Moon → your 5th house',
        transitDesc:
          transitData?.desc || 'Follow your heart, do what brings joy',
        format: format,
      });

      const ogImageUrl = `/api/og/daily-insight?${ogParams.toString()}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) throw new Error('Failed to generate image');

      const blob = await imageResponse.blob();
      setImageBlob(blob);
    } catch (err) {
      console.error('Error generating card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate card');
    } finally {
      setLoading(false);
    }
  }, [
    firstName,
    tarotData,
    crystalData,
    horoscope,
    isPersonalized,
    today,
    transitData,
    format,
    setLoading,
    setError,
  ]);

  const handleOpen = async () => {
    openModal();
    shareTracking.shareInitiated(user?.id, 'daily-insight');
    if (!imageBlob) {
      await generateCard();
    }
  };

  // Regenerate when format changes
  useEffect(() => {
    if (isOpen && imageBlob) {
      generateCard();
    }
  }, [format]);

  const handleShare = async () => {
    if (!imageBlob) return;

    const file = new File([imageBlob], 'lunary-daily-insight.png', {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Daily Cosmic Insight',
          text: `${tarotData.name} • ${crystalData.name}`,
        });
        shareTracking.shareCompleted(user?.id, 'daily-insight', 'native');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (!imageBlob) return;

    const url = URL.createObjectURL(imageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lunary-daily-insight.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'daily-insight', 'download');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://lunary.app');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'daily-insight', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent('My daily cosmic insight from Lunary ✨')}&url=${encodeURIComponent('https://lunary.app')}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent('My daily cosmic insight from Lunary ✨ lunary.app')}`,
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className='flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-lunary-primary-400 transition-colors rounded-md hover:bg-zinc-800/50'
        aria-label='Share your daily cosmic insight'
      >
        <Share2 className='w-4 h-4' />
        <span className={isDemoMode ? 'hidden' : 'hidden md:inline'}>
          Share
        </span>
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Share Your Cosmic Insight'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Your Daily Cosmic Insight'
        />

        {!loading && !error && imageBlob && (
          <>
            <div className='mb-4'>
              <ShareFormatSelector
                selected={format}
                onChange={setFormat}
                options={['square', 'landscape', 'story']}
              />
            </div>

            <ShareActions
              onShare={handleShare}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              linkCopied={linkCopied}
              canNativeShare={canNativeShare}
              disabled={loading}
              socialUrls={socialUrls}
            />
          </>
        )}

        {error && (
          <div className='text-center py-8'>
            <p className='text-red-400 mb-4'>{error}</p>
            <button
              onClick={generateCard}
              className='px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg transition-colors'
            >
              Try Again
            </button>
          </div>
        )}
      </ShareModal>
    </>
  );
}
