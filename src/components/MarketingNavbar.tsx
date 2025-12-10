'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStatus } from './AuthStatus';
import { Logo } from './Logo';
import { Button } from './ui/button';

export function MarketingNavbar() {
  const _pathname = usePathname();
  const authState = useAuthStatus();

  const showBetaBanner = !authState.loading && !authState.isAuthenticated;

  return (
    <nav
      className={`fixed left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm ${showBetaBanner ? 'top-[36px]' : 'top-0'}`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2 text-xl font-medium font-mono text-zinc-100 tracking-tight hover:text-lunary-primary transition-colors'
          >
            <Logo size={28} />
            Lunary
          </Link>

          {/* Navigation Links - min-h-12 for 48px touch target */}
          <div className='hidden sm:flex items-center gap-2'>
            <Link
              href='/grimoire'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-3 min-h-12 flex items-center'
            >
              Grimoire
            </Link>
            <Link
              href='/blog'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-3 min-h-12 flex items-center'
            >
              Blog
            </Link>
            <Link
              href='/pricing'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-3 min-h-12 flex items-center'
            >
              Pricing
            </Link>
            <Link
              href='/help'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-3 min-h-12 flex items-center'
            >
              Help
            </Link>
            <Link
              href='/app'
              className='text-sm text-lunary-secondary hover:text-white transition-colors font-medium px-3 py-3 min-h-12 flex items-center'
            >
              App
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className='flex items-center gap-3'>
            {authState.isAuthenticated ? (
              <Button
                variant='lunary-solid'
                size='sm'
                className='rounded-full'
                asChild
              >
                <Link href='/app'>Open App</Link>
              </Button>
            ) : (
              <>
                <Link
                  href='/auth'
                  className='text-sm text-zinc-300 hover:text-zinc-100 px-4 py-2 transition-colors'
                >
                  Sign In
                </Link>
                <Button
                  variant='lunary-solid'
                  size='sm'
                  className='rounded-full'
                  asChild
                >
                  <Link href='/profile'>Start free trial</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
