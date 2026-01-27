import { ReactNode } from 'react';

interface MetricRow {
  label: string;
  value: string | number | ReactNode;
}

interface MetricInfoBoxProps {
  title: string;
  metrics: MetricRow[];
}

export function MetricInfoBox({ title, metrics }: MetricInfoBoxProps) {
  return (
    <div className='rounded-xl border border-zinc-800/30 bg-zinc-950/50 p-4 text-sm text-zinc-300'>
      <p className='text-xs uppercase tracking-wider text-zinc-400'>{title}</p>
      <div className='mt-2 space-y-1'>
        {metrics.map((metric, idx) => (
          <div key={idx} className='flex items-center justify-between'>
            <span>{metric.label}</span>
            <span>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
