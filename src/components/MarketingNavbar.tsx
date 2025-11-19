'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStatus } from './AuthStatus';

export function MarketingNavbar() {
  const pathname = usePathname();
  const authState = useAuthStatus();

  return (
    <nav className='sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link
            href='/'
            className='text-xl font-medium text-zinc-100 tracking-tight hover:text-purple-400 transition-colors'
          >
            Lunary
          </Link>

          {/* Navigation Links */}
          <div className='hidden sm:flex items-center gap-6'>
            <Link
              href='/blog'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Blog
            </Link>
            <Link
              href='/pricing'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Pricing
            </Link>
            <Link
              href='/welcome'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Features
            </Link>
            <Link
              href='/help'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Help
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className='flex items-center gap-3'>
            {authState.isAuthenticated ? (
              <Link
                href='/app'
                className='text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors'
              >
                Open App
              </Link>
            ) : (
              <>
                <Link
                  href='/auth'
                  className='text-sm text-zinc-300 hover:text-zinc-100 px-4 py-2 transition-colors'
                >
                  Sign In
                </Link>
                <Link
                  href='/profile'
                  className='text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors'
                >
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
