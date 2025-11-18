import { memo, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type InsightSource = 'app' | 'email' | 'substack' | string;

export interface InsightCardProps {
  insight: {
    id: number;
    insight_text: string;
    created_at?: string | null;
    source?: InsightSource | null;
  };
  moonCircle?: {
    moon_phase?: string | null;
    date?: string | null;
  };
  className?: string;
}

const sourceLabels: Record<string, string> = {
  app: 'Shared in app',
  email: 'Shared via email',
  substack: 'Shared via Substack',
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Just now';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const InsightCard = memo(function InsightCard({
  insight,
  moonCircle,
  className,
}: InsightCardProps) {
  const sourceKey = (insight.source || 'app').toLowerCase();
  const sourceLabel = sourceLabels[sourceKey] || 'Shared insight';

  useEffect(() => {
    // Track insight access for weekly usage counter
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('insight-accessed'));
    }
  }, []);

  return (
    <article
      className={cn(
        'rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-4 shadow-lg shadow-purple-500/10 backdrop-blur',
        className,
      )}
    >
      <div className='flex flex-wrap items-center gap-2 text-xs text-purple-100/70'>
        <span className='inline-flex items-center rounded-full bg-purple-500/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-100'>
          {sourceLabel}
        </span>
        {moonCircle?.moon_phase && (
          <span className='inline-flex items-center gap-1 text-purple-100/80'>
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                moonCircle.moon_phase === 'Full Moon'
                  ? 'bg-amber-300'
                  : 'bg-indigo-300',
              )}
            />
            {moonCircle.moon_phase}
          </span>
        )}
        {moonCircle?.date && (
          <time className='text-purple-200/70'>
            {formatDate(moonCircle.date)}
          </time>
        )}
      </div>
      <p className='mt-3 text-sm leading-relaxed text-white'>
        {insight.insight_text}
      </p>
      <div className='mt-4 text-xs text-purple-200/70'>
        Shared on {formatDate(insight.created_at)}
      </div>
    </article>
  );
});
