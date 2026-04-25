'use client';

import { useEffect, useState } from 'react';
import { Headphones, Sparkles } from 'lucide-react';

import DailyRecapPlayer from '@/components/daily-recap/DailyRecapPlayer';
import { InfoBottomSheet } from '@/components/ui/InfoBottomSheet';
import { cn } from '@/lib/utils';

export default function DailyRecapLauncher({
  className,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('recap') === '1' || params.get('narrate') === '1') {
      setOpen(true);
    }
  }, []);

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className={cn(
          'w-full rounded-xl border border-stroke-subtle bg-surface-elevated/45 px-4 py-3 text-left transition-colors hover:border-stroke-default',
          className,
        )}
      >
        <span className='flex items-center justify-between gap-3'>
          <span className='min-w-0'>
            <span className='block text-sm font-medium text-content-primary'>
              Daily sky recap
            </span>
            <span className='mt-1 block text-xs text-content-muted'>
              Open a short narrated read when you want it.
            </span>
          </span>
          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lunary-primary/30 bg-layer-base/70 text-content-brand'>
            <Headphones className='h-4 w-4' aria-hidden />
          </span>
        </span>
      </button>

      <InfoBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title='Daily sky recap'
        subtitle='A short listen for today, away from the dashboard.'
        leading={<Sparkles className='h-5 w-5' aria-hidden />}
        className='md:w-[520px]'
      >
        <DailyRecapPlayer className='border-0 bg-transparent p-0 shadow-none' />
      </InfoBottomSheet>
    </>
  );
}
