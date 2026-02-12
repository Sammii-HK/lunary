'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSurvivalContent } from '@/lib/retrograde/survival-content';

interface RetrogradeSurvivalKitProps {
  dayNumber: number;
  className?: string;
}

/**
 * Expandable card: daily dos/don'ts, journal prompt, practical tip.
 * Content is indexed by day-of-retrograde.
 */
export function RetrogradeSurvivalKit({
  dayNumber,
  className,
}: RetrogradeSurvivalKitProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = getSurvivalContent(dayNumber);

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-800/40 bg-gradient-to-br from-amber-950/40 to-zinc-900',
        className,
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex items-center justify-between w-full p-4 text-left'
      >
        <div className='flex items-center gap-2'>
          <Lightbulb className='w-4 h-4 text-amber-400' />
          <span className='text-sm font-medium text-amber-200'>
            Day {dayNumber} Survival Kit
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className='w-4 h-4 text-amber-400' />
        ) : (
          <ChevronDown className='w-4 h-4 text-amber-400' />
        )}
      </button>

      {isExpanded && (
        <div className='px-4 pb-4 space-y-4'>
          {/* Do's */}
          <div>
            <h4 className='text-xs font-medium text-green-400 uppercase tracking-wide mb-2'>
              Do
            </h4>
            <ul className='space-y-1.5'>
              {content.dos.map((item, i) => (
                <li
                  key={i}
                  className='flex items-start gap-2 text-xs text-zinc-300'
                >
                  <CheckCircle2 className='w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div>
            <h4 className='text-xs font-medium text-red-400 uppercase tracking-wide mb-2'>
              Don&apos;t
            </h4>
            <ul className='space-y-1.5'>
              {content.donts.map((item, i) => (
                <li
                  key={i}
                  className='flex items-start gap-2 text-xs text-zinc-300'
                >
                  <XCircle className='w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Journal Prompt */}
          <div className='rounded-lg bg-lunary-primary-900/20 border border-lunary-primary-800/30 p-3'>
            <div className='flex items-center gap-1.5 mb-1.5'>
              <BookOpen className='w-3.5 h-3.5 text-lunary-primary-400' />
              <span className='text-[10px] font-medium text-lunary-primary-300 uppercase tracking-wide'>
                Journal Prompt
              </span>
            </div>
            <p className='text-xs text-zinc-300 italic'>
              {content.journalPrompt}
            </p>
          </div>

          {/* Practical Tip */}
          <div className='rounded-lg bg-amber-900/20 border border-amber-800/30 p-3'>
            <div className='flex items-center gap-1.5 mb-1.5'>
              <Lightbulb className='w-3.5 h-3.5 text-amber-400' />
              <span className='text-[10px] font-medium text-amber-300 uppercase tracking-wide'>
                Tip
              </span>
            </div>
            <p className='text-xs text-zinc-300'>{content.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
