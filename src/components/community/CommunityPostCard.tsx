'use client';

import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { ReportButton } from '@/components/community/ReportButton';

interface CommunityPostCardProps {
  id: number;
  postText: string;
  isAnonymous: boolean;
  userId?: string;
  createdAt: string | null;
}

export function CommunityPostCard({
  id,
  postText,
  isAnonymous,
  userId,
  createdAt,
}: CommunityPostCardProps) {
  return (
    <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/50 p-4'>
      <div className='flex items-start gap-3'>
        <div className='w-8 h-8 rounded-full bg-lunary-primary-900/30 flex items-center justify-center flex-shrink-0'>
          <User className='w-4 h-4 text-lunary-primary-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-xs text-zinc-500'>
              {isAnonymous ? 'Anonymous' : 'Community member'}
            </span>
            {createdAt && (
              <span className='text-[10px] text-zinc-600'>
                {formatDistanceToNow(new Date(createdAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
          <p className='text-sm text-zinc-300 whitespace-pre-wrap break-words'>
            {postText}
          </p>
        </div>

        <ReportButton
          contentType='post'
          contentId={id}
          authorId={userId}
          className='flex-shrink-0 self-start'
        />
      </div>
    </div>
  );
}
