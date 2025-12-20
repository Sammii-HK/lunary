'use client';

import { DailyThreadModule } from '@/lib/daily-thread/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ModuleCardProps {
  module: DailyThreadModule;
  onAction: (action: DailyThreadModule['actions'][0]) => void;
}

export function ModuleCard({ module, onAction }: ModuleCardProps) {
  const router = useRouter();

  const handleAction = async (action: DailyThreadModule['actions'][0]) => {
    if (action.intent === 'dismiss') {
      onAction(action);
      return;
    }

    if (action.href) {
      router.push(action.href);
      return;
    }

    if (action.intent === 'journal' && action.payload?.prompt) {
      router.push(
        `/journal?prompt=${encodeURIComponent(action.payload.prompt)}`,
      );
      return;
    }

    // Call API for other actions
    try {
      const response = await fetch('/api/astral-chat/daily-thread/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.intent,
          moduleId: module.id,
          payload: action.payload,
        }),
      });

      const data = await response.json();
      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch (error) {
      console.error('[ModuleCard] Error handling action:', error);
    }

    onAction(action);
  };

  return (
    <div className='flex-shrink-0 w-full rounded-lg border border-lunary-primary-700 bg-zinc-950/60 p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-sm'>
      <div>
        <h3 className='text-xs sm:text-sm font-medium text-zinc-100 mb-1'>
          {module.title}
        </h3>
        <p className='text-xs sm:text-sm text-zinc-400 leading-relaxed'>
          {module.body}
        </p>
      </div>

      {module.meta && (
        <div className='text-[10px] sm:text-xs text-zinc-500 space-y-1'>
          {module.meta.relativeTime && (
            <div>On this day, {module.meta.relativeTime}</div>
          )}
          {module.meta.question && module.meta.question !== module.body && (
            <div className='italic'>{module.meta.question}</div>
          )}
        </div>
      )}

      <div className='flex flex-wrap gap-1.5 sm:gap-2'>
        {module.actions.map((action, index) => (
          <Button
            key={index}
            variant={action.intent === 'dismiss' ? 'ghost' : 'default'}
            size='sm'
            onClick={() => handleAction(action)}
            className='text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-3'
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
