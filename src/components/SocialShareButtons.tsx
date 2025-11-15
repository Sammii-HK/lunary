'use client';

import { Copy } from 'lucide-react';

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

export function SocialShareButtons({ url, title }: SocialShareButtonsProps) {
  const shareText = `${title} ${url}`;

  const handleCopyLink = async (customMessage?: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert(customMessage || 'Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInstagramShare = async () => {
    await handleCopyLink(
      'Link copied! Paste it into your Instagram story or bio.',
    );
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='flex flex-wrap gap-3'>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
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
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
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
          <path d='M12 2C6.486 2 2 6.262 2 12s4.486 10 10 10 10-4.262 10-10S17.514 2 12 2zm0 2c4.411 0 8 3.178 8 8s-3.589 8-8 8-8-3.178-8-8 3.589-8 8-8zm-.234 3c-2.391 0-4.239 1.72-4.239 3.918 0 1.64.99 3.024 2.573 3.51.089.024.178-.022.206-.111l.256-.823a.164.164 0 00-.082-.197c-.971-.487-1.519-1.41-1.519-2.379 0-1.589 1.294-2.838 3.042-2.838 1.856 0 3.031 1.09 3.031 2.852 0 1.164-.522 2.008-1.329 2.28-.334.112-.567.431-.567.79v.962c0 .091.074.165.166.165h.931c.089 0 .163-.07.166-.159.061-1.836 2.634-2.135 2.634-4.038C16.531 8.932 14.613 7 11.766 7zm.114 4.442c-.624 0-1.132.508-1.132 1.132 0 .625.508 1.132 1.132 1.132s1.132-.507 1.132-1.132-.508-1.132-1.132-1.132z' />
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
      <button
        onClick={() => handleCopyLink()}
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-colors text-sm'
      >
        <Copy className='w-4 h-4' />
        Copy Link
      </button>
    </div>
  );
}
