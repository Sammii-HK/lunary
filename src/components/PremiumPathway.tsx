'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { hasBirthChartAccess } from '../../utils/pricing';

type PathwayVariant = 'tarot' | 'themes' | 'shadow' | 'transits' | 'guide';

interface PremiumPathwayProps {
  variant: PathwayVariant;
  className?: string;
}

const VARIANT_COPY: Record<
  PathwayVariant,
  { title: string; description: string }
> = {
  tarot: {
    title: 'Unlock Tarot Insights',
    description:
      'Get personalized card readings, pattern analysis, and rituals tailored to your cosmic profile.',
  },
  themes: {
    title: 'Discover Your Life Themes',
    description:
      'See the deeper patterns in your journey with AI-powered theme analysis and guidance.',
  },
  shadow: {
    title: 'Explore Your Archetypes',
    description:
      'Uncover the archetypes active in your life and receive personalized shadow work practices.',
  },
  transits: {
    title: 'Personal Transit Insights',
    description:
      'See how planetary movements affect your unique birth chart with detailed transit analysis.',
  },
  guide: {
    title: 'Unlimited Astral Guide',
    description:
      'Get unlimited AI-powered cosmic guidance personalized to your chart and journey.',
  },
};

export function PremiumPathway({
  variant,
  className = '',
}: PremiumPathwayProps) {
  const subscription = useSubscription();
  const isPremium = hasBirthChartAccess(subscription.status, subscription.plan);

  if (isPremium) {
    return null;
  }

  const copy = VARIANT_COPY[variant];

  return (
    <div
      className={`rounded-lg border border-lunary-primary-800/30 bg-gradient-to-r from-lunary-primary-950/30 to-transparent p-4 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <div className='p-2 rounded-lg bg-lunary-primary-900/30 flex-shrink-0'>
          <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium text-zinc-200 mb-1'>{copy.title}</p>
          <p className='text-xs text-zinc-400 mb-3'>{copy.description}</p>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white transition-colors'
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
}
