'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === '/admin') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label =
      segment === 'admin'
        ? 'Dashboard'
        : segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

    return {
      href,
      label,
      isLast: index === segments.length - 1,
    };
  });

  return (
    <nav
      className='pt-6 mb-6 flex items-center gap-2 text-sm text-zinc-400 px-4 md:px-6 lg:px-8'
      aria-label='Breadcrumb'
    >
      <Link
        href='/admin'
        className='flex items-center gap-1 hover:text-white transition-colors'
      >
        <Home className='h-4 w-4' />
        <span>Admin</span>
      </Link>
      {breadcrumbs
        .filter((crumb) => crumb.href !== '/admin')
        .map((crumb, index) => (
          <div key={crumb.href} className='flex items-center gap-2'>
            <ChevronRight className='h-4 w-4 text-zinc-600' />
            {crumb.isLast ? (
              <span className='text-white font-medium'>{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className='hover:text-white transition-colors'
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
    </nav>
  );
}
