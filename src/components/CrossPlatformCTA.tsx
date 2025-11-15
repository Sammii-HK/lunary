'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, BookOpen, Mail } from 'lucide-react';
import { conversionTracking } from '@/lib/analytics';

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

  const handleClick = (platform: string) => {
    conversionTracking.upgradeClicked(
      `cross_platform_${platform}`,
      `${source || 'unknown'}_${variant}`,
    );
  };

  if (variant === 'app') {
    return (
      <div
        className={`rounded-lg border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-zinc-900/50 p-6 ${className}`}
      >
        <div className='flex items-start gap-4'>
          <Sparkles className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1' />
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Get Your Personalized Cosmic Profile
            </h3>
            <p className='text-zinc-300 mb-4'>
              Discover your complete birth chart, personalized daily horoscopes,
              and interactive cosmic guidance tailored to your exact birth time
              and location.
            </p>
            <Link
              href={`${baseUrl}/pricing?utm_source=${source || 'blog'}&utm_medium=cta&utm_campaign=cross_platform`}
              onClick={() => handleClick('app')}
              className='inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm font-medium'
            >
              Open Lunary App
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'substack') {
    return (
      <div
        className={`rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-zinc-900/50 p-6 ${className}`}
      >
        <div className='flex items-start gap-4'>
          <Mail className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1' />
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Get Weekly Cosmic Insights via Email
            </h3>
            <p className='text-zinc-300 mb-4'>
              Subscribe to our Substack newsletter for weekly cosmic forecasts,
              planetary insights, and ritual guidance delivered to your inbox.
            </p>
            <Link
              href={`${substackUrl}?utm_source=${source || 'app'}&utm_medium=cta&utm_campaign=cross_platform`}
              onClick={() => handleClick('substack')}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium'
            >
              Subscribe on Substack
              <ArrowRight className='w-4 h-4' />
            </Link>
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
            <Link
              href={`${baseUrl}/blog?utm_source=${source || 'app'}&utm_medium=cta&utm_campaign=cross_platform`}
              onClick={() => handleClick('blog')}
              className='inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition-colors text-sm font-medium'
            >
              Visit Blog
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
