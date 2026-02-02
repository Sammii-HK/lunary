'use client';

import { useState, useCallback, useEffect } from 'react';
import { Share2, Award } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface RetrogradePeriod {
  planet: string;
  startDate: string;
  endDate: string;
  sign: string;
}

interface RetrogradeStatus {
  isActive: boolean;
  period?: RetrogradePeriod;
  survivalDays: number;
  isCompleted: boolean;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'diamond' | null;
}

interface ShareRetrogradeBadgeProps {
  retrogradeStatus?: RetrogradeStatus;
  onStatusFetch?: () => Promise<RetrogradeStatus | null>;
  compact?: boolean; // Icon-only mode for header integration
}

// Helper function to check if currently in Mercury retrograde
function getCurrentRetrogradeStatus(): RetrogradeStatus {
  const today = new Date();

  // 2026 Mercury Retrograde periods
  const retrogradePeriods: RetrogradePeriod[] = [
    {
      planet: 'Mercury',
      startDate: '2026-01-15',
      endDate: '2026-02-04',
      sign: 'Aquarius',
    },
    {
      planet: 'Mercury',
      startDate: '2026-05-10',
      endDate: '2026-06-03',
      sign: 'Gemini',
    },
    {
      planet: 'Mercury',
      startDate: '2026-09-09',
      endDate: '2026-09-30',
      sign: 'Virgo',
    },
    {
      planet: 'Mercury',
      startDate: '2026-12-29',
      endDate: '2027-01-18',
      sign: 'Capricorn',
    },
  ];

  // Check if in any retrograde period
  for (const period of retrogradePeriods) {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (today >= start && today <= end) {
      const daysDiff = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      const survivalDays = daysDiff + 1; // Include start day

      // Determine badge level
      let badgeLevel: 'bronze' | 'silver' | 'gold' | 'diamond' | null = null;
      if (survivalDays >= 3 && survivalDays < 10) {
        badgeLevel = 'bronze';
      } else if (survivalDays >= 10) {
        badgeLevel = 'silver';
      }

      return {
        isActive: true,
        period,
        survivalDays,
        isCompleted: false,
        badgeLevel,
      };
    }

    // Check if just completed (within 3 days after end)
    const threeDaysAfter = new Date(end);
    threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

    if (today > end && today <= threeDaysAfter) {
      const totalDays =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      return {
        isActive: false,
        period,
        survivalDays: totalDays,
        isCompleted: true,
        badgeLevel: 'gold',
      };
    }
  }

  return {
    isActive: false,
    survivalDays: 0,
    isCompleted: false,
    badgeLevel: null,
  };
}

