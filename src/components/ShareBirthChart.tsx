'use client';

import { useState, useCallback, useMemo } from 'react';
import { Share2 } from 'lucide-react';
import { BirthChartData } from '../../utils/astrology/birthChart';
import { bodiesSymbols } from '@/constants/symbols';
import { useShareModal } from '@/hooks/useShareModal';
import { ShareModal } from './share/ShareModal';
import { SharePreview } from './share/SharePreview';
import { ShareActions } from './share/ShareActions';
import { ShareFormatSelector } from './share/ShareFormatSelector';
import { shareTracking } from '@/lib/analytics/share-tracking';
import { useUser } from '@/context/UserContext';

interface ShareBirthChartProps {
  birthChart: BirthChartData[];
  userName?: string;
  userBirthday?: string;
}

const getElementCounts = (birthChart: BirthChartData[]) => {
  const elementMap: Record<string, string> = {
    Aries: 'Fire',
    Leo: 'Fire',
    Sagittarius: 'Fire',
    Taurus: 'Earth',
    Virgo: 'Earth',
    Capricorn: 'Earth',
    Gemini: 'Air',
    Libra: 'Air',
    Aquarius: 'Air',
    Cancer: 'Water',
    Scorpio: 'Water',
    Pisces: 'Water',
  };

  const counts: Record<string, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };
  birthChart.forEach((planet) => {
    const element = elementMap[planet.sign];
    if (element) counts[element]++;
  });

  return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
};

const getModalityCounts = (birthChart: BirthChartData[]) => {
  const modalityMap: Record<string, string> = {
    Aries: 'Cardinal',
    Cancer: 'Cardinal',
    Libra: 'Cardinal',
    Capricorn: 'Cardinal',
    Taurus: 'Fixed',
    Leo: 'Fixed',
    Scorpio: 'Fixed',
    Aquarius: 'Fixed',
    Gemini: 'Mutable',
    Virgo: 'Mutable',
    Sagittarius: 'Mutable',
    Pisces: 'Mutable',
  };

  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  birthChart.forEach((planet) => {
    const modality = modalityMap[planet.sign];
    if (modality) counts[modality]++;
  });

  return Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
};

const getChartInsight = (birthChart: BirthChartData[]): string => {
  const retrogradeCount = birthChart.filter((p) => p.retrograde).length;
  if (retrogradeCount >= 3) {
    return `${retrogradeCount} retrograde planets suggest deep introspection and mastery through internal processing.`;
  }

  const uniqueSigns = new Set(birthChart.map((p) => p.sign)).size;
  if (uniqueSigns <= 4) {
    return `Planets concentrated in ${uniqueSigns} signs creates laser-focused intensity and depth.`;
  }

  const element = getElementCounts(birthChart);
  const elementMeanings: Record<string, string> = {
    Fire: 'A fire-dominant chart brings passionate, action-oriented energy.',
    Earth: 'An earth-dominant chart brings practical, grounded stability.',
    Air: 'An air-dominant chart brings intellectual, communicative nature.',
    Water: 'A water-dominant chart brings emotional depth and intuition.',
  };

  return (
    elementMeanings[element] ||
    'A balanced cosmic profile with diverse energies.'
  );
};

export function ShareBirthChart({
  birthChart,
  userName,
  userBirthday,
}: ShareBirthChartProps) {
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

  const sun = birthChart.find((p) => p.body === 'Sun');
  const moon = birthChart.find((p) => p.body === 'Moon');
  const rising = birthChart.find((p) => p.body === 'Ascendant');

  const dominantElement = getElementCounts(birthChart);
  const dominantModality = getModalityCounts(birthChart);
  const insight = getChartInsight(birthChart);

  const placementsForOg = useMemo(
    () =>
      birthChart.map((p) => ({
        body: p.body,
        sign: p.sign,
        degree: p.degree,
        minute: p.minute,
        eclipticLongitude: p.eclipticLongitude,
        retrograde: p.retrograde,
        house: p.house,
      })),
    [birthChart],
  );

  const generateCard = useCallback<
    () => Promise<{ shareId: string; shareUrl: string } | undefined>
  >(async () => {
    setLoading(true);
    setError(null);

    try {
      let currentShareId = shareRecord?.shareId;
      let currentShareUrl = shareRecord?.shareUrl;

      if (!currentShareId || !currentShareUrl) {
        const response = await fetch('/api/share/birth-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: firstName,
            date: userBirthday,
            sun: sun?.sign,
            moon: moon?.sign,
            rising: rising?.sign,
            element: dominantElement,
            modality: dominantModality,
            insight: insight.substring(0, 160),
            placements: placementsForOg,
            format: format,
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

      const ogImageUrl = `/api/og/share/birth-chart?shareId=${encodeURIComponent(
        currentShareId,
      )}&format=${format}`;

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
    userBirthday,
    sun,
    moon,
    rising,
    dominantElement,
    dominantModality,
    insight,
    placementsForOg,
    shareRecord,
    format,
    setLoading,
    setError,
  ]);

  const handleOpen = async () => {
    openModal();
    shareTracking.shareInitiated(user?.id, 'birth-chart');
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

    const file = new File([imageBlob], 'my-birth-chart.png', {
      type: 'image/png',
    });
    const shareText = `${bodiesSymbols.sun} ${sun?.sign} Sun · ${bodiesSymbols.moon} ${moon?.sign} Moon · ${bodiesSymbols.ascendant} ${rising?.sign} Rising`;
    const shareMessage = shareInfo?.shareUrl
      ? `${shareText}\n${shareInfo.shareUrl}`
      : shareText;

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${firstName ? `${firstName}'s` : 'My'} Birth Chart`,
          text: shareMessage,
        });
        shareTracking.shareCompleted(user?.id, 'birth-chart', 'native');
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
    a.download = 'my-birth-chart.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    shareTracking.shareCompleted(user?.id, 'birth-chart', 'download');
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
      shareTracking.shareCompleted(user?.id, 'birth-chart', 'clipboard');
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
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my birth chart! ☀️ ${sun?.sign} Sun · 🌙 ${moon?.sign} Moon · ⬆️ ${rising?.sign} Rising`)}&url=${encodeURIComponent(socialShareUrl)}`,
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`Check out my birth chart! ☀️ ${sun?.sign} Sun · 🌙 ${moon?.sign} Moon · ⬆️ ${rising?.sign} Rising ${socialShareUrl}`)}`,
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <button
        onClick={handleOpen}
        className='inline-flex items-center gap-2 rounded-full border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-xs font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
      >
        <Share2 className='w-4 h-4' />
        Share Birth Chart
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={closeModal}
        title='Share Your Birth Chart'
      >
        <SharePreview
          imageBlob={imageBlob}
          loading={loading}
          format={format}
          alt='Your Birth Chart'
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
              People who click your link can see your Big Three and chart
              highlights without needing an account
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
