'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewCardProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
  arrowClassName?: string;
}

export const PreviewCard = ({
  children,
  href,
  onClick,
  className,
  showArrow = true,
  arrowClassName,
}: PreviewCardProps) => {
  const cardClasses = cn(
    'block py-3 px-4 border border-stone-800 rounded-md w-full',
    'hover:border-lunary-primary-600 transition-colors group',
    className,
  );

  const content = (
    <div className='flex items-start justify-between gap-3'>
      <div className='flex-1 min-w-0'>{children}</div>
      {showArrow && (
        <ArrowRight
          className={cn(
            'w-4 h-4 text-zinc-600 group-hover:text-lunary-accent transition-colors flex-shrink-0 mt-1',
            arrowClassName,
          )}
        />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cardClasses}>
        {content}
      </button>
    );
  }

  return <div className={cardClasses}>{content}</div>;
};

interface PreviewCardHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'default' | 'highlight' | 'warning';
}

export const PreviewCardHeader = ({
  icon,
  title,
  subtitle,
  badge,
  badgeVariant = 'default',
}: PreviewCardHeaderProps) => {
  const badgeClasses = {
    default: 'bg-zinc-700/50 text-zinc-300',
    highlight: 'bg-lunary-primary-900 text-lunary-accent-300',
    warning: 'bg-amber-500/20 text-amber-300',
  };

  return (
    <div className='flex items-center gap-2 mb-1'>
      {icon && <span className='text-lunary-accent'>{icon}</span>}
      <span className='text-sm font-medium text-zinc-200'>{title}</span>
      {subtitle && (
        <span className='text-xs text-zinc-500 uppercase tracking-wide'>
          {subtitle}
        </span>
      )}
      {badge && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            badgeClasses[badgeVariant],
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

interface PreviewCardBodyProps {
  children: ReactNode;
  className?: string;
}

export const PreviewCardBody = ({
  children,
  className,
}: PreviewCardBodyProps) => {
  return (
    <div className={cn('text-xs text-zinc-400', className)}>{children}</div>
  );
};
