'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
  SortAsc,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CommunityPostCard } from './CommunityPostCard';

type SortOrder = 'newest' | 'oldest';

interface Post {
  id: number;
  postText: string;
  isAnonymous: boolean;
  userId?: string;
  createdAt: string | null;
}

interface CommunityPostFeedProps {
  spaceSlug: string;
  pageSize?: number;
  defaultSort?: SortOrder;
  className?: string;
}

export function CommunityPostFeed({
  spaceSlug,
  pageSize = 10,
  defaultSort = 'newest',
  className,
}: CommunityPostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortOrder>(defaultSort);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchPosts = useCallback(
    async (bustCache = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const offset = page * pageSize;
        const cacheBust = bustCache ? `&_t=${Date.now()}` : '';
        const res = await fetch(
          `/api/community/spaces/${spaceSlug}/posts?limit=${pageSize}&offset=${offset}&sort=${sort}${cacheBust}`,
        );

        if (!res.ok) throw new Error('Failed to load posts');

        const data = await res.json();
        setPosts(data.posts ?? []);
        setTotal(data.total ?? 0);
      } catch {
        setError('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    },
    [spaceSlug, page, pageSize, sort],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Listen for new post submissions
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.spaceSlug === spaceSlug) {
        setPage(0);
        fetchPosts(true);
      }
    };

    window.addEventListener('community-post:submitted', handler);
    return () =>
      window.removeEventListener('community-post:submitted', handler);
  }, [spaceSlug, fetchPosts]);

  if (isLoading && posts.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-20 bg-zinc-900/50 border border-zinc-800/30 rounded-lg animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className='text-sm text-zinc-500'>{error}</p>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => fetchPosts()}
          className='mt-2'
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with sort + count */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
          <MessageCircle className='w-3.5 h-3.5' />
          <span>
            {total} {total === 1 ? 'post' : 'posts'}
          </span>
        </div>
        <button
          onClick={() => {
            setSort(sort === 'newest' ? 'oldest' : 'newest');
            setPage(0);
          }}
          className='flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
        >
          <SortAsc className='w-3 h-3' />
          {sort === 'newest' ? 'Newest' : 'Oldest'}
        </button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className='text-center py-8 border border-dashed border-zinc-800 rounded-lg'>
          <p className='text-sm text-zinc-500'>
            No posts yet. Be the first to share!
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <CommunityPostCard
            key={post.id}
            id={post.id}
            postText={post.postText}
            isAnonymous={post.isAnonymous}
            userId={post.userId}
            createdAt={post.createdAt}
          />
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2 pt-2'>
          <Button
            variant='ghost'
            size='sm'
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className='h-8 px-2'
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <span className='text-xs text-zinc-500'>
            {page + 1} / {totalPages}
          </span>
          <Button
            variant='ghost'
            size='sm'
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className='h-8 px-2'
          >
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && posts.length > 0 && (
        <div className='flex justify-center py-2'>
          <Loader2 className='w-4 h-4 text-zinc-500 animate-spin' />
        </div>
      )}
    </div>
  );
}
