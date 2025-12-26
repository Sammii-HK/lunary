import * as React from 'react';

import { cn } from '@/lib/utils';

type SectionTitleTag = 'p' | 'h2' | 'h3';

export interface SectionTitleProps extends React.HTMLAttributes<HTMLElement> {
  as?: SectionTitleTag;
}

export const SectionTitle = React.forwardRef<HTMLElement, SectionTitleProps>(
  ({ className, as, ...props }, ref) => {
    const Comp = (as || 'p') as SectionTitleTag;
    return (
      <Comp
        ref={ref as any}
        className={cn(
          'text-xs font-semibold uppercase tracking-wide text-zinc-400',
          className,
        )}
        {...props}
      />
    );
  },
);
SectionTitle.displayName = 'SectionTitle';
