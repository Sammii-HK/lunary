'use client';

import { useState, useCallback } from 'react';
import { Share2, X, Download, Copy, Check, Loader2 } from 'lucide-react';

interface CardData {
  date: string;
  moonPhase: string;
  moonSign: string;
  moonEmoji: string;
  tarot: { name: string; keywords: string[] };
  crystal: { name: string; reason: string };
  transit: string;
  insight: string;
  isPersonalized: boolean;
  ogImageUrl: string;
}

export function ShareDailyInsight() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/share/daily-insight');
      if (!response.ok) throw new Error('Failed to fetch card data');

      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || 'Failed to generate card');

      setCardData(data.card);

      const imageResponse = await fetch(data.card.ogImageUrl);
      if (!imageResponse.ok) throw new Error('Failed to generate image');

      const blob = await imageResponse.blob();
      setImageBlob(blob);
    } catch (err) {
      console.error('Error generating card:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate card');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!cardData) {
      await generateCard();
    }
  };

  const handleShare = async () => {
    if (!imageBlob || !cardData) return;

    const file = new File([imageBlob], 'lunary-daily-insight.png', {
      type: 'image/png',
    });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My Daily Cosmic Insight',
          text: `${cardData.moonPhase} in ${cardData.moonSign} • ${cardData.tarot.name} • ${cardData.crystal.name}`,
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
    a.download = 'lunary-daily-insight.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://lunary.app');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        className='flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-purple-400 transition-colors rounded-md hover:bg-zinc-800/50'
        aria-label='Share your daily cosmic insight'
      >
        <Share2 className='w-4 h-4' />
        <span className='hidden sm:inline'>Share</span>
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
                Share Your Cosmic Insight
              </h2>

              {loading && (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Loader2 className='w-8 h-8 text-purple-400 animate-spin mb-4' />
                  <p className='text-zinc-400 text-sm'>
                    Generating your cosmic card...
                  </p>
                </div>
              )}

              {error && (
                <div className='text-center py-8'>
                  <p className='text-red-400 mb-4'>{error}</p>
                  <button
                    onClick={generateCard}
                    className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors'
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && imageBlob && (
                <>
                  <div className='mb-6 rounded-lg overflow-hidden border border-zinc-700'>
                    <img
                      src={URL.createObjectURL(imageBlob)}
                      alt='Your Daily Cosmic Insight'
                      className='w-full'
                    />
                  </div>

                  <div className='space-y-3'>
                    {canNativeShare && (
                      <button
                        onClick={handleShare}
                        className='w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium'
                      >
                        <Share2 className='w-4 h-4' />
                        Share Image
                      </button>
                    )}

                    <button
                      onClick={handleDownload}
                      className='w-full flex items-center justify-center gap-2 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors'
                    >
                      <Download className='w-4 h-4' />
                      Save Image
                    </button>

                    <div className='flex gap-3'>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('My daily cosmic insight from Lunary ✨')}&url=${encodeURIComponent('https://lunary.app')}`}
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
                        href={`https://www.threads.net/intent/post?text=${encodeURIComponent('My daily cosmic insight from Lunary ✨ lunary.app')}`}
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
                        {copied ? (
                          <>
                            <Check className='w-4 h-4 text-green-400' />
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
