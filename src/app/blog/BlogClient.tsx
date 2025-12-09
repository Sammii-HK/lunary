'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Star,
  TrendingUp,
  BookOpen,
  Moon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CrossPlatformCTA } from '@/components/CrossPlatformCTA';

interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  year: number;
  generatedAt: string;
  contentSummary: {
    planetaryHighlights: number;
    retrogradeChanges: number;
    majorAspects: number;
    moonPhases: number;
  };
  slug: string;
}

interface BlogClientProps {
  initialPosts: BlogPost[];
}

export function BlogClient({ initialPosts }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);

  useEffect(() => {
    fetchCurrentWeek();
    fetchAllWeeksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentWeek = async () => {
    try {
      const response = await fetch('/api/blog/weekly');
      const data = await response.json();
      setCurrentWeekData(data.data);
    } catch (error) {
      // Silent fail - initial data is already shown
    }
  };

  const fetchAllWeeksData = async () => {
    const fetchPromises = initialPosts.map(async (week) => {
      try {
        const weekStartDate = new Date(week.weekStart);
        const response = await fetch(
          `/api/blog/weekly?date=${weekStartDate.toISOString().split('T')[0]}`,
        );
        const data = await response.json();

        if (data.success && data.data) {
          return {
            ...week,
            title: data.data.title,
            subtitle: data.data.subtitle,
            summary: data.data.summary,
            contentSummary: {
              planetaryHighlights: data.data.planetaryHighlights?.length || 0,
              retrogradeChanges: data.data.retrogradeChanges?.length || 0,
              majorAspects: data.data.majorAspects?.length || 0,
              moonPhases: data.data.moonPhases?.length || 0,
            },
          };
        }
        return week;
      } catch {
        return week;
      }
    });

    const updatedPosts = await Promise.all(fetchPromises);
    setPosts(updatedPosts);
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.weekStart).getTime();
      const dateB = new Date(b.weekStart).getTime();
      return dateB - dateA;
    });
  }, [posts]);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-7xl mx-auto p-4 md:px-6 lg:px-8'>
        <div className='mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-4xl font-light text-zinc-100 mb-2 flex items-center gap-3'>
            <BookOpen className='h-8 w-8 md:h-10 md:w-10 text-lunary-primary-400' />
            Cosmic Blog
          </h1>
          <p className='text-lg md:text-xl text-zinc-400'>
            Weekly cosmic guidance and planetary insights
          </p>
        </div>

        {currentWeekData && (
          <div className='mb-8 rounded-lg border border-lunary-primary-700 bg-gradient-to-br from-lunary-primary-900/20 to-zinc-900/50 p-6 md:p-8 hover:border-lunary-primary-600 transition-colors'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='px-3 py-1 text-xs font-medium rounded-full bg-lunary-primary-900/20 text-lunary-primary-300 border border-lunary-primary-700'>
                    This Week
                  </span>
                  <span className='text-sm text-zinc-400'>
                    Week {currentWeekData.weekNumber}, {currentWeekData.year}
                  </span>
                </div>
                <h2 className='text-2xl md:text-3xl font-medium text-zinc-100 mb-2'>
                  {currentWeekData.title}
                </h2>
                <p className='text-lg text-zinc-300 italic mb-4'>
                  {currentWeekData.subtitle}
                </p>
              </div>
            </div>
            <p className='text-base text-zinc-300 mb-4 leading-relaxed'>
              {currentWeekData.summary}
            </p>
            <div className='flex flex-wrap gap-4 text-sm text-zinc-400 mb-6'>
              <span className='flex items-center gap-1.5'>
                <Star className='h-4 w-4 text-lunary-primary-400' />
                {currentWeekData.planetaryHighlights?.length || 0} planetary
                events
              </span>
              <span className='flex items-center gap-1.5'>
                <TrendingUp className='h-4 w-4 text-lunary-primary-400' />
                {currentWeekData.retrogradeChanges?.length || 0} retrograde
                changes
              </span>
              <span className='flex items-center gap-1.5'>
                <Moon className='h-4 w-4 text-lunary-primary-400' />
                {currentWeekData.moonPhases?.length || 0} moon phases
              </span>
              <span className='flex items-center gap-1.5'>
                <Sparkles className='h-4 w-4 text-lunary-primary-400' />
                {currentWeekData.majorAspects?.length || 0} major aspects
              </span>
            </div>
            <Link
              href={`/blog/week/week-${currentWeekData.weekNumber}-${currentWeekData.year}`}
              className='inline-flex items-center gap-2 px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-md transition-colors text-sm font-medium'
            >
              Read Full Forecast
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        )}

        <div className='space-y-6'>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-6'>
            Weekly Archives
          </h2>

          <div className='space-y-4'>
            {sortedPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/week/week-${post.weekNumber}-${post.year}`}
                className={`block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all group ${index > 3 ? 'content-auto' : ''}`}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='px-2.5 py-0.5 text-xs font-medium rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'>
                        Week {post.weekNumber}
                      </span>
                      <span className='text-xs text-zinc-400'>{post.year}</span>
                    </div>
                    <h3 className='text-xl md:text-2xl font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                      {post.title}
                    </h3>
                    <p className='text-base text-zinc-300 italic mb-3'>
                      {post.subtitle}
                    </p>
                  </div>
                </div>
                <p className='text-sm text-zinc-400 mb-4 leading-relaxed'>
                  {post.summary}
                </p>

                <div className='flex items-center gap-4 text-xs text-zinc-400 mb-4'>
                  <span className='flex items-center gap-1.5'>
                    <Calendar className='h-3.5 w-3.5' />
                    {new Date(post.weekStart).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    -{' '}
                    {new Date(post.weekEnd).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className='flex items-center gap-2 text-sm text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
                  Read full forecast
                  <ArrowRight className='h-4 w-4' />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <CrossPlatformCTA variant='app' source='blog_listing' />
        </section>
      </div>
    </div>
  );
}
