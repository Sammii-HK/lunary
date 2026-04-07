'use client';

import Link from 'next/link';
import { findKarmicDebt } from '@/lib/numerology';
import { karmicDebtNumbers } from '@/constants/grimoire/numerology-extended-data';
import { useNumerologyProfileResults } from '@/components/grimoire/NumerologyProfileCalculator';

export function KarmicDebtCalculatorExtras() {
  const results = useNumerologyProfileResults();
  const metrics = [
    { label: 'Life Path', result: results.lifePath },
    { label: 'Expression', result: results.expression },
    { label: 'Soul Urge', result: results.soulUrge },
  ];

  const matches = metrics
    .map((metric) => {
      const karmic = findKarmicDebt(metric.result?.reductionPath ?? []);
      if (!karmic) return null;
      return { label: metric.label, number: karmic };
    })
    .filter((match): match is { label: string; number: number } =>
      Boolean(match),
    );

  const hasInputs = Boolean(results.fullName || results.birthDate);

  return (
    <div className='space-y-4'>
      <p className='text-sm text-content-muted'>
        Karmic Debt Numbers (13, 14, 16, 19) appear when Life Path, Expression,
        or Soul Urge calculations pass through these energies. Enter your data
        to spot which lessons are active for you today.
      </p>
      {matches.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2'>
          {matches.map((match) => {
            const key = match.number.toString();
            const detail = karmicDebtNumbers[key];
            return (
              <div
                key={`${match.label}-${match.number}`}
                className='border border-stroke-subtle rounded-2xl bg-surface-base/50 p-4 space-y-2'
              >
                <div className='text-xs font-semibold uppercase tracking-wide text-content-muted'>
                  {match.label}
                </div>
                <p className='text-lg font-semibold text-content-brand'>
                  Karmic Debt {match.number}
                </p>
                <p className='text-sm text-content-muted'>
                  {detail?.meaning ??
                    detail?.description ??
                    'A karmic lesson to work through.'}
                </p>
                <Link
                  className='text-xs font-semibold text-content-brand hover:underline'
                  href={`/grimoire/numerology/karmic-debt/${match.number}`}
                >
                  Read the full meaning
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <p className='text-sm text-content-secondary'>
          {hasInputs
            ? 'None of the numbers you entered show a karmic debt right now. Keep exploring — the lessons can shift as you grow.'
            : 'Enter your name and birth date to see if any karmic debt numbers are active for you.'}
        </p>
      )}
    </div>
  );
}
