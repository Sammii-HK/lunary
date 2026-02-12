'use client';

import { useState } from 'react';
import { Modal, ModalBody } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

const TOPICS = [
  { value: 'general', label: 'General' },
  { value: 'transits', label: 'Transits' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'tarot', label: 'Tarot' },
  { value: 'career', label: 'Career' },
] as const;

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    post_text: string;
    is_anonymous: boolean;
    topic_tag: string;
  }) => Promise<void>;
}

export function AskQuestionModal({
  isOpen,
  onClose,
  onSubmit,
}: AskQuestionModalProps) {
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('general');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (text.trim().length < 15) {
      setError('Question must be at least 15 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        post_text: text.trim(),
        is_anonymous: isAnonymous,
        topic_tag: topic,
      });
      setText('');
      setTopic('general');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md'>
      <ModalBody>
        <h2 className='text-lg font-semibold text-white mb-4'>
          Ask the Circle
        </h2>

        {/* Topic selector */}
        <div className='flex flex-wrap gap-2 mb-4'>
          {TOPICS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTopic(t.value)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                topic === t.value
                  ? 'border-lunary-primary-500 bg-lunary-primary-900/30 text-lunary-primary-300'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='What cosmic question is on your mind?'
          rows={4}
          maxLength={1000}
          className='w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary-500 resize-none'
        />

        <div className='flex items-center justify-between mt-3'>
          <label className='flex items-center gap-2 text-xs text-zinc-400 cursor-pointer'>
            <input
              type='checkbox'
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className='rounded border-zinc-600'
            />
            Post anonymously
          </label>

          <span className='text-xs text-zinc-600'>{text.length}/1000</span>
        </div>

        {error && <p className='text-xs text-red-400 mt-2'>{error}</p>}

        <div className='flex gap-3 mt-4'>
          <Button variant='ghost' onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || text.trim().length < 15}
          >
            {submitting ? 'Posting...' : 'Ask Question'}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
