'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { MoonEvent } from '@/lib/moon/events';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  day: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
});

type MoonPhaseEventListProps = {
  events: MoonEvent[];
  year: string;
  type: MoonEvent['type'];
};

export default function MoonPhaseEventList({
  events,
  year,
  type,
}: MoonPhaseEventListProps) {
  if (events.length === 0) {
    return (
      <p className='text-sm text-zinc-500'>
        Lunar phase data is loading—check back soon.
      </p>
    );
  }

  const iconSrc =
    type === 'full'
      ? '/icons/moon-phases/full-moon.svg'
      : '/icons/moon-phases/new-moon.svg';
  const iconAlt = type === 'full' ? 'Full moon' : 'New moon';

  return (
    <div className='grid gap-4'>
      {events.map((moon) => {
        const date = new Date(moon.timestamp);
        const formattedDate = dateFormatter.format(date);
        const formattedTime = timeFormatter.format(date);
        const title = type === 'full' ? moon.name : `New Moon in ${moon.sign}`;

        return (
          <Link
            key={moon.slug}
            href={`/grimoire/moon/${year}/${moon.slug}`}
            className='group flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/60 hover:border-lunary-primary-600 transition-all'
          >
            <div className='flex items-center gap-4'>
              <Image
                src={iconSrc}
                alt={iconAlt}
                width={24}
                height={24}
                className='h-10 w-10'
              />
              <div>
                <h3 className='font-medium text-white group-hover:text-lunary-primary-300'>
                  {title}
                </h3>
                <p className='text-sm text-zinc-400'>
                  {formattedDate} · {formattedTime}
                </p>
              </div>
            </div>
            <ArrowRight className='h-5 w-5 text-zinc-600 group-hover:text-lunary-primary-400 transition-colors' />
          </Link>
        );
      })}
    </div>
  );
}
