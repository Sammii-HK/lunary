'use client';

import { useState, useMemo } from 'react';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { Calendar } from '@/components/ui/calendar';
import { RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';

export const DateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { writtenDate, setCurrentDateTime, currentDate } =
    useAstronomyContext();

  const isViewingDifferentDate = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return currentDate && currentDate !== today;
  }, [currentDate]);

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setCurrentDateTime(newDate);
    }
    setIsOpen(false);
  };

  const handleBackToToday = () => {
    const today = new Date();
    setDate(today);
    setCurrentDateTime(today);
    setIsOpen(false);
  };

  return (
    <>
      <div className='flex flex-col items-center gap-1'>
        <button
          className='flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors text-zinc-300'
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className='w-4 h-4' />
          <span>{writtenDate}</span>
        </button>
        {isViewingDifferentDate && (
          <button
            onClick={handleBackToToday}
            className='flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/30'
          >
            <RotateCcw className='w-3 h-3' />
            <span>Back to today</span>
          </button>
        )}
      </div>
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
