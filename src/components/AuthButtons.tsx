'use client';

import Link from 'next/link';
import { useAuthStatus } from './AuthStatus';
import { SignOutButton } from './SignOutButton';
import { Button } from './ui/button';

interface AuthButtonsProps {
  variant?: 'primary' | 'secondary' | 'navbar';
  className?: string;
}

export function AuthButtons({
  variant = 'primary',
  className = '',
}: AuthButtonsProps) {
  const { isAuthenticated, user, loading } = useAuthStatus();

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className='animate-pulse bg-zinc-700 h-10 w-20 rounded-full'></div>
        <div className='animate-pulse bg-zinc-700 h-10 w-20 rounded-full'></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const displayName = user.name || 'User';

    if (variant === 'navbar') {
      return (
        <div className={`flex items-center gap-3 ${className}`}>
          <span className='text-sm text-zinc-300'>👋 {displayName}</span>
          <Link
            href='/profile'
            className='text-xs text-lunary-secondary hover:text-white transition-colors'
          >
            Profile
          </Link>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}
      >
        <div className='text-center'>
          <p className='text-zinc-300 mb-2'>
            Welcome back,{' '}
            <span className='text-lunary-secondary font-medium'>
              {displayName}
            </span>
            !
          </p>
          <p className='text-sm text-zinc-400'>
            Your cosmic profile is synced and ready
          </p>
        </div>
        <div className='flex gap-3'>
          <Button variant='lunary-solid' asChild>
            <Link href='/profile'>View Profile</Link>
          </Button>
          <SignOutButton variant='text' />
        </div>
      </div>
    );
  }

  // If not authenticated, show single profile creation button
  if (variant === 'primary') {
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <Button
          variant='lunary'
          size='lg'
          className='rounded-full px-8'
          asChild
        >
          <Link href='/pricing'>Start Free Trial</Link>
        </Button>
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <div className={`flex justify-center ${className}`}>
        <Button variant='lunary' asChild>
          <Link href='/pricing'>Start Free Trial</Link>
        </Button>
      </div>
    );
  }

  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Button
          variant='lunary-solid'
          size='sm'
          className='rounded-full'
          asChild
        >
          <Link href='/pricing'>Pricing</Link>
        </Button>
      </div>
    );
  }

  return null;
}
