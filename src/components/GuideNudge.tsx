'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useGuideContextHints } from '@/hooks/useGuideContextHints';
import { useSubscription } from '@/hooks/useSubscription';
import { hasFeatureAccess } from '../../utils/pricing';

type NudgeLocation = 'tarot' | 'horoscope' | 'profile' | 'journal';

interface GuideNudgeProps {
  location: NudgeLocation;
  className?: string;
}

export function GuideNudge({ location, className = '' }: GuideNudgeProps) {
  const hint = useGuideContextHints(location);
  const subscription = useSubscription();
  const hasPaidAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
  );

  if (!hint) {
    return null;
  }

  const guideUrl = `/guide?prompt=${encodeURIComponent(hint.suggestedPrompt)}`;

  return (
    <div
      className={`rounded-lg border border-lunary-primary-800/50 bg-gradient-to-r from-lunary-primary-950/30 to-transparent p-3 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <div className='p-1.5 rounded-md bg-lunary-primary-900/30'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        </div>
        <div className='flex-1 min-w-0'>
          {hasPaidAccess ? (
            <>
              <p className='text-sm text-zinc-300 mb-1'>{hint.title}</p>
              <p className='text-xs text-zinc-400 mb-2'>{hint.shortText}</p>
            </>
          ) : (
            <p className='text-sm text-zinc-300 mb-2'>{hint.shortText}</p>
          )}
          <Link
            href={guideUrl}
            className='inline-flex items-center gap-1.5 text-xs font-medium text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
          >
            <Sparkles className='w-3 h-3' />
            Ask the Astral Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
