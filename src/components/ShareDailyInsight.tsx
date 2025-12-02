'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Share2, X, Download, Copy, Check, Loader2 } from 'lucide-react';
import { useAccount } from 'jazz-tools/react';
import { getTarotCard } from '../../utils/tarot/tarot';
import { getGeneralCrystalRecommendation } from '../../utils/crystals/generalCrystals';
import {
  calculateCrystalRecommendation,
  getCrystalGuidance,
} from '../../utils/crystals/personalizedCrystals';
import {
  getBirthChartFromProfile,
  hasBirthChart,
} from '../../utils/astrology/birthChart';
import { getAstrologicalChart } from '../../utils/astrology/astrology';
import { getGeneralHoroscope } from '../../utils/astrology/generalHoroscope';
import { getUpcomingTransits } from '../../utils/astrology/transitCalendar';
import {
  getPersonalTransitImpacts,
  PersonalTransitImpact,
} from '../../utils/astrology/personalTransits';
import { useSubscription } from '../hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(utc);
dayjs.extend(dayOfYear);

export function ShareDailyInsight() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [observer, setObserver] = useState<any>(null);

  const { me } = useAccount();
  const subscription = useSubscription();

  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;
  const firstName = userName?.trim() ? userName.split(' ')[0] : '';

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  const hasBirthChartData = hasBirthChart(me?.profile);
  const birthChart = hasBirthChartData
    ? getBirthChartFromProfile(me?.profile)
    : null;

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
    if (hasChartAccess && userName && userBirthday) {
      const card = getTarotCard(`daily-${dateStr}`, userName, userBirthday);
      return {
        name: card.name,
        keywords: card.keywords?.slice(0, 3) || [],
        isPersonalized: true,
      };
    }

    const nowUtc = today.utc();
    const dayOfYearUtc = nowUtc.dayOfYear();
    const generalSeed = `cosmic-${nowUtc.format('YYYY-MM-DD')}-${dayOfYearUtc}-energy`;
    const card = getTarotCard(generalSeed);
    return {
      name: card.name,
      keywords: card.keywords?.slice(0, 3) || [],
      isPersonalized: false,
    };
  }, [hasChartAccess, userName, userBirthday, dateStr, today]);

  const crystalData = useMemo(() => {
    if (!hasChartAccess || !birthChart || !observer) {
      const general = getGeneralCrystalRecommendation(normalizedDate);
      return {
        name: general.name,
        reason: general.reason,
        isPersonalized: false,
      };
    }

    const currentTransits = getAstrologicalChart(normalizedDate, observer);
    const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
    const { crystal, reasons } = calculateCrystalRecommendation(
      birthChart,
      currentTransits,
      normalizedDate,
      userBirthday,
    );

    const guidance = getCrystalGuidance(crystal, reasons, sunSign);

    return {
      name: crystal.name,
      reason: guidance || crystal.properties?.slice(0, 2).join(', ') || '',
      isPersonalized: true,
    };
  }, [hasChartAccess, birthChart, observer, normalizedDate, userBirthday]);

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
    if (!hasChartAccess || !birthChart || birthChart.length === 0) {
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
  }, [hasChartAccess, birthChart]);

  const isPersonalized =
    hasChartAccess && tarotData.isPersonalized && crystalData.isPersonalized;

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
  ]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!imageBlob) {
      await generateCard();
    }
  };

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
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://lunary.app');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  return (
    <>
      <button
        onClick={handleOpen}
        className='flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-purple-400 transition-colors rounded-md hover:bg-zinc-800/50'
        aria-label='Share your daily cosmic insight'
      >
        <Share2 className='w-4 h-4' />
        <span className='hidden sm:inline'>Share</span>
      </button>

      {isOpen && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='p-6'>
              <h2 className='text-lg font-medium text-white mb-4'>
                Share Your Cosmic Insight
              </h2>

              {loading && (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Loader2 className='w-8 h-8 text-purple-400 animate-spin mb-4' />
                  <p className='text-zinc-400 text-sm'>
                    Generating your cosmic card...
                  </p>
                </div>
              )}

              {error && (
                <div className='text-center py-8'>
                  <p className='text-red-400 mb-4'>{error}</p>
                  <button
                    onClick={generateCard}
                    className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors'
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && imageBlob && (
                <>
                  <div className='mb-6 rounded-lg overflow-hidden border border-zinc-700'>
                    <img
                      src={URL.createObjectURL(imageBlob)}
                      alt='Your Daily Cosmic Insight'
                      className='w-full'
                    />
                  </div>

                  <div className='space-y-3'>
                    {canNativeShare && (
                      <button
                        onClick={handleShare}
                        className='w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium'
                      >
                        <Share2 className='w-4 h-4' />
                        Share Image
                      </button>
                    )}

                    <button
                      onClick={handleDownload}
                      className='w-full flex items-center justify-center gap-2 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors'
                    >
                      <Download className='w-4 h-4' />
                      Save Image
                    </button>

                    <div className='flex gap-3'>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('My daily cosmic insight from Lunary ✨')}&url=${encodeURIComponent('https://lunary.app')}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex-1 flex items-center justify-center gap-2 py-2.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors text-sm'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                        </svg>
                        X
                      </a>
                      <a
                        href={`https://www.threads.net/intent/post?text=${encodeURIComponent('My daily cosmic insight from Lunary ✨ lunary.app')}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex-1 flex items-center justify-center gap-2 py-2.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors text-sm'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='currentColor'
                          viewBox='0 0 640 640'
                        >
                          <path d='M427.5 299.7C429.7 300.6 431.7 301.6 433.8 302.5C463 316.6 484.4 337.7 495.6 363.9C511.3 400.4 512.8 459.7 465.3 507.1C429.1 543.3 385 559.6 322.7 560.1L322.4 560.1C252.2 559.6 198.3 536 162 489.9C129.7 448.9 113.1 391.8 112.5 320.3L112.5 319.8C113 248.3 129.6 191.2 161.9 150.2C198.2 104.1 252.2 80.5 322.4 80L322.7 80C393 80.5 447.6 104 485 149.9C503.4 172.6 517 199.9 525.6 231.6L485.2 242.4C478.1 216.6 467.4 194.6 453 177C423.8 141.2 380 122.8 322.5 122.4C265.5 122.9 222.4 141.2 194.3 176.8C168.1 210.1 154.5 258.3 154 320C154.5 381.7 168.1 429.9 194.3 463.3C222.3 498.9 265.5 517.2 322.5 517.7C373.9 517.3 407.9 505.1 436.2 476.8C468.5 444.6 467.9 405 457.6 380.9C451.5 366.7 440.5 354.9 425.7 346C422 372.9 413.9 394.3 401 410.8C383.9 432.6 359.6 444.4 328.3 446.1C304.7 447.4 282 441.7 264.4 430.1C243.6 416.3 231.4 395.3 230.1 370.8C227.6 322.5 265.8 287.8 325.3 284.4C346.4 283.2 366.2 284.1 384.5 287.2C382.1 272.4 377.2 260.6 369.9 252C359.9 240.3 344.3 234.3 323.7 234.2L323 234.2C306.4 234.2 284 238.8 269.7 260.5L235.3 236.9C254.5 207.8 285.6 191.8 323.1 191.8L323.9 191.8C386.5 192.2 423.8 231.3 427.6 299.5L427.4 299.7L427.5 299.7zM271.5 368.5C272.8 393.6 299.9 405.3 326.1 403.8C351.7 402.4 380.7 392.4 385.6 330.6C372.4 327.7 357.8 326.2 342.2 326.2C337.4 326.2 332.6 326.3 327.8 326.6C284.9 329 270.6 349.8 271.6 368.4L271.5 368.5z' />
                        </svg>
                        Threads
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className='flex-1 flex items-center justify-center gap-2 py-2.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors text-sm'
                      >
                        {copied ? (
                          <>
                            <Check className='w-4 h-4 text-green-400' />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className='w-4 h-4' />
                            Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
