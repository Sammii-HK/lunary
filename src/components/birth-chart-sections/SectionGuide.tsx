'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GuideVariant = 'start' | 'next' | 'pro';

interface SectionGuideProps {
  label: string;
  children: ReactNode;
  variant?: GuideVariant;
  className?: string;
}

const variantStyles: Record<GuideVariant, string> = {
  start: 'border-lunary-accent/30 bg-lunary-accent/10 text-lunary-accent',
  next: 'border-lunary-secondary/30 bg-lunary-secondary/10 text-lunary-secondary',
  pro: 'border-stroke-subtle bg-surface-card/60 text-content-secondary',
};

export function SectionGuide({
  label,
  children,
  variant = 'next',
  className,
}: SectionGuideProps) {
  return (
    <div
      className={cn(
        'mb-3 rounded-lg border px-3 py-2 text-xs leading-relaxed',
        variantStyles[variant],
        className,
      )}
    >
      <div className='mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-current/80'>
        {label}
      </div>
      <div className='text-content-secondary'>{children}</div>
    </div>
  );
}
