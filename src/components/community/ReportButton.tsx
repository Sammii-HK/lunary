'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportButtonProps {
  contentType: 'post' | 'question' | 'answer';
  contentId: number;
  authorId?: string;
  className?: string;
}

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'harmful', label: 'Harmful content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
] as const;

export function ReportButton({
  contentType,
  contentId,
  authorId,
  className,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReport = async (reason: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit report');
        return;
      }

      setSubmitted(true);
      setTimeout(() => setIsOpen(false), 2000);
    } catch {
      setError('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlock = async () => {
    if (!authorId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/community/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: authorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to block user');
        return;
      }

      setBlocked(true);
      setTimeout(() => setIsOpen(false), 2000);
    } catch {
      setError('Failed to block user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted || blocked) {
    return (
      <span className='text-[10px] text-zinc-500'>
        {blocked ? 'Blocked' : 'Reported'}
      </span>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='p-1 text-zinc-600 hover:text-zinc-400 transition-colors'
        aria-label='Report content'
        title='Report'
      >
        <Flag className='w-3 h-3' />
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute right-0 bottom-full mb-1 z-50 w-44 rounded-lg border border-zinc-800 bg-zinc-900 shadow-lg py-1'>
            <p className='px-3 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wide'>
              Report as
            </p>
            {REASONS.map((r) => (
              <button
                key={r.value}
                type='button'
                disabled={isSubmitting}
                onClick={() => handleReport(r.value)}
                className='w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50'
              >
                {r.label}
              </button>
            ))}

            {authorId && (
              <>
                <div className='border-t border-zinc-800 my-1' />
                <button
                  type='button'
                  disabled={isSubmitting}
                  onClick={handleBlock}
                  className='w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-zinc-800 transition-colors disabled:opacity-50'
                >
                  Block this user
                </button>
              </>
            )}

            {error && (
              <p className='px-3 py-1.5 text-[10px] text-red-400'>{error}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
