import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const headingVariants = cva('text-zinc-100', {
  variants: {
    variant: {
      h1: 'text-2xl md:text-4xl lg:text-5xl font-light tracking-tight',
      h2: 'text-xl md:text-2xl font-medium tracking-tight',
      h3: 'text-lg md:text-xl font-medium',
      h4: 'text-base md:text-lg font-medium',
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
        className={cn(headingVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';