export function ShareRetrogradeBadge({
  retrogradeStatus,
  onStatusFetch,
  compact = false,
}: ShareRetrogradeBadgeProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareRecord, setShareRecord] = useState<{
    shareId: string;
    shareUrl: string;
  } | null>(null);
  const [status, setStatus] = useState<RetrogradeStatus | null>(
    retrogradeStatus || null,
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

  // Check retrograde status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (onStatusFetch) {
        const fetchedStatus = await onStatusFetch();
        setStatus(fetchedStatus);
      } else {
        const currentStatus = getCurrentRetrogradeStatus();
        setStatus(currentStatus);
      }
    };
    checkStatus();
  }, [onStatusFetch]);

  const generateCard = useCallback(async () => {
    if (!status || !status.badgeLevel) {
      setError('No badge available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId;
      let currentShareUrl = shareRecord?.shareUrl;

      if (!currentShareId || !currentShareUrl) {
        const response = await fetch('/api/share/retrograde-badge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.name?.split(' ')[0],
            planet: status.period?.planet || 'Mercury',
            badgeLevel: status.badgeLevel,
            survivalDays: status.survivalDays,
            isCompleted: status.isCompleted,
            retrogradeStart: status.period?.startDate,
            retrogradeEnd: status.period?.endDate,
            sign: status.period?.sign,
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

      const ogImageUrl = `/api/og/share/retrograde-badge?shareId=${encodeURIComponent(
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
  }, [status, shareRecord, format, user?.name, setLoading, setError]);

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
    shareTracking.shareInitiated(user?.id, 'retrograde-badge');
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

    const fileName = status?.isCompleted
      ? 'mercury-retrograde-survivor.png'
      : 'mercury-retrograde-badge.png';
    const file = new File([imageBlob], fileName, { type: 'image/png' });

    const shareText = status?.isCompleted
      ? `I survived Mercury Retrograde! 🏆`
      : `Day ${status?.survivalDays} of Mercury Retrograde 💪`;

    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Mercury Retrograde Survival Badge',
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'retrograde-badge', 'native');
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
    a.download = status?.isCompleted
      ? 'mercury-retrograde-survivor.png'
      : 'mercury-retrograde-badge.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'retrograde-badge', 'download');
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
      shareTracking.shareCompleted(user?.id, 'retrograde-badge', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialShareUrl = shareRecord?.shareUrl || 'https://lunary.app';
  const socialText = status?.isCompleted
    ? `I survived Mercury Retrograde! 🏆`
    : `Day ${status?.survivalDays} of Mercury Retrograde 💪`;

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${socialText} ${socialShareUrl}`)}`,
  };

  // Don't show button if not in retrograde or no badge earned
  if (
    !status ||
    !status.badgeLevel ||
    (!status.isActive && !status.isCompleted)
  ) {
    return null;
  }

  const badgeLabels = {
    bronze: 'Bronze Survivor',
    silver: 'Halfway Hero',
    gold: 'Completed Unscathed',
    diamond: 'Unscathed Champion',
  };

  const buttonText = status.isCompleted
    ? 'Share Survival Badge'
    : `Share Day ${status.survivalDays} Badge`;

  return (
    <>
      {compact ? (
        // Compact mode (icon only for header)
        <button
          onClick={handleOpen}
          className='inline-flex items-center justify-center rounded-lg border border-amber-600 bg-amber-900/10 p-2 text-amber-200 hover:text-amber-100 hover:bg-amber-900/20 transition-colors'
          title={buttonText}
        >
          <Share2 className='w-4 h-4' />
        </button>
      ) : (
        // Full display mode with enhanced design
        <div className='flex flex-col items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-2 border-amber-500/60'>
          <div className='flex items-center gap-2'>
            <Award className='w-5 h-5 text-amber-400' />
            <span className='text-sm font-semibold text-amber-200'>
              {status.isCompleted
                ? 'Retrograde Survivor!'
                : `Day ${status.survivalDays} Survivor`}
            </span>
          </div>

          {/* Progress indicator */}
          <div className='w-full max-w-xs'>
            <div className='h-1.5 bg-amber-950/50 rounded-full overflow-hidden'>
              <div
                className='h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500'
                style={{
                  width: `${Math.min((status.survivalDays / 21) * 100, 100)}%`,
                }}
              />
            </div>
            <div className='flex justify-between mt-1 text-xs text-amber-300/60'>
              <span>Start</span>
              <span>{status.survivalDays} / 21 days</span>
            </div>
          </div>

          <button
            onClick={handleOpen}
            className='inline-flex items-center gap-2 rounded-lg border-2 border-amber-500 bg-amber-900/30 px-4 py-2 text-sm font-medium text-amber-100 hover:text-white hover:bg-amber-900/50 hover:border-amber-400 transition-all'
          >
            <Share2 className='w-4 h-4' />
            {buttonText}
          </button>
        </div>
      )}

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Mercury Retrograde Survival Badge'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Mercury Retrograde Survival Badge'
        />

        {!loading && !error && imageBlob && (
          <>
            <div className='mb-4'>
              <ShareFormatSelector
                selected={format}
                onChange={setFormat}
                options={['square', 'story']}
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
              Survive Mercury Retrograde with lunary.app
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
    </>
  );
}
