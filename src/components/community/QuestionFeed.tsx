'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './QuestionCard';
import { AskQuestionModal } from './AskQuestionModal';

const TOPICS = [
  { value: 'all', label: 'All' },
  { value: 'transits', label: 'Transits' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'tarot', label: 'Tarot' },
  { value: 'career', label: 'Career' },
  { value: 'general', label: 'General' },
] as const;

interface Question {
  id: number;
  text: string;
  isAnonymous: boolean;
  authorName: string | null;
  voteCount: number;
  answerCount: number;
  topicTag: string | null;
  createdAt: string | null;
}

interface QuestionFeedProps {
  isAuthenticated: boolean;
  initialQuestions?: Question[];
  initialTotal?: number;
}

export function QuestionFeed({
  isAuthenticated,
  initialQuestions,
  initialTotal,
}: QuestionFeedProps) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions || [],
  );
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [sort, setSort] = useState<'top' | 'new'>('top');
  const [topic, setTopic] = useState('all');
  const [loading, setLoading] = useState(!initialQuestions);
  const [showAskModal, setShowAskModal] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, limit: '20', offset: '0' });
      if (topic !== 'all') params.set('topic', topic);

      const res = await fetch(`/api/community/questions?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  }, [sort, topic]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleVote = async (postId: number) => {
    if (!isAuthenticated) return;

    try {
      const res = await fetch('/api/community/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId }),
      });

      const data = await res.json();

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === postId
            ? {
                ...q,
                voteCount: data.voted
                  ? q.voteCount + 1
                  : Math.max(q.voteCount - 1, 0),
              }
            : q,
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

  const handleAskQuestion = async (data: {
    post_text: string;
    is_anonymous: boolean;
    topic_tag: string;
  }) => {
    const res = await fetch('/api/community/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (errorData as { error?: string }).error || 'Failed to post question',
      );
    }

    await fetchQuestions();
  };

  return (
    <div>
      {/* Controls */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex gap-2'>
          {/* Sort toggle */}
          <div className='flex rounded-lg border border-zinc-700 overflow-hidden'>
            <button
              onClick={() => setSort('top')}
              className={`px-3 py-1 text-xs transition-colors ${
                sort === 'top'
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setSort('new')}
              className={`px-3 py-1 text-xs transition-colors ${
                sort === 'new'
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              New
            </button>
          </div>
        </div>

        {isAuthenticated && (
          <Button size='sm' onClick={() => setShowAskModal(true)}>
            <Plus className='w-4 h-4 mr-1' />
            Ask
          </Button>
        )}
      </div>

      {/* Topic tabs */}
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

      {/* Questions list */}
      {loading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-20 rounded-lg bg-zinc-900/50 border border-zinc-800 animate-pulse'
            />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-zinc-400 text-sm'>
            No questions yet. Be the first to ask!
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              {...q}
              onVote={isAuthenticated ? handleVote : undefined}
              hasVoted={votedIds.has(q.id)}
            />
          ))}
        </div>
      )}

      {total > questions.length && (
        <p className='text-center text-xs text-zinc-500 mt-4'>
          Showing {questions.length} of {total} questions
        </p>
      )}

      {/* Ask Question Modal */}
      {isAuthenticated && (
        <AskQuestionModal
          isOpen={showAskModal}
          onClose={() => setShowAskModal(false)}
          onSubmit={handleAskQuestion}
        />
      )}
    </div>
  );
}
