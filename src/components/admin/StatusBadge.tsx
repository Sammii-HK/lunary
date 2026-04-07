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
        'bg-layer-deep/40 text-lunary-success-300 border-lunary-success-700',
      icon: CheckCircle,
      defaultLabel: 'Excellent',
    },
    good: {
      className:
        'bg-layer-deep/40 text-content-brand border-lunary-primary-700',
      icon: CheckCircle,
      defaultLabel: 'Good',
    },
    warning: {
      className:
        'bg-layer-deep/40 text-content-brand-accent border-lunary-accent-700',
      icon: AlertCircle,
      defaultLabel: 'Warning',
    },
    critical: {
      className:
        'bg-layer-deep/40 text-lunary-error-300 border-lunary-error-700',
      icon: XCircle,
      defaultLabel: 'Critical',
    },
    info: {
      className:
        'bg-layer-deep/40 text-content-brand-secondary border-lunary-secondary-700',
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
