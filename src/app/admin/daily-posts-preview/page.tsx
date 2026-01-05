'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

type PostContent = {
  snippet?: string;
  [key: string]: unknown;
};

type ViewMode = 'daily' | 'grid';

export default function DailyPostsPreviewPage() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [postContent, setPostContent] = useState<PostContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  const next30Days = useMemo(() => {
    const dates: string[] = [];
    const startDate = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPostContent = async () => {
      setContentLoading(true);
      setContentError(null);
      try {
        const response = await fetch(
          `/api/og/cosmic-post/${selectedDate}?t=${cacheBuster}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch content (${response.status})`);
        }
        const data = await response.json();
        if (isMounted) {
          setPostContent(data);
        }
      } catch (error) {
        console.error('Error loading post content', error);
        if (isMounted) {
          setPostContent(null);
          setContentError('Unable to load post content right now.');
        }
      } finally {
        if (isMounted) {
          setContentLoading(false);
        }
      }
    };

    fetchPostContent();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, cacheBuster]);

  const postTypes = useMemo(
    () => [
      {
        name: 'Main Cosmic',
        description: 'Daily cosmic content with astronomical insights',
        imageUrl: `/api/og/cosmic/${selectedDate}?format=square&t=${cacheBuster}`,
        platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
        time: '12:00 PM UTC',
        hashtags: '#cosmic #astrology #daily',
      },
      // {
      //   name: 'Daily Crystal',
      //   description: 'Crystal recommendations for spiritual guidance',
      //   imageUrl: `/api/og/crystal/${selectedDate}?t=${cacheBuster}`,
      //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
      //   time: '3:00 PM UTC',
      //   hashtags: '#crystals #healing #spirituality',
      // },
      // {
      //   name: 'Daily Tarot',
      //   description: 'Tarot wisdom and card meanings',
      //   imageUrl: `/api/og/tarot/${selectedDate}?t=${cacheBuster}`,
      //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
      //   time: '6:00 PM UTC',
      //   hashtags: '#tarot #dailytarot #divination',
      // },
      // {
      //   name: 'Moon Phase',
      //   description: 'Lunar energy and moon phase guidance',
      //   imageUrl: `/api/og/moon/${selectedDate}?t=${cacheBuster}`,
      //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
      //   time: '9:00 PM UTC',
      //   hashtags: '#moonphases #lunar #celestial',
      // },
      // {
      //   name: 'Daily Horoscope',
      //   description: 'Zodiac wisdom and daily guidance',
      //   imageUrl: `/api/og/horoscope/${selectedDate}?t=${cacheBuster}`,
      //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
      //   time: '12:00 AM UTC (next day)',
      //   hashtags: '#horoscope #zodiac #astrology',
      // },
    ],
    [selectedDate, cacheBuster],
  );

  const contentMessage = useMemo(() => {
    if (contentLoading) {
      return 'Loading content...';
    }
    if (contentError) {
      return contentError;
    }
    return postContent?.snippet ?? 'No content available for this date yet.';
  }, [contentLoading, contentError, postContent]);

  const formatDateDisplay = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-4'>Daily Posts Preview</h1>
          <p className='text-zinc-400 mb-6'>
            Preview all daily post types and their scheduled times
          </p>

          {/* View Mode Toggle */}
          <div className='flex gap-4 mb-6'>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'daily'
                  ? 'bg-lunary-primary-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-lunary-primary-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              30-Day Grid
            </button>
          </div>

          {/* Date Selector */}
          <div className='flex items-center gap-4 mb-6'>
            <label className='text-sm font-medium'>Select Date:</label>
            <input
              type='date'
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className='px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white'
            />
            <div className='text-sm text-zinc-400'>
              {formatDateDisplay(selectedDate)}
            </div>
          </div>
        </div>

        {/* 30-Day Grid View */}
        {viewMode === 'grid' && (
          <div className='mb-12'>
            <h2 className='text-2xl font-bold mb-6'>30-Day OG Preview</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
              {next30Days.map((date) => (
                <div
                  key={date}
                  className={`bg-zinc-900 rounded-lg p-2 text-center cursor-pointer transition-all hover:bg-zinc-800 ${
                    date === selectedDate ? 'ring-2 ring-lunary-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('daily');
                  }}
                >
                  <Image
                    src={`/api/og/cosmic/${date}?format=square&t=${cacheBuster}`}
                    alt={`Cosmic image for ${date}`}
                    width={200}
                    height={200}
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                    className='mb-2 hover:opacity-90 transition-opacity'
                  />
                  <p className='text-zinc-300 text-xs font-medium'>
                    {new Date(date).toLocaleDateString('en-AU', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {viewMode === 'daily' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {postTypes.map((post, index) => (
              <div
                key={post.name}
                className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden hover:border-lunary-primary transition-colors'
              >
                {/* Post Header */}
                <div className='p-6 border-b border-zinc-700'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-xl font-bold text-white'>
                      {post.name}
                    </h3>
                    <div className='text-sm text-lunary-primary-400 font-medium'>
                      {post.time}
                    </div>
                  </div>
                  <p className='text-zinc-400 text-sm mb-3'>
                    {post.description}
                  </p>

                  {/* Platforms */}
                  <div className='flex gap-2 mb-3'>
                    {post.platforms.map((platform) => (
                      <span
                        key={platform}
                        className='px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300'
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  {/* Hashtags */}
                  {/* <div className='text-xs text-lunary-secondary'>{post.hashtags}</div> */}
                </div>

                {/* Image Preview */}
                <div className='p-6'>
                  <div className='relative aspect-square rounded-lg overflow-hidden border border-zinc-600'>
                    <Image
                      src={post.imageUrl}
                      alt={post.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className='hover:scale-105 transition-transform duration-300'
                    />
                  </div>

                  {/* Image URL for testing */}
                  <div className='mt-3 text-xs text-zinc-400 break-all'>
                    {post.imageUrl}
                  </div>

                  <div className='mb-8'>
                    <h3 className='text-xl font-bold mb-4'>Post Content</h3>
                    <div className='text-zinc-400 text-sm mb-3 whitespace-pre-line leading-relaxed'>
                      {contentMessage}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Timeline */}
        {viewMode === 'daily' && (
          <div className='mt-12 bg-zinc-900 rounded-lg p-6 border border-zinc-700'>
            <h3 className='text-xl font-bold mb-4'>Daily Schedule Timeline</h3>
            <div className='space-y-3'>
              {postTypes.map((post, index) => (
                <div key={post.name} className='flex items-center gap-4'>
                  <div className='w-16 text-sm text-lunary-primary-400 font-mono'>
                    {post.time}
                  </div>
                  <div className='w-4 h-4 bg-lunary-primary-500 rounded-full'></div>
                  <div className='flex-1'>
                    <span className='font-medium text-white'>{post.name}</span>
                    <span className='text-zinc-400 ml-2'>→</span>
                    <span className='text-zinc-400 ml-2'>
                      {post.platforms.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className='mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-700'>
          <h3 className='text-xl font-bold mb-4'>Test Actions</h3>
          <div className='flex flex-wrap gap-4'>
            <button
              onClick={() => window.open('/api/cron/daily-posts', '_blank')}
              className='px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 rounded-md text-white font-medium transition-colors'
            >
              Test Cron Job
            </button>
            <button
              onClick={() => window.open('/admin/scheduler', '_blank')}
              className='px-4 py-2 bg-lunary-primary hover:bg-lunary-primary-400 rounded-md text-white font-medium transition-colors'
            >
              Manual Scheduler
            </button>
            <a
              href='/admin/tarot-gallery'
              className='px-4 py-2 bg-lunary-primary hover:bg-lunary-primary-700 rounded-md text-white font-medium transition-colors'
            >
              Tarot Gallery
            </a>
            <a
              href='/admin/crystal-gallery'
              className='px-4 py-2 bg-lunary-success-600 hover:bg-lunary-success-700 rounded-md text-white font-medium transition-colors'
            >
              Crystal Gallery
            </a>
            <button
              onClick={() => setCacheBuster(Date.now())}
              className='px-4 py-2 bg-lunary-error-600 hover:bg-lunary-error-700 rounded-md text-white font-medium transition-colors'
            >
              🔄 Refresh Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
