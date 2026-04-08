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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    // Track insight access for weekly usage counter
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('insight-accessed'));
    }
  }, []);

  const handleDelete = () => {
    if (!moonCircleId || !isAdmin) return;
    setDeleteError(null);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!moonCircleId || !isAdmin) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);
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
      setDeleteError(
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
        'rounded-2xl border border-lunary-primary-800 bg-gradient-to-br from-layer-deep via-layer-deep/50 to-transparent p-4 shadow-lg shadow-lunary-primary-950 backdrop-blur',
        className,
      )}
    >
      <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-content-brand-accent/70'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center rounded-full bg-layer-base px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-content-brand-accent'>
            {sourceLabel}
          </span>
          {moonCircle?.moon_phase && (
            <span className='inline-flex items-center gap-1 text-content-brand-accent/80'>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  moonCircle.moon_phase === 'Full Moon'
                    ? 'bg-lunary-accent-300'
                    : 'bg-lunary-secondary-300',
                )}
              />
              {moonCircle.moon_phase}
            </span>
          )}
          {moonCircle?.date && (
            <time className='text-content-brand-accent/70'>
              {formatDate(moonCircle.date)}
            </time>
          )}
        </div>
        {isAdmin && moonCircleId && !showDeleteConfirm && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='ml-auto rounded-lg p-1.5 text-content-brand-accent/70 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50'
            aria-label='Delete insight'
            title='Delete insight (admin only)'
          >
            {isDeleting ? (
              <div className='h-4 w-4 border-2 border-stroke-strong border-t-zinc-200 rounded-full animate-spin' />
            ) : (
              <Trash2 className='h-4 w-4' />
            )}
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <div className='mt-2 flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-800/50 px-3 py-2'>
          <p className='text-xs text-red-300 flex-1'>Delete this insight?</p>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className='px-2 py-1 text-xs text-content-muted rounded hover:bg-surface-card transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className='px-2 py-1 text-xs text-white bg-red-700 rounded hover:bg-red-600 transition-colors'
          >
            Delete
          </button>
        </div>
      )}

      {deleteError && (
        <div className='mt-2 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-800/40 px-3 py-2'>
          <p className='text-xs text-red-300 flex-1'>{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className='text-xs text-content-muted underline'
          >
            Dismiss
          </button>
        </div>
      )}

      <p className='mt-3 text-sm leading-relaxed text-content-primary'>
        {insight.insight_text}
      </p>
      <div className='mt-4 text-xs text-content-brand-accent/70'>
        Shared on {formatDate(insight.created_at)}
      </div>
    </article>
  );
});
