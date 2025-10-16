'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function OGDebugPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [cacheKey, setCacheKey] = useState(() => Date.now());

  // Force refresh by adding timestamp to URLs
  const refreshCache = () => {
    setCacheKey(Date.now());
  };

  const ogTypes = [
    {
      name: 'Cosmic',
      url: `/api/og/cosmic?date=${selectedDate}&t=${cacheKey}`,
      description: 'Daily cosmic content with astronomical insights',
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
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">OG Image Debug Page</h1>
          <p className="text-zinc-400 mb-6">
            Debug OG images with cache-busting and real-time updates
          </p>
          
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white"
            />
            <button
              onClick={refreshCache}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition-colors"
            >
              🔄 Force Refresh (Bypass Cache)
            </button>
            <div className="text-sm text-zinc-400">
              Cache key: {cacheKey}
            </div>
          </div>

          {/* Cache Busting Info */}
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 mb-6">
            <h3 className="text-lg font-bold mb-2">Cache Busting Methods:</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• <strong>URL timestamp</strong>: Adds ?t={cacheKey} to force new requests</li>
              <li>• <strong>Browser cache</strong>: Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)</li>
              <li>• <strong>Next.js cache</strong>: Images have dynamic='force-dynamic'</li>
              <li>• <strong>Vercel cache</strong>: Deploy to production to see latest changes</li>
            </ul>
          </div>
        </div>

        {/* OG Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ogTypes.map((og) => (
            <div
              key={og.name}
              className="bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-700">
                <h3 className="text-xl font-bold text-white mb-2">{og.name}</h3>
                <p className="text-zinc-400 text-sm">{og.description}</p>
              </div>

              {/* Image */}
              <div className="p-6">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-zinc-600 mb-4">
                  <Image
                    src={og.url}
                    alt={og.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="hover:scale-105 transition-transform duration-300"
                    key={`${og.name}-${cacheKey}`} // Force React to reload
                  />
                </div>
                
                {/* URL for testing */}
                <div className="text-xs text-zinc-500 break-all mb-3">
                  {og.url}
                </div>

                {/* Direct link */}
                <button
                  onClick={() => window.open(og.url, '_blank')}
                  className="w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-white transition-colors"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-xl font-bold mb-4">Debug Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Selected Date:</strong> {selectedDate}
              <br />
              <strong>Cache Key:</strong> {cacheKey}
              <br />
              <strong>Last Refresh:</strong> {new Date(cacheKey).toLocaleTimeString()}
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
        <div className="mt-8 text-center">
          <a
            href="/admin/daily-posts-preview"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium transition-colors"
          >
            ← Back to Daily Posts Preview
          </a>
        </div>
      </div>
    </div>
  );
}
