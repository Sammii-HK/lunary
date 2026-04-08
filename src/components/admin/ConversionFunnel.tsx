import { cn } from '@/lib/utils';

type FunnelStage = {
  label: string;
  value: number;
  subtitle?: string;
};

type DropOffPoint = {
  stage: string;
  drop_off_rate: number;
};

interface ConversionFunnelProps {
  stages: FunnelStage[];
  dropOffPoints?: DropOffPoint[];
}

export function ConversionFunnel({
  stages,
  dropOffPoints = [],
}: ConversionFunnelProps) {
  if (!stages.length) {
    return (
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-4 text-sm text-content-muted'>
        No funnel data available for this range.
      </div>
    );
  }

  const maxValue = Math.max(...stages.map((stage) => stage.value));

  return (
    <div className='space-y-4'>
      {stages.map((stage, index) => {
        const widthPercent =
          maxValue > 0 ? Math.max((stage.value / maxValue) * 100, 10) : 0;
        const dropOff = dropOffPoints.find(
          (point) => point.stage === stage.label,
        );

        return (
          <div key={stage.label} className='space-y-2'>
            <div className='flex items-center justify-between text-sm text-content-muted'>
              <span className='font-medium text-content-primary'>
                {stage.label}
              </span>
              <span>{stage.value.toLocaleString()}</span>
            </div>
            <div className='relative h-10 rounded-xl bg-surface-card/60'>
              <div
                className={cn(
                  'absolute inset-y-0 rounded-xl bg-gradient-to-r from-lunary-primary-500/70 to-violet-500/80 transition-all',
                )}
                style={{ width: `${widthPercent}%` }}
              />
              {dropOff && (
                <div className='absolute inset-y-0 right-3 flex items-center text-xs text-content-primary'>
                  -{dropOff.drop_off_rate.toFixed(1)}%
                </div>
              )}
            </div>
            {stage.subtitle && (
              <div className='text-xs text-content-muted'>{stage.subtitle}</div>
            )}
            {index < stages.length - 1 && (
              <div className='flex items-center justify-center text-xs text-content-muted'>
                ↓
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
