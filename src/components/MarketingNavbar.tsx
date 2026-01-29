'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { Logo } from './Logo';
import { Button } from './ui/button';

export function MarketingNavbar() {
  const _pathname = usePathname();
  const authState = useAuthStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      data-global-nav
      className='fixed left-0 right-0 z-50 border-b-2 border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-lg top-0'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-10 md:h-16'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2 text-xl font-medium font-mono text-zinc-100 tracking-tight hover:text-lunary-primary transition-colors'
          >
            <Logo size={28} />
            Lunary
          </Link>

          {/* Navigation Links - Desktop */}
          <div className='hidden marketing:flex items-center gap-2'>
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
              href='/shop'
              className='text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-3 min-h-12 flex items-center'
            >
              Shop
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

          {/* Auth Buttons - Desktop */}
          <div className='hidden marketing:flex items-center gap-3'>
            {authState.isAuthenticated ? (
              <Button variant='outline' size='sm' asChild>
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
                <Link
                  href='/auth?signup=true'
                  className='text-sm text-lunary-primary-300 hover:text-lunary-primary-100 px-4 py-2 transition-colors'
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='marketing:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors'
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='marketing:hidden border-t-2 border-zinc-800/50 bg-lunary-primary-950 bg-opacity-30 backdrop-opacity-30 backdrop-blur-xl shadow-lg'>
          <div className='px-4 py-6 space-y-6'>
            {/* Navigation Links */}
            <div className='space-y-2'>
              <Link
                href='/grimoire'
                onClick={() => setMobileMenuOpen(false)}
                className='block text-sm text-zinc-300 hover:text-zinc-100 transition-colors py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
              >
                Grimoire
              </Link>
              <Link
                href='/blog'
                onClick={() => setMobileMenuOpen(false)}
                className='block text-sm text-zinc-300 hover:text-zinc-100 transition-colors py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
              >
                Blog
              </Link>
              <Link
                href='/shop'
                onClick={() => setMobileMenuOpen(false)}
                className='block text-sm text-zinc-300 hover:text-zinc-100 transition-colors py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
              >
                Shop
              </Link>
              <Link
                href='/pricing'
                onClick={() => setMobileMenuOpen(false)}
                className='block text-sm text-zinc-300 hover:text-zinc-100 transition-colors py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
              >
                Pricing
              </Link>
              <Link
                href='/help'
                onClick={() => setMobileMenuOpen(false)}
                className='block text-sm text-zinc-300 hover:text-zinc-100 transition-colors py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
              >
                Help
              </Link>
              <Link
                href='/app'
                onClick={() => setMobileMenuOpen(false)}
                className='block text-sm text-lunary-secondary hover:text-white transition-colors font-medium py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
              >
                App
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className='pt-4 border-t-2 border-zinc-800/50 space-y-3'>
              {authState.isAuthenticated ? (
                <Button variant='outline' size='sm' className='w-full' asChild>
                  <Link href='/app' onClick={() => setMobileMenuOpen(false)}>
                    Open App
                  </Link>
                </Button>
              ) : (
                <>
                  <Link
                    href='/auth'
                    onClick={() => setMobileMenuOpen(false)}
                    className='block text-sm text-zinc-200 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
                  >
                    Sign In
                  </Link>
                  <Link
                    href='/auth?signup=true'
                    onClick={() => setMobileMenuOpen(false)}
                    className='block text-sm text-lunary-primary-300 hover:text-lunary-primary-100 transition-colors py-2 px-3 rounded-md hover:bg-lunary-primary-900/50 text-center'
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* Bottom border to separate from page content */}
          <div className='border-b-2 border-zinc-800/50'></div>
        </div>
      )}
    </nav>
  );
}
