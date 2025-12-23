'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DailyThreadModule } from '@/lib/daily-thread/types';
import { ModuleCard } from './ModuleCard';
import { cn } from '@/lib/utils';

interface DailyThreadProps {
  className?: string;
}

export function DailyThread({ className }: DailyThreadProps) {
  const [modules, setModules] = useState<DailyThreadModule[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('daily-thread-collapsed');
    if (savedState === 'true') {
      setIsExpanded(false);
    }

    // Fetch modules
    fetchModules();

    // Listen for refresh events
    const handleRefresh = async (event: CustomEvent) => {
      const { type } = event.detail || {};
      await fetchModules(type, true);
      setIsExpanded(true); // Auto-expand when refreshing
    };

    window.addEventListener(
      'refresh-daily-thread',
      handleRefresh as unknown as EventListenerOrEventListenerObject,
    );
    return () => {
      window.removeEventListener(
        'refresh-daily-thread',
        handleRefresh as unknown as EventListenerOrEventListenerObject,
      );
    };
  }, []);

  const fetchModules = async (type?: string, forceRefresh = false) => {
    try {
      setIsLoading(true);
      const url = type
        ? `/api/astral-chat/daily-thread?type=${type}&forceRefresh=${forceRefresh}`
        : `/api/astral-chat/daily-thread?forceRefresh=${forceRefresh}`;
      const response = await fetch(url);
      const data = await response.json();
      setModules(data.modules || []);
    } catch (error) {
      console.error('[DailyThread] Error fetching modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('daily-thread-collapsed', String(!newState));
  };

  const handleAction = (
    action: DailyThreadModule['actions'][0],
    moduleId: string,
  ) => {
    // Handle dismiss action
    if (action.intent === 'dismiss') {
      setModules((prev) => prev.filter((module) => module.id !== moduleId));
      fetch('/api/astral-chat/daily-thread/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dismiss',
          moduleId,
        }),
      }).catch((error) => {
        console.error('[DailyThread] Failed to dismiss module:', error);
      });
    }
  };

  if (isLoading) {
    return null; // Don't show loading state, just hide until loaded
  }

  if (modules.length === 0) {
    return null; // Don't show if no modules
  }

  return (
    <div className={cn('mb-1', className)} data-daily-thread>
      <button
        onClick={handleToggle}
        className='flex w-full items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 px-3 sm:px-4 py-2 sm:py-2.5 text-left transition-colors hover:bg-zinc-900/50 mb-1.5'
      >
        <span className='text-xs sm:text-sm font-medium text-zinc-100'>
          Today's thread
        </span>
        {isExpanded ? (
          <ChevronUp className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400' />
        ) : (
          <ChevronDown className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400' />
        )}
      </button>

      {isExpanded && (
        <div className='overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          <div className='flex gap-3'>
            {modules.map((module) => (
              <div
                key={module.id}
                className='snap-start flex-shrink-0 w-full min-w-full'
              >
                <ModuleCard module={module} onAction={handleAction} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
