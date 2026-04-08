'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompatibilityTipCardProps {
  friendName: string;
  tip: string;
  pairType: string;
  className?: string;
}

const PAIR_STYLES: Record<string, string> = {
  same: 'border-lunary-primary-800/40 from-layer-deep/30',
  complementary: 'border-green-800/40 from-green-950/30',
  challenging: 'border-amber-800/40 from-amber-950/30',
  neutral: 'border-stroke-subtle/40 from-surface-elevated/50',
};

const PAIR_LABELS: Record<string, string> = {
  same: 'Same Element',
  complementary: 'Complementary',
  challenging: 'Growth Pair',
  neutral: 'Cosmic Bond',
};

export function CompatibilityTipCard({
  friendName,
  tip,
  pairType,
  className,
}: CompatibilityTipCardProps) {
  const style = PAIR_STYLES[pairType] ?? PAIR_STYLES.neutral;
  const label = PAIR_LABELS[pairType] ?? 'Cosmic Bond';

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br to-surface-elevated p-4',
        style,
        className,
      )}
    >
      <div className='flex items-center gap-2 mb-2'>
        <Sparkles className='w-3.5 h-3.5 text-lunary-accent-400' />
        <span className='text-[10px] font-medium text-content-muted uppercase tracking-wide'>
          Daily tip with {friendName}
        </span>
        <span className='px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-surface-card/50 text-content-muted'>
          {label}
        </span>
      </div>
      <p className='text-xs text-content-secondary'>{tip}</p>
    </div>
  );
}
