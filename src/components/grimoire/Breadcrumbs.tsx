'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';

function stringifySafe(data: object) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Override home href - if not provided, auto-detects based on auth status */
  homeHref?: string;
  /** Force marketing home (/) regardless of auth */
  forceMarketingHome?: boolean;
  /** Render schema - if false, no schema will be rendered */
  renderSchema?: boolean;
}

export function Breadcrumbs({
  items,
  homeHref,
  forceMarketingHome = false,
  renderSchema = false,
}: BreadcrumbsProps) {
  const { isAuthenticated } = useAuthStatus();

  // Determine home href: explicit > force marketing > auth-based
  const resolvedHomeHref =
    homeHref ?? (forceMarketingHome ? '/' : isAuthenticated ? '/app' : '/');

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://lunary.app',
      },
      ...items
        .filter((item) => item.href)
        .map((item, index) => ({
          '@type': 'ListItem',
          position: index + 2,
          name: item.label,
          item: `https://lunary.app${item.href}`,
        })),
    ],
  };

  return (
    <>
      <nav
        className='flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-zinc-400 mb-6 flex-wrap'
        aria-label='Breadcrumb'
      >
        <Link
          href={resolvedHomeHref}
          className='hover:text-lunary-primary-400 transition-colors flex items-center gap-1 flex-shrink-0'
        >
          <Home className='w-3.5 h-3.5 md:w-4 md:h-4' />
          <span className='sr-only'>Home</span>
        </Link>
        {items.map((item, index) => (
          <span
            key={item.href || item.label}
            className='flex items-center gap-1.5 md:gap-2 flex-shrink-0'
          >
            <ChevronRight className='w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-600 flex-shrink-0' />
            {index === items.length - 1 || !item.href ? (
              <span className='text-zinc-300 font-medium truncate max-w-[120px] md:max-w-none'>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className='hover:text-lunary-primary-400 transition-colors truncate max-w-[120px] md:max-w-none'
              >
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: stringifySafe(breadcrumbSchema),
        }}
      />
    </>
  );
}
