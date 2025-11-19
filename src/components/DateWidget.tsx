'use client';

import { useState, lazy, Suspense } from 'react';
import { useAstronomyContext } from '@/context/AstronomyContext';
import dayjs, { Dayjs } from 'dayjs';

// Lazy load MUI date picker - only load when calendar is opened
// This prevents loading ~192KB of MUI date picker code on initial page load
const DateCalendarModal = lazy(async () => {
  const [
    { LocalizationProvider },
    { AdapterDayjs },
    { DateCalendar },
    { createTheme, ThemeProvider },
  ] = await Promise.all([
    import('@mui/x-date-pickers/LocalizationProvider'),
    import('@mui/x-date-pickers/AdapterDayjs'),
    import('@mui/x-date-pickers/DateCalendar'),
    import('@mui/material'),
  ]);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return {
    default: function DateCalendarModal({
      value,
      onChange,
    }: {
      value: Dayjs | null;
      onChange: (newValue: Dayjs | null) => void;
    }) {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ThemeProvider theme={darkTheme}>
            <DateCalendar views={['day']} value={value} onChange={onChange} />
          </ThemeProvider>
        </LocalizationProvider>
      );
    },
  };
});

export const DateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const { writtenDate, setCurrentDateTime } = useAstronomyContext();

  const handleChange = (newValue: Dayjs | null) => {
    setValue(newValue);
    if (newValue) {
      setCurrentDateTime(newValue.toDate());
    }
    setIsOpen(false);
  };

  return (
    <>
      <p
        className='w-full flex justify-center cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        {writtenDate}
      </p>
      {isOpen && (
        <Suspense
          fallback={
            <div className='h-64 bg-zinc-900/50 rounded-lg animate-pulse flex items-center justify-center'>
              <p className='text-zinc-400'>Loading calendar...</p>
            </div>
          }
        >
          <DateCalendarModal value={value} onChange={handleChange} />
        </Suspense>
      )}
    </>
  );
};
