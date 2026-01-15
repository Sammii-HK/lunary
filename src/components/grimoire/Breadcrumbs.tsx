'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  /** Disable JSON-LD injection when the parent already renders breadcrumb schema */
  renderSchema?: boolean;
}

export function Breadcrumbs({
  items,
  homeHref,
  forceMarketingHome = false,
  renderSchema = true,
}: BreadcrumbsProps) {
  const { isAuthenticated } = useAuthStatus();
  const searchParams = useSearchParams();
  const navOverride = searchParams?.get('nav');
  const fromParam = searchParams?.get('from');

  // Determine home href: explicit > force marketing > auth-based
  const resolvedHomeHref =
    homeHref ??
    (navOverride === 'app'
      ? '/app'
      : navOverride === 'marketing'
        ? '/'
        : forceMarketingHome
          ? '/'
          : isAuthenticated
            ? '/app'
            : '/');
  const appendNavParams = (href?: string) => {
    if (!href) return undefined;
    if (!navOverride && !fromParam) return href;

    const baseUrl = new URL(href, 'https://lunary.app');
    if (navOverride && !baseUrl.searchParams.get('nav')) {
      baseUrl.searchParams.set('nav', navOverride);
    }
    if (fromParam && !baseUrl.searchParams.get('from')) {
      baseUrl.searchParams.set('from', fromParam);
    }

    const query = baseUrl.searchParams.toString();
    return `${baseUrl.pathname}${query ? `?${query}` : ''}${baseUrl.hash}`;
  };

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
          href={appendNavParams(resolvedHomeHref) as string}
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
                href={appendNavParams(item.href) as string}
                className='hover:text-lunary-primary-400 transition-colors truncate max-w-[120px] md:max-w-none'
              >
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      {renderSchema && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: stringifySafe(breadcrumbSchema),
          }}
        />
      )}
    </>
  );
}
