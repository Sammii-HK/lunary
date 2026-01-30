import { useState, useCallback } from 'react';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { useUser } from '@/context/UserContext';
import type { ShareFormat } from './useShareModal';

export interface ShareRecord {
  shareId: string;
  shareUrl: string;
}

export interface UseShareableOptions {
  shareType: string;
  onGenerate?: (format: ShareFormat) => Promise<ShareRecord | undefined>;
  onSuccess?: (record: ShareRecord) => void;
  onError?: (error: Error) => void;
}

export interface UseShareableReturn {
  imageBlob: Blob | null;
  shareRecord: ShareRecord | null;
  loading: boolean;
  error: string | null;
  generateShare: (format: ShareFormat) => Promise<ShareRecord | undefined>;
  handleShare: (shareText?: string, shareTitle?: string) => Promise<void>;
  handleDownload: (filename?: string) => void;
  handleCopyLink: () => Promise<void>;
  linkCopied: boolean;
}

export function useShareable({
  shareType,
  onGenerate,
  onSuccess,
  onError,
}: UseShareableOptions): UseShareableReturn {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [shareRecord, setShareRecord] = useState<ShareRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const generateShare = useCallback(
    async (format: ShareFormat): Promise<ShareRecord | undefined> => {
      setLoading(true);
      setError(null);

      try {
        // Call the provided generator function
        if (!onGenerate) {
          throw new Error('No generator function provided');
        }

        const record = await onGenerate(format);
        if (!record) {
          throw new Error('Failed to generate share');
        }

        setShareRecord(record);
        if (onSuccess) onSuccess(record);

        // Track share initiation
        shareTracking.shareInitiated(user?.id, shareType);

        return record;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate share';
        setError(errorMessage);
        if (onError)
          onError(err instanceof Error ? err : new Error(errorMessage));
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [onGenerate, onSuccess, onError, user?.id, shareType],
  );

  const handleShare = useCallback(
    async (shareText?: string, shareTitle?: string) => {
      if (!imageBlob) return;

      const file = new File([imageBlob], `lunary-${shareType}.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: shareTitle || `My ${shareType}`,
            text: shareText || `Check out my ${shareType} from Lunary`,
          });
          shareTracking.shareCompleted(user?.id, shareType, 'native');
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Share failed:', err);
          }
        }
      } else {
        handleDownload();
      }
    },
    [imageBlob, shareType, user?.id],
  );

  const handleDownload = useCallback(
    (filename?: string) => {
      if (!imageBlob) return;

      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `lunary-${shareType}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      shareTracking.shareCompleted(user?.id, shareType, 'download');
    },
    [imageBlob, shareType, user?.id],
  );

  const handleCopyLink = useCallback(async () => {
    try {
      if (!shareRecord?.shareUrl) {
        throw new Error('Share link unavailable');
      }

      await navigator.clipboard.writeText(shareRecord.shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);

      shareTracking.shareCompleted(user?.id, shareType, 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
      setError('Failed to copy link');
    }
  }, [shareRecord, user?.id, shareType]);

  return {
    imageBlob,
    shareRecord,
    loading,
    error,
    generateShare,
    handleShare,
    handleDownload,
    handleCopyLink,
    linkCopied,
  };
}
