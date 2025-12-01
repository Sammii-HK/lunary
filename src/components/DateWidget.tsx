'use client';

import { useState } from 'react';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { Calendar } from '@/components/ui/calendar';

export const DateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { writtenDate, setCurrentDateTime } = useAstronomyContext();

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setCurrentDateTime(newDate);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        className='w-full flex justify-center cursor-pointer hover:text-purple-400 transition-colors text-zinc-300'
        onClick={() => setIsOpen(!isOpen)}
      >
        {writtenDate}
      </button>
      {isOpen && (
        <div className='mt-2 flex justify-center'>
          <div className='rounded-lg border border-purple-500/30 bg-zinc-900/95 shadow-xl backdrop-blur-sm'>
            <Calendar
              mode='single'
              selected={date}
              onSelect={handleSelect}
              className='p-3'
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-3',
                caption:
                  'flex justify-center pt-1 relative items-center text-zinc-200',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button:
                  'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-zinc-400 hover:text-purple-400 transition-colors',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell:
                  'text-zinc-500 rounded-md w-8 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-purple-500/20 [&:has([aria-selected])]:rounded-md',
                day: 'h-8 w-8 p-0 font-normal text-zinc-300 hover:bg-zinc-800 hover:text-purple-300 rounded-md transition-colors aria-selected:opacity-100',
                day_selected:
                  'bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white',
                day_today: 'bg-zinc-800 text-purple-400 font-medium',
                day_outside: 'text-zinc-600 opacity-50',
                day_disabled: 'text-zinc-600 opacity-30',
                day_hidden: 'invisible',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
