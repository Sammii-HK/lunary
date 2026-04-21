'use client';

import { useState, useCallback, useEffect } from 'react';
import { Share2, Sparkles, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './ShareModal';
import { SharePreview } from './SharePreview';
import { ShareActions } from './ShareActions';
import { ShareFormatSelector } from './ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { isInDemoMode } from '@/lib/demo-mode';
import { OG_IMAGE_VERSION } from '@/lib/share/og-utils';

interface ZodiacSeasonData {
  sign: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  startDate: string;
  endDate: string;
  themes: string[];
  symbol: string; // Unicode zodiac symbol
}

interface ShareZodiacSeasonProps {
  currentSeason?: ZodiacSeasonData;
  onSeasonFetch?: () => Promise<ZodiacSeasonData | null>;
  demo?: boolean; // Always show for testing/demo purposes
}

// Zodiac sign metadata
const ZODIAC_METADATA: Record<
  string,
  {
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
    modality: 'Cardinal' | 'Fixed' | 'Mutable';
    themes: string[];
    symbol: string;
  }
> = {
  Aries: {
    element: 'Fire',
    modality: 'Cardinal',
    themes: ['Initiative', 'Courage', 'Action'],
    symbol: '♈',
  },
  Taurus: {
    element: 'Earth',
    modality: 'Fixed',
    themes: ['Stability', 'Pleasure', 'Values'],
    symbol: '♉',
  },
  Gemini: {
    element: 'Air',
    modality: 'Mutable',
    themes: ['Communication', 'Curiosity', 'Connection'],
    symbol: '♊',
  },
  Cancer: {
    element: 'Water',
    modality: 'Cardinal',
    themes: ['Emotion', 'Nurture', 'Home'],
    symbol: '♋',
  },
  Leo: {
    element: 'Fire',
    modality: 'Fixed',
    themes: ['Creativity', 'Expression', 'Joy'],
    symbol: '♌',
  },
  Virgo: {
    element: 'Earth',
    modality: 'Mutable',
    themes: ['Service', 'Precision', 'Health'],
    symbol: '♍',
  },
  Libra: {
    element: 'Air',
    modality: 'Cardinal',
    themes: ['Balance', 'Harmony', 'Relationships'],
    symbol: '♎',
  },
  Scorpio: {
    element: 'Water',
    modality: 'Fixed',
    themes: ['Transformation', 'Depth', 'Power'],
    symbol: '♏',
  },
  Sagittarius: {
    element: 'Fire',
    modality: 'Mutable',
    themes: ['Adventure', 'Wisdom', 'Expansion'],
    symbol: '♐',
  },
  Capricorn: {
    element: 'Earth',
    modality: 'Cardinal',
    themes: ['Ambition', 'Structure', 'Achievement'],
    symbol: '♑',
  },
  Aquarius: {
    element: 'Air',
    modality: 'Fixed',
    themes: ['Innovation', 'Community', 'Vision'],
    symbol: '♒',
  },
  Pisces: {
    element: 'Water',
    modality: 'Mutable',
    themes: ['Compassion', 'Intuition', 'Dreams'],
    symbol: '♓',
  },
};

// Fetch the real astronomical Sun sign from the global cosmic context.
// Uses /api/cosmic/global which returns Sun's live ecliptic longitude →
// current sign + the actual ingress start/end dates (astronomy-engine,
// hourly server cache). Returns null outside the real season — fixes the
// old calendar-date implementation that triggered the banner before the
// Sun had actually ingressed into the sign.
async function fetchAstronomicalSunSeason(): Promise<ZodiacSeasonData | null> {
  try {
    const response = await fetch('/api/cosmic/global', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    const sun = data?.planetaryPositions?.Sun;
    if (!sun?.sign) return null;

    const metadata = ZODIAC_METADATA[sun.sign as keyof typeof ZODIAC_METADATA];
    if (!metadata) return null;

    // Prefer the real astronomical ingress dates; fall back to a sensible
    // month window only if the global cache hasn't populated duration yet.
    const startDate = sun.duration?.startDate
      ? new Date(sun.duration.startDate)
      : null;
    const endDate = sun.duration?.endDate
      ? new Date(sun.duration.endDate)
      : null;

    const now = new Date();
    // Guard: never show before the real ingress, even if cache is ahead.
    if (startDate && now < startDate) return null;
    // Guard: never show after the sign ends (Sun is in the next sign).
    if (endDate && now > endDate) return null;

    return {
      sign: sun.sign,
      element: metadata.element,
      modality: metadata.modality,
      startDate: (startDate ?? now).toISOString().split('T')[0],
      endDate: (endDate ?? now).toISOString().split('T')[0],
      themes: metadata.themes,
      symbol: metadata.symbol,
    };
  } catch {
    return null;
  }
}

// Demo data for testing/preview
function getDemoSeasonData(): ZodiacSeasonData {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  // Determine current zodiac sign based on month
  const zodiacSigns = [
    {
      name: 'Aquarius',
      start: { month: 1, day: 20 },
      end: { month: 2, day: 18 },
    },
    {
      name: 'Pisces',
      start: { month: 2, day: 19 },
      end: { month: 3, day: 20 },
    },
    { name: 'Aries', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
    {
      name: 'Taurus',
      start: { month: 4, day: 20 },
      end: { month: 5, day: 20 },
    },
    {
      name: 'Gemini',
      start: { month: 5, day: 21 },
      end: { month: 6, day: 20 },
    },
    {
      name: 'Cancer',
      start: { month: 6, day: 21 },
      end: { month: 7, day: 22 },
    },
    { name: 'Leo', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
    { name: 'Virgo', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
    {
      name: 'Libra',
      start: { month: 9, day: 23 },
      end: { month: 10, day: 22 },
    },
    {
      name: 'Scorpio',
      start: { month: 10, day: 23 },
      end: { month: 11, day: 21 },
    },
    {
      name: 'Sagittarius',
      start: { month: 11, day: 22 },
      end: { month: 12, day: 21 },
    },
    {
      name: 'Capricorn',
      start: { month: 12, day: 22 },
      end: { month: 1, day: 19 },
    },
  ];

  const currentSign = zodiacSigns.find((sign) => {
    if (sign.start.month <= sign.end.month) {
      return (
        (currentMonth === sign.start.month &&
          today.getDate() >= sign.start.day) ||
        (currentMonth === sign.end.month && today.getDate() <= sign.end.day) ||
        (currentMonth > sign.start.month && currentMonth < sign.end.month)
      );
    } else {
      // Handle year-crossing signs like Capricorn
      return (
        (currentMonth === sign.start.month &&
          today.getDate() >= sign.start.day) ||
        (currentMonth === sign.end.month && today.getDate() <= sign.end.day) ||
        currentMonth > sign.start.month ||
        currentMonth < sign.end.month
      );
    }
  });

  const signName = (currentSign?.name ||
    'Aquarius') as keyof typeof ZODIAC_METADATA;
  const metadata = ZODIAC_METADATA[signName];

  const startDate = new Date(
    today.getFullYear(),
    (currentSign?.start.month || 1) - 1,
    currentSign?.start.day || 20,
  );
  const endDate = new Date(
    today.getFullYear(),
    (currentSign?.end.month || 2) - 1,
    currentSign?.end.day || 18,
  );

  return {
    sign: signName,
    element: metadata.element,
    modality: metadata.modality,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    themes: metadata.themes,
    symbol: metadata.symbol,
  };
}

export function ShareZodiacSeason({
  currentSeason,
  onSeasonFetch,
  demo = false,
}: ShareZodiacSeasonProps) {
  const { user } = useUser();
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [shareRecord, setShareRecord] = useState<{
    shareId: string;
    shareUrl: string;
  } | null>(null);
  const [seasonData, setSeasonData] = useState<ZodiacSeasonData | null>(
    currentSeason || null,
  );

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

  // Resolve the current zodiac season from real astronomy (Sun position +
  // ingress dates) via /api/cosmic/global, never from fixed calendar dates.
  useEffect(() => {
    const checkSeason = async () => {
      if (onSeasonFetch) {
        const fetchedSeason = await onSeasonFetch();
        setSeasonData(fetchedSeason);
      } else if (demo) {
        const demoSeason =
          (await fetchAstronomicalSunSeason()) ?? getDemoSeasonData();
        setSeasonData(demoSeason);
      } else {
        const currentSeason = await fetchAstronomicalSunSeason();
        setSeasonData(currentSeason);
      }
    };
    checkSeason();
  }, [onSeasonFetch, demo]);

  // Check dismiss state from localStorage + cookie
  useEffect(() => {
    if (!seasonData) return;
    const key = `season-banner-dismissed-${seasonData.sign}`;
    if (localStorage.getItem(key)) {
      setDismissed(true);
      return;
    }
    // Also check cookie for cross-tab persistence
    if (document.cookie.includes(key)) {
      setDismissed(true);
    }
  }, [seasonData]);

  const handleDismiss = useCallback(() => {
    if (!seasonData) return;
    const key = `season-banner-dismissed-${seasonData.sign}`;
    localStorage.setItem(key, '1');
    // Set cookie that expires when season ends (use endDate + 1 day)
    const expires = new Date(seasonData.endDate + 'T23:59:59');
    document.cookie = `${key}=1; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    setDismissed(true);
  }, [seasonData]);

  const generateCard = useCallback(async () => {
    if (!seasonData) {
      setError('No season data available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId ?? '';
      let currentShareUrl = shareRecord?.shareUrl ?? '';

      if (!currentShareId || !currentShareUrl) {
        const response = await fetch('/api/share/zodiac-season', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.name?.split(' ')[0],
            sign: seasonData.sign,
            element: seasonData.element,
            modality: seasonData.modality,
            startDate: seasonData.startDate,
            endDate: seasonData.endDate,
            themes: seasonData.themes,
            symbol: seasonData.symbol,
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

      const ogImageUrl = `/api/og/share/zodiac-season?shareId=${encodeURIComponent(
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
  }, [seasonData, shareRecord, format, user?.name, setLoading, setError]);

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
    shareTracking.shareInitiated(user?.id, 'zodiac-season');
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

    const file = new File(
      [imageBlob],
      `${seasonData?.sign.toLowerCase()}-season.png`,
      { type: 'image/png' },
    );

    const shareText = `Happy ${seasonData?.sign} Season`;
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${seasonData?.sign} Season`,
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'zodiac-season', 'native');
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
    a.download = `${seasonData?.sign.toLowerCase()}-season.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'zodiac-season', 'download');
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
      shareTracking.shareCompleted(user?.id, 'zodiac-season', 'clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const socialShareUrl = shareRecord?.shareUrl || 'https://lunary.app';
  const socialText = `Happy ${seasonData?.sign} Season`;

  const socialUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialText)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${socialText} ${socialShareUrl}`)}`,
  };

  // Don't show button if not in season transition window (unless in demo mode)
  if (!seasonData || dismissed) {
    return null;
  }

  return (
    <div className='relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-lunary-primary-700/50 bg-layer-base/5'>
      <button
        onClick={handleDismiss}
        className='absolute top-2 right-2 p-1 rounded-md text-content-muted hover:text-content-secondary hover:bg-surface-card/50 transition-colors'
        aria-label='Dismiss season banner'
      >
        <X className='w-3.5 h-3.5' />
      </button>

      <div className='flex items-center gap-2 text-sm text-content-secondary'>
        <Sparkles className='w-4 h-4' />
        <span>Welcome to {seasonData.sign} Season!</span>
      </div>

      <p className='text-xs text-content-muted text-center'>
        {seasonData.themes.join(' • ')}
      </p>

      <button
        onClick={handleOpen}
        className='inline-flex items-center gap-2 rounded-lg border border-lunary-primary-700 bg-layer-base/10 px-4 py-2 text-sm font-medium text-content-secondary hover:text-content-secondary hover:bg-layer-base/20 transition-colors mt-2'
      >
        <Share2 className='w-4 h-4' />
        Share {seasonData.sign} Season
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title={`${seasonData.sign} Season`}
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt={`${seasonData.sign} Season`}
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
              Explore the cosmic weather at lunary.app
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
