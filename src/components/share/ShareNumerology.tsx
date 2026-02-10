'use client';

import { useState, useCallback } from 'react';
import { Share2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import {
  calculateLifePath,
  calculateSoulUrge,
  calculateExpression,
  getNumberMeaning,
} from '@/lib/numerology';
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface ShareNumerologyProps {
  userName?: string;
  birthDate?: string;
}

export function ShareNumerology({ userName, birthDate }: ShareNumerologyProps) {
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

  const firstName = userName?.trim() ? userName.split(' ')[0] : '';

  // Calculate numerology numbers
  const lifePathCalc = birthDate ? calculateLifePath(birthDate) : null;
  const soulUrgeCalc = userName ? calculateSoulUrge(userName) : null;
  const expressionCalc = userName ? calculateExpression(userName) : null;

  const lifePath = lifePathCalc?.result;
  const soulUrge = soulUrgeCalc?.result;
  const expression = expressionCalc?.result;

  const generateCard = useCallback(async () => {
    if (!lifePath || !soulUrge || !expression) {
      setError('Missing numerology data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId ?? '';
      let currentShareUrl = shareRecord?.shareUrl ?? '';

      if (!currentShareId || !currentShareUrl) {
        const response = await fetch('/api/share/numerology', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: firstName,
            birthDate,
            lifePath,
            soulUrge,
            expression,
            lifePathMeaning: getNumberMeaning('life-path', lifePath),
            soulUrgeMeaning: getNumberMeaning('soul-urge', soulUrge),
            expressionMeaning: getNumberMeaning('expression', expression),
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

      const ogImageUrl = `/api/og/share/numerology?shareId=${encodeURIComponent(
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
  }, [
    firstName,
    birthDate,
    lifePath,
    soulUrge,
    expression,
    shareRecord,
    format,
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
    shareTracking.shareInitiated(user?.id, 'numerology');
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

    const file = new File([imageBlob], 'my-numerology.png', {
      type: 'image/png',
    });
    const shareText = `Life Path ${lifePath} • Soul Urge ${soulUrge} • Expression ${expression}`;
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${firstName ? `${firstName}'s` : 'My'} Numerology`,
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'numerology', 'native');
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
    a.download = 'my-numerology.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'numerology', 'download');
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
      shareTracking.shareCompleted(user?.id, 'numerology', 'clipboard');
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
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`My numerology: Life Path ${lifePath}, Soul Urge ${soulUrge}, Expression ${expression}`)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`My numerology: Life Path ${lifePath}, Soul Urge ${soulUrge}, Expression ${expression} ${socialShareUrl}`)}`,
  };

  // Don't show button if missing required data
  if (!lifePath || !soulUrge || !expression) {
    return null;
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        onClick={handleOpen}
        className='inline-flex items-center gap-2 rounded-full border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-xs font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
      >
        <Share2 className='w-4 h-4' />
        Share Numerology
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Share Your Numerology'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Your Numerology'
        />

        {!loading && !error && imageBlob && (
          <>
            <div className='mb-4'>
              <ShareFormatSelector
                selected={format}
                onChange={setFormat}
                options={['square', 'landscape']}
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
              Discover your personal numerology at lunary.app
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
