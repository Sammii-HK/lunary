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
    <div className='rounded-xl border border-stroke-subtle/30 bg-surface-base/50 p-4 text-sm text-content-secondary'>
      <p className='text-xs uppercase tracking-wider text-content-muted'>
        {title}
      </p>
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
