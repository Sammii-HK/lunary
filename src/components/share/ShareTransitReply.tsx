'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareImageModal } from '@/components/og/ShareImageModal';
import { useOgShareModal } from '@/hooks/useOgShareModal';
import { useUser } from '@/context/UserContext';
import type { BirthChartData } from '@utils/astrology/birthChart';

type ShareTransitReplyProps = {
  birthChart: BirthChartData[];
  compact?: boolean;
};

export function ShareTransitReply({
  birthChart,
  compact = false,
}: ShareTransitReplyProps) {
  const { user } = useUser();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const {
    shareTarget,
    sharePreviewUrl,
    shareLoading,
    shareError,
    isOpen,
    openShareModal,
    closeShareModal,
    handleShareImage,
    handleDownloadShareImage,
    handleCopyShareLink,
  } = useOgShareModal();

  const handleOpen = async () => {
    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/share/transit-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name?.split(' ')[0],
          birthChart,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to create transit overlay share');
      }

      await openShareModal({
        title: 'Share transit overlay',
        description:
          'Natal chart inside, live transits outside, and the strongest active contacts.',
        pageUrl: data.shareUrl,
        ogUrl: data.imageUrl,
      });
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Unable to create transit overlay share',
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Button
        type='button'
        variant={compact ? 'outline' : 'default'}
        size={compact ? 'icon' : 'default'}
        onClick={handleOpen}
        disabled={creating || birthChart.length < 3}
        className={compact ? 'rounded-full' : 'gap-2'}
        title='Share transit overlay'
      >
        <Share2 className='h-4 w-4' />
        {!compact && (creating ? 'Creating...' : 'Share transits')}
      </Button>
      {createError && (
        <p className='mt-2 text-xs text-red-400'>{createError}</p>
      )}
      <ShareImageModal
        isOpen={isOpen}
        target={shareTarget}
        previewUrl={sharePreviewUrl}
        loading={shareLoading}
        error={shareError}
        onClose={closeShareModal}
        onShare={handleShareImage}
        onDownload={handleDownloadShareImage}
        onCopy={handleCopyShareLink}
      />
    </>
  );
}
