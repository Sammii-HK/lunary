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
    <div className='flex items-start justify-between gap-4 rounded-xl border border-zinc-800/40 bg-zinc-950/60 px-4 py-3'>
      <div>
        <p className='text-xs uppercase tracking-wider text-zinc-500'>
          {label}
        </p>
        <p className='text-2xl font-light text-white'>{displayValue}</p>
        <p className='text-xs text-zinc-500'>7-day rolling</p>
      </div>
      <div className='text-right text-xs'>
        <p className='text-sm font-semibold text-white'>
          {change !== null
            ? `${change >= 0 ? '+' : ''}${change.toLocaleString()}`
            : 'N/A'}
        </p>
        <p className='text-[11px] text-zinc-500'>
          {percentChange !== null
            ? `${percentChange.toFixed(1)}% vs prior 7d`
            : 'No prior window'}
        </p>
        <p className='text-[11px] text-zinc-500'>{trendDescription}</p>
      </div>
    </div>
  );
}
