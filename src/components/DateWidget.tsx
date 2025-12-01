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
      <p
        className='w-full flex justify-center cursor-pointer hover:text-purple-400 transition-colors'
        onClick={() => setIsOpen(!isOpen)}
      >
        {writtenDate}
      </p>
      {isOpen && (
        <div className='mt-2 rounded-lg border border-zinc-800 bg-zinc-900'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={handleSelect}
            className='rounded-lg'
          />
        </div>
      )}
    </>
  );
};
