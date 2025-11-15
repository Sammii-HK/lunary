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
          <path d='M12 2C-.747 2.242-2.34 4.947-4.57 7.177C5.2 11.406 3 12.998 3 14.75 3 17.097 5.053 19 7.5 19c1.542 0 2.966-.828 4.5-2.5 1.534 1.672 2.958 2.5 4.5 2.5 2.447 0 4.5-1.903 4.5-4.25 0-1.752-2.2-3.344-4.43-5.573C14.34 6.947 12.747 4.242 12 2zm0 7.5c.924 1.347 1.986 2.53 3.07 3.614C16.821 14.865 18 16.04 18 17c0 .828-.672 1.5-1.5 1.5-.93 0-1.935-.768-3-2.045V9.5z' />
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
          <path d='M12 2c-.747 2.242-2.34 4.947-4.57 7.177C5.2 11.406 3 12.998 3 14.75 3 17.097 5.053 19 7.5 19c1.542 0 2.966-.828 4.5-2.5 1.534 1.672 2.958 2.5 4.5 2.5 2.447 0 4.5-1.903 4.5-4.25 0-1.752-2.2-3.344-4.43-5.573C14.34 6.947 12.747 4.242 12 2zm0 7.5c.924 1.347 1.986 2.53 3.07 3.614C16.821 14.865 18 16.04 18 17c0 .828-.672 1.5-1.5 1.5-.93 0-1.935-.768-3-2.045V9.5z' />
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
