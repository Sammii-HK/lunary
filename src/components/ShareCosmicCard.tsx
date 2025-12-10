'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Share2, Copy, Check } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function ShareCosmicCard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardData, setCardData] = useState<any>(null);

  const generateCard = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/share/cosmic-card');
      if (response.ok) {
        const data = await response.json();
        setCardData(data.card);
      }
    } catch (error) {
      console.error('Failed to generate cosmic card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!cardData) {
      await generateCard();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Cosmic State - Lunary',
          text: `Check out my cosmic state: ${cardData.sun} Sun, ${cardData.moon} Moon, ${cardData.rising} Rising`,
          url: cardData.shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    if (!cardData) {
      await generateCard();
      return;
    }

    try {
      await navigator.clipboard.writeText(cardData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className='space-y-4'>
      {cardData && (
        <div className='bg-zinc-900 rounded-lg p-4 border border-zinc-800'>
          <Image
            src={cardData.ogImageUrl}
            alt='Cosmic State Card'
            width={1200}
            height={630}
            className='w-full rounded-lg mb-4'
            unoptimized
          />
          <div className='flex gap-2'>
            <button
              onClick={handleShare}
              className='flex-1 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'
            >
              <Share2 className='w-4 h-4' />
              Share
            </button>
            <button
              onClick={handleCopy}
              className='flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors'
            >
              {copied ? (
                <>
                  <Check className='w-4 h-4' />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className='w-4 h-4' />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!cardData && (
        <button
          onClick={generateCard}
          disabled={loading}
          className='w-full bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors'
        >
          <Share2 className='w-5 h-5' />
          {loading ? 'Generating...' : 'Generate Shareable Cosmic Card'}
        </button>
      )}
    </div>
  );
}
