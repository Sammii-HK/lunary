import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'text-xs border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'text-xs border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'text-xs border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-xs text-foreground',
        success:
          'text-xs border-transparent bg-lunary-success text-white hover:bg-lunary-success-400',
        warning:
          'text-xs border-transparent bg-lunary-accent text-white hover:bg-lunary-accent-400',
        error:
          'text-xs border-transparent bg-red-500 text-white hover:bg-red-600',
        'cosmic-rose':
          'text-xs border-transparent bg-[#EE789E] text-white hover:bg-[#EE789E]/80',
        aurora:
          'text-xs border-transparent bg-[#6B9B7A] text-white hover:bg-[#6B9B7A]/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
