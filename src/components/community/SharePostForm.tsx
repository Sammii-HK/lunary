'use client';

import { useState, useRef } from 'react';
import { Send, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SharePostFormProps {
  spaceSlug: string;
  onPostSubmitted?: () => void;
  className?: string;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

export function SharePostForm({
  spaceSlug,
  onPostSubmitted,
  className,
}: SharePostFormProps) {
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.trim().length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/community/spaces/${spaceSlug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_text: text.trim(),
          is_anonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit post');
      }

      setText('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Dispatch event so feed can refresh
      window.dispatchEvent(
        new CustomEvent('community-post:submitted', {
          detail: { spaceSlug },
        }),
      );

      onPostSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4',
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(null);
        }}
        placeholder='Share your thoughts with the community...'
        rows={3}
        maxLength={MAX_LENGTH}
        className='w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none'
      />

      <div className='flex items-center justify-between mt-3'>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => setIsAnonymous(!isAnonymous)}
            className='flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
          >
            {isAnonymous ? (
              <EyeOff className='w-3.5 h-3.5' />
            ) : (
              <Eye className='w-3.5 h-3.5' />
            )}
            {isAnonymous ? 'Anonymous' : 'Visible'}
          </button>

          <span
            className={cn(
              'text-[10px]',
              charCount > MAX_LENGTH
                ? 'text-red-400'
                : charCount >= MIN_LENGTH
                  ? 'text-zinc-500'
                  : 'text-zinc-600',
            )}
          >
            {charCount}/{MAX_LENGTH}
          </span>
        </div>

        <Button
          type='submit'
          disabled={!isValid || isSubmitting}
          className='h-8 px-3 text-xs gap-1.5'
        >
          <Send className='w-3 h-3' />
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>

      {error && <p className='text-xs text-red-400 mt-2'>{error}</p>}

      {success && (
        <p className='text-xs text-green-400 mt-2'>
          Your post has been shared!
        </p>
      )}
    </form>
  );
}
