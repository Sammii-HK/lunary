'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Animated collapse with natural bezier easing.
 * Wraps content in a CSS grid-rows transition — no JS height calculation needed.
 */
export function Collapse({ isOpen, children, className }: CollapseProps) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div className='overflow-hidden'>{children}</div>
    </div>
  );
}
