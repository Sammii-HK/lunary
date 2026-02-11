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

interface ShareHoroscopeProps {
  sunSign: string;
  headline: string;
  overview: string;
  numerologyNumber?: number;
  transitInfo?: {
    planet: string;
    headline: string;
  };
  compact?: boolean;
}

export function ShareHoroscope({
  sunSign,
  headline,
  overview,
  numerologyNumber,
  transitInfo,
  compact = false,
}: ShareHoroscopeProps) {
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
        const today = new Date();
        const response = await fetch('/api/share/horoscope', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.name?.split(' ')[0],
            sunSign,
            headline,
            overview: overview.substring(0, 200), // Limit for OG
            numerologyNumber,
            transitInfo,
            date: today.toISOString().split('T')[0],
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

      const ogImageUrl = `/api/og/share/horoscope?shareId=${encodeURIComponent(currentShareId)}&format=${format}&v=${OG_IMAGE_VERSION}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await imageResponse.blob();
      setImageBlob(blob);

      shareTracking.shareViewed(user?.id || 'anonymous', 'horoscope', format);
    } catch (err) {
      console.error('Generate card error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate share image',
      );
    } finally {
      setLoading(false);
    }
  }, [
    sunSign,
    headline,
    overview,
    numerologyNumber,
    transitInfo,
    format,
    shareRecord,
    user,
    setLoading,
    setError,
  ]);

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

    const file = new File([imageBlob], 'horoscope.png', {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${sunSign} Horoscope`,
          text: headline,
        });
        shareTracking.shareCompleted(user?.id, 'horoscope', 'native');
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
    a.download = 'horoscope.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'horoscope', 'download');
  };

  const handleCopyLink = async () => {
    if (!shareRecord?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareRecord.shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'horoscope', 'clipboard');
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
        x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`My ${sunSign} horoscope`)}&url=${encodeURIComponent(shareRecord.shareUrl)}`,
        threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`My ${sunSign} horoscope ${shareRecord.shareUrl}`)}`,
      }
    : undefined;

  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        onClick={handleOpen}
        className={
          compact
            ? 'inline-flex items-center justify-center rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-2 text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
            : 'inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-zinc-200 transition hover:border-lunary-primary-500 hover:text-white'
        }
        title={compact ? 'Share Horoscope' : undefined}
      >
        <Share2 className='w-4 h-4' />
        {!compact && 'Share Horoscope'}
      </button>

      <ShareModal isOpen={isOpen} onClose={closeModal} title='Share Horoscope'>
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Horoscope'
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
              Check your daily horoscope at lunary.app
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
