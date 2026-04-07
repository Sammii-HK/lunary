'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapse } from '@/components/ui/Collapse';
import { hapticService } from '@/services/native/haptic-service';

interface CollapsibleSectionProps {
  title: string | ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  icon?: string;
  persistState?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  className,
  icon,
  persistState = false,
}: CollapsibleSectionProps) {
  // Get title string for data attribute and storage key
  const titleString = typeof title === 'string' ? title : 'section';

  // Check if in demo mode - start collapsed if so
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check for persisted state first
      if (persistState) {
        const stored = localStorage.getItem(`section-${titleString}`);
        if (stored !== null) {
          return JSON.parse(stored);
        }
      }

      const isDemoMode =
        document.getElementById('demo-preview-container') !== null ||
        (window as any).__LUNARY_DEMO_MODE__;
      return isDemoMode ? true : defaultCollapsed;
    }
    return defaultCollapsed;
  });

  // Persist state to localStorage
  useEffect(() => {
    if (persistState) {
      localStorage.setItem(
        `section-${titleString}`,
        JSON.stringify(isCollapsed),
      );
    }
  }, [isCollapsed, titleString, persistState]);

  const handleToggle = () => {
    hapticService.light();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 overflow-hidden',
        className,
      )}
      data-collapsible={titleString}
    >
      <button
        onClick={handleToggle}
        className='flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-elevated/50'
      >
        <div className='flex items-center gap-3'>
          {icon && <span className='text-xl'>{icon}</span>}
          {typeof title === 'string' ? (
            <h2 className='text-base md:text-lg font-medium text-content-primary'>
              {title}
            </h2>
          ) : (
            <div className='text-base md:text-lg font-medium text-content-primary'>
              {title}
            </div>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className='w-5 h-5 text-content-muted' />
        ) : (
          <ChevronUp className='w-5 h-5 text-content-muted' />
        )}
      </button>
      <Collapse isOpen={!isCollapsed}>
        <div className='border-t border-stroke-subtle/50 p-4'>{children}</div>
      </Collapse>
    </div>
  );
}
