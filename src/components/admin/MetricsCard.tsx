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
    <div className='rounded-xl border border-zinc-800/20 bg-zinc-900/5 p-4 transition-colors hover:border-zinc-800/40 hover:bg-zinc-900/10'>
      <div className='text-xs font-medium text-zinc-500'>{title}</div>
      <div className='mt-3 flex items-baseline justify-between gap-2'>
        <div className='text-2xl font-light tracking-tight text-white md:text-3xl'>
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
      {subtitle && <div className='mt-2 text-xs text-zinc-600'>{subtitle}</div>}
    </div>
  );
}
