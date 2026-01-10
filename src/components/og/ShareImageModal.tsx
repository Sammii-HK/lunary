'use client';

import Image from 'next/image';
import { Copy, Download, Share2, X } from 'lucide-react';
import { OgShareTarget } from '@/hooks/useOgShareModal';

type ShareImageModalProps = {
  isOpen: boolean;
  target: OgShareTarget | null;
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onShare: () => void;
  onDownload: () => void;
  onCopy: () => void;
};

export function ShareImageModal({
  isOpen,
  target,
  previewUrl,
  loading,
  error,
  onClose,
  onShare,
  onDownload,
  onCopy,
}: ShareImageModalProps) {
  if (!isOpen || !target) return null;
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
      aria-modal='true'
      role='dialog'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl'
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-zinc-400 hover:text-zinc-100'
        >
          <X className='w-5 h-5' />
        </button>

        <h2 className='text-lg font-medium text-white'>{target.title}</h2>
        {target.description && (
          <p className='text-xs text-zinc-400'>{target.description}</p>
        )}

        {loading && (
          <div className='flex flex-col items-center justify-center py-8'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-lunary-primary-400 border-t-transparent'></div>
            <p className='mt-3 text-sm text-zinc-400'>
              Generating the share image…
            </p>
          </div>
        )}

        {error && <p className='mt-4 text-sm text-red-400'>{error}</p>}

        {previewUrl && (
          <div className='mt-4 overflow-hidden rounded-xl border border-zinc-800'>
            <Image
              src={previewUrl}
              alt={target.title}
              width={1080}
              height={600}
              className='w-full h-auto'
              unoptimized
            />
          </div>
        )}

        <div className='mt-5 space-y-2'>
          <button
            type='button'
            onClick={onShare}
            disabled={loading}
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-lunary-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-lunary-primary-500 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <Share2 className='h-4 w-4' />
            Share image
          </button>
          <button
            type='button'
            onClick={onDownload}
            className='flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-700'
          >
            <Download className='h-4 w-4' />
            Save image
          </button>
          <button
            type='button'
            onClick={onCopy}
            className='flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800/80'
          >
            <Copy className='h-4 w-4' />
            Copy share link
          </button>
        </div>
      </div>
    </div>
  );
}
