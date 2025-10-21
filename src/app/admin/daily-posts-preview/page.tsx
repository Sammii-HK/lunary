'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const selectedDate = new Date().toISOString().split('T')[0];

const postContent = await fetch(`/api/og/cosmic-post/${selectedDate}`);
const postContentData = await postContent.json();
console.log('postContentData', postContentData)

export default function DailyPostsPreviewPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Add cache busting timestamp for debugging
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const postTypes = [
    {
      name: 'Main Cosmic',
      description: 'Daily cosmic content with astronomical insights',
      imageUrl: `/api/og/cosmic/${selectedDate}`,
      platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
      time: '12:00 PM UTC',
      hashtags: '#cosmic #astrology #daily',
    },
    // {
    //   name: 'Daily Crystal',
    //   description: 'Crystal recommendations for spiritual guidance',
    //   imageUrl: `/api/og/crystal/${selectedDate}&t=${cacheBuster}`,
    //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
    //   time: '3:00 PM UTC',
    //   hashtags: '#crystals #healing #spirituality',
    // },
    // {
    //   name: 'Daily Tarot',
    //   description: 'Tarot wisdom and card meanings',
    //   imageUrl: `/api/og/tarot/${selectedDate}&t=${cacheBuster}`,
    //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
    //   time: '6:00 PM UTC',
    //   hashtags: '#tarot #dailytarot #divination',
    // },
    // {
    //   name: 'Moon Phase',
    //   description: 'Lunar energy and moon phase guidance',
    //   imageUrl: `/api/og/moon/${selectedDate}&t=${cacheBuster}`,
    //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
    //   time: '9:00 PM UTC',
    //   hashtags: '#moonphases #lunar #celestial',
    // },
    // {
    //   name: 'Daily Horoscope',
    //   description: 'Zodiac wisdom and daily guidance',
    //   imageUrl: `/api/og/horoscope/${selectedDate}&t=${cacheBuster}`,
    //   platforms: ['X', 'Bluesky', 'Instagram', 'Reddit', 'Pinterest'],
    //   time: '12:00 AM UTC (next day)',
    //   hashtags: '#horoscope #zodiac #astrology',
    // },
  ];

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

        {/* Posts Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {postTypes.map((post, index) => (
            <div
              key={post.name}
              className='bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden hover:border-purple-500 transition-colors'
            >
              {/* Post Header */}
              <div className='p-6 border-b border-zinc-700'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xl font-bold text-white'>{post.name}</h3>
                  <div className='text-sm text-purple-400 font-medium'>
                    {post.time}
                  </div>
                </div>
                <p className='text-zinc-400 text-sm mb-3'>{post.description}</p>

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
                {/* <div className='text-xs text-blue-400'>{post.hashtags}</div> */}
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
                <div className='mt-3 text-xs text-zinc-500 break-all'>
                  {post.imageUrl}
                </div>

                <div className='mb-8'>
                  <h3 className='text-xl font-bold mb-4'>Post Content</h3>
                  <div className='text-zinc-400 text-sm mb-3 whitespace-pre-line leading-relaxed'>
                    {postContentData.snippet}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Timeline */}
        <div className='mt-12 bg-zinc-900 rounded-lg p-6 border border-zinc-700'>
          <h3 className='text-xl font-bold mb-4'>Daily Schedule Timeline</h3>
          <div className='space-y-3'>
            {postTypes.map((post, index) => (
              <div key={post.name} className='flex items-center gap-4'>
                <div className='w-16 text-sm text-purple-400 font-mono'>
                  {post.time}
                </div>
                <div className='w-4 h-4 bg-purple-500 rounded-full'></div>
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

        {/* Test Actions */}
        <div className='mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-700'>
          <h3 className='text-xl font-bold mb-4'>Test Actions</h3>
          <div className='flex flex-wrap gap-4'>
            <button
              onClick={() => window.open('/api/cron/daily-posts', '_blank')}
              className='px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-medium transition-colors'
            >
              Test Cron Job
            </button>
            <button
              onClick={() => window.open('/admin/scheduler', '_blank')}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors'
            >
              Manual Scheduler
            </button>
            <a
              href='/admin/tarot-gallery'
              className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium transition-colors'
            >
              Tarot Gallery
            </a>
            <a
              href='/admin/crystal-gallery'
              className='px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium transition-colors'
            >
              Crystal Gallery
            </a>
            <button
              onClick={() => setCacheBuster(Date.now())}
              className='px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition-colors'
            >
              🔄 Refresh Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
