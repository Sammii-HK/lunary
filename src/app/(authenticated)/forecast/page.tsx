'use client';

import { YearlyForecast } from '@/components/forecast/YearlyForecast';
import { ForecastTeaser } from '@/components/forecast/ForecastTeaser';
import { useSubscription } from '@/hooks/useSubscription';
import { Heading } from '@/components/ui/Heading';

const currentYear = new Date().getFullYear();

export default function ForecastPage() {
  const subscription = useSubscription();

  return (
    <div className='flex h-fit-content w-full flex-col gap-4 max-w-4xl mx-auto px-4 py-4'>
      <div className='space-y-2'>
        <Heading as='h1' variant='h1'>
          {currentYear} Forecast
        </Heading>
        <p className='text-zinc-400'>
          Major transits, retrogrades, eclipses and key aspects for the year
          ahead. Download as a calendar to track cosmic events.
        </p>
      </div>

      {subscription.hasAccess('yearly_forecast') ? (
        <YearlyForecast />
      ) : (
        <ForecastTeaser year={currentYear} />
      )}
    </div>
  );
}
