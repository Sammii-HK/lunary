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
    <div className='rounded-2xl border border-stroke-subtle/60 bg-surface-base/40 p-4 shadow-sm shadow-black/30'>
      <div className='flex items-start justify-between mb-3'>
        <Icon className='h-6 w-6 text-content-brand' />
        <StatusBadge status={status} label='' showIcon={false} />
      </div>

      <div className='space-y-1'>
        <div className='text-xs font-medium text-content-muted'>{label}</div>
        <div className='flex items-baseline gap-2'>
          <span className='text-3xl font-bold text-content-primary'>
            {value}
          </span>
          {unit && <span className='text-sm text-content-muted'>{unit}</span>}
        </div>
        {trend && (
          <div className='text-xs text-content-muted mt-2'>{trend}</div>
        )}
        {description && (
          <div className='text-xs text-content-muted mt-2'>{description}</div>
        )}
      </div>
    </div>
  );
}
