'use client';

import { Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export function SocialShareButtons({
  url,
  title,
  description,
  imageUrl,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareText = `${title} ${url}`;

  const handleCopyLink = async (customMessage?: string) => {
    try {
      await navigator.clipboard.writeText(url);
      if (customMessage) {
        alert(customMessage);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
      } catch (err) {
        // User cancelled or error
        console.error('Share failed:', err);
      }
    }
  };

  const handleInstagramShare = async () => {
    await handleCopyLink(
      'Link copied! Paste it into your Instagram story or bio.',
    );
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description || title);

  return (
    <div className='flex flex-wrap gap-3'>
      {typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' && (
          <button
            onClick={handleNativeShare}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
          >
            <Share2 className='w-4 h-4' />
            Share
          </button>
        )}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
        </svg>
        Share on X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
        </svg>
        Share on Facebook
      </a>
      <button
        onClick={handleInstagramShare}
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm9 2a1 1 0 100 2 1 1 0 000-2zM12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z' />
        </svg>
        Share on Instagram
      </button>
      <a
        href={`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M12.186 8.302c1.831 0 3.193.771 3.193 1.936 0 .844-.793 1.51-1.888 1.725l-.01.002c.01.06.016.122.016.185 0 1.165-1.362 1.936-3.193 1.936-1.831 0-3.193-.771-3.193-1.936 0-.063.006-.125.016-.185l-.01-.002c-1.095-.215-1.888-.881-1.888-1.725 0-1.165 1.362-1.936 3.193-1.936zm0-1.302C9.343 7 7.5 8.343 7.5 10.238c0 .844.793 1.51 1.888 1.725l.01.002c-.01.06-.016.122-.016.185 0 1.895 1.843 3.238 4.186 3.238 2.343 0 4.186-1.343 4.186-3.238 0-.063-.006-.125-.016-.185l.01-.002c1.095-.215 1.888-.881 1.888-1.725C16.686 8.343 14.843 7 12.186 7zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z' />
        </svg>
        Share on Threads
      </a>
      <a
        href={`https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z' />
          <circle
            cx='12'
            cy='12'
            r='8'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
          />
          <path
            d='M8 12h8M12 8v8'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
          />
        </svg>
        Share on Bluesky
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z' />
        </svg>
        Share on Reddit
      </a>
      <button
        onClick={() => handleCopyLink()}
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        {copied ? (
          <>
            <Check className='w-4 h-4 text-green-400' />
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
  );
}
