import { useCallback, useEffect, useMemo, useState } from 'react';

export type OgShareTarget = {
  title: string;
  description?: string;
  pageUrl?: string;
  ogUrl: string;
};

export function useOgShareModal() {
  const [shareTarget, setShareTarget] = useState<OgShareTarget | null>(null);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareImageBlob) {
      setSharePreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(shareImageBlob);
    setSharePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [shareImageBlob]);

  const openShareModal = useCallback(async (target: OgShareTarget) => {
    setShareTarget(target);
    setShareLoading(true);
    setShareError(null);
    setShareImageBlob(null);
    try {
      const response = await fetch(target.ogUrl);
      if (!response.ok) {
        throw new Error('Failed to generate share image');
      }
      const blob = await response.blob();
      setShareImageBlob(blob);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    } finally {
      setShareLoading(false);
    }
  }, []);

  const closeShareModal = useCallback(() => {
    setShareTarget(null);
    setShareImageBlob(null);
    setSharePreviewUrl(null);
    setShareError(null);
    setShareLoading(false);
  }, []);

  const handleShareImage = useCallback(() => {
    if (!shareTarget || !shareImageBlob) return;
    const file = new File([shareImageBlob], 'lunary-share.png', {
      type: shareImageBlob.type || 'image/png',
    });
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      navigator.share({
        files: [file],
        title: shareTarget.title,
        text: shareTarget.description,
        url: shareTarget.pageUrl,
      });
      return;
    }
    const url = shareTarget.pageUrl ?? shareTarget.ogUrl;
    window.open(url, '_blank');
  }, [shareImageBlob, shareTarget]);

  const handleDownloadShareImage = useCallback(() => {
    if (!shareImageBlob) return;
    const url = URL.createObjectURL(shareImageBlob);
    if (typeof document !== 'undefined') {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'lunary-share.png';
      anchor.click();
    }
    URL.revokeObjectURL(url);
  }, [shareImageBlob]);

  const handleCopyShareLink = useCallback(() => {
    if (
      !shareTarget ||
      typeof navigator === 'undefined' ||
      !navigator.clipboard
    ) {
      return;
    }
    const link = shareTarget.pageUrl ?? shareTarget.ogUrl;
    navigator.clipboard.writeText(link);
  }, [shareTarget]);

  const isOpen = useMemo(() => Boolean(shareTarget), [shareTarget]);

  return {
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
  };
}
