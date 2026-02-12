'use client';

import Link from 'next/link';
import { MessageCircle, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TOPIC_COLORS: Record<string, string> = {
  transits: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  relationships: 'bg-pink-900/40 text-pink-300 border-pink-700/50',
  tarot: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  career: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  general: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/50',
};

interface QuestionCardProps {
  id: number;
  text: string;
  authorName: string | null;
  isAnonymous: boolean;
  voteCount: number;
  answerCount: number;
  topicTag: string | null;
  createdAt: string | null;
  onVote?: (id: number) => void;
  hasVoted?: boolean;
}

export function QuestionCard({
  id,
  text,
  authorName,
  isAnonymous,
  voteCount,
  answerCount,
  topicTag,
  createdAt,
  onVote,
  hasVoted = false,
}: QuestionCardProps) {
  const topic = topicTag || 'general';
  const topicColor = TOPIC_COLORS[topic] || TOPIC_COLORS.general;

  return (
    <div className='flex gap-3 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors'>
      {/* Vote column */}
      <div className='flex flex-col items-center gap-1 min-w-[40px]'>
        <button
          onClick={() => onVote?.(id)}
          className={`p-1 rounded transition-colors ${
            hasVoted
              ? 'text-lunary-primary-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ChevronUp className='w-5 h-5' />
        </button>
        <span className='text-sm font-medium text-zinc-300'>{voteCount}</span>
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <Link href={`/community/questions/${id}`} className='block group'>
          <p className='text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-2'>
            {text}
          </p>
        </Link>

        <div className='flex items-center gap-3 mt-2 flex-wrap'>
          <span
            className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded-full border ${topicColor}`}
          >
            {topic}
          </span>

          <span className='flex items-center gap-1 text-xs text-zinc-500'>
            <MessageCircle className='w-3 h-3' />
            {answerCount}
          </span>

          <span className='text-xs text-zinc-500'>
            {isAnonymous ? 'Anonymous' : authorName || 'Unknown'}
          </span>

          {createdAt && (
            <span className='text-xs text-zinc-600'>
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
