'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = '/shop/page',
}: PaginationProps) {
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const linkSuffix = fromParam ? `?from=${fromParam}` : '';

  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // Max pages to show

    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate middle range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at edges
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add ellipsis before middle if needed
      if (start > 2) {
        pages.push('ellipsis');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after middle if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const getPageUrl = (page: number) => {
    if (page === 1) {
      return `/shop${linkSuffix}`;
    }
    return `${basePath}/${page}${linkSuffix}`;
  };

  return (
    <nav
      className='flex items-center justify-center gap-1 sm:gap-2'
      aria-label='Shop pagination'
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='text-white/60 hover:text-white'
        >
          <Link href={getPageUrl(currentPage - 1)} aria-label='Previous page'>
            <ChevronLeft className='h-4 w-4' />
            <span className='hidden sm:inline'>Previous</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          disabled
          className='text-white/30 cursor-not-allowed'
        >
          <ChevronLeft className='h-4 w-4' />
          <span className='hidden sm:inline'>Previous</span>
        </Button>
      )}

      {/* Page Numbers */}
      <div className='flex items-center gap-1'>
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className='px-2 text-white/40'
                aria-hidden
              >
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;

          return (
            <Button
              key={page}
              variant={isCurrentPage ? 'lunary' : 'ghost'}
              size='sm'
              asChild={!isCurrentPage}
              className={`min-w-[36px] ${
                isCurrentPage
                  ? 'pointer-events-none'
                  : 'text-white/60 hover:text-white'
              }`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {isCurrentPage ? (
                <span>{page}</span>
              ) : (
                <Link href={getPageUrl(page)} aria-label={`Go to page ${page}`}>
                  {page}
                </Link>
              )}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='text-white/60 hover:text-white'
        >
          <Link href={getPageUrl(currentPage + 1)} aria-label='Next page'>
            <span className='hidden sm:inline'>Next</span>
            <ChevronRight className='h-4 w-4' />
          </Link>
        </Button>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          disabled
          className='text-white/30 cursor-not-allowed'
        >
          <span className='hidden sm:inline'>Next</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
      )}
    </nav>
  );
}
