'use client';

import Link from 'next/link';
import { Sparkles, ChevronRight, Lock as LockIcon } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

type PathwayVariant = 'tarot' | 'themes' | 'shadow' | 'transits' | 'guide';

interface PremiumPathwayProps {
  variant: PathwayVariant;
  className?: string;
  compact?: boolean;
}

const PATHWAY_CONTENT: Record<
  PathwayVariant,
  { text: string; heading: string; icon: string }
> = {
  tarot: {
    heading: 'Deeper Tarot Insights',
    text: 'Unlock Tarot Seasons, rituals, and pattern narratives that reveal the story behind your cards.',
    icon: '🃏',
  },
  themes: {
    heading: 'Your Life Themes',
    text: 'See the full story of your Life Themes and how they evolve across time.',
    icon: '✨',
  },
  shadow: {
    heading: 'Shadow Archetypes',
    text: 'Explore your shadow archetypes with guided integration work and deep narratives.',
    icon: '🌙',
  },
  transits: {
    heading: 'Transits for You',
    text: 'Get full transit impact breakdowns with emotional tones, actions, and insights.',
    icon: '🌟',
  },
  guide: {
    heading: 'Astral Guide+',
    text: 'Let the Astral Guide work with your full pattern history for deeper wisdom.',
    icon: '🔮',
  },
};

export function PremiumPathway({
  variant,
  className = '',
  compact = false,
}: PremiumPathwayProps) {
  const { isSubscribed } = useSubscription();

  if (isSubscribed) {
    return null;
  }

  const content = PATHWAY_CONTENT[variant];

  if (compact) {
    return (
      <Link
        href='/pricing?nav=app'
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-lunary-primary-700/30 bg-layer-deep/20 hover:bg-layer-deep/40 transition-colors ${className}`}
      >
        <LockIcon className='w-3 h-3 text-lunary-primary-400' />
        <span className='text-xs text-content-brand'>Unlock with Lunary+</span>
        <ChevronRight className='w-3 h-3 text-lunary-primary-400 group-hover:translate-x-0.5 transition-transform' />
      </Link>
    );
  }

  return (
    <div
      className={`rounded-xl border border-lunary-primary-700/30 bg-gradient-to-br from-layer-deep/30 to-surface-elevated/60 p-4 ${className}`}
    >
      <div className='flex items-start gap-3'>
        <div className='shrink-0 text-2xl'>{content.icon}</div>
        <div className='flex-1'>
          <h3 className='text-sm font-medium text-content-primary mb-1'>
            {content.heading}
          </h3>
          <p className='text-xs text-content-muted leading-relaxed mb-3'>
            {content.text}
          </p>
          <Link
            href='/pricing?nav=app'
            className='group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lunary-primary-600/20 border border-lunary-primary-600/40 text-xs font-medium text-content-brand hover:bg-lunary-primary-600/30 transition-colors'
          >
            <Sparkles className='w-3 h-3' />
            Upgrade to Lunary+
            <ChevronRight className='w-3 h-3 group-hover:translate-x-0.5 transition-transform' />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface InlineUpgradeProps {
  feature: string;
  className?: string;
}

export function InlineUpgrade({ feature, className = '' }: InlineUpgradeProps) {
  const { isSubscribed } = useSubscription();

  if (isSubscribed) {
    return null;
  }

  return (
    <span className={`text-xs text-content-muted ${className}`}>
      <Link
        href='/pricing?nav=app'
        className='text-lunary-primary-400 hover:text-content-brand'
      >
        Upgrade to Lunary+
      </Link>{' '}
      {feature}
    </span>
  );
}

export function LockedFeatureBadge({ className = '' }: { className?: string }) {
  const { isSubscribed } = useSubscription();

  if (isSubscribed) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-card/50 border border-stroke-default/50 text-[10px] text-content-muted ${className}`}
    >
      <LockIcon className='w-2.5 h-2.5' />
      Premium
    </span>
  );
}
