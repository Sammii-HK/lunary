'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Share2, X, Download, Copy, Check, Loader2, Link2 } from 'lucide-react';
import { BirthChartData } from '../../utils/astrology/birthChart';

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
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = userName?.trim() ? userName.split(' ')[0] : '';

  const sun = birthChart.find((p) => p.body === 'Sun');
  const moon = birthChart.find((p) => p.body === 'Moon');
  const rising = birthChart.find((p) => p.body === 'Ascendant');

  const dominantElement = getElementCounts(birthChart);
  const dominantModality = getModalityCounts(birthChart);
  const insight = getChartInsight(birthChart);

  const shareUrl = (() => {
    if (typeof window === 'undefined') return '';
    const url = new URL('/share/birth-chart', window.location.origin);
    if (firstName) url.searchParams.set('name', firstName);
    if (userBirthday) url.searchParams.set('date', userBirthday);
    if (sun?.sign) url.searchParams.set('sun', sun.sign);
    if (moon?.sign) url.searchParams.set('moon', moon.sign);
    if (rising?.sign) url.searchParams.set('rising', rising.sign);
    if (dominantElement) url.searchParams.set('element', dominantElement);
    if (dominantModality) url.searchParams.set('modality', dominantModality);
    if (insight) url.searchParams.set('insight', insight);
    return url.toString();
  })();

  const generateCard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ogParams = new URLSearchParams({
        name: firstName,
        sun: sun?.sign || '',
        moon: moon?.sign || '',
        rising: rising?.sign || '',
        element: dominantElement,
        modality: dominantModality,
        insight: insight.substring(0, 160),
      });

      const ogImageUrl = `/api/og/share/birth-chart?${ogParams.toString()}`;

      const imageResponse = await fetch(ogImageUrl);
      if (!imageResponse.ok) throw new Error('Failed to generate image');

      const blob = await imageResponse.blob();
      setImageBlob(blob);
    } catch (err) {
      console.error('Error generating card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate card');
    } finally {
      setLoading(false);
    }
  }, [
    firstName,
    sun,
    moon,
    rising,
    dominantElement,
    dominantModality,
    insight,
  ]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!imageBlob) {
      await generateCard();
    }
  };

  const handleShare = async () => {
    if (!imageBlob) return;

    const file = new File([imageBlob], 'my-birth-chart.png', {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${firstName ? `${firstName}'s` : 'My'} Birth Chart`,
          text: `☀️ ${sun?.sign} Sun · 🌙 ${moon?.sign} Moon · ⬆️ ${rising?.sign} Rising`,
        });
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
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  return (
    <>
      <button
        onClick={handleOpen}
        className='inline-flex items-center gap-2 rounded-full border border-lunary-primary-700 bg-lunary-primary-900/10 px-4 py-2 text-xs font-medium text-lunary-primary-200 hover:text-lunary-primary-100 hover:bg-lunary-primary-900/20 transition-colors'
      >
        <Share2 className='w-4 h-4' />
        Share Birth Chart
      </button>

      {isOpen && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='p-6'>
              <h2 className='text-lg font-medium text-white mb-4'>
                Share Your Birth Chart
              </h2>

              {loading && (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Loader2 className='w-8 h-8 text-lunary-primary-400 animate-spin mb-4' />
                  <p className='text-zinc-400 text-sm'>
                    Generating your birth chart card...
                  </p>
                </div>
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

              {!loading && !error && imageBlob && (
                <>
                  <div className='mb-6 rounded-lg overflow-hidden border border-zinc-700'>
                    <Image
                      src={URL.createObjectURL(imageBlob)}
                      alt='Your Birth Chart'
                      width={1200}
                      height={630}
                      className='w-full h-auto'
                      unoptimized
                    />
                  </div>

                  <div className='space-y-3'>
                    {/* Share as Image */}
                    <div className='space-y-2'>
                      <p className='text-xs text-zinc-400 uppercase tracking-wider'>
                        Share as Image
                      </p>
                      <div className='flex gap-2'>
                        {canNativeShare && (
                          <button
                            onClick={handleShare}
                            className='flex-1 flex items-center justify-center gap-2 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg transition-colors font-medium'
                          >
                            <Share2 className='w-4 h-4' />
                            Share
                          </button>
                        )}
                        <button
                          onClick={handleDownload}
                          className='flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors'
                        >
                          <Download className='w-4 h-4' />
                          Download
                        </button>
                      </div>
                    </div>

                    {/* Share Link */}
                    <div className='space-y-2'>
                      <p className='text-xs text-zinc-400 uppercase tracking-wider'>
                        Share as Link
                      </p>
                      <p className='text-xs text-zinc-500'>
                        Anyone with this link can view your birth chart
                        highlights
                      </p>
                      <button
                        onClick={handleCopyLink}
                        className='w-full flex items-center justify-center gap-2 py-3 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors'
                      >
                        {linkCopied ? (
                          <>
                            <Check className='w-4 h-4 text-lunary-success' />
                            Link Copied!
                          </>
                        ) : (
                          <>
                            <Link2 className='w-4 h-4' />
                            Copy Shareable Link
                          </>
                        )}
                      </button>
                    </div>

                    {/* Social Share */}
                    <div className='flex gap-3 pt-2'>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my birth chart! ☀️ ${sun?.sign} Sun · 🌙 ${moon?.sign} Moon · ⬆️ ${rising?.sign} Rising`)}&url=${encodeURIComponent(shareUrl)}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex-1 flex items-center justify-center gap-2 py-2.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors text-sm'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                        </svg>
                        X
                      </a>
                      <a
                        href={`https://www.threads.net/intent/post?text=${encodeURIComponent(`Check out my birth chart! ☀️ ${sun?.sign} Sun · 🌙 ${moon?.sign} Moon · ⬆️ ${rising?.sign} Rising ${shareUrl}`)}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex-1 flex items-center justify-center gap-2 py-2.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors text-sm'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='currentColor'
                          viewBox='0 0 640 640'
                        >
                          <path d='M427.5 299.7C429.7 300.6 431.7 301.6 433.8 302.5C463 316.6 484.4 337.7 495.6 363.9C511.3 400.4 512.8 459.7 465.3 507.1C429.1 543.3 385 559.6 322.7 560.1L322.4 560.1C252.2 559.6 198.3 536 162 489.9C129.7 448.9 113.1 391.8 112.5 320.3L112.5 319.8C113 248.3 129.6 191.2 161.9 150.2C198.2 104.1 252.2 80.5 322.4 80L322.7 80C393 80.5 447.6 104 485 149.9C503.4 172.6 517 199.9 525.6 231.6L485.2 242.4C478.1 216.6 467.4 194.6 453 177C423.8 141.2 380 122.8 322.5 122.4C265.5 122.9 222.4 141.2 194.3 176.8C168.1 210.1 154.5 258.3 154 320C154.5 381.7 168.1 429.9 194.3 463.3C222.3 498.9 265.5 517.2 322.5 517.7C373.9 517.3 407.9 505.1 436.2 476.8C468.5 444.6 467.9 405 457.6 380.9C451.5 366.7 440.5 354.9 425.7 346C422 372.9 413.9 394.3 401 410.8C383.9 432.6 359.6 444.4 328.3 446.1C304.7 447.4 282 441.7 264.4 430.1C243.6 416.3 231.4 395.3 230.1 370.8C227.6 322.5 265.8 287.8 325.3 284.4C346.4 283.2 366.2 284.1 384.5 287.2C382.1 272.4 377.2 260.6 369.9 252C359.9 240.3 344.3 234.3 323.7 234.2L323 234.2C306.4 234.2 284 238.8 269.7 260.5L235.3 236.9C254.5 207.8 285.6 191.8 323.1 191.8L323.9 191.8C386.5 192.2 423.8 231.3 427.6 299.5L427.4 299.7L427.5 299.7zM271.5 368.5C272.8 393.6 299.9 405.3 326.1 403.8C351.7 402.4 380.7 392.4 385.6 330.6C372.4 327.7 357.8 326.2 342.2 326.2C337.4 326.2 332.6 326.3 327.8 326.6C284.9 329 270.6 349.8 271.6 368.4L271.5 368.5z' />
                        </svg>
                        Threads
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className='flex-1 flex items-center justify-center gap-2 py-2.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors text-sm'
                      >
                        {linkCopied ? (
                          <>
                            <Check className='w-4 h-4 text-lunary-success' />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className='w-4 h-4' />
                            Link
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className='mt-4 text-xs text-zinc-500 text-center'>
                    People who click your link can see your Big Three and chart
                    highlights without needing an account
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
