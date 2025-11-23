'use client';

import { useState } from 'react';
import type { AIPrompt } from '@/lib/ai/prompt-generator';

interface AIPromptCardProps {
  prompt: AIPrompt;
  onUsePrompt: (promptText: string) => void;
  onMarkAsRead: (promptId: number) => void;
}

export function AIPromptCard({
  prompt,
  onUsePrompt,
  onMarkAsRead,
}: AIPromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(prompt.isNew);

  const handleUse = () => {
    onUsePrompt(prompt.promptText);
    if (prompt.isNew) {
      onMarkAsRead(prompt.id);
    }
    setIsExpanded(false);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (prompt.isNew && !isExpanded) {
      onMarkAsRead(prompt.id);
    }
  };

  const getPromptTypeLabel = () => {
    switch (prompt.promptType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      default:
        return 'Prompt';
    }
  };

  const getPromptTypeColor = () => {
    switch (prompt.promptType) {
      case 'daily':
        return 'border-purple-500/40 bg-purple-950/20';
      case 'weekly':
        return 'border-blue-500/40 bg-blue-950/20';
      default:
        return 'border-zinc-700/60 bg-zinc-900/40';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        prompt.isNew
          ? `${getPromptTypeColor()} shadow-lg shadow-purple-500/10 animate-pulse`
          : 'border-zinc-700/60 bg-zinc-900/40'
      }`}
    >
      <button
        onClick={handleToggle}
        className='w-full px-4 py-3 text-left flex items-center justify-between gap-3'
      >
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              prompt.promptType === 'daily'
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}
          >
            {getPromptTypeLabel()}
          </span>
          {prompt.isNew && (
            <span className='text-xs font-semibold text-purple-300 animate-pulse'>
              New
            </span>
          )}
          <span className='text-sm text-zinc-300 truncate flex-1'>
            {prompt.promptText.substring(0, 60)}
            {prompt.promptText.length > 60 ? '...' : ''}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isExpanded && (
        <div className='px-4 pb-4 border-t border-zinc-700/40 pt-3 space-y-3'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {prompt.promptText}
          </p>
          <button
            onClick={handleUse}
            className='w-full rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500'
          >
            Use this prompt
          </button>
        </div>
      )}
    </div>
  );
}
