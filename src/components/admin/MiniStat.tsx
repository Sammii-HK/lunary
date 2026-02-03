import { ReactNode } from 'react';

interface MiniStatProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: ReactNode;
}

export function MiniStat({ label, value, subValue, icon }: MiniStatProps) {
  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3 shadow-sm shadow-black/30'>
      <div className='flex items-center gap-1.5 text-xs font-medium text-zinc-400'>
        {icon}
        {label}
      </div>
      <div className='mt-2 text-xl font-light tracking-tight text-white'>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subValue && (
        <div className='mt-0.5 text-xs text-zinc-500'>{subValue}</div>
      )}
    </div>
  );
}
