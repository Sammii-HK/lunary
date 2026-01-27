import { LucideIcon } from 'lucide-react';
import { StatusBadge, BadgeStatus } from './StatusBadge';

interface HealthMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  status: BadgeStatus;
  description?: string;
}

export function HealthMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  status,
  description,
}: HealthMetricCardProps) {
  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-4 shadow-sm shadow-black/30'>
      <div className='flex items-start justify-between mb-3'>
        <Icon className='h-6 w-6 text-lunary-primary-300' />
        <StatusBadge status={status} label='' showIcon={false} />
      </div>

      <div className='space-y-1'>
        <div className='text-xs font-medium text-zinc-400'>{label}</div>
        <div className='flex items-baseline gap-2'>
          <span className='text-3xl font-bold text-white'>{value}</span>
          {unit && <span className='text-sm text-zinc-500'>{unit}</span>}
        </div>
        {trend && <div className='text-xs text-zinc-400 mt-2'>{trend}</div>}
        {description && (
          <div className='text-xs text-zinc-500 mt-2'>{description}</div>
        )}
      </div>
    </div>
  );
}
