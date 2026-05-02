'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Share2 } from 'lucide-react';
import { ShareIconButton } from '@/components/share/ShareIconButton';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { isInDemoMode } from '@/lib/demo-mode';

interface ShareMoonPhaseProps {
  moonPhase: string;
  moonSign?: string;
  illumination?: number;
  compact?: boolean;
}

export function ShareMoonPhase({
  moonPhase,
  moonSign,
  illumination,
  compact = false,
}: ShareMoonPhaseProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const lastGeneratedFormatRef = useRef<string | null>(null);

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

      // Build the OG image URL for moon
      const params = new URLSearchParams({
        phase: moonPhase,
        date: dateStr,
      });

      if (moonSign) {
        params.set('sign', moonSign);
      }

      if (illumination !== undefined) {
        params.set('illumination', illumination.toString());
      }

      const ogImageUrl = `/api/og/moon?${params.toString()}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await imageResponse.blob();
      setImageBlob(blob);

      shareTracking.shareViewed(user?.id || 'anonymous', 'moon-phase', format);
    } catch (err) {
      console.error('Generate card error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate share image',
      );
    } finally {
      setLoading(false);
    }
  }, [moonPhase, moonSign, illumination, format, user, setLoading, setError]);

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
    shareTracking.shareInitiated(user?.id, 'moon-phase');
    if (!imageBlob) {
      lastGeneratedFormatRef.current = format;
      generateCard();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (loading || error || !imageBlob) return;
    if (lastGeneratedFormatRef.current === format) return;

    lastGeneratedFormatRef.current = format;
    generateCard();
  }, [error, format, generateCard, imageBlob, isOpen, loading]);

  const handleShare = async () => {
    if (!imageBlob) return;

    const file = new File([imageBlob], 'moon-phase.png', {
      type: 'image/png',
    });
    const shareText = moonSign ? `${moonPhase} in ${moonSign}` : moonPhase;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Moon Phase: ${moonPhase}`,
          text: shareText,
        });
        shareTracking.shareCompleted(user?.id, 'moon-phase', 'native');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleDownload();
    }
  };

  function handleDownload() {
    if (!imageBlob) return;

    const url = URL.createObjectURL(imageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moon-phase.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'moon-phase', 'download');
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://lunary.app/moon-calendar');
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      shareTracking.shareCompleted(user?.id, 'moon-phase', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const shareText = moonSign ? `${moonPhase} in ${moonSign}` : moonPhase;

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Today's moon: ${shareText} 🌙`)}&url=${encodeURIComponent('https://lunary.app/moon-calendar')}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`Today's moon: ${shareText} 🌙 lunary.app/moon-calendar`)}`,
  };

  return (
    <div className='flex items-center justify-center'>
      {compact ? (
        <ShareIconButton
          label='Share Moon Phase'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpen();
          }}
        />
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpen();
          }}
          className='inline-flex items-center gap-2 rounded-full border border-stroke-default px-4 py-2 text-xs font-semibold tracking-wide uppercase text-content-primary transition hover:border-lunary-primary-500 hover:text-content-primary'
        >
          <Share2 className='w-3.5 h-3.5' />
          Share
        </button>
      )}

      <ShareModal isOpen={isOpen} onClose={closeModal} title='Share Moon Phase'>
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Moon Phase'
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

            <p className='mt-4 text-xs text-content-muted text-center'>
              Track the moon at lunary.app
            </p>
          </>
        )}

        {error && (
          <div className='text-center py-8'>
            <p className='text-red-400 mb-4'>{error}</p>
            <button
              onClick={generateCard}
              className='px-4 py-2 bg-lunary-primary-600 hover:bg-layer-high text-white rounded-lg transition-colors'
            >
              Try Again
            </button>
          </div>
        )}
      </ShareModal>
    </div>
  );
}
