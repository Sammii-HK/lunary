'use client';

import { useState, useCallback } from 'react';
import { Share2, Flame } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface ShareStreakMilestoneProps {
  streakDays: number;
  totalReadings?: number;
  totalEntries?: number;
  totalRituals?: number;
  compact?: boolean;
}

export function ShareStreakMilestone({
  streakDays,
  totalReadings = 0,
  totalEntries = 0,
  totalRituals = 0,
  compact = false,
}: ShareStreakMilestoneProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareRecord, setShareRecord] = useState<{
    shareId: string;
    shareUrl: string;
  } | null>(null);

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

  const generateCard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId ?? '';
      let currentShareUrl = shareRecord?.shareUrl ?? '';

      if (!currentShareId || !currentShareUrl) {
        const response = await fetch('/api/share/streak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streakDays,
            totalReadings,
            totalEntries,
            totalRituals,
            userName: user?.name?.split(' ')[0],
            format,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            (data as { error?: string }).error || 'Failed to create share link',
          );
        }

        currentShareId = data.shareId;
        currentShareUrl = data.shareUrl;
        setShareRecord({ shareId: currentShareId, shareUrl: currentShareUrl });
        setLinkCopied(false);
      }

      const ogImageUrl = `/api/og/share/streak?shareId=${encodeURIComponent(
        currentShareId,
      )}&format=${format}&v=${OG_IMAGE_VERSION}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) throw new Error('Failed to generate image');

      const blob = await imageResponse.blob();
      setImageBlob(blob);
      return { shareId: currentShareId, shareUrl: currentShareUrl };
    } catch (err) {
      console.error('Error generating streak card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate card');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [
    shareRecord,
    format,
    streakDays,
    totalReadings,
    totalEntries,
    totalRituals,
    user?.name,
    setLoading,
    setError,
  ]);

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
    shareTracking.shareInitiated(user?.id, 'streak-milestone');
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

    const file = new File([imageBlob], 'streak-milestone.png', {
      type: 'image/png',
    });
    const shareText = `${streakDays} days of cosmic alignment!`;
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Streak Milestone',
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'streak-milestone', 'native');
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
    a.download = 'streak-milestone.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    shareTracking.shareCompleted(user?.id, 'streak-milestone', 'download');
  };

  const handleCopyLink = async () => {
    try {
      let shareInfo: { shareId: string; shareUrl: string } | null = shareRecord;
      if (!shareInfo) {
        shareInfo = (await generateCard()) ?? null;
      }
      const urlToCopy = shareInfo?.shareUrl;
      if (!urlToCopy) throw new Error('Share link unavailable');
      await navigator.clipboard.writeText(urlToCopy);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'streak-milestone', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialShareUrl = shareRecord?.shareUrl || 'https://lunary.app';
  const socialText = `${streakDays} days of cosmic alignment!`;

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${socialText} ${socialShareUrl}`)}`,
  };

  return (
    <>
      {compact ? (
        <button
          onClick={handleOpen}
          className='inline-flex items-center justify-center rounded-lg border border-orange-600 bg-orange-900/10 p-2 text-orange-200 hover:text-orange-100 hover:bg-orange-900/20 transition-colors'
          title='Share streak milestone'
        >
          <Share2 className='w-4 h-4' />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className='inline-flex items-center gap-2 rounded-lg border border-orange-500/50 bg-orange-900/20 px-4 py-2 text-sm font-medium text-orange-200 hover:text-white hover:bg-orange-900/30 hover:border-orange-400 transition-all'
        >
          <Flame className='w-4 h-4' />
          <Share2 className='w-4 h-4' />
          Share Milestone
        </button>
      )}

      <ShareModal isOpen={isOpen} onClose={closeModal} title='Streak Milestone'>
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Streak milestone share card'
        />

        {!loading && !error && imageBlob && (
          <>
            <div className='mb-4'>
              <ShareFormatSelector
                selected={format}
                onChange={setFormat}
                options={['square', 'story', 'landscape']}
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
