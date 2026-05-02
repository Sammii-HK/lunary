'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShareIconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export const ShareIconButton = forwardRef<
  HTMLButtonElement,
  ShareIconButtonProps
>(({ label, className, ...props }, ref) => (
  <button
    ref={ref}
    type='button'
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex h-7 min-h-7 w-7 min-w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 text-content-muted shadow-none transition-colors hover:bg-surface-card/50 hover:text-content-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary/45',
      className,
    )}
    data-dashboard-share='compact'
    {...props}
  >
    <Share2 className='h-3.5 w-3.5' aria-hidden='true' />
  </button>
));

ShareIconButton.displayName = 'ShareIconButton';
