'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Mail } from 'lucide-react';
import { conversionTracking } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from './AuthStatus';

interface CrossPlatformCTAProps {
  variant?: 'app' | 'substack' | 'newsletter' | 'blog';
  source?: string;
  className?: string;
}

export function CrossPlatformCTA({
  variant = 'app',
  source,
  className = '',
}: CrossPlatformCTAProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const substackUrl = 'https://lunary.substack.com';
  const authState = useAuthStatus();

  const handleClick = (platform: string) => {
    conversionTracking.upgradeClicked(
      `cross_platform_${platform}`,
      `${source || 'unknown'}_${variant}`,
    );
  };

  if (variant === 'app') {
    return (
      <div
        className={`rounded-lg border border-lunary-primary/20 bg-gradient-to-br from-lunary-primary-900/20 to-zinc-900/50 p-6 ${className}`}
      >
        <div className='flex items-start gap-4'>
          <Sparkles className='w-6 h-6 text-lunary-primary-400 flex-shrink-0 mt-1' />
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Get Your Personalized Cosmic Profile
            </h3>
            <p className='text-zinc-300 mb-4'>
              Discover your complete birth chart, personalized daily horoscopes,
              and interactive cosmic guidance tailored to your exact birth time
              and location.
            </p>
            <Button variant='lunary' asChild>
              <Link
                href={
                  authState.isAuthenticated
                    ? '/app'
                    : `${baseUrl}/pricing?utm_source=${source || 'blog'}&utm_medium=cta&utm_campaign=cross_platform`
                }
                onClick={() => handleClick('app')}
              >
                {authState.isAuthenticated
                  ? 'Open Lunary App'
                  : 'Start Free Trial'}
                <ArrowRight className='w-4 h-4' />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'substack') {
    return (
      <div
        className={`rounded-lg border border-lunary-secondary-800 bg-gradient-to-br from-lunary-secondary-900/20 to-zinc-900/50 p-6 ${className}`}
      >
        <div className='flex items-start gap-4'>
          <Mail className='w-6 h-6 text-lunary-secondary flex-shrink-0 mt-1' />
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Get Weekly Cosmic Insights via Email
            </h3>
            <p className='text-zinc-300 mb-4'>
              Subscribe to our Substack newsletter for weekly cosmic forecasts,
              planetary insights, and ritual guidance delivered to your inbox.
            </p>
            <Button variant='lunary-solid' asChild>
              <Link
                href={`${substackUrl}?utm_source=${source || 'app'}&utm_medium=cta&utm_campaign=cross_platform`}
                onClick={() => handleClick('substack')}
                target='_blank'
                rel='noopener noreferrer'
              >
                Subscribe on Substack
                <ArrowRight className='w-4 h-4' />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'blog') {
    return (
      <div
        className={`rounded-lg border border-zinc-700/50 bg-zinc-900/30 p-6 ${className}`}
      >
        <div className='flex items-start gap-4'>
          <BookOpen className='w-6 h-6 text-zinc-400 flex-shrink-0 mt-1' />
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Explore More Cosmic Content
            </h3>
            <p className='text-zinc-300 mb-4'>
              Read our weekly blog posts for in-depth cosmic guidance, planetary
              analysis, and ritual recommendations.
            </p>
            <Button variant='secondary' asChild>
              <Link
                href={`${baseUrl}/blog?utm_source=${source || 'app'}&utm_medium=cta&utm_campaign=cross_platform`}
                onClick={() => handleClick('blog')}
              >
                Visit Blog
                <ArrowRight className='w-4 h-4' />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
