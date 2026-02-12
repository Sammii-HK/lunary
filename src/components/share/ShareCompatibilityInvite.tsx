'use client';

import { useState, useCallback } from 'react';
import { Share2, Heart } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface ShareCompatibilityInviteProps {
  inviterName: string;
  inviterSign: string;
  inviterBigThree?: { sun: string; moon: string; rising: string };
  inviteCode: string;
  referralCode?: string;
  compact?: boolean;
}

export function ShareCompatibilityInvite({
  inviterName,
  inviterSign,
  inviterBigThree,
  inviteCode,
  referralCode,
  compact = false,
}: ShareCompatibilityInviteProps) {
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
        const response = await fetch('/api/share/compat-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inviterName,
            inviterSign,
            inviterBigThree,
            inviteCode,
            referralCode,
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

      const ogImageUrl = `/api/og/share/compat-invite?shareId=${encodeURIComponent(
        currentShareId,
      )}&format=${format}&v=${OG_IMAGE_VERSION}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) throw new Error('Failed to generate image');

      const blob = await imageResponse.blob();
      setImageBlob(blob);
      return { shareId: currentShareId, shareUrl: currentShareUrl };
    } catch (err) {
      console.error('Error generating compat invite card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate card');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [
    shareRecord,
    format,
    inviterName,
    inviterSign,
    inviterBigThree,
    inviteCode,
    referralCode,
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
    shareTracking.shareInitiated(user?.id, 'compat-invite');
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

    const file = new File([imageBlob], 'compatibility-invite.png', {
      type: 'image/png',
    });
    const shareText = `Check our cosmic compatibility!`;
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Cosmic Compatibility',
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'compat-invite', 'native');
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
    a.download = 'compatibility-invite.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    shareTracking.shareCompleted(user?.id, 'compat-invite', 'download');
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
      shareTracking.shareCompleted(user?.id, 'compat-invite', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialShareUrl = shareRecord?.shareUrl || 'https://lunary.app';
  const socialText = `Check our cosmic compatibility!`;

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${socialText} ${socialShareUrl}`)}`,
  };

  return (
    <>
      {compact ? (
        <button
          onClick={handleOpen}
          className='inline-flex items-center justify-center rounded-lg border border-lunary-primary-600 bg-lunary-primary-900/10 p-2 text-lunary-primary-300 hover:text-lunary-primary-200 hover:bg-lunary-primary-900/20 transition-colors'
          title='Invite to check compatibility'
        >
          <Heart className='w-4 h-4' />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-500/50 bg-lunary-primary-900/20 px-4 py-2 text-sm font-medium text-lunary-primary-200 hover:text-white hover:bg-lunary-primary-900/30 hover:border-lunary-primary-400 transition-all'
        >
          <Heart className='w-4 h-4' />
          <Share2 className='w-4 h-4' />
          Invite to Check Compatibility
        </button>
      )}

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Compatibility Invite'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Compatibility invite share card'
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
