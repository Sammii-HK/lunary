'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { OgShareTarget, useOgShareModal } from '@/hooks/useOgShareModal';
import { ShareImageModal } from '@/components/og/ShareImageModal';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

type SkyNowSharePanelProps = {
  dateParam: string;
  title?: string;
  description?: string;
};

export function SkyNowSharePanel({
  dateParam,
  title = 'Sky Now Transit Chart',
  description = 'See the live planetary weather snapshot from Lunary.',
}: SkyNowSharePanelProps) {
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

  const shareConfig: OgShareTarget = useMemo(
    () => ({
      title,
      description,
      pageUrl: `${APP_URL}/grimoire/astrology/sky-now`,
      ogUrl: `${APP_URL}/api/og/grimoire/astrology/sky-now?date=${encodeURIComponent(
        dateParam,
      )}`,
    }),
    [dateParam, description, title],
  );

  return (
    <>
      <div className='mt-5 flex justify-center'>
        <Button variant='outline' onClick={() => openShareModal(shareConfig)}>
          Share this transit snapshot
        </Button>
      </div>
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

export default SkyNowSharePanel;
