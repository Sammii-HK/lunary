'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnswerCard } from '@/components/community/AnswerCard';

const ASTRAL_GUIDE_USER_ID = 'astral_guide';

interface Answer {
  id: number;
  userId: string;
  text: string;
  isAnonymous: boolean;
  authorName: string | null;
  voteCount: number;
  isBestAnswer: boolean;
  createdAt: string | null;
}

interface Question {
  id: number;
  userId: string;
  text: string;
  voteCount: number;
  topicTag: string | null;
}

interface QuestionDetailClientProps {
  question: Question;
  answers: Answer[];
  isAuthenticated: boolean;
  currentUserId: string | null;
}

export function QuestionDetailClient({
  question,
  answers: initialAnswers,
  isAuthenticated,
  currentUserId,
}: QuestionDetailClientProps) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [answerText, setAnswerText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  const isQuestionAuthor = currentUserId === question.userId;

  const handleSubmitAnswer = async () => {
    if (answerText.trim().length < 10) {
      setError('Answer must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/community/questions/${question.id}/answers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post_text: answerText.trim(),
            is_anonymous: isAnonymous,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || 'Failed to post answer',
        );
      }

      const data = await res.json();
      setAnswers((prev) => [
        ...prev,
        {
          id: data.answer.id,
          userId: currentUserId || '',
          text: data.answer.text,
          isAnonymous: data.answer.isAnonymous,
          authorName: isAnonymous ? null : 'You',
          voteCount: 0,
          isBestAnswer: false,
          createdAt: data.answer.createdAt,
        },
      ]);
      setAnswerText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (postId: number) => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch('/api/community/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });

      const data = await res.json();

      setAnswers((prev) =>
        prev.map((a) =>
          a.id === postId
            ? {
                ...a,
                voteCount: data.voted
                  ? a.voteCount + 1
                  : Math.max(a.voteCount - 1, 0),
              }
            : a,
        ),
      );

      setVotedIds((prev) => {
        const next = new Set(prev);
        if (data.voted) next.add(postId);
        else next.delete(postId);
        return next;
      });
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleMarkBest = async (answerId: number) => {
    try {
      const res = await fetch(`/api/community/questions/${question.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ best_answer_id: answerId }),
      });

      if (res.ok) {
        setAnswers((prev) =>
          prev.map((a) => ({
            ...a,
            isBestAnswer: a.id === answerId,
          })),
        );
      }
    } catch (err) {
      console.error('Mark best failed:', err);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Answers */}
      <div>
        <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3'>
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answers.length === 0 ? (
          <p className='text-sm text-zinc-500 py-4'>
            No answers yet. Be the first to share your cosmic wisdom!
          </p>
        ) : (
          <div className='space-y-3'>
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                {...answer}
                isAstralGuide={answer.userId === ASTRAL_GUIDE_USER_ID}
                onVote={isAuthenticated ? handleVote : undefined}
                onMarkBest={isQuestionAuthor ? handleMarkBest : undefined}
                hasVoted={votedIds.has(answer.id)}
                canMarkBest={isQuestionAuthor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Answer form */}
      {isAuthenticated && (
        <div className='border-t border-zinc-800 pt-6'>
          <h3 className='text-sm font-medium text-zinc-300 mb-3'>
            Your Answer
          </h3>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder='Share your cosmic wisdom...'
            rows={4}
            maxLength={2000}
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

            <span className='text-xs text-zinc-600'>
              {answerText.length}/2000
            </span>
          </div>

          {error && <p className='text-xs text-red-400 mt-2'>{error}</p>}

          <Button
            onClick={handleSubmitAnswer}
            disabled={submitting || answerText.trim().length < 10}
            className='mt-3'
          >
            {submitting ? 'Posting...' : 'Post Answer'}
          </Button>
        </div>
      )}
    </div>
  );
}
