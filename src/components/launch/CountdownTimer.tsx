'use client';

import { useEffect, useMemo, useState } from 'react';

interface CountdownTimerProps {
  targetDate?: string;
  label?: string;
  className?: string;
}

const DEFAULT_LAUNCH = '2025-03-03T17:00:00.000Z'; // 9 AM PT

const getTimeLeft = (target: Date) => {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isLive: false };
};

export function CountdownTimer({
  targetDate = DEFAULT_LAUNCH,
  label = 'Launch Day',
  className = '',
}: CountdownTimerProps) {
  const target = useMemo(() => new Date(targetDate), [targetDate]);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);

    return () => clearInterval(id);
  }, [target]);

  return (
    <section
      className={`rounded-3xl border border-white/10 bg-gradient-to-r from-lunary-primary-900/40 via-indigo-900/40 to-transparent p-6 ${className}`}
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
            {label}
          </p>
          <h3 className='text-2xl font-semibold text-white'>
            {timeLeft.isLive
              ? 'We are live 🎉'
              : 'Countdown to Product Hunt launch'}
          </h3>
          <p className='text-sm text-zinc-300'>
            March 3 · Product Hunt · Global livestream · Press drop
          </p>
        </div>

        <div className='flex flex-wrap gap-3 text-center'>
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((segment) => (
            <div
              key={segment.label}
              className='w-20 rounded-2xl border border-white/10 bg-black/40 p-3'
            >
              <p className='text-2xl font-bold text-white tabular-nums'>
                {segment.value.toString().padStart(2, '0')}
              </p>
              <p className='text-xs uppercase tracking-[0.3em] text-lunary-primary-200'>
                {segment.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
