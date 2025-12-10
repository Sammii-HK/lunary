'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Star,
  TrendingUp,
  BookOpen,
  Moon,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CrossPlatformCTA } from '@/components/CrossPlatformCTA';
import { Button } from '@/components/ui/button';

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

const POSTS_PER_PAGE = 8;

export function BlogClient({ initialPosts }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

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

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return sortedPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [sortedPosts, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='bg-zinc-950 text-zinc-100 pb-20'>
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
            <Button variant='lunary-solid' asChild>
              <Link
                href={`/blog/week/week-${currentWeekData.weekNumber}-${currentWeekData.year}${linkSuffix}`}
              >
                Read Full Forecast
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        )}

        <div className='space-y-6'>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-6'>
            Weekly Archives
          </h2>

          <div className='space-y-4'>
            {paginatedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/week/week-${post.weekNumber}-${post.year}${linkSuffix}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all group'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='px-2.5 py-0.5 text-xs font-medium rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'>
                        Week {post.weekNumber}
                      </span>
                      <span className='text-xs text-zinc-400'>{post.year}</span>
                    </div>
                    <h3 className='text-xl md:text-2xl font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-300 transition-colors line-clamp-1'>
                      {post.title}
                    </h3>
                    <p className='text-base text-zinc-300 italic mb-3 line-clamp-1'>
                      {post.subtitle}
                    </p>
                  </div>
                </div>
                <p className='text-sm text-zinc-400 mb-4 leading-relaxed line-clamp-2'>
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

          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2 mt-8 pt-6 border-t border-zinc-800'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className='disabled:opacity-40 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:pointer-events-none'
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>

              <div className='flex items-center gap-1'>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-lunary-primary-900 text-lunary-primary-300 border border-lunary-primary-700'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <Button
                variant='ghost'
                size='sm'
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='disabled:opacity-40 disabled:text-zinc-500 disabled:cursor-not-allowed disabled:pointer-events-none'
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>

        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <CrossPlatformCTA variant='app' source='blog_listing' />
        </section>
      </div>
    </div>
  );
}
