'use client';

import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ShareFormat } from '@/hooks/useShareModal';
import { FORMAT_SIZES } from '@/lib/share/types';

export interface SharePreviewProps {
  imageBlob: Blob | null;
  loading: boolean;
  format: ShareFormat;
  alt?: string;
}

export function SharePreview({
  imageBlob,
  loading,
  format,
  alt = 'Share preview',
}: SharePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      setImageLoaded(false);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [imageBlob]);

  const dimensions = FORMAT_SIZES[format];

  if (loading || !imageUrl) {
    return (
      <div
        className='flex flex-col items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50'
        style={{
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
        }}
      >
        <Loader2 className='w-8 h-8 text-lunary-primary-400 animate-spin mb-4' />
        <p className='text-zinc-400 text-sm'>Generating your card...</p>
      </div>
    );
  }

  return (
    <div className='rounded-lg overflow-hidden border border-zinc-700 relative'>
      {!imageLoaded && (
        <div
          className='absolute inset-0 flex items-center justify-center bg-zinc-800/50'
          style={{
            aspectRatio: `${dimensions.width} / ${dimensions.height}`,
          }}
        >
          <Loader2 className='w-8 h-8 text-lunary-primary-400 animate-spin' />
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={`w-full h-auto transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        unoptimized
      />
    </div>
  );
}
