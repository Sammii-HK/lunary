'use client';

import { useState, useCallback, useEffect } from 'react';
import { Share2, Lock } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface WeeklyPatternData {
  season: {
    name: string;
    suit: string;
    description: string;
  };
  suitDistribution: Array<{
    suit: string;
    percentage: number;
    count: number;
  }>;
  frequentCards: Array<{
    name: string;
    count: number;
  }>;
  period: number;
  readingCount: number;
}

interface ShareWeeklyPatternProps {
  onDataFetch?: () => Promise<WeeklyPatternData | null>;
}

export function ShareWeeklyPattern({ onDataFetch }: ShareWeeklyPatternProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareRecord, setShareRecord] = useState<{
    shareId: string;
    shareUrl: string;
  } | null>(null);
  const [patternData, setPatternData] = useState<WeeklyPatternData | null>(
    null,
  );
  const [hasEnoughData, setHasEnoughData] = useState(false);

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

  // Check if user has enough readings
  useEffect(() => {
    const checkData = async () => {
      if (onDataFetch) {
        const data = await onDataFetch();
        setPatternData(data);
        setHasEnoughData(data !== null && data.readingCount >= 3);
      }
    };
    checkData();
  }, [onDataFetch]);

  const generateCard = useCallback(async () => {
    if (!patternData) {
      setError('No pattern data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId ?? '';
      let currentShareUrl = shareRecord?.shareUrl ?? '';

      if (!currentShareId || !currentShareUrl) {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 6);

        const response = await fetch('/api/share/weekly-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.name?.split(' ')[0],
            season: patternData.season,
            topCards: patternData.frequentCards.slice(0, 3),
            dominantSuit: patternData.suitDistribution[0],
            dateRange: {
              start: weekStart.toISOString().split('T')[0],
              end: today.toISOString().split('T')[0],
            },
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

      const ogImageUrl = `/api/og/share/weekly-pattern?shareId=${encodeURIComponent(
        currentShareId,
      )}&format=${format}&v=${OG_IMAGE_VERSION}`;

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
  }, [patternData, shareRecord, format, user?.name, setLoading, setError]);

  const handleOpen = async () => {
    if (isInDemoMode()) {
      window.dispatchEvent(
        new CustomEvent('demo-action-blocked', {
          detail: { action: 'Sharing images' },
        }),
      );
      return;
    }
    openModal();
    shareTracking.shareInitiated(user?.id, 'weekly-pattern');
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

    const file = new File([imageBlob], 'my-week-in-tarot.png', {
      type: 'image/png',
    });
    const shareText = patternData
      ? `My week in tarot: ${patternData.season.name}`
      : 'My week in tarot';
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Week in Tarot',
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'weekly-pattern', 'native');
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
    a.download = 'my-week-in-tarot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'weekly-pattern', 'download');
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
      shareTracking.shareCompleted(user?.id, 'weekly-pattern', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialShareUrl = shareRecord?.shareUrl || 'https://lunary.app';
  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`My week in tarot: ${patternData?.season.name || 'Check it out!'}`)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`My week in tarot: ${patternData?.season.name || 'Check it out!'} ${socialShareUrl}`)}`,
  };

  // Show locked state if not enough readings
  if (!hasEnoughData) {
    return (
      <div className='flex flex-col items-center gap-2 p-4 border border-zinc-700/50 rounded-lg bg-zinc-900/30'>
        <Lock className='w-5 h-5 text-zinc-500' />
        <p className='text-sm text-zinc-400 text-center'>
          Share your weekly pattern after 3+ tarot readings
        </p>
        <p className='text-xs text-zinc-500'>
          {patternData?.readingCount || 0}/3 readings this week
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        onClick={handleOpen}
        className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-sm font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
      >
        <Share2 className='w-4 h-4' />
        Share This Week's Pattern
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Share Your Week in Tarot'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='My Week in Tarot'
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
              Track your tarot patterns at lunary.app
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
