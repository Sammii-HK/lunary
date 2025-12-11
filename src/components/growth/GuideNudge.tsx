'use client';

import Link from 'next/link';
import { Sparkles, ChevronRight } from 'lucide-react';
import {
  useGuideContextHints,
  buildGuidePromptFromHint,
} from '@/features/guide';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuthStatus } from '@/components/AuthStatus';

type NudgeLocation = 'tarot' | 'horoscope' | 'profile' | 'journal';

interface GuideNudgeProps {
  location: NudgeLocation;
  className?: string;
}

const LOCATION_CONTEXT: Record<
  NudgeLocation,
  { fallbackTitle: string; fallbackText: string }
> = {
  tarot: {
    fallbackTitle: 'Explore your tarot patterns',
    fallbackText:
      'The Astral Guide can help you understand what your cards reveal.',
  },
  horoscope: {
    fallbackTitle: 'Deepen your cosmic understanding',
    fallbackText: "Ask the Astral Guide about how today's transits affect you.",
  },
  profile: {
    fallbackTitle: 'Discover your cosmic journey',
    fallbackText:
      'The Astral Guide weaves together your chart, cards, and reflections.',
  },
  journal: {
    fallbackTitle: 'Reflect with guidance',
    fallbackText:
      'The Astral Guide can help you explore patterns in your reflections.',
  },
};

export function GuideNudge({ location, className = '' }: GuideNudgeProps) {
  const { isAuthenticated } = useAuthStatus();
  const { isSubscribed } = useSubscription();
  const { primaryHint, isLoading } = useGuideContextHints();

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 ${className}`}
      >
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-full bg-zinc-800 animate-pulse' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-zinc-800 rounded w-3/4 animate-pulse' />
            <div className='h-3 bg-zinc-800 rounded w-1/2 animate-pulse' />
          </div>
        </div>
      </div>
    );
  }

  const fallback = LOCATION_CONTEXT[location];
  const hint = primaryHint || {
    id: `fallback-${location}`,
    title: fallback.fallbackTitle,
    shortText: fallback.fallbackText,
    suggestedAction: 'ask_guide' as const,
  };

  const prompt = primaryHint
    ? encodeURIComponent(buildGuidePromptFromHint(primaryHint))
    : '';

  const guideUrl = prompt ? `/guide?prompt=${prompt}` : '/guide';

  return (
    <div
      className={`group rounded-xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/60 to-lunary-primary-950/20 p-4 transition-all hover:border-lunary-primary-700/50 hover:bg-gradient-to-br hover:from-zinc-900/80 hover:to-lunary-primary-950/30 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <div className='shrink-0 w-8 h-8 rounded-full bg-lunary-primary-900/40 border border-lunary-primary-700/50 flex items-center justify-center'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        </div>

        <div className='flex-1 min-w-0'>
          <h3 className='text-sm font-medium text-zinc-100 mb-1 line-clamp-1'>
            {hint.title}
          </h3>
          <p className='text-xs text-zinc-400 leading-relaxed line-clamp-2'>
            {hint.shortText}
          </p>

          <Link
            href={guideUrl}
            className='inline-flex items-center gap-1 mt-2 text-xs font-medium text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
          >
            Ask the Astral Guide
            <ChevronRight className='w-3 h-3 group-hover:translate-x-0.5 transition-transform' />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function GuideNudgeCompact({
  location,
  className = '',
}: GuideNudgeProps) {
  const { isAuthenticated } = useAuthStatus();
  const { primaryHint, isLoading } = useGuideContextHints();

  if (!isAuthenticated || isLoading) {
    return null;
  }

  const prompt = primaryHint
    ? encodeURIComponent(buildGuidePromptFromHint(primaryHint))
    : '';

  const guideUrl = prompt ? `/guide?prompt=${prompt}` : '/guide';

  return (
    <Link
      href={guideUrl}
      className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800/50 bg-zinc-900/40 hover:border-lunary-primary-700/50 hover:bg-lunary-primary-950/30 transition-all ${className}`}
    >
      <Sparkles className='w-3 h-3 text-lunary-primary-400' />
      <span className='text-xs text-zinc-300 group-hover:text-zinc-100'>
        {primaryHint ? primaryHint.title : 'Ask the Astral Guide'}
      </span>
      <ChevronRight className='w-3 h-3 text-zinc-500 group-hover:text-lunary-primary-400 group-hover:translate-x-0.5 transition-all' />
    </Link>
  );
}
