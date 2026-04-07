import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type MetricsCardProps = {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
};

export function MetricsCard({
  title,
  value,
  change,
  trend = 'stable',
  subtitle,
}: MetricsCardProps) {
  const hasChange = typeof change === 'number' && !Number.isNaN(change);
  const trendColor =
    trend === 'up'
      ? 'text-lunary-success'
      : trend === 'down'
        ? 'text-lunary-error'
        : 'text-content-muted';
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <div className='rounded-xl border border-stroke-subtle/20 bg-surface-elevated/5 p-4 transition-colors hover:border-stroke-subtle/40 hover:bg-surface-elevated/10'>
      <div className='text-xs font-medium text-content-muted'>{title}</div>
      <div className='mt-3 flex items-baseline justify-between gap-2'>
        <div className='text-2xl font-light tracking-tight text-content-primary md:text-3xl'>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {hasChange && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              trendColor,
            )}
          >
            <TrendIcon className='h-3 w-3' />
            {change?.toFixed(1)}%
          </div>
        )}
      </div>
      {subtitle && (
        <div className='mt-2 text-xs text-content-muted'>{subtitle}</div>
      )}
    </div>
  );
}
