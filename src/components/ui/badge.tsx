import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'text-xs border-transparent bg-lunary-primary text-white hover:bg-lunary-primary/80',
        secondary:
          'text-xs border-transparent bg-surface-overlay text-content-secondary hover:bg-surface-overlay/80',
        destructive:
          'text-xs border-transparent bg-lunary-error text-white hover:bg-lunary-error/80',
        outline: 'text-xs border-stroke-default text-content-primary',
        success:
          'text-xs border-transparent bg-lunary-success text-white hover:bg-lunary-success-400',
        warning:
          'text-xs border-transparent bg-lunary-accent text-white hover:bg-lunary-accent-400',
        error:
          'text-xs border-transparent bg-red-500 text-white hover:bg-red-600',
        'cosmic-rose':
          'text-xs border-transparent bg-[#EE789E] text-content-primary hover:bg-[#EE789E]/80',
        aurora:
          'text-xs border-transparent bg-[#6B9B7A] text-content-primary hover:bg-[#6B9B7A]/80',
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
