'use client';

import { DailyThreadModule } from '@/lib/daily-thread/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ModuleCardProps {
  module: DailyThreadModule;
  onAction: (action: DailyThreadModule['actions'][0], moduleId: string) => void;
}

const getMoonPhaseImage = (moonPhase?: string) => {
  if (!moonPhase) return null;
  const normalized = moonPhase.toLowerCase();
  const map: Array<[string, string]> = [
    ['new moon', 'new-moon.svg'],
    ['waxing crescent', 'waxing-cresent-moon.svg'],
    ['first quarter', 'first-quarter.svg'],
    ['waxing gibbous', 'waxing-gibbous-moon.svg'],
    ['full moon', 'full-moon.svg'],
    ['waning gibbous', 'waning-gibbous-moon.svg'],
    ['last quarter', 'last-quarter.svg'],
    ['waning crescent', 'waning-cresent-moon.svg'],
  ];
  const match = map.find(([phase]) => normalized.includes(phase));
  return match ? `/icons/moon-phases/${match[1]}` : null;
};

export function ModuleCard({ module, onAction }: ModuleCardProps) {
  const router = useRouter();
  const moonPhaseImage = getMoonPhaseImage(module.meta?.moonPhase);

  const handleAction = async (action: DailyThreadModule['actions'][0]) => {
    if (action.intent === 'dismiss') {
      onAction(action, module.id);
      return;
    }

    if (action.href) {
      router.push(action.href);
      return;
    }

    if (action.intent === 'journal') {
      const prompt = action.payload?.prompt;
      const inputElement =
        typeof document !== 'undefined'
          ? document.getElementById('book-of-shadows-message')
          : null;
      if (inputElement) {
        window.dispatchEvent(
          new CustomEvent('astral-chat:journal', {
            detail: { prompt },
          }),
        );
        return;
      }

      const query = prompt ? `?prompt=${encodeURIComponent(prompt)}` : '';
      router.push(`/book-of-shadows${query}`);
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

    onAction(action, module.id);
  };

  return (
    <div className='flex-shrink-0 w-full rounded-lg border border-lunary-primary-700 bg-zinc-950/60 p-3 sm:p-4 space-y-2 sm:space-y-3 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1'>
          <h3 className='text-xs sm:text-sm font-medium text-zinc-100 mb-1'>
            {module.title}
          </h3>
          <p className='text-xs sm:text-sm text-zinc-400 leading-relaxed'>
            {module.body}
          </p>
        </div>
        {moonPhaseImage && (
          <div className='flex-shrink-0'>
            <Image
              src={moonPhaseImage}
              alt={module.meta?.moonPhase || 'Moon phase'}
              width={40}
              height={40}
              className='opacity-90'
            />
          </div>
        )}
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
