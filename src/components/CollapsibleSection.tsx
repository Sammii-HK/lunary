'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string | ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  className,
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={cn('space-y-4', className)}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className='flex w-full items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-4 py-3 text-left transition-colors hover:bg-zinc-900/50'
      >
        {typeof title === 'string' ? (
          <h2 className='text-lg font-medium text-zinc-100'>{title}</h2>
        ) : (
          <div className='text-lg font-medium text-zinc-100'>{title}</div>
        )}
        {isCollapsed ? (
          <ChevronDown className='w-5 h-5 text-zinc-400' />
        ) : (
          <ChevronUp className='w-5 h-5 text-zinc-400' />
        )}
      </button>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
}
