import { memo, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStatus } from './AuthStatus';

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
  moonCircleId?: number;
  className?: string;
  onDelete?: () => void;
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

function useIsAdmin(): boolean {
  const authState = useAuthStatus();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authState.user?.email) {
      setIsAdmin(false);
      return;
    }

    const adminEmailsEnv =
      process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      '';
    const adminEmails = adminEmailsEnv
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = authState.user.email.toLowerCase();
    setIsAdmin(adminEmails.includes(userEmail));
  }, [authState.user?.email]);

  return isAdmin;
}

export const InsightCard = memo(function InsightCard({
  insight,
  moonCircle,
  moonCircleId,
  className,
  onDelete,
}: InsightCardProps) {
  const sourceKey = (insight.source || 'app').toLowerCase();
  const sourceLabel = sourceLabels[sourceKey] || 'Shared insight';
  const isAdmin = useIsAdmin();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Track insight access for weekly usage counter
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('insight-accessed'));
    }
  }, []);

  const handleDelete = async () => {
    if (!moonCircleId || !isAdmin) return;
    if (!confirm('Are you sure you want to delete this insight?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/moon-circles/${moonCircleId}/insights?insightId=${insight.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete insight');
      }

      onDelete?.();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('moon-circle-insight:deleted', {
            detail: { insightId: insight.id },
          }),
        );
      }
    } catch (error) {
      console.error('Failed to delete insight:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to delete insight. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      className={cn(
        'rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-4 shadow-lg shadow-purple-500/10 backdrop-blur',
        className,
      )}
    >
      <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-purple-100/70'>
        <div className='flex flex-wrap items-center gap-2'>
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
        {isAdmin && moonCircleId && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='ml-auto rounded-lg p-1.5 text-purple-300/70 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50'
            aria-label='Delete insight'
            title='Delete insight (admin only)'
          >
            <Trash2 className='h-4 w-4' />
          </button>
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
