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
      ? 'text-emerald-400'
      : trend === 'down'
        ? 'text-rose-400'
        : 'text-zinc-400';
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm'>
      <div className='text-sm font-medium text-zinc-400'>{title}</div>
      <div className='mt-2 flex items-baseline justify-between gap-2'>
        <div className='text-3xl font-semibold text-white'>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {hasChange && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trendColor,
            )}
          >
            <TrendIcon className='h-4 w-4' />
            {change?.toFixed(1)}%
          </div>
        )}
      </div>
      {subtitle && (
        <div className='mt-2 text-xs text-zinc-500'>{subtitle}</div>
      )}
    </div>
  );
}
