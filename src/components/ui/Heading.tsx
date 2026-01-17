import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const headingVariants = cva('text-zinc-100', {
  variants: {
    variant: {
      // text-xl md:text-2xl font-light lg:text-4xl text-lunary-primary-100 break-words
      h1: 'text-xl md:text-2xl font-light tracking-tight lg:text-4xl text-lunary-primary-100 break-words',
      // h1: 'text-2xl md:text-4xl lg:text-5xl font-light tracking-tight',
      h2: 'text-lg md:text-xl font-light tracking-tight text-zinc-300 mb-3',
      h3: 'text-sm md:text-md font-normal text-lunary-primary-300 mb-2',
      h4: 'text-sm font-medium text-zinc-400 mb-3',
    },
  },
  defaultVariants: {
    variant: 'h2',
  },
});

export interface HeadingProps
  extends
    React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = (as || variant || 'h2') as 'h1' | 'h2' | 'h3' | 'h4';
    return (
      <Comp
        ref={ref as any}
        className={cn(
          headingVariants({ variant }),
          className,
          'transition-colors',
        )}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';
