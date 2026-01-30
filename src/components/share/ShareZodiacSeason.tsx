'use client';

import { useState, useCallback, useEffect } from 'react';
import { Share2, Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';

interface ZodiacSeasonData {
  sign: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  startDate: string;
  endDate: string;
  themes: string[];
  symbol: string; // Unicode zodiac symbol
}

interface ShareZodiacSeasonProps {
  currentSeason?: ZodiacSeasonData;
  onSeasonFetch?: () => Promise<ZodiacSeasonData | null>;
}

// Zodiac sign metadata
const ZODIAC_METADATA: Record<
  string,
  {
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
    modality: 'Cardinal' | 'Fixed' | 'Mutable';
    themes: string[];
    symbol: string;
  }
> = {
  Aries: {
    element: 'Fire',
    modality: 'Cardinal',
    themes: ['Initiative', 'Courage', 'Action'],
    symbol: '♈',
  },
  Taurus: {
    element: 'Earth',
    modality: 'Fixed',
    themes: ['Stability', 'Pleasure', 'Values'],
    symbol: '♉',
  },
  Gemini: {
    element: 'Air',
    modality: 'Mutable',
    themes: ['Communication', 'Curiosity', 'Connection'],
    symbol: '♊',
  },
  Cancer: {
    element: 'Water',
    modality: 'Cardinal',
    themes: ['Emotion', 'Nurture', 'Home'],
    symbol: '♋',
  },
  Leo: {
    element: 'Fire',
    modality: 'Fixed',
    themes: ['Creativity', 'Expression', 'Joy'],
    symbol: '♌',
  },
  Virgo: {
    element: 'Earth',
    modality: 'Mutable',
    themes: ['Service', 'Precision', 'Health'],
    symbol: '♍',
  },
  Libra: {
    element: 'Air',
    modality: 'Cardinal',
    themes: ['Balance', 'Harmony', 'Relationships'],
    symbol: '♎',
  },
  Scorpio: {
    element: 'Water',
    modality: 'Fixed',
    themes: ['Transformation', 'Depth', 'Power'],
    symbol: '♏',
  },
  Sagittarius: {
    element: 'Fire',
    modality: 'Mutable',
    themes: ['Adventure', 'Wisdom', 'Expansion'],
    symbol: '♐',
  },
  Capricorn: {
    element: 'Earth',
    modality: 'Cardinal',
    themes: ['Ambition', 'Structure', 'Achievement'],
    symbol: '♑',
  },
  Aquarius: {
    element: 'Air',
    modality: 'Fixed',
    themes: ['Innovation', 'Community', 'Vision'],
    symbol: '♒',
  },
  Pisces: {
    element: 'Water',
    modality: 'Mutable',
    themes: ['Compassion', 'Intuition', 'Dreams'],
    symbol: '♓',
  },
};

const ZODIAC_SEASONS = [
  { sign: 'Capricorn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
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

// Helper function to check if we're in a season transition window (±3 days)
function getCurrentSeasonIfTransitioning(): ZodiacSeasonData | null {
  const today = new Date();
  const year = today.getFullYear();

  for (const season of ZODIAC_SEASONS) {
    const metadata = ZODIAC_METADATA[season.sign];
    if (!metadata) continue;

    // Calculate season start date
    let startDate = new Date(year, season.startMonth - 1, season.startDay);

    // Handle year transition for Capricorn
    if (season.sign === 'Capricorn' && season.startMonth === 12) {
      if (today.getMonth() === 0) {
        // If today is in January, Capricorn season started last year
        startDate = new Date(year - 1, season.startMonth - 1, season.startDay);
      }
    }

    // Calculate end date
    let endMonth = season.endMonth - 1;
    let endYear = year;
    if (season.startMonth > season.endMonth) {
      endYear = year + 1;
    }
    const endDate = new Date(endYear, endMonth, season.endDay);

    // Check if we're within ±3 days of season start
    const threeDaysBefore = new Date(startDate);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
    const threeDaysAfter = new Date(startDate);
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

    if (today >= threeDaysBefore && today <= threeDaysAfter) {
      return {
        sign: season.sign,
        element: metadata.element,
        modality: metadata.modality,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        themes: metadata.themes,
        symbol: metadata.symbol,
      };
    }
  }

  return null;
}

export function ShareZodiacSeason({
  currentSeason,
  onSeasonFetch,
}: ShareZodiacSeasonProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareRecord, setShareRecord] = useState<{
    shareId: string;
    shareUrl: string;
  } | null>(null);
  const [seasonData, setSeasonData] = useState<ZodiacSeasonData | null>(
    currentSeason || null,
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

  // Check if we're in a season transition
  useEffect(() => {
    const checkSeason = async () => {
      if (onSeasonFetch) {
        const fetchedSeason = await onSeasonFetch();
        setSeasonData(fetchedSeason);
      } else {
        const currentTransition = getCurrentSeasonIfTransitioning();
        setSeasonData(currentTransition);
      }
    };
    checkSeason();
  }, [onSeasonFetch]);

  const generateCard = useCallback(async () => {
    if (!seasonData) {
      setError('No season data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId;
      let currentShareUrl = shareRecord?.shareUrl;

      if (!currentShareId || !currentShareUrl) {
        const response = await fetch('/api/share/zodiac-season', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.name?.split(' ')[0],
            sign: seasonData.sign,
            element: seasonData.element,
            modality: seasonData.modality,
            startDate: seasonData.startDate,
            endDate: seasonData.endDate,
            themes: seasonData.themes,
            symbol: seasonData.symbol,
            format,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            (data as { error?: string }).error || 'Failed to create share link',
          );
        }

        if (!data.shareId || !data.shareUrl) {
          throw new Error('Share API did not return a link');
        }

        currentShareId = data.shareId;
        currentShareUrl = data.shareUrl;

        setShareRecord({ shareId: currentShareId, shareUrl: currentShareUrl });
        setLinkCopied(false);
      }

      const ogImageUrl = `/api/og/share/zodiac-season?shareId=${encodeURIComponent(
        currentShareId,
      )}&format=${format}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) throw new Error('Failed to generate image');

      const blob = await imageResponse.blob();
      setImageBlob(blob);
      return { shareId: currentShareId, shareUrl: currentShareUrl };
    } catch (err) {
      console.error('Error generating card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate card');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [seasonData, shareRecord, format, user?.name, setLoading, setError]);

  const handleOpen = async () => {
    openModal();
    shareTracking.shareInitiated(user?.id, 'zodiac-season');
    if (!imageBlob) {
      await generateCard();
    }
  };

  const handleShare = async () => {
    if (!imageBlob) return;

    let shareInfo: { shareId: string; shareUrl: string } | null = shareRecord;
    if (!shareInfo) {
      shareInfo = (await generateCard()) ?? null;
    }

    const file = new File(
      [imageBlob],
      `${seasonData?.sign.toLowerCase()}-season.png`,
      { type: 'image/png' },
    );

    const shareText = `Happy ${seasonData?.sign} Season! ✨`;
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${seasonData?.sign} Season`,
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'zodiac-season', 'native');
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
    a.download = `${seasonData?.sign.toLowerCase()}-season.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'zodiac-season', 'download');
  };

  const handleCopyLink = async () => {
    try {
      let shareInfo: { shareId: string; shareUrl: string } | null = shareRecord;
      if (!shareInfo) {
        shareInfo = (await generateCard()) ?? null;
      }
      const urlToCopy = shareInfo?.shareUrl;
      if (!urlToCopy) {
        throw new Error('Share link unavailable');
      }
      await navigator.clipboard.writeText(urlToCopy);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'zodiac-season', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialShareUrl = shareRecord?.shareUrl || 'https://lunary.app';
  const socialText = `Happy ${seasonData?.sign} Season! ✨`;

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${socialText} ${socialShareUrl}`)}`,
  };

  // Don't show button if not in season transition window
  if (!seasonData) {
    return null;
  }

  return (
    <div className='flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-lunary-primary-700/50 bg-lunary-primary-900/5'>
      <div className='flex items-center gap-2 text-sm text-lunary-primary-200'>
        <Sparkles className='w-4 h-4' />
        <span>Welcome to {seasonData.sign} Season!</span>
      </div>

      <p className='text-xs text-zinc-400 text-center'>
        {seasonData.themes.join(' • ')}
      </p>

      <button
        onClick={handleOpen}
        className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-sm font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors mt-2'
      >
        <Share2 className='w-4 h-4' />
        Share {seasonData.sign} Season
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title={`${seasonData.sign} Season`}
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt={`${seasonData.sign} Season`}
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
              Explore the cosmic weather at lunary.app
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
