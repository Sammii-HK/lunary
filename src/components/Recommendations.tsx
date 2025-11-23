'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, Calendar } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';

interface Recommendation {
  type: 'tarot' | 'ritual' | 'horoscope' | 'book-of-shadows';
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

export function Recommendations() {
  const authState = useAuthStatus();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = () => {
      const recs: Recommendation[] = [];

      // Always recommend Book of Shadows
      recs.push({
        type: 'book-of-shadows',
        title: 'Ask about your week',
        description: 'Get personalized weekly guidance',
        link: '/book-of-shadows?prompt=weekly overview',
        icon: <Sparkles className='w-4 h-4' />,
      });

      // Recommend tarot based on day of week
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        recs.push({
          type: 'tarot',
          title: 'Weekend Reflection Spread',
          description: 'Perfect for weekend introspection',
          link: '/tarot',
          icon: <BookOpen className='w-4 h-4' />,
        });
      } else {
        recs.push({
          type: 'tarot',
          title: 'Daily Card Guidance',
          description: 'See what the cards reveal today',
          link: '/tarot',
          icon: <BookOpen className='w-4 h-4' />,
        });
      }

      // Recommend horoscope
      recs.push({
        type: 'horoscope',
        title: 'Your Daily Horoscope',
        description: 'Personalized insights for today',
        link: '/horoscope',
        icon: <Calendar className='w-4 h-4' />,
      });

      setRecommendations(recs);
      setIsLoading(false);
    };

    generateRecommendations();
  }, []);

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex w-full items-center justify-between mb-4'
      >
        <div className='flex items-center gap-2'>
          <Sparkles className='w-5 h-5 text-purple-400' />
          <h2 className='text-lg font-semibold text-zinc-100'>
            You Might Like
          </h2>
        </div>
        <span className='text-xs text-zinc-400'>
          {isExpanded ? 'Hide' : 'Show'}
        </span>
      </button>

      {isExpanded && (
        <div className='space-y-2'>
          {recommendations.map((rec, idx) => (
            <Link
              key={idx}
              href={rec.link}
              className='block rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 hover:border-purple-500/40 transition-colors'
            >
              <div className='flex items-start gap-3'>
                <div className='mt-0.5'>{rec.icon}</div>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-zinc-200 mb-1'>
                    {rec.title}
                  </h3>
                  <p className='text-xs text-zinc-400'>{rec.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
