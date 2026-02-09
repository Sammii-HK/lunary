'use client';

import Link from 'next/link';
import { Sparkles, Moon, BookOpen, Stars, ChevronRight } from 'lucide-react';

type EmptyStateType =
  | 'patterns'
  | 'themes'
  | 'archetypes'
  | 'tarot'
  | 'journal'
  | 'horoscope'
  | 'general';

interface EmptyStateProps {
  type: EmptyStateType;
  className?: string;
  compact?: boolean;
}

const EMPTY_STATE_CONTENT: Record<
  EmptyStateType,
  {
    icon: React.ReactNode;
    heading: string;
    message: string;
    action?: { label: string; href: string };
  }
> = {
  patterns: {
    icon: <Sparkles className='w-6 h-6 text-lunary-primary-400' />,
    heading: 'Patterns will emerge',
    message:
      'Once you have used Lunary for a while, we will reveal the patterns in your cosmic journey.',
    action: { label: 'Pull a card', href: '/tarot' },
  },
  themes: {
    icon: <Sparkles className='w-6 h-6 text-lunary-primary-400' />,
    heading: 'Life themes are forming',
    message:
      'Continue your practice and your life themes will begin to take shape.',
    action: { label: 'Write a reflection', href: '/book-of-shadows' },
  },
  archetypes: {
    icon: <Moon className='w-6 h-6 text-lunary-primary-400' />,
    heading: 'Your archetype is emerging',
    message:
      'As you engage with Lunary, we will identify the archetype guiding your current journey.',
    action: { label: 'Explore your chart', href: '/app/birth-chart' },
  },
  tarot: {
    icon: <Stars className='w-6 h-6 text-lunary-primary-400' />,
    heading: 'Begin your tarot journey',
    message:
      'Pull a few more cards to discover your seasonal themes and patterns.',
    action: { label: 'Pull a card', href: '/tarot' },
  },
  journal: {
    icon: <BookOpen className='w-6 h-6 text-lunary-primary-400' />,
    heading: 'Your Book of Shadows awaits',
    message: 'Start writing to capture your cosmic insights and reflections.',
    action: { label: 'Write now', href: '/book-of-shadows' },
  },
  horoscope: {
    icon: <Stars className='w-6 h-6 text-lunary-primary-400' />,
    heading: 'Personalize your horoscope',
    message: 'Add your birth details to receive personalized cosmic guidance.',
    action: { label: 'Add birthday', href: '/profile' },
  },
  general: {
    icon: <Sparkles className='w-6 h-6 text-lunary-primary-400' />,
    heading: 'Nothing here yet',
    message: 'Continue your practice to unlock more insights.',
  },
};

export function EmptyState({
  type,
  className = '',
  compact = false,
}: EmptyStateProps) {
  const content = EMPTY_STATE_CONTENT[type];

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 ${className}`}
      >
        <div className='shrink-0 opacity-50'>{content.icon}</div>
        <p className='text-xs text-zinc-400'>{content.message}</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50 ${className}`}
    >
      <div className='w-12 h-12 rounded-full bg-lunary-primary-950/50 border border-lunary-primary-800/30 flex items-center justify-center mb-4'>
        {content.icon}
      </div>
      <h3 className='text-sm font-medium text-zinc-100 mb-2'>
        {content.heading}
      </h3>
      <p className='text-xs text-zinc-400 max-w-xs mb-4'>{content.message}</p>
      {content.action && (
        <Link
          href={content.action.href}
          className='group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lunary-primary-900/30 border border-lunary-primary-700/30 text-xs font-medium text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
        >
          {content.action.label}
          <ChevronRight className='w-3 h-3 group-hover:translate-x-0.5 transition-transform' />
        </Link>
      )}
    </div>
  );
}

interface LoadingStateProps {
  className?: string;
  lines?: number;
}

export function LoadingState({ className = '', lines = 3 }: LoadingStateProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className='h-4 bg-zinc-800 rounded animate-pulse'
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 rounded-xl bg-red-950/10 border border-red-900/30 ${className}`}
    >
      <p className='text-sm text-red-300 mb-3'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-700/30 text-xs font-medium text-red-300 hover:bg-red-900/50 transition-colors'
        >
          Try again
        </button>
      )}
    </div>
  );
}
