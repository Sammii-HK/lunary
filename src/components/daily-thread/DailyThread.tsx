'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DailyThreadModule } from '@/lib/daily-thread/types';
import { ModuleCard } from './ModuleCard';
import { cn } from '@/lib/utils';

interface DailyThreadProps {
  className?: string;
  /** Controlled expanded state. If provided, internal state is ignored. */
  isExpanded?: boolean;
  /** Controlled toggle callback. Called when the internal toggle button is clicked. */
  onToggle?: () => void;
  /** Hide the internal toggle button (use when toggle is rendered externally). */
  hideToggle?: boolean;
  /** Called once modules are loaded, with whether any exist. */
  onModulesLoaded?: (hasModules: boolean) => void;
}

export function DailyThread({
  className,
  isExpanded: isExpandedProp,
  onToggle,
  hideToggle,
  onModulesLoaded,
}: DailyThreadProps) {
  const [modules, setModules] = useState<DailyThreadModule[]>([]);
  const [isExpandedInternal, setIsExpandedInternal] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const isControlled = isExpandedProp !== undefined;
  const isExpanded = isControlled ? isExpandedProp : isExpandedInternal;

  useEffect(() => {
    if (!isControlled) {
      const savedState = localStorage.getItem('daily-thread-collapsed');
      if (savedState === 'true') setIsExpandedInternal(false);
    }

    fetchModules();

    const handleRefresh = async (event: CustomEvent) => {
      const { type } = event.detail || {};
      await fetchModules(type, true);
      if (!isControlled) setIsExpandedInternal(true);
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
  }, [isControlled]);

  const fetchModules = async (type?: string, forceRefresh = false) => {
    try {
      setIsLoading(true);
      const url = type
        ? `/api/astral-chat/daily-thread?type=${type}&forceRefresh=${forceRefresh}`
        : `/api/astral-chat/daily-thread?forceRefresh=${forceRefresh}`;
      const response = await fetch(url);
      const data = await response.json();
      const loaded = data.modules || [];
      setModules(loaded);
      onModulesLoaded?.(loaded.length > 0);
    } catch (error) {
      console.error('[DailyThread] Error fetching modules:', error);
      onModulesLoaded?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      const newState = !isExpandedInternal;
      setIsExpandedInternal(newState);
      localStorage.setItem('daily-thread-collapsed', String(!newState));
    }
  };

  if (isLoading) return null;
  if (modules.length === 0) return null;

  return (
    <div className={cn(className)} data-daily-thread>
      {!hideToggle && (
        <button
          onClick={handleToggle}
          className='flex w-full items-center justify-between rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 px-3 sm:px-4 py-2 sm:py-2.5 text-left transition-colors hover:bg-surface-elevated/50 mb-1.5'
        >
          <span className='text-xs sm:text-sm font-medium text-content-primary'>
            Today's thread
          </span>
          {isExpanded ? (
            <ChevronUp className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-content-muted' />
          ) : (
            <ChevronDown className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-content-muted' />
          )}
        </button>
      )}

      {isExpanded && (
        <div className='overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          <div className='flex gap-3'>
            {modules.map((module) => (
              <div
                key={module.id}
                className='snap-start flex-shrink-0 w-full min-w-full'
              >
                <ModuleCard
                  module={module}
                  onAction={(action) => {
                    if (action.intent === 'dismiss') {
                      setModules((prev) =>
                        prev.filter((m) => m.id !== module.id),
                      );
                      fetch('/api/astral-chat/daily-thread/action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          action: 'dismiss',
                          moduleId: module.id,
                        }),
                      }).catch((e) =>
                        console.error('[DailyThread] dismiss failed:', e),
                      );
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
