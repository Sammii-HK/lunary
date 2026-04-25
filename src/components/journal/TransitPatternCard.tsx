'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { SurfacedTransitPattern } from '@/lib/transit-pattern-surfacer';

type Props = {
  pattern: SurfacedTransitPattern;
  className?: string;
  /** Optional index for staggered list animation. */
  index?: number;
};

function formatDateChip(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * TransitPatternCard
 *
 * Surfaces a single detected pattern: a transit context (e.g. "When transit
 * Saturn squares your natal Moon") paired with a behavioral observation
 * ("you tend to journal anxious feelings"), a confidence bar, and small
 * date chips for the supporting entries.
 *
 * Uses Lunary tokens (`lunary-primary-*`, `content-*`, `layer-*`,
 * `stroke-subtle`) and `motion/react` for entrance animation.
 */
export function TransitPatternCard({
  pattern,
  className = '',
  index = 0,
}: Props) {
  const confidencePct = Math.round(
    Math.max(0, Math.min(1, pattern.confidence)) * 100,
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-xl border border-lunary-primary-800/40 bg-gradient-to-br from-layer-deep/60 to-layer-base/20 p-4 ${className}`}
    >
      {/* Soft sparkle accent */}
      <div className='flex items-start gap-2 mb-2'>
        <Sparkles
          className='w-4 h-4 text-lunary-primary-400 flex-shrink-0 mt-0.5'
          aria-hidden='true'
        />
        <p className='text-xs uppercase tracking-wide text-content-muted'>
          Transit pattern
        </p>
      </div>

      {/* Transit context */}
      <p className='text-sm text-content-secondary leading-relaxed'>
        <span className='text-content-brand font-medium'>
          {pattern.transitContext}
        </span>
        {', '}
        <span className='text-content-primary'>{pattern.pattern}</span>
        {'.'}
      </p>

      {/* Optional secondary journal context (only show if distinct) */}
      {pattern.journalContext && pattern.journalContext !== pattern.pattern && (
        <p className='text-xs text-content-muted mt-2 italic'>
          {pattern.journalContext}
        </p>
      )}

      {/* Confidence bar */}
      <div className='mt-3'>
        <div className='flex items-center justify-between mb-1'>
          <span className='text-[10px] uppercase tracking-wide text-content-muted'>
            Confidence
          </span>
          <span className='text-[10px] text-content-secondary tabular-nums'>
            {confidencePct}%
          </span>
        </div>
        <div className='h-1.5 w-full rounded-full bg-layer-base/40 overflow-hidden'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidencePct}%` }}
            transition={{
              duration: 0.6,
              delay: 0.15 + index * 0.05,
              ease: 'easeOut',
            }}
            className='h-full rounded-full bg-gradient-to-r from-lunary-primary-500 to-lunary-primary-300'
          />
        </div>
      </div>

      {/* Supporting date chips */}
      {pattern.supportingDates.length > 0 && (
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {pattern.supportingDates.map((iso) => (
            <span
              key={iso}
              className='text-[10px] px-2 py-0.5 rounded-full bg-layer-base/40 text-content-secondary border border-stroke-subtle'
            >
              {formatDateChip(iso)}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}

export default TransitPatternCard;
