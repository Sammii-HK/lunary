import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
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
      ...items.map((item, index) => ({
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
        className='flex items-center gap-2 text-sm text-zinc-400 mb-6'
        aria-label='Breadcrumb'
      >
        <Link
          href='/'
          className='hover:text-purple-400 transition-colors flex items-center gap-1'
        >
          <Home className='w-4 h-4' />
          <span className='sr-only'>Home</span>
        </Link>
        {items.map((item, index) => (
          <span key={item.href} className='flex items-center gap-2'>
            <ChevronRight className='w-4 h-4 text-zinc-600' />
            {index === items.length - 1 ? (
              <span className='text-zinc-300 font-medium'>{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className='hover:text-purple-400 transition-colors'
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
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
