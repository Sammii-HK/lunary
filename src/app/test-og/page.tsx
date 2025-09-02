'use client';

import { useState, useEffect } from 'react';

interface PostContent {
  date: string;
  primaryEvent: {
    name: string;
    energy: string;
  };
  highlights: string[];
  horoscopeSnippet: string;
  callToAction: string;
}

export default function TestOGPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [postContent, setPostContent] = useState<PostContent | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Generate array of dates for the next 30 days
  const getNextMonthDates = () => {
    const dates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDateForUrl = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fetch post content when selected date changes
  useEffect(() => {
    const fetchPostContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/og/cosmic-post?date=${formatDateForUrl(selectedDate)}`);
        const data = await response.json();
        setPostContent(data);
      } catch (error) {
        console.error('Error fetching post content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostContent();
  }, [selectedDate]);

  const nextMonthDates = getNextMonthDates();

  return (
    <div className='flex flex-col items-center gap-6 py-8 px-4'>
      <h1 className='text-3xl font-bold text-white mb-6'>Cosmic OG Preview</h1>
      
      {/* Selected Date Image */}
      <div className='bg-zinc-800 rounded-lg p-6 max-w-2xl w-full'>
        <h2 className='text-xl font-semibold text-white mb-4 text-center'>
          Selected Date: {formatDateDisplay(selectedDate)}
        </h2>
        <div className='flex justify-center mb-4'>
          <img
            src={`/api/og/cosmic?date=${formatDateForUrl(selectedDate)}`}
            alt={`Cosmic image for ${formatDateDisplay(selectedDate)}`}
            style={{ 
              width: '400px', 
              height: '400px', 
              objectFit: 'cover',
              borderRadius: '12px',
              border: '2px solid #8b5cf6'
            }}
            onClick={() => window.open(`/api/og/cosmic?date=${formatDateForUrl(selectedDate)}`, '_blank')}
            className='cursor-pointer hover:opacity-90 transition-opacity'
          />
        </div>
        <p className='text-zinc-400 text-sm text-center'>
          Click image to view full size (1200×1200px)
        </p>
      </div>

      {/* Post Content */}
      <div className='bg-zinc-800 rounded-lg p-6 max-w-2xl w-full'>
        <h2 className='text-xl font-semibold text-purple-400 mb-4'>Post Content</h2>
        {loading ? (
          <div className='animate-pulse'>
            <div className='h-4 bg-zinc-700 rounded mb-2'></div>
            <div className='h-4 bg-zinc-700 rounded mb-2'></div>
            <div className='h-4 bg-zinc-700 rounded mb-2'></div>
          </div>
        ) : postContent ? (
          <div className='space-y-4'>
            {/* <div>
              <h3 className='text-lg font-medium text-white mb-2'>
                {postContent.primaryEvent?.name} - {postContent.primaryEvent?.energy}
              </h3>
              <p className='text-zinc-300 text-sm mb-4'>{postContent.date}</p>
            </div> */}
            
            <div>
              {/* <h4 className='text-purple-300 font-medium mb-2'>🌟 Cosmic Highlights</h4> */}
              <ul className='space-y-1'>
                {postContent.highlights?.map((highlight, index) => (
                  <li key={index} className='text-zinc-300 text-sm'>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {/* <h4 className='text-purple-300 font-medium mb-2'>✨ Today's Guidance</h4> */}
              <p className='text-zinc-300 text-sm leading-relaxed'>
                {postContent.horoscopeSnippet}
              </p>
            </div>

            <div className='pt-2 border-t border-zinc-700'>
              <p className='text-purple-400 text-sm font-medium'>
                {postContent.callToAction}
              </p>
            </div>
          </div>
        ) : (
          <p className='text-zinc-400'>Failed to load post content</p>
        )}
      </div>
      
      {/* Monthly Preview Grid */}
      <div className='w-full max-w-6xl'>
        <h2 className='text-2xl font-bold text-white mb-6 text-center'>30-Day Preview</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
          {nextMonthDates.map((date, index) => (
            <div 
              key={index} 
              className={`bg-zinc-800 rounded-lg p-2 text-center cursor-pointer transition-all hover:bg-zinc-700 ${
                formatDateForUrl(date) === formatDateForUrl(selectedDate) 
                  ? 'ring-2 ring-purple-500' 
                  : ''
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <img
                src={`/api/og/cosmic?date=${formatDateForUrl(date)}`}
                alt={`Cosmic image for ${formatDateDisplay(date)}`}
                style={{ 
                  width: '100%', 
                  aspectRatio: '1/1', 
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                className='mb-2 hover:opacity-90 transition-opacity'
              />
              <p className='text-zinc-300 text-xs font-medium'>
                {formatDateDisplay(date)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
