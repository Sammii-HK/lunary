import { ReactNode } from 'react';

interface MomentumCardProps {
  label: string;
  currentValue: string | number;
  change: number | null;
  percentChange: number | null;
  trendDescription: ReactNode;
  formatter?: (value: number) => string;
}

export function MomentumCard({
  label,
  currentValue,
  change,
  percentChange,
  trendDescription,
  formatter,
}: MomentumCardProps) {
  const displayValue =
    typeof currentValue === 'number'
      ? formatter
        ? formatter(currentValue)
        : currentValue.toLocaleString()
      : currentValue;

  return (
    <div className='flex items-start justify-between gap-4 rounded-xl border border-stroke-subtle/40 bg-surface-base/60 px-4 py-3'>
      <div>
        <p className='text-xs uppercase tracking-wider text-content-muted'>
          {label}
        </p>
        <p className='text-2xl font-light text-content-primary'>
          {displayValue}
        </p>
        <p className='text-xs text-content-muted'>7-day rolling</p>
      </div>
      <div className='text-right text-xs'>
        <p className='text-sm font-semibold text-content-primary'>
          {change !== null
            ? `${change >= 0 ? '+' : ''}${change.toLocaleString()}`
            : 'N/A'}
        </p>
        <p className='text-[11px] text-content-muted'>
          {percentChange !== null
            ? `${percentChange.toFixed(1)}% vs prior 7d`
            : 'No prior window'}
        </p>
        <p className='text-[11px] text-content-muted'>{trendDescription}</p>
      </div>
    </div>
  );
}
