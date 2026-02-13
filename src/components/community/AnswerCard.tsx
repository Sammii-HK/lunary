'use client';

import { ChevronUp, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ReportButton } from '@/components/community/ReportButton';

interface AnswerCardProps {
  id: number;
  text: string;
  authorName: string | null;
  isAnonymous: boolean;
  voteCount: number;
  isBestAnswer: boolean;
  createdAt: string | null;
  userId: string;
  isAstralGuide?: boolean;
  onVote?: (id: number) => void;
  onMarkBest?: (id: number) => void;
  hasVoted?: boolean;
  canMarkBest?: boolean;
}

export function AnswerCard({
  id,
  text,
  authorName,
  isAnonymous,
  voteCount,
  isBestAnswer,
  createdAt,
  isAstralGuide = false,
  onVote,
  onMarkBest,
  hasVoted = false,
  canMarkBest = false,
}: AnswerCardProps) {
  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border transition-colors ${
        isBestAnswer
          ? 'border-lunary-success/50 bg-lunary-success/5'
          : 'border-zinc-800 bg-zinc-900/30'
      }`}
    >
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
        {isBestAnswer && (
          <div className='flex items-center gap-1.5 mb-2'>
            <Award className='w-4 h-4 text-lunary-success' />
            <span className='text-xs font-medium text-lunary-success'>
              Best Answer
            </span>
          </div>
        )}

        <div className='text-sm text-zinc-300 whitespace-pre-wrap'>{text}</div>

        <div className='flex items-center gap-3 mt-3 flex-wrap'>
          <span
            className={`text-xs ${
              isAstralGuide
                ? 'text-lunary-primary-400 font-medium'
                : 'text-zinc-500'
            }`}
          >
            {isAstralGuide
              ? 'Astral Guide'
              : isAnonymous
                ? 'Anonymous'
                : authorName || 'Unknown'}
          </span>

          {createdAt && (
            <span className='text-xs text-zinc-600'>
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          )}

          {canMarkBest && !isBestAnswer && (
            <button
              onClick={() => onMarkBest?.(id)}
              className='text-xs text-zinc-500 hover:text-lunary-success transition-colors'
            >
              Mark as best
            </button>
          )}

          <ReportButton contentType='answer' contentId={id} authorId={userId} />
        </div>
      </div>
    </div>
  );
}
