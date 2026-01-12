'use client';

import { ReactNode, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableCardProps {
  preview: ReactNode;
  expanded: ReactNode;
  defaultExpanded?: boolean;
  autoExpandOnDesktop?: boolean;
  className?: string;
  previewClassName?: string;
  expandedClassName?: string;
  onToggle?: (isExpanded: boolean) => void;
}

export const ExpandableCard = ({
  preview,
  expanded,
  defaultExpanded = false,
  autoExpandOnDesktop = false,
  className,
  previewClassName,
  expandedClassName,
  onToggle,
}: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (!autoExpandOnDesktop) return;

    const checkDesktop = () => {
      const isNowDesktop = window.matchMedia('(min-width: 768px)').matches;
      setIsDesktop(isNowDesktop);
      if (isNowDesktop) {
        setIsExpanded(true);
      }
    };

    checkDesktop();
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    mediaQuery.addEventListener('change', checkDesktop);
    return () => mediaQuery.removeEventListener('change', checkDesktop);
  }, [autoExpandOnDesktop]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <div
      data-component='expandable-card'
      data-version='v2'
      className={cn(
        'bg-lunary-bg border border-zinc-800/50 rounded-md w-full overflow-hidden transition-all relative',
        isExpanded && 'border-lunary-primary-700/50',
        className,
      )}
    >
      <div
        role='button'
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={handleToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
          }
        }}
        className={cn(
          'w-full py-3 px-4 text-left hover:bg-zinc-900/50 transition-colors group',
          previewClassName,
        )}
      >
        <div className='w-full'>{preview}</div>
        <div className='absolute top-1 right-2'>
          {isExpanded ? (
            <ChevronUp className='w-4 h-4 text-zinc-500' />
          ) : (
            <ChevronDown className='w-4 h-4 text-zinc-600 group-hover:text-lunary-accent transition-colors' />
          )}
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div
          className={cn(
            'px-4 pb-4 border-t border-zinc-800/30 max-h-[400px] overflow-y-auto',
            expandedClassName,
          )}
        >
          {expanded}
        </div>
      </div>
    </div>
  );
};

interface ExpandableCardHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'highlight' | 'warning' | 'danger';
  action?: ReactNode;
}

export const ExpandableCardHeader = ({
  icon,
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
  action,
}: ExpandableCardHeaderProps) => {
  const badgeClasses = {
    default: 'bg-zinc-800/50 text-zinc-400',
    highlight: 'bg-zinc-800/50 text-lunary-primary-200',
    warning: 'bg-zinc-800/50 text-lunary-accent-200',
    danger: 'bg-lunary-error-950/50 text-lunary-error-300',
  };

  return (
    <div className='flex items-center justify-between w-full pr-2'>
      <div className='flex items-center gap-2'>
        {icon && <span>{icon}</span>}
        <span className='text-sm font-medium text-zinc-200'>{title}</span>
        {subtitle && <span className='text-xs text-zinc-400'>{subtitle}</span>}
      </div>
      <div className='flex items-center gap-2'>
        {action}
        {badge && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded',
              badgeClasses[badgeVariant],
            )}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
