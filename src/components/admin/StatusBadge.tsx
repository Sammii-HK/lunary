import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export type BadgeStatus =
  | 'excellent'
  | 'good'
  | 'warning'
  | 'critical'
  | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
}: StatusBadgeProps) {
  const config = {
    excellent: {
      className:
        'bg-lunary-success-950/40 text-lunary-success-300 border-lunary-success-700',
      icon: CheckCircle,
      defaultLabel: 'Excellent',
    },
    good: {
      className:
        'bg-lunary-primary-950/40 text-lunary-primary-300 border-lunary-primary-700',
      icon: CheckCircle,
      defaultLabel: 'Good',
    },
    warning: {
      className:
        'bg-lunary-accent-950/40 text-lunary-accent-300 border-lunary-accent-700',
      icon: AlertCircle,
      defaultLabel: 'Warning',
    },
    critical: {
      className:
        'bg-lunary-error-950/40 text-lunary-error-300 border-lunary-error-700',
      icon: XCircle,
      defaultLabel: 'Critical',
    },
    info: {
      className:
        'bg-lunary-secondary-950/40 text-lunary-secondary-300 border-lunary-secondary-700',
      icon: Info,
      defaultLabel: 'Info',
    },
  };

  const { className, icon: Icon, defaultLabel } = config[status];
  const displayLabel = label || defaultLabel;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${className}`}
    >
      {showIcon && <Icon className='h-3 w-3' />}
      {displayLabel}
    </div>
  );
}
