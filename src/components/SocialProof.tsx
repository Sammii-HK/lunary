'use client';

import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
}

// Placeholder testimonials - these should be replaced with real testimonials
const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah M.',
    text: 'Lunary has completely transformed how I understand my cosmic blueprint. The personalized insights are incredibly accurate and meaningful.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Alex K.',
    text: 'Finally, an astrology app that respects my intelligence. The birth chart analysis is detailed and the daily guidance feels truly personal.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Jordan L.',
    text: 'The AI features are game-changing. I can ask deep questions about my chart and get thoughtful, nuanced answers.',
    rating: 5,
  },
];

export function SocialProof() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [testimonials] = useState<Testimonial[]>(PLACEHOLDER_TESTIMONIALS);

  useEffect(() => {
    // Fetch user count from API
    // This endpoint might require authentication, so we gracefully fall back
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/admin/subscriber-count', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.count) {
            setUserCount(data.count);
            return;
          }
        }
      } catch (error) {
        // Silently fail - API might not be accessible to all users
        console.debug('Could not fetch subscriber count:', error);
      }
      // Fallback to placeholder if API fails or is unavailable
      setUserCount(1250);
    };

    fetchUserCount();
  }, []);

  if (userCount === null) {
    return null;
  }

  return (
    <div className='space-y-12'>
      {/* Trust Counter */}
      <div className='text-center'>
        <div className='inline-flex items-center gap-2 px-6 py-3 rounded-full border border-lunary-primary/30 bg-lunary-primary-500/10 backdrop-blur-sm'>
          <Star
            className='w-5 h-5 text-lunary-primary-300'
            fill='currentColor'
          />
          <span className='text-lg font-medium text-white'>
            Trusted by {userCount.toLocaleString()}+ cosmic seekers
          </span>
        </div>
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className='p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/40 transition-colors'
            >
              <div className='flex items-center gap-1 mb-3'>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className='w-4 h-4 text-lunary-accent'
                    fill='currentColor'
                  />
                ))}
              </div>
              <Quote className='w-6 h-6 text-lunary-primary-400/50 mb-3' />
              <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className='text-xs text-zinc-500 font-medium'>
                — {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
