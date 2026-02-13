'use client';

import { useState } from 'react';
import { Target, Check, X, ChevronDown, ChevronUp, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IntentionContent {
  text: string;
  intentionCategory?: string;
  status: string;
  moonPhase?: string;
  moonSign?: string;
  source?: string;
  manifestedAt?: string | null;
  releasedAt?: string | null;
  progressNotes?: Array<{ note: string; date: string }>;
}

interface IntentionCardProps {
  id: number;
  content: IntentionContent;
  createdAt: string;
  onStatusChange: (id: number, status: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'border-lunary-primary-600',
  progressing: 'border-lunary-accent',
  blocked: 'border-amber-600',
  manifested: 'border-lunary-success',
  released: 'border-zinc-600',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  progressing: 'Progressing',
  blocked: 'Blocked',
  manifested: 'Manifested',
  released: 'Released',
};

const CATEGORY_LABELS: Record<string, string> = {
  career: 'Career',
  love: 'Love',
  health: 'Health',
  spiritual: 'Spiritual',
  financial: 'Financial',
  creative: 'Creative',
  personal: 'Personal Growth',
  other: 'Other',
};

export function IntentionCard({
  id,
  content,
  createdAt,
  onStatusChange,
}: IntentionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isResolved =
    content.status === 'manifested' || content.status === 'released';
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      onStatusChange(id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={cn(
        'border-l-2 pl-4 py-3 transition-colors',
        STATUS_COLORS[content.status] || 'border-zinc-700',
        isResolved && 'opacity-70',
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-1'>
            <Target className='w-3.5 h-3.5 text-lunary-primary-400 shrink-0' />
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                content.status === 'manifested'
                  ? 'bg-lunary-success/20 text-lunary-success'
                  : content.status === 'released'
                    ? 'bg-zinc-800 text-zinc-400'
                    : content.status === 'blocked'
                      ? 'bg-amber-900/30 text-amber-400'
                      : 'bg-lunary-primary-900/50 text-lunary-primary-300',
              )}
            >
              {STATUS_LABELS[content.status] || content.status}
            </span>
            {content.intentionCategory && (
              <span className='text-xs text-zinc-500'>
                {CATEGORY_LABELS[content.intentionCategory] ||
                  content.intentionCategory}
              </span>
            )}
          </div>
          <p className='text-white text-sm leading-relaxed'>{content.text}</p>
          <div className='flex items-center gap-3 mt-1.5'>
            <span className='text-xs text-zinc-500'>{formattedDate}</span>
            {content.moonPhase && (
              <span className='text-xs text-zinc-500 flex items-center gap-1'>
                <Moon className='w-3 h-3' />
                {content.moonPhase}
                {content.moonSign && ` in ${content.moonSign}`}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className='p-1 text-zinc-400 hover:text-zinc-200'
        >
          {expanded ? (
            <ChevronUp className='w-4 h-4' />
          ) : (
            <ChevronDown className='w-4 h-4' />
          )}
        </button>
      </div>

      {expanded && !isResolved && (
        <div className='mt-3 flex flex-wrap gap-2'>
          {content.status !== 'progressing' && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleStatusChange('progressing')}
              disabled={isUpdating}
              className='text-xs'
            >
              Progressing
            </Button>
          )}
          {content.status !== 'blocked' && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleStatusChange('blocked')}
              disabled={isUpdating}
              className='text-xs'
            >
              Blocked
            </Button>
          )}
          <Button
            size='sm'
            onClick={() => handleStatusChange('manifested')}
            disabled={isUpdating}
            className='text-xs bg-lunary-success/20 text-lunary-success hover:bg-lunary-success/30 border border-lunary-success/30'
          >
            <Check className='w-3 h-3 mr-1' />
            Manifested!
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleStatusChange('released')}
            disabled={isUpdating}
            className='text-xs text-zinc-400'
          >
            <X className='w-3 h-3 mr-1' />
            Release
          </Button>
        </div>
      )}

      {expanded && content.manifestedAt && (
        <p className='text-xs text-lunary-success mt-2'>
          Manifested on{' '}
          {new Date(content.manifestedAt).toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
      {expanded && content.releasedAt && (
        <p className='text-xs text-zinc-400 mt-2'>
          Released on{' '}
          {new Date(content.releasedAt).toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}
