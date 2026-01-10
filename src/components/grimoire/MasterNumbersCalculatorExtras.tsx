'use client';

import { useNumerologyProfileResults } from '@/components/grimoire/NumerologyProfileCalculator';
import { findMasterNumber } from '@/lib/numerology';

export function MasterNumbersCalculatorExtras() {
  const results = useNumerologyProfileResults();
  const metrics = [
    { label: 'Life Path', result: results.lifePath },
    { label: 'Expression', result: results.expression },
    { label: 'Soul Urge', result: results.soulUrge },
  ];

  const matches = metrics
    .map((metric) => {
      const master = findMasterNumber(metric.result?.reductionPath ?? []);
      if (!master) return null;
      return { label: metric.label, master };
    })
    .filter((match): match is { label: string; master: number } =>
      Boolean(match),
    );

  return (
    <div className='space-y-4'>
      <p className='text-sm text-zinc-400'>
        Master Numbers (11, 22, 33) are rare amplifications of the core digits.
        Enter your name and birth date to see if your Life Path, Expression, or
        Soul Urge lands in this powerful trio.
      </p>
      {matches.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2'>
          {matches.map((match) => (
            <div
              key={`${match.label}-${match.master}`}
              className='border border-zinc-800 rounded-2xl bg-zinc-950/50 p-4 space-y-2'
            >
              <div className='text-xs font-semibold uppercase tracking-wide text-zinc-500'>
                {match.label}
              </div>
              <p className='text-3xl font-light text-lunary-primary-300'>
                Master {match.master}
              </p>
              <p className='text-sm text-zinc-400'>
                {match.master === 11 &&
                  'Master 11 is the intuitive messenger, calling you to inspire others.'}
                {match.master === 22 &&
                  'Master 22 is the Master Builder, designed to manifest grand visions.'}
                {match.master === 33 &&
                  'Master 33 is the Master Teacher, guiding you to love and heal with wisdom.'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-sm text-zinc-300'>
          Enter your personal details to learn whether any of your primary
          numbers carry Master Number energy.
        </p>
      )}
    </div>
  );
}
