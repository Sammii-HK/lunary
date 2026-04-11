'use client';

import { useState, useMemo } from 'react';
import { useCosmicDate } from '@/context/AstronomyContext';
import { useUser } from '@/context/UserContext';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { RotateCcw, Calendar as CalendarIcon, Lock } from 'lucide-react';
import dayjs from 'dayjs';

export const DateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { writtenDate, setCurrentDateTime, currentDate } = useCosmicDate();
  const { user } = useUser();

  const isViewingDifferentDate = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return currentDate && currentDate !== today;
  }, [currentDate]);

  const isPremium = user?.isPaid ?? false;

  const handleDateButtonClick = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setIsOpen(!isOpen);
  };

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
      <div className='flex flex-col items-center gap-2'>
        {/* Date picker button */}
        <Button
          onClick={handleDateButtonClick}
          variant={isViewingDifferentDate ? 'lunary-solid' : 'lunary'}
          size='default'
          className={`${
            isViewingDifferentDate ? 'animate-pulse' : ''
          } transition-all`}
        >
          <CalendarIcon className='w-4 h-4' />
          <span>{writtenDate}</span>
          {!isPremium && <Lock className='w-3.5 h-3.5' />}
        </Button>

        {/* Back to today button */}
        {isViewingDifferentDate && (
          <Button
            onClick={handleBackToToday}
            size='sm'
            variant='ghost'
            className='text-lunary-accent'
          >
            <RotateCcw className='w-3.5 h-3.5' />
            <span>Back to today</span>
          </Button>
        )}
      </div>

      {/* Premium modal */}
      {showPremiumModal && (
        <div className='fixed inset-0 bg-black/50 flex items-end z-50'>
          <div className='w-full bg-surface-elevated rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom-5'>
            <div className='flex items-center gap-2'>
              <div className='p-2 bg-lunary-accent/10 rounded-lg'>
                <CalendarIcon className='w-5 h-5 text-lunary-accent' />
              </div>
              <div>
                <h3 className='font-semibold text-content-primary'>
                  Explore Any Date
                </h3>
                <p className='text-xs text-content-muted'>Premium feature</p>
              </div>
            </div>

            <p className='text-sm text-content-secondary'>
              See how the moon phases, planetary positions, tarot readings, and
              cosmic energy shift across any date in time. Perfect for planning
              ahead or understanding the past.
            </p>

            <div className='space-y-2'>
              <Button
                onClick={() => {
                  setShowPremiumModal(false);
                  // Navigate to upgrade or show paywall
                  window.location.href = '/pricing';
                }}
                className='w-full'
                variant='lunary-solid'
              >
                Upgrade to Pro
              </Button>
              <Button
                onClick={() => setShowPremiumModal(false)}
                variant='ghost'
                className='w-full'
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Calendar picker modal */}
      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-end z-40'>
          <div className='w-full bg-surface-elevated rounded-t-2xl p-4 animate-in slide-in-from-bottom-5'>
            {/* Header */}
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold text-content-primary'>
                Select a date
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className='p-1 hover:bg-surface-card rounded-lg transition-colors'
              >
                <CalendarIcon className='w-5 h-5 text-content-muted' />
              </button>
            </div>

            {/* Calendar */}
            <div className='bg-surface-elevated rounded-xl border border-lunary-primary-700'>
              <Calendar
                mode='single'
                selected={date}
                onSelect={handleSelect}
                className='p-3'
                classNames={{
                  months: 'flex flex-col',
                  month: 'space-y-3',
                  caption:
                    'flex justify-center pt-1 relative items-center text-content-primary',
                  caption_label: 'text-sm font-medium',
                  nav: 'space-x-1 flex items-center',
                  nav_button:
                    'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-content-muted hover:text-lunary-accent transition-colors',
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell:
                    'text-content-muted rounded-md w-8 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-layer-base [&:has([aria-selected])]:rounded-md',
                  day: 'h-8 w-8 p-0 font-normal text-content-secondary hover:bg-surface-card hover:text-content-brand-accent rounded-md transition-colors aria-selected:opacity-100',
                  day_selected:
                    'bg-lunary-primary text-white hover:bg-lunary-primary hover:text-white focus:bg-lunary-primary focus:text-white',
                  day_today: 'bg-surface-card text-lunary-accent font-medium',
                  day_outside: 'text-content-muted opacity-50',
                  day_disabled: 'text-content-muted opacity-30',
                  day_hidden: 'invisible',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
