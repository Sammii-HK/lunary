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
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface TarotPatternData {
  topCards: Array<{ name: string; count: number }>;
  dominantSuit: { name: string; percentage: number };
  dateRange: { start: string; end: string };
  readingCount: number;
}

interface ShareTarotPatternProps {
  onDataFetch?: () => Promise<TarotPatternData | null>;
  compact?: boolean;
}

export function ShareTarotPattern({
  onDataFetch,
  compact = false,
}: ShareTarotPatternProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareRecord, setShareRecord] = useState<{
    shareId: string;
    shareUrl: string;
  } | null>(null);
  const [patternData, setPatternData] = useState<TarotPatternData | null>(null);

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

  // Fetch pattern data
  useEffect(() => {
    const fetchData = async () => {
      if (onDataFetch) {
        const data = await onDataFetch();
        setPatternData(data);
      }
    };
    fetchData();
  }, [onDataFetch]);

  const generateCard = useCallback(async () => {
    if (!patternData) {
      setError('No pattern data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId;
      let currentShareUrl = shareRecord?.shareUrl;

      if (!currentShareId || !currentShareUrl) {
        const response = await fetch('/api/share/tarot-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.name?.split(' ')[0],
            topCards: patternData.topCards,
            dominantSuit: patternData.dominantSuit,
            dateRange: patternData.dateRange,
            readingCount: patternData.readingCount,
            format,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            (data as { error?: string }).error || 'Failed to create share',
          );
        }

        if (!data.shareId || !data.shareUrl) {
          throw new Error('Failed to generate share');
        }

        currentShareId = data.shareId;
        currentShareUrl = data.shareUrl;

        setShareRecord({
          shareId: currentShareId,
          shareUrl: currentShareUrl,
        });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
      const ogImageUrl = `${baseUrl}/api/og/share/tarot-pattern?shareId=${currentShareId}&format=${format}&v=${OG_IMAGE_VERSION}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await imageResponse.blob();
      setImageBlob(blob);

      shareTracking.shareViewed(user?.id, 'tarot-pattern', format);
    } catch (err) {
      console.error('Generate card error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate share image',
      );
    } finally {
      setLoading(false);
    }
  }, [patternData, format, shareRecord, user, setLoading, setError]);

  const handleOpen = () => {
    if (isInDemoMode()) {
      window.dispatchEvent(
        new CustomEvent('demo-action-blocked', {
          detail: { action: 'Sharing images' },
        }),
      );
      return;
    }
    openModal();
    if (!imageBlob) {
      generateCard();
    }
  };

  useEffect(() => {
    if (isOpen && !loading && !error && imageBlob) {
      generateCard();
    }
  }, [format]);

  const handleShare = async () => {
    if (!imageBlob) return;

    const file = new File([imageBlob], 'tarot-pattern.png', {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Tarot Pattern',
          text: 'My tarot reading pattern',
        });
        shareTracking.shareCompleted(user?.id, 'tarot-pattern', 'native');
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
    a.download = 'tarot-pattern.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'tarot-pattern', 'download');
  };

  const handleCopyLink = async () => {
    if (!shareRecord?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareRecord.shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'tarot-pattern', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialUrls = shareRecord?.shareUrl
    ? {
        x: `https://twitter.com/intent/tweet?text=${encodeURIComponent('My tarot pattern')}&url=${encodeURIComponent(shareRecord.shareUrl)}`,
        threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`My tarot pattern ${shareRecord.shareUrl}`)}`,
      }
    : undefined;

  // Don't show if no data
  if (!patternData) {
    return null;
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        onClick={handleOpen}
        className={
          compact
            ? 'inline-flex items-center justify-center rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-2 text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
            : 'inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-sm font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
        }
        title={compact ? 'Share Tarot Pattern' : undefined}
      >
        <Share2 className='w-4 h-4' />
        {!compact && 'Share Pattern'}
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Share Tarot Pattern'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Tarot Pattern'
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
