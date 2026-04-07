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
      <div className='absolute inset-0 bg-gradient-to-br from-layer-base/30 via-purple-900/20 to-layer-base/30 rounded-2xl blur-xl' />

      <blockquote className='relative rounded-2xl border border-lunary-primary-700/30 bg-surface-elevated/80 backdrop-blur-sm p-6 md:p-8'>
        {/* Quote icon */}
        <Quote className='absolute top-4 left-4 h-8 w-8 text-lunary-primary-500/30' />

        {/* Affirmation text */}
        <p className='text-lg md:text-xl lg:text-2xl font-light text-content-primary leading-relaxed text-center px-4 md:px-8 pt-4'>
          &ldquo;{affirmation}&rdquo;
        </p>

        {/* Attribution */}
        <footer className='mt-4 text-center'>
          <cite className='text-sm text-content-muted not-italic'>
            — {author}
            {weekTitle && (
              <span className='text-content-muted'>, {weekTitle}</span>
            )}
          </cite>
        </footer>

        {/* Share actions */}
        <div className='flex justify-center gap-2 mt-6'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCopy}
            className='text-content-muted hover:text-content-primary hover:bg-surface-card'
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
            className='text-content-muted hover:text-content-primary hover:bg-surface-card'
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
      className={`rounded-xl border border-lunary-primary-700/20 bg-gradient-to-br from-layer-base/20 to-surface-elevated p-4 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <Quote className='h-5 w-5 text-lunary-primary-500/50 flex-shrink-0 mt-0.5' />
        <p className='text-sm text-content-secondary italic leading-relaxed'>
          {affirmation}
        </p>
      </div>
    </div>
  );
}
