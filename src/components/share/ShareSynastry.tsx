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
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface BigThree {
  sun?: string;
  moon?: string;
  rising?: string;
}

interface TopAspect {
  person1Planet: string;
  person2Planet: string;
  aspectType: string;
  isHarmonious: boolean;
}

interface ShareSynastryProps {
  userName?: string;
  friendName: string;
  compatibilityScore: number;
  summary: string;
  harmoniousAspects?: number;
  challengingAspects?: number;
  person1BigThree?: BigThree;
  person2BigThree?: BigThree;
  topAspects?: TopAspect[];
  elementBalance?: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  archetype?: string;
  buttonVariant?: 'default' | 'small' | 'icon';
}

export function ShareSynastry({
  userName,
  friendName,
  compatibilityScore,
  summary,
  harmoniousAspects,
  challengingAspects,
  person1BigThree,
  person2BigThree,
  topAspects,
  elementBalance,
  archetype,
  buttonVariant = 'default',
}: ShareSynastryProps) {
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
        const response = await fetch('/api/share/synastry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName,
            friendName,
            compatibilityScore,
            summary,
            harmoniousAspects,
            challengingAspects,
            person1BigThree,
            person2BigThree,
            topAspects,
            elementBalance,
            archetype,
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

      const ogImageUrl = `/api/og/share/synastry?shareId=${encodeURIComponent(
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
    userName,
    friendName,
    compatibilityScore,
    summary,
    harmoniousAspects,
    challengingAspects,
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
    shareTracking.shareInitiated(user?.id, 'synastry');
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

    const file = new File([imageBlob], 'synastry-compatibility.png', {
      type: 'image/png',
    });
    const shareText = `${compatibilityScore}% compatible with ${friendName}`;
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Synastry with ${friendName}`,
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'synastry', 'native');
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
    a.download = 'synastry-compatibility.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'synastry', 'download');
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
      shareTracking.shareCompleted(user?.id, 'synastry', 'clipboard');
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
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${compatibilityScore}% compatible with ${friendName} according to our synastry!`)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${compatibilityScore}% compatible with ${friendName} according to our synastry! ${socialShareUrl}`)}`,
  };

  const buttonClasses = {
    default:
      'inline-flex items-center gap-2 rounded-full border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-xs font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors',
    small:
      'inline-flex items-center gap-1.5 rounded-full border border-zinc-600 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors',
    icon: 'p-2 rounded-full border border-zinc-600 bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors',
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <button onClick={handleOpen} className={buttonClasses[buttonVariant]}>
        <Share2 className='w-4 h-4' />
        {buttonVariant !== 'icon' && 'Share'}
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Share Your Compatibility'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Synastry Compatibility'
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
              Discover your cosmic compatibility at lunary.app
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
