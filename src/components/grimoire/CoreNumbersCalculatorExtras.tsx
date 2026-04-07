'use client';

import { useNumerologyProfileResults } from '@/components/grimoire/NumerologyProfileCalculator';

export function CoreNumbersCalculatorExtras() {
  const results = useNumerologyProfileResults();
  const entries = [
    {
      label: 'Life Path',
      description: 'Your primary life purpose and direction',
      value: results.lifePath?.result,
    },
    {
      label: 'Expression',
      description: 'The natural talents you express in the world',
      value: results.expression?.result,
    },
    {
      label: 'Soul Urge',
      description: 'What your heart truly desires',
      value: results.soulUrge?.result,
    },
  ];

  return (
    <div className='space-y-4'>
      <p className='text-sm text-content-muted'>
        Your Life Path, Expression, and Soul Urge numbers are the three core
        values that form the foundation of your numerology profile. Use the
        inputs above to reveal which cores you're working with right now.
      </p>
      <div className='grid gap-4 md:grid-cols-3'>
        {entries.map((entry) => (
          <div
            key={entry.label}
            className='border border-stroke-subtle rounded-2xl bg-surface-elevated/30 p-4 flex flex-col gap-2'
          >
            <div className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
              {entry.label}
            </div>
            <div className='text-4xl font-light text-content-brand'>
              {entry.value ?? '--'}
            </div>
            <p className='text-xs text-content-muted'>
              {entry.value
                ? 'Calculated from your inputs above'
                : entry.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
