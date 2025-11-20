'use client';

import { YearlyForecast } from '@/components/forecast/YearlyForecast';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/UpgradePrompt';

export default function ForecastPage() {
  const subscription = useSubscription();

  return (
    <div className='flex h-fit-content w-full flex-col gap-6 max-w-7xl mx-auto px-4 py-6'>
      <div className='space-y-4'>
        <h1 className='text-2xl font-semibold text-white'>2026 Forecast</h1>
        <p className='text-zinc-400'>
          Your personalized yearly cosmic forecast with major transits,
          retrogrades, eclipses, and key aspects.
        </p>
      </div>

      {subscription.hasAccess('yearly_forecast') ? (
        <div className='rounded-xl border border-zinc-700 bg-zinc-900/70 shadow-lg p-6'>
          <YearlyForecast />
        </div>
      ) : (
        <UpgradePrompt
          featureName='yearly_forecast'
          title='Unlock Your 2026 Forecast'
          description='Get personalized insights into major planetary transits, retrogrades, eclipses, and key aspects for 2026.'
        />
      )}
    </div>
  );
}
