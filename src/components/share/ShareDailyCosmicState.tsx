'use client';

import { useState, useCallback, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { getCosmicContextForDate } from '@/lib/cosmic/cosmic-context-utils';

interface DailyCosmicStateData {
  moonPhase: {
    name: string;
    icon: {
      src: string;
      alt: string;
    };
  };
  zodiacSeason: string;
  insight: string;
  transit?: {
    headline: string;
    description: string;
  };
  date: string;
}

interface ShareDailyCosmicStateProps {
  generalInsight?: string;
  transitInfo?: {
    headline: string;
    description: string;
  };
}

export function ShareDailyCosmicState({
  generalInsight = 'Follow the cosmic flow and trust your intuition today',
  transitInfo,
}: ShareDailyCosmicStateProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [cosmicData, setCosmicData] = useState<DailyCosmicStateData | null>(
    null,
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

  // Calculate today's cosmic state
  useEffect(() => {
    const today = new Date();
    const cosmicContext = getCosmicContextForDate(today);

    // Get zodiac season
    const zodiacSeason = getZodiacSeasonForDate(today);

    setCosmicData({
      moonPhase: cosmicContext.moonPhase,
      zodiacSeason,
      insight: generalInsight,
      transit: transitInfo,
      date: today.toISOString().split('T')[0],
    });
  }, [generalInsight, transitInfo]);

  const generateCard = useCallback(async () => {
    if (!cosmicData) {
      setError('No cosmic data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/share/cosmic-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name?.split(' ')[0],
          ...cosmicData,
          format,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (data as { error?: string }).error || 'Failed to create share',
        );
      }

      if (!data.shareId) {
        throw new Error('Failed to generate share');
      }

      const ogImageUrl = `/api/og/share/cosmic-state?shareId=${encodeURIComponent(
        data.shareId,
      )}&format=${format}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) throw new Error('Failed to generate image');

      const blob = await imageResponse.blob();
      setImageBlob(blob);
      return { shareId: data.shareId, shareUrl: data.shareUrl };
    } catch (err) {
      console.error('Error generating card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate card');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [cosmicData, format, user?.name, setLoading, setError]);

  const handleOpen = async () => {
    openModal();
    shareTracking.shareInitiated(user?.id, 'cosmic-state');
    if (!imageBlob) {
      await generateCard();
    }
  };

  const handleShare = async () => {
    if (!imageBlob) return;

    const file = new File([imageBlob], 'todays-cosmic-state.png', {
      type: 'image/png',
    });
    const shareText = cosmicData
      ? `Today's cosmic state: ${cosmicData.moonPhase.name} in ${cosmicData.zodiacSeason} Season`
      : "Today's cosmic state";

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Today's Cosmic State",
          text: shareText,
        });
        shareTracking.shareCompleted(user?.id, 'cosmic-state', 'native');
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
    a.download = 'todays-cosmic-state.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'cosmic-state', 'download');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://lunary.app');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'cosmic-state', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Today's cosmic state ✨")}&url=${encodeURIComponent('https://lunary.app')}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent("Today's cosmic state ✨ lunary.app")}`,
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        onClick={handleOpen}
        className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-sm font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
      >
        <Share2 className='w-4 h-4' />
        Share Today's Cosmic State
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title="Share Today's Cosmic State"
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt="Today's Cosmic State"
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

            <p className='mt-4 text-xs text-zinc-400 text-center'>
              Check your daily cosmic state at lunary.app
            </p>
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
    </div>
  );
}

// Helper function to get zodiac season
function getZodiacSeasonForDate(date: Date): string {
  const ZODIAC_SEASONS = [
    {
      sign: 'Capricorn',
      startMonth: 12,
      startDay: 22,
      endMonth: 1,
      endDay: 19,
    },
    { sign: 'Aquarius', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { sign: 'Pisces', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
    { sign: 'Aries', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { sign: 'Taurus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { sign: 'Gemini', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { sign: 'Cancer', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { sign: 'Leo', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { sign: 'Virgo', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { sign: 'Libra', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { sign: 'Scorpio', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    {
      sign: 'Sagittarius',
      startMonth: 11,
      startDay: 22,
      endMonth: 12,
      endDay: 21,
    },
  ];

  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const season of ZODIAC_SEASONS) {
    if (season.startMonth <= season.endMonth) {
      if (
        (month === season.startMonth && day >= season.startDay) ||
        (month === season.endMonth && day <= season.endDay) ||
        (month > season.startMonth && month < season.endMonth)
      ) {
        return season.sign;
      }
    } else {
      if (
        (month === season.startMonth && day >= season.startDay) ||
        (month === season.endMonth && day <= season.endDay) ||
        month > season.startMonth ||
        month < season.endMonth
      ) {
        return season.sign;
      }
    }
  }

  return 'Aquarius';
}
