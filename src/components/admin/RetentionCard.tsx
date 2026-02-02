interface RetentionCardProps {
  label: string;
  value: number | null;
  variant?: 'positive' | 'negative';
}

export function RetentionCard({
  label,
  value,
  variant = 'positive',
}: RetentionCardProps) {
  const color =
    variant === 'negative'
      ? 'text-lunary-error-300 border-lunary-error-800/20 bg-lunary-error-900/5'
      : 'text-lunary-success-300 border-lunary-success-800/20 bg-lunary-success-900/5';

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${color}`}>
      <div className='text-xs font-medium text-zinc-400'>{label}</div>
      <div className='mt-1.5 text-2xl font-light tracking-tight text-white'>
        {typeof value === 'number' ? `${value.toFixed(1)}%` : 'N/A'}
      </div>
    </div>
  );
}
