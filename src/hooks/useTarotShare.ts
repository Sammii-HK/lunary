'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import type { SpreadReadingRecord } from '@/components/tarot/TarotSpreadExperience';

type TarotShareTarget = {
  title: string;
  description?: string;
  pageUrl: string;
  ogUrl: string;
  variant: 'card' | 'spread';
};

interface UseTarotShareProps {
  generalTarot: {
    daily: { name: string; keywords: string[] };
    weekly: { name: string; keywords: string[] };
    guidance: { dailyMessage: string; weeklyMessage: string };
  } | null;
  personalizedReading: {
    daily: { name: string; keywords: string[] };
    weekly: { name: string; keywords: string[] };
    guidance?: { dailyMessage?: string; weeklyMessage?: string };
  } | null;
  firstName?: string;
}

export function useTarotShare({
  generalTarot,
  personalizedReading,
  firstName,
}: UseTarotShareProps) {
  const [shareOrigin, setShareOrigin] = useState('https://lunary.app');
  const [shareTarget, setShareTarget] = useState<TarotShareTarget | null>(null);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [sharePreviewUrl, setSharePreviewUrl] = useState<string | null>(null);

  const shareDate = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

  const truncate = useCallback((value?: string | null, limit = 140) => {
    if (!value) return undefined;
    if (value.length <= limit) return value;
    return `${value.slice(0, limit - 1).trimEnd()}…`;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      setShareOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!shareImageBlob) {
      setSharePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(shareImageBlob);
    setSharePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setSharePreviewUrl(null);
    };
  }, [shareImageBlob]);

  const generalDailyShare = useMemo(() => {
    if (!generalTarot) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', generalTarot.daily.name);
      if (generalTarot.daily.keywords?.length) {
        url.searchParams.set(
          'keywords',
          generalTarot.daily.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Daily');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'general');

      return {
        url: url.toString(),
        title: `Today's Tarot Card: ${generalTarot.daily.name}`,
        text: truncate(generalTarot.guidance?.dailyMessage),
      };
    } catch (error) {
      console.error('Failed to build general tarot share URL:', error);
      return null;
    }
  }, [generalTarot, shareOrigin, shareDate, truncate]);

  const generalWeeklyShare = useMemo(() => {
    if (!generalTarot) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', generalTarot.weekly.name);
      if (generalTarot.weekly.keywords?.length) {
        url.searchParams.set(
          'keywords',
          generalTarot.weekly.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Weekly');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'weekly');

      const description =
        generalTarot.guidance?.weeklyMessage ||
        generalTarot.weekly.keywords?.slice(0, 3).join(', ');

      return {
        url: url.toString(),
        title: `Weekly Tarot Card: ${generalTarot.weekly.name}`,
        text: truncate(description),
      };
    } catch (error) {
      console.error('Failed to build general weekly share URL:', error);
      return null;
    }
  }, [generalTarot, shareOrigin, shareDate, truncate]);

  const personalizedDailyShare = useMemo(() => {
    if (!personalizedReading) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', personalizedReading.daily.name);
      if (personalizedReading.daily.keywords?.length) {
        url.searchParams.set(
          'keywords',
          personalizedReading.daily.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Daily');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'personal');
      if (firstName) {
        url.searchParams.set('name', firstName);
      }

      const description =
        personalizedReading.guidance?.dailyMessage ||
        personalizedReading.daily.keywords?.slice(0, 3).join(', ');

      return {
        url: url.toString(),
        title: `${firstName ? `${firstName}'s` : 'My'} Daily Tarot Card: ${
          personalizedReading.daily.name
        }`,
        text: truncate(description),
      };
    } catch (error) {
      console.error('Failed to build personalized tarot share URL:', error);
      return null;
    }
  }, [personalizedReading, shareOrigin, shareDate, firstName, truncate]);

  const personalizedWeeklyShare = useMemo(() => {
    if (!personalizedReading) return null;

    try {
      const url = new URL('/share/tarot', shareOrigin);
      url.searchParams.set('card', personalizedReading.weekly.name);
      if (personalizedReading.weekly.keywords?.length) {
        url.searchParams.set(
          'keywords',
          personalizedReading.weekly.keywords.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('timeframe', 'Weekly');
      url.searchParams.set('date', shareDate);
      url.searchParams.set('variant', 'weekly');
      if (firstName) {
        url.searchParams.set('name', firstName);
      }

      const description =
        personalizedReading.guidance?.weeklyMessage ||
        personalizedReading.weekly.keywords?.slice(0, 3).join(', ');

      return {
        url: url.toString(),
        title: `${firstName ? `${firstName}'s` : 'My'} Weekly Tarot Card: ${personalizedReading.weekly.name}`,
        text: truncate(description),
      };
    } catch (error) {
      console.error('Failed to build personalized weekly share URL:', error);
      return null;
    }
  }, [personalizedReading, shareOrigin, shareDate, firstName, truncate]);

  const buildOgUrlFromShareUrl = useCallback(
    (shareUrl: string) => {
      try {
        const url = new URL(shareUrl);
        url.pathname = '/api/og/share/tarot';
        return url.toString();
      } catch (error) {
        console.error('Invalid share URL:', shareUrl, error);
        return `${shareOrigin}/api/og/share/tarot`;
      }
    },
    [shareOrigin],
  );

  const openShareModal = useCallback(async (target: TarotShareTarget) => {
    setShareTarget(target);
    setShareLoading(true);
    setShareError(null);
    setShareImageBlob(null);

    try {
      const response = await fetch(target.ogUrl);
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      const blob = await response.blob();
      setShareImageBlob(blob);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : 'Failed to generate image',
      );
    } finally {
      setShareLoading(false);
    }
  }, []);

  const closeShareModal = useCallback(() => {
    setShareTarget(null);
    setShareImageBlob(null);
    setShareError(null);
    setShareLoading(false);
    setSharePreviewUrl(null);
  }, []);

  const handleDownloadShareImage = useCallback(() => {
    if (!shareImageBlob) return;
    const url = URL.createObjectURL(shareImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lunary-tarot.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [shareImageBlob]);

  const handleShareImage = useCallback(async () => {
    if (!shareTarget || !shareImageBlob) return;
    const file = new File([shareImageBlob], 'lunary-tarot.png', {
      type: 'image/png',
    });

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: shareTarget.title,
          text: shareTarget.description,
        });
        return;
      } catch (error) {
        const isAbort = error instanceof Error && error.name === 'AbortError';
        if (!isAbort) {
          console.error('Share failed:', error);
        }
      }
    }

    handleDownloadShareImage();
  }, [shareTarget, shareImageBlob, handleDownloadShareImage]);

  const handleCopyShareLink = useCallback(async () => {
    if (!shareTarget || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(shareTarget.pageUrl);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [shareTarget]);

  const handleCardShare = useCallback(
    (shareData: { url: string; title: string; text?: string }) => {
      openShareModal({
        title: shareData.title,
        description: shareData.text,
        pageUrl: shareData.url,
        ogUrl: buildOgUrlFromShareUrl(shareData.url),
        variant: 'card',
      });
    },
    [buildOgUrlFromShareUrl, openShareModal],
  );

  const buildSpreadOgUrl = useCallback(
    (reading: SpreadReadingRecord) => {
      const url = new URL('/api/og/share/tarot', shareOrigin);
      url.searchParams.set('variant', 'spread');
      url.searchParams.set('card', reading.spreadName);
      if (firstName) {
        url.searchParams.set('name', firstName);
      }
      if (reading.summary) {
        url.searchParams.set('spreadSummary', reading.summary);
        url.searchParams.set('text', reading.summary);
      }
      const snippet =
        reading.highlights?.length > 0
          ? reading.highlights[0]
          : reading.summary;
      if (snippet) {
        url.searchParams.set('spreadSnippet', snippet);
      }

      const cards = reading.cards.map((card) => ({
        positionLabel: card.positionLabel,
        positionPrompt: card.positionPrompt,
        cardName: card.card.name,
        keywords: card.card.keywords.slice(0, 4),
        insight: card.insight,
      }));
      url.searchParams.set('spreadCards', JSON.stringify(cards));

      if (reading.highlights?.length) {
        url.searchParams.set(
          'keywords',
          reading.highlights.slice(0, 3).join(','),
        );
      }
      url.searchParams.set('spreadName', reading.spreadName);
      return url.toString();
    },
    [firstName, shareOrigin],
  );

  const handleShareSpread = useCallback(
    (reading: SpreadReadingRecord) => {
      const ogUrl = buildSpreadOgUrl(reading);
      openShareModal({
        title: reading.spreadName,
        description: reading.summary,
        pageUrl: `${shareOrigin}/tarot`,
        ogUrl,
        variant: 'spread',
      });
    },
    [buildSpreadOgUrl, openShareModal, shareOrigin],
  );

  return {
    shareOrigin,
    shareTarget,
    shareImageBlob,
    shareLoading,
    shareError,
    sharePreviewUrl,
    generalDailyShare,
    generalWeeklyShare,
    personalizedDailyShare,
    personalizedWeeklyShare,
    buildOgUrlFromShareUrl,
    openShareModal,
    closeShareModal,
    handleDownloadShareImage,
    handleShareImage,
    handleCopyShareLink,
    handleCardShare,
    buildSpreadOgUrl,
    handleShareSpread,
  };
}
