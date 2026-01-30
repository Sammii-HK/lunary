'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type ColorVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'highlight'
  | 'rose'
  | 'success';

interface PatternCardProps {
  title: string;
  subtitle?: string;
  color?: ColorVariant;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  locked?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
}

// Map variant to Tailwind classes (avoids dynamic class generation issues)
const COLOR_CLASSES = {
  primary: {
    border: 'border-lunary-primary-800',
    bg: 'bg-lunary-primary-950/40',
    icon: 'text-lunary-primary-400',
    title: 'text-lunary-primary-300',
  },
  secondary: {
    border: 'border-lunary-secondary-800',
    bg: 'bg-lunary-secondary-950/40',
    icon: 'text-lunary-secondary-400',
    title: 'text-lunary-secondary-300',
  },
  accent: {
    border: 'border-lunary-accent-800',
    bg: 'bg-lunary-accent-950/40',
    icon: 'text-lunary-accent-400',
    title: 'text-lunary-accent-300',
  },
  highlight: {
    border: 'border-lunary-highlight-800',
    bg: 'bg-lunary-highlight-950/40',
    icon: 'text-lunary-highlight-400',
    title: 'text-lunary-highlight-300',
  },
  rose: {
    border: 'border-lunary-rose-800',
    bg: 'bg-lunary-rose-950/40',
    icon: 'text-lunary-rose-400',
    title: 'text-lunary-rose-300',
  },
  success: {
    border: 'border-lunary-success-800',
    bg: 'bg-lunary-success-950/40',
    icon: 'text-lunary-success-400',
    title: 'text-lunary-success-300',
  },
} as const;

export function PatternCard({
  title,
  subtitle,
  color = 'primary',
  icon,
  badge,
  children,
  locked = false,
  onUpgradeClick,
  className,
}: PatternCardProps) {
  const colorClasses = COLOR_CLASSES[color];

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        colorClasses.border,
        colorClasses.bg,
        locked && 'relative overflow-hidden',
        className,
      )}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          {icon && <span className={colorClasses.icon}>{icon}</span>}
          <h3 className={cn('text-sm font-medium', colorClasses.title)}>
            {title}
          </h3>
        </div>
        {badge && (
          <Badge variant='outline' className='text-xs'>
            {badge}
          </Badge>
        )}
      </div>
      {subtitle && <p className='text-xs text-zinc-500 mb-3'>{subtitle}</p>}

      {locked ? (
        <>
          <div className='filter blur-sm pointer-events-none'>{children}</div>
          <div className='absolute inset-0 flex items-center justify-center bg-lunary-bg/80 backdrop-blur-sm'>
            <button
              onClick={onUpgradeClick}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                'bg-lunary-accent hover:bg-lunary-accent/80 text-white',
              )}
            >
              Upgrade to unlock
            </button>
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
