'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function OGDebugPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [cacheKey, setCacheKey] = useState(() => Date.now());
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});

  const refreshCache = () => {
    setCacheKey(Date.now());
    setLoadErrors({});
  };

  const handleImageError = (name: string) => {
    setLoadErrors((prev) => ({ ...prev, [name]: true }));
  };

  const ogTypes = [
    {
      name: 'Cosmic (Square)',
      url: `/api/og/cosmic/${selectedDate}?format=square&t=${cacheKey}`,
      description: 'Daily cosmic content - square format',
    },
    {
      name: 'Cosmic (Landscape)',
      url: `/api/og/cosmic/${selectedDate}?format=landscape&t=${cacheKey}`,
      description: 'Daily cosmic content - landscape for X/Twitter',
    },
    {
      name: 'Cosmic Post',
      url: `/api/og/cosmic-post/${selectedDate}?t=${cacheKey}`,
      description: 'Cosmic post data endpoint (JSON)',
      isJson: true,
    },
    {
      name: 'Crystal',
      url: `/api/og/crystal?date=${selectedDate}&t=${cacheKey}`,
      description: 'Crystal recommendations with chakra info',
    },
    {
      name: 'Tarot',
      url: `/api/og/tarot?date=${selectedDate}&t=${cacheKey}`,
      description: 'Tarot cards with suit color variations',
    },
    {
      name: 'Moon',
      url: `/api/og/moon?date=${selectedDate}&t=${cacheKey}`,
      description: 'Real moon phases with astronomical data',
    },
    {
      name: 'Horoscope',
      url: `/api/og/horoscope?date=${selectedDate}&t=${cacheKey}`,
      description: 'Zodiac signs with daily wisdom',
    },
    {
      name: 'Moon Circle',
      url: `/api/og/moon-circle?date=${selectedDate}&t=${cacheKey}`,
      description: 'Moon circle event images',
    },
    {
      name: 'Social Quote',
      url: `/api/og/social-quote?quote=The+stars+align+today&t=${cacheKey}`,
      description: 'Quote images for social media',
    },
  ];

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-4'>OG Image Debug Page</h1>
          <p className='text-zinc-400 mb-6'>
            Debug OG images with cache-busting and real-time updates
          </p>

          {/* Controls */}
          <div className='flex items-center gap-4 mb-6'>
            <label className='text-sm font-medium'>Date:</label>
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
            />
            <button
              onClick={refreshCache}
              className='px-4 py-2 bg-lunary-error-600 hover:bg-lunary-error-700 rounded-md text-white font-medium transition-colors'
            >
              🔄 Force Refresh (Bypass Cache)
            </button>
            <div className='text-sm text-zinc-400'>Cache key: {cacheKey}</div>
          </div>

          {/* Cache Busting Info */}
          <div className='bg-zinc-900 rounded-lg p-4 border border-zinc-700 mb-6'>
            <h3 className='text-lg font-bold mb-2'>Cache Busting Methods:</h3>
            <ul className='text-sm text-zinc-400 space-y-1'>
              <li>
                • <strong>URL timestamp</strong>: Adds ?t={cacheKey} to force
                new requests
              </li>
              <li>
                • <strong>Browser cache</strong>: Hard refresh with Cmd+Shift+R
                (Mac) or Ctrl+Shift+R (Windows)
              </li>
              <li>
                • <strong>Next.js cache</strong>: Images have
                dynamic='force-dynamic'
              </li>
              <li>
                • <strong>Vercel cache</strong>: Deploy to production to see
                latest changes
              </li>
            </ul>
          </div>
        </div>

        {/* OG Images Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {ogTypes.map((og: any) => (
            <div
              key={og.name}
              className={`bg-zinc-900 rounded-lg border overflow-hidden ${
                loadErrors[og.name] ? 'border-lunary-error' : 'border-zinc-700'
              }`}
            >
              <div className='p-4 border-b border-zinc-700'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-bold text-white'>{og.name}</h3>
                  {loadErrors[og.name] && (
                    <span className='px-2 py-1 text-xs bg-lunary-error-900 text-lunary-error rounded'>
                      ERROR
                    </span>
                  )}
                  {og.isJson && (
                    <span className='px-2 py-1 text-xs bg-lunary-secondary-900 text-lunary-secondary rounded'>
                      JSON
                    </span>
                  )}
                </div>
                <p className='text-zinc-400 text-sm mt-1'>{og.description}</p>
              </div>

              <div className='p-4'>
                {og.isJson ? (
                  <div className='bg-zinc-800 rounded p-4 text-xs text-zinc-400 h-48 overflow-auto'>
                    <a
                      href={og.url}
                      target='_blank'
                      className='text-lunary-primary-400 hover:underline'
                    >
                      View JSON Response →
                    </a>
                  </div>
                ) : (
                  <div className='relative aspect-square rounded-lg overflow-hidden border border-zinc-600 mb-3'>
                    {loadErrors[og.name] ? (
                      <div className='absolute inset-0 flex items-center justify-center bg-lunary-error-900/20 text-lunary-error text-sm'>
                        Failed to load image
                      </div>
                    ) : (
                      <Image
                        src={og.url}
                        alt={og.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className='hover:scale-105 transition-transform duration-300'
                        key={`${og.name}-${cacheKey}`}
                        onError={() => handleImageError(og.name)}
                        unoptimized
                      />
                    )}
                  </div>
                )}

                <div className='text-xs text-zinc-400 break-all mb-2 font-mono bg-zinc-800 p-2 rounded'>
                  {og.url}
                </div>

                <button
                  onClick={() => window.open(og.url, '_blank')}
                  className='w-full px-3 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 rounded text-sm text-white transition-colors'
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Debug Info */}
        <div className='mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-700'>
          <h3 className='text-xl font-bold mb-4'>Debug Info</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <strong>Selected Date:</strong> {selectedDate}
              <br />
              <strong>Cache Key:</strong> {cacheKey}
              <br />
              <strong>Last Refresh:</strong>{' '}
              {new Date(cacheKey).toLocaleTimeString()}
            </div>
            <div>
              <strong>Dev Server:</strong> localhost:3004
              <br />
              <strong>Images:</strong> {ogTypes.length} types
              <br />
              <strong>Cache Busting:</strong> Active
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className='mt-8 text-center'>
          <a
            href='/admin/daily-posts-preview'
            className='inline-block px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 rounded-md text-white font-medium transition-colors'
          >
            ← Back to Daily Posts Preview
          </a>
        </div>
      </div>
    </div>
  );
}
