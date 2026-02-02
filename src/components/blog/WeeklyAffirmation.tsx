// Weekly affirmation component with styled blockquote and shareable format
'use client';

import { useState } from 'react';
import { Quote, Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeeklyAffirmationProps {
  affirmation: string;
  weekTitle?: string;
  author?: string;
}

export function WeeklyAffirmation({
  affirmation,
  weekTitle,
  author = 'Lunary',
}: WeeklyAffirmationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shareText = weekTitle
      ? `"${affirmation}"\n\n— ${author}, ${weekTitle}`
      : `"${affirmation}"\n\n— ${author}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareText = weekTitle
      ? `"${affirmation}" — ${author}, ${weekTitle}`
      : `"${affirmation}" — ${author}`;

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className='relative my-8'>
      {/* Decorative gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-lunary-primary-900/30 via-purple-900/20 to-lunary-primary-900/30 rounded-2xl blur-xl' />

      <blockquote className='relative rounded-2xl border border-lunary-primary-700/30 bg-zinc-900/80 backdrop-blur-sm p-6 md:p-8'>
        {/* Quote icon */}
        <Quote className='absolute top-4 left-4 h-8 w-8 text-lunary-primary-500/30' />

        {/* Affirmation text */}
        <p className='text-lg md:text-xl lg:text-2xl font-light text-zinc-100 leading-relaxed text-center px-4 md:px-8 pt-4'>
          &ldquo;{affirmation}&rdquo;
        </p>

        {/* Attribution */}
        <footer className='mt-4 text-center'>
          <cite className='text-sm text-zinc-400 not-italic'>
            — {author}
            {weekTitle && <span className='text-zinc-500'>, {weekTitle}</span>}
          </cite>
        </footer>

        {/* Share actions */}
        <div className='flex justify-center gap-2 mt-6'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCopy}
            className='text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          >
            {copied ? (
              <>
                <Check className='h-4 w-4 mr-1' />
                Copied
              </>
            ) : (
              <>
                <Copy className='h-4 w-4 mr-1' />
                Copy
              </>
            )}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleShare}
            className='text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          >
            <Share2 className='h-4 w-4 mr-1' />
            Share
          </Button>
        </div>
      </blockquote>
    </div>
  );
}

// Compact inline affirmation for sidebars or cards
interface AffirmationCardProps {
  affirmation: string;
  className?: string;
}

export function AffirmationCard({
  affirmation,
  className = '',
}: AffirmationCardProps) {
  return (
    <div
      className={`rounded-xl border border-lunary-primary-700/20 bg-gradient-to-br from-lunary-primary-900/20 to-zinc-900 p-4 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <Quote className='h-5 w-5 text-lunary-primary-500/50 flex-shrink-0 mt-0.5' />
        <p className='text-sm text-zinc-300 italic leading-relaxed'>
          {affirmation}
        </p>
      </div>
    </div>
  );
}
