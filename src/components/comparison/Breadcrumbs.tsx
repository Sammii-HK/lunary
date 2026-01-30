import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label='Breadcrumb' className='mb-6'>
      <ol className='flex items-center gap-2 text-sm text-zinc-400'>
        <li>
          <Link
            href='/'
            className='hover:text-lunary-primary-300 transition-colors'
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.href} className='flex items-center gap-2'>
            <ChevronRight className='h-4 w-4' />
            {index === items.length - 1 ? (
              <span className='text-zinc-300' aria-current='page'>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className='hover:text-lunary-primary-300 transition-colors'
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
