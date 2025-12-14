import Link from 'next/link';
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
import { BlogPost, POSTS_PER_PAGE } from './blog-utils';

interface BlogListProps {
  posts: BlogPost[];
  currentWeekData?: {
    weekNumber: number;
    year: number;
    title: string;
    subtitle: string;
    summary: string;
    planetaryHighlights?: any[];
    retrogradeChanges?: any[];
    moonPhases?: any[];
    majorAspects?: any[];
  } | null;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
  }

  return pages;
}

export function BlogList({
  posts,
  currentWeekData,
  currentPage,
  totalPages,
  totalPosts,
}: BlogListProps) {
  const pageNumbers = generatePageNumbers(currentPage, totalPages);
  const isFirstPage = currentPage === 1;

  return (
    <div className='bg-zinc-950 text-zinc-100 pb-20'>
      <div className='max-w-7xl mx-auto p-4 md:px-6 lg:px-8'>
        <header className='mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-4xl font-light text-zinc-100 mb-2 flex items-center gap-3'>
            <BookOpen className='h-8 w-8 md:h-10 md:w-10 text-lunary-primary-400' />
            {isFirstPage ? 'Cosmic Blog' : `Cosmic Blog - Page ${currentPage}`}
          </h1>
          <p className='text-lg md:text-xl text-zinc-400'>
            Weekly cosmic guidance and planetary insights
          </p>
          {!isFirstPage && (
            <p className='text-sm text-zinc-500 mt-2'>
              Showing {(currentPage - 1) * POSTS_PER_PAGE + 1} -{' '}
              {Math.min(currentPage * POSTS_PER_PAGE, totalPosts)} of{' '}
              {totalPosts} weekly forecasts
            </p>
          )}
        </header>

        {isFirstPage && currentWeekData && (
          <article
            className='mb-8 rounded-lg border border-lunary-primary-700 bg-gradient-to-br from-lunary-primary-900/20 to-zinc-900/50 p-6 md:p-8 hover:border-lunary-primary-600 transition-colors'
            itemScope
            itemType='https://schema.org/Article'
          >
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
                <h2
                  className='text-2xl md:text-3xl font-medium text-zinc-100 mb-2'
                  itemProp='headline'
                >
                  {currentWeekData.title}
                </h2>
                <p
                  className='text-lg text-zinc-300 italic mb-4'
                  itemProp='description'
                >
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
                href={`/blog/week/week-${currentWeekData.weekNumber}-${currentWeekData.year}`}
                itemProp='url'
              >
                Read Full Forecast
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </article>
        )}

        <section className='space-y-6'>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-6'>
            Weekly Archives
          </h2>

          <div
            className='space-y-4'
            itemScope
            itemType='https://schema.org/ItemList'
          >
            <meta itemProp='numberOfItems' content={String(totalPosts)} />
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/week/week-${post.weekNumber}-${post.year}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all group'
                itemScope
                itemType='https://schema.org/ListItem'
                itemProp='itemListElement'
              >
                <meta
                  itemProp='position'
                  content={String(
                    (currentPage - 1) * POSTS_PER_PAGE + index + 1,
                  )}
                />
                <div
                  itemScope
                  itemType='https://schema.org/Article'
                  itemProp='item'
                >
                  <meta
                    itemProp='url'
                    content={`https://lunary.app/blog/week/week-${post.weekNumber}-${post.year}`}
                  />
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='px-2.5 py-0.5 text-xs font-medium rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'>
                          Week {post.weekNumber}
                        </span>
                        <span className='text-xs text-zinc-400'>
                          {post.year}
                        </span>
                      </div>
                      <h3
                        className='text-xl md:text-2xl font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-300 transition-colors line-clamp-1'
                        itemProp='headline'
                      >
                        {post.title}
                      </h3>
                      <p
                        className='text-base text-zinc-300 italic mb-3 line-clamp-1'
                        itemProp='description'
                      >
                        {post.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className='text-sm text-zinc-400 mb-4 leading-relaxed line-clamp-2'>
                    {post.summary}
                  </p>

                  <div className='flex items-center gap-4 text-xs text-zinc-400 mb-4'>
                    <time
                      className='flex items-center gap-1.5'
                      dateTime={post.weekStart}
                      itemProp='datePublished'
                    >
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
                    </time>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
                    Read full forecast
                    <ArrowRight className='h-4 w-4' />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className='flex items-center justify-center gap-2 mt-8 pt-6 border-t border-zinc-800'
              aria-label='Blog pagination'
            >
              {currentPage > 1 ? (
                <Button variant='ghost' size='sm' asChild>
                  <Link
                    href={
                      currentPage === 2
                        ? '/blog'
                        : `/blog/page/${currentPage - 1}`
                    }
                    rel='prev'
                    aria-label='Go to previous page'
                  >
                    <ChevronLeft className='h-4 w-4' />
                    Previous
                  </Link>
                </Button>
              ) : (
                <Button
                  variant='ghost'
                  size='sm'
                  disabled
                  className='opacity-40 cursor-not-allowed'
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
              )}

              <div className='flex items-center gap-1'>
                {pageNumbers.map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className='w-8 h-8 flex items-center justify-center text-zinc-500'
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={page}
                      href={page === 1 ? '/blog' : `/blog/page/${page}`}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                        page === currentPage
                          ? 'bg-lunary-primary-900 text-lunary-primary-300 border border-lunary-primary-700'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </Link>
                  ),
                )}
              </div>

              {currentPage < totalPages ? (
                <Button variant='ghost' size='sm' asChild>
                  <Link
                    href={`/blog/page/${currentPage + 1}`}
                    rel='next'
                    aria-label='Go to next page'
                  >
                    Next
                    <ChevronRight className='h-4 w-4' />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant='ghost'
                  size='sm'
                  disabled
                  className='opacity-40 cursor-not-allowed'
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              )}
            </nav>
          )}
        </section>

        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <CrossPlatformCTA variant='app' source='blog_listing' />
        </section>
      </div>
    </div>
  );
}
