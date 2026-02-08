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

interface ShareDailyTarotCardProps {
  cardName: string;
  keywords: string[];
  isPersonalized?: boolean;
  compact?: boolean;
}

export function ShareDailyTarotCard({
  cardName,
  keywords,
  isPersonalized = false,
  compact = false,
}: ShareDailyTarotCardProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const firstName = user?.name?.split(' ')[0];

      // Build the OG image URL directly
      const params = new URLSearchParams({
        card: cardName,
        timeframe: 'Daily',
        keywords: keywords.join(','),
        date: dateStr,
      });

      if (firstName) {
        params.set('name', firstName);
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
      const ogImageUrl = `${baseUrl}/api/og/share/tarot?${params.toString()}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await imageResponse.blob();
      setImageBlob(blob);

      shareTracking.shareViewed(user?.id || 'anonymous', 'daily-tarot', format);
    } catch (err) {
      console.error('Generate card error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate share image',
      );
    } finally {
      setLoading(false);
    }
  }, [cardName, keywords, format, user, setLoading, setError]);

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
    shareTracking.shareInitiated(user?.id, 'daily-tarot');
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

    const file = new File([imageBlob], 'daily-tarot.png', {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Daily Tarot: ${cardName}`,
          text: `My daily tarot card is ${cardName}`,
        });
        shareTracking.shareCompleted(user?.id, 'daily-tarot', 'native');
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
    a.download = 'daily-tarot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'daily-tarot', 'download');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://lunary.app/tarot');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'daily-tarot', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`My daily tarot card is ${cardName}`)}&url=${encodeURIComponent('https://lunary.app/tarot')}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`My daily tarot card is ${cardName} lunary.app/tarot`)}`,
  };

  return (
    <div className='flex items-center justify-center'>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpen();
        }}
        className={
          compact
            ? 'inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:text-lunary-accent-300 hover:bg-zinc-800/50 transition-colors'
            : 'inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold tracking-wide uppercase text-zinc-200 transition hover:border-lunary-primary-500 hover:text-white'
        }
        title='Share Daily Card'
      >
        <Share2 className='w-3.5 h-3.5' />
        {!compact && 'Share'}
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Share Daily Tarot'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Daily Tarot Card'
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
              Get your daily tarot at lunary.app
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
