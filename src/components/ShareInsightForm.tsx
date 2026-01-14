'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Lock as LockIcon, Send, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateInsightText } from '@/lib/moon-circles/moderation';

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ShareInsightFormProps {
  moonCircleId: number;
  onSuccess?: () => void;
  autoFocus?: boolean;
  defaultAnonymous?: boolean;
  className?: string;
}

const dispatchInsightSharedEvent = (moonCircleId: number) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('moon-circle-insight:submitted', {
      detail: { moonCircleId },
    }),
  );
};

export function ShareInsightForm({
  moonCircleId,
  onSuccess,
  autoFocus = false,
  defaultAnonymous = true,
  className,
}: ShareInsightFormProps) {
  const [insightText, setInsightText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(defaultAnonymous);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const remaining = MAX_LENGTH - insightText.length;
  const isTooShort = insightText.trim().length < MIN_LENGTH;
  const isTooLong = insightText.length > MAX_LENGTH;
  const isSubmitDisabled = status === 'loading' || isTooShort || isTooLong;

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [autoFocus]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitDisabled) return;

      const moderationCheck = validateInsightText(insightText);
      if (!moderationCheck.isValid) {
        setStatus('error');
        setMessage(moderationCheck.error || 'Content validation failed');
        return;
      }

      setStatus('loading');
      setMessage(null);

      try {
        const response = await fetch(
          `/api/moon-circles/${moonCircleId}/insights`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              insight_text: insightText,
              is_anonymous: isAnonymous,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              'We could not share your insight right now. Please try again.',
          );
        }

        // Reset form state immediately
        setInsightText('');
        if (textareaRef.current) {
          textareaRef.current.value = '';
        }

        setStatus('success');
        setMessage('✨ Insight shared with the circle!');

        // Dispatch event for other components to listen
        dispatchInsightSharedEvent(moonCircleId);

        // Call success callback
        onSuccess?.();
      } catch (error) {
        console.error('Share insight failed', error);
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
        );
      } finally {
        setTimeout(() => {
          setStatus('idle');
        }, 2500);
      }
    },
    [insightText, isAnonymous, isSubmitDisabled, moonCircleId, onSuccess],
  );

  const helperText = useMemo(() => {
    if (isTooShort) {
      return `Add ${
        MIN_LENGTH - insightText.trim().length
      } more character${MIN_LENGTH - insightText.trim().length === 1 ? '' : 's'} to reach the minimum.`;
    }
    if (isTooLong) {
      return `You are ${Math.abs(remaining)} characters over the limit.`;
    }
    return 'Insights stay anonymous unless you decide otherwise.';
  }, [insightText, isTooLong, isTooShort, remaining]);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'space-y-4 rounded-3xl border border-lunary-primary-700 bg-black/40 p-6 shadow-lg shadow-lunary-primary-900 backdrop-blur',
        className,
      )}
    >
      <div className='flex items-center gap-3'>
        <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-lunary-primary-900 text-lunary-accent-200'>
          <Sparkles className='h-5 w-5' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-white'>
            Share your insight
          </h3>
          <p className='text-sm text-lunary-accent-100/70'>
            Reflect on the energy of this circle—your words support others.
          </p>
        </div>
      </div>

      <div className='space-y-2'>
        <Textarea
          ref={textareaRef}
          placeholder='How did this Moon Circle resonate with you?'
          value={insightText}
          onChange={(event) =>
            setInsightText(event.target.value.slice(0, MAX_LENGTH))
          }
          className='min-h-[140px] resize-none border-lunary-primary-700 bg-black/40 text-sm text-white placeholder:text-lunary-accent-200/40 focus-visible:border-lunary-accent-300 focus-visible:ring-lunary-accent-700'
          maxLength={MAX_LENGTH + 10}
        />
        <div className='flex items-center justify-between text-xs text-lunary-accent-100/70'>
          <span
            className={cn(
              isTooShort || isTooLong ? 'text-lunary-error-300' : undefined,
            )}
          >
            {helperText}
          </span>
          <span className={cn(isTooLong ? 'text-lunary-error-300' : undefined)}>
            {insightText.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between gap-4 rounded-2xl border border-lunary-primary-800 bg-lunary-primary-950 px-4 py-3'>
        <div className='flex-1'>
          <Label
            htmlFor='share-anonymous'
            className='text-sm font-medium text-white cursor-pointer'
          >
            Share anonymously
          </Label>
          <p className='text-xs text-lunary-accent-100/60 mt-0.5'>
            Your name and profile stay hidden unless toggled off.
          </p>
        </div>
        <Switch
          id='share-anonymous'
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          aria-label='Toggle anonymous sharing'
          className='shrink-0 data-[state=checked]:bg-lunary-primary data-[state=unchecked]:bg-lunary-primary-700'
          thumbClassName='bg-white'
        />
      </div>

      <Button
        type='submit'
        disabled={isSubmitDisabled}
        className='w-full rounded-2xl bg-lunary-primary py-3 text-base font-semibold text-white shadow-lg shadow-lunary-primary-700 transition hover:bg-lunary-primary-400 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {status === 'loading' ? (
          <span className='flex items-center justify-center gap-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Sending insight…
          </span>
        ) : (
          <span className='flex items-center justify-center gap-2'>
            <Send className='h-4 w-4' />
            Share with the circle
          </span>
        )}
      </Button>

      <div className='text-xs text-lunary-accent-100/70'>
        <p className='flex items-center gap-1.5'>
          <LockIcon className='h-3.5 w-3.5' />
          Community-ready content only. Moderation keeps things safe.
        </p>
        {message && (
          <p
            className={cn(
              'mt-2 rounded-xl px-3 py-2',
              status === 'error'
                ? 'bg-lunary-error-950 text-lunary-error-200'
                : 'bg-lunary-success-950 text-lunary-success-200',
            )}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
