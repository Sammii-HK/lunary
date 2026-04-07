// Void of Course Moon Schedule component
// Displays VOC periods with timing and guidance

'use client';

import { Moon, AlertCircle, CheckCircle } from 'lucide-react';

interface VOCPeriod {
  start: Date | string;
  end: Date | string;
  guidance?: string;
}

interface VOCMoonScheduleProps {
  voidPeriods: VOCPeriod[];
  variant?: 'full' | 'compact';
}

// What to do and avoid during VOC Moon
const vocGuidance = {
  embrace: [
    'Complete existing projects',
    'Routine tasks and maintenance',
    'Meditation and reflection',
    'Rest and self-care',
    'Reviewing and editing work',
    'Cleaning and organizing',
  ],
  avoid: [
    'Starting new projects',
    'Important meetings or negotiations',
    'Signing contracts',
    'Making major purchases',
    'First dates or job interviews',
    'Launching products or websites',
  ],
};

function formatDateTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(start: Date | string, end: Date | string): string {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} min`;
  }
  if (diffHours === 1) return '1 hour';
  return `${diffHours} hours`;
}

export function VOCMoonSchedule({
  voidPeriods,
  variant = 'full',
}: VOCMoonScheduleProps) {
  if (!voidPeriods || voidPeriods.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className='rounded-lg border border-stroke-default/50 bg-surface-elevated/50 p-3'>
        <div className='flex items-center gap-2 mb-2'>
          <Moon className='h-4 w-4 text-content-muted' />
          <span className='text-xs font-medium text-content-secondary'>
            Void of Course Moon
          </span>
        </div>
        <p className='text-xs text-content-muted'>
          {voidPeriods.length} VOC period{voidPeriods.length > 1 ? 's' : ''}{' '}
          this week
        </p>
        <p className='text-xs text-content-muted mt-1'>
          Pause new beginnings during these times
        </p>
      </div>
    );
  }

  // Full variant
  return (
    <section className='space-y-4'>
      <h2 className='text-2xl font-bold flex items-center gap-2'>
        <Moon className='h-6 w-6 text-content-muted' />
        Void of Course Moon Schedule
      </h2>

      <div className='rounded-xl border border-stroke-default/50 bg-surface-elevated/50 p-6'>
        {/* Explanation */}
        <div className='mb-6 p-4 rounded-lg bg-surface-card/50 border border-stroke-default/30'>
          <p className='text-sm text-content-secondary'>
            <strong className='text-content-primary'>
              What is Void of Course Moon?
            </strong>{' '}
            When the Moon makes no more major aspects before entering a new
            sign, it is considered "void of course." During these periods, new
            initiatives may not turn out as expected. It is an excellent time
            for completion and reflection.
          </p>
        </div>

        {/* VOC Periods */}
        <div className='space-y-3 mb-6'>
          <h3 className='text-sm font-medium text-content-secondary'>
            This Week's VOC Periods
          </h3>
          {voidPeriods.map((period, index) => {
            const startDate =
              period.start instanceof Date
                ? period.start
                : new Date(period.start);
            const endDate =
              period.end instanceof Date ? period.end : new Date(period.end);

            return (
              <div
                key={index}
                className='flex items-start gap-3 p-3 rounded-lg bg-surface-card/30 border border-stroke-default/20'
              >
                <div className='w-8 h-8 rounded-full bg-surface-overlay/50 flex items-center justify-center flex-shrink-0'>
                  <Moon className='h-4 w-4 text-content-muted' />
                </div>
                <div className='flex-1'>
                  <div className='flex flex-wrap items-center gap-2 text-sm'>
                    <span className='font-medium text-content-primary'>
                      {startDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className='text-content-muted'>
                      {formatTime(startDate)} → {formatTime(endDate)}
                    </span>
                    <span className='text-xs px-2 py-0.5 rounded-full bg-surface-overlay/50 text-content-muted'>
                      {formatDuration(startDate, endDate)}
                    </span>
                  </div>
                  {period.guidance && (
                    <p className='text-xs text-content-muted mt-1'>
                      {period.guidance}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guidance columns */}
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='p-4 rounded-lg bg-emerald-950/20 border border-emerald-700/20'>
            <h4 className='flex items-center gap-2 font-medium text-emerald-400 mb-3'>
              <CheckCircle className='h-4 w-4' />
              Embrace During VOC
            </h4>
            <ul className='space-y-1.5'>
              {vocGuidance.embrace.map((item) => (
                <li
                  key={item}
                  className='text-sm text-content-muted flex items-start gap-2'
                >
                  <span className='text-emerald-500 mt-1'>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className='p-4 rounded-lg bg-rose-950/20 border border-rose-700/20'>
            <h4 className='flex items-center gap-2 font-medium text-rose-400 mb-3'>
              <AlertCircle className='h-4 w-4' />
              Avoid During VOC
            </h4>
            <ul className='space-y-1.5'>
              {vocGuidance.avoid.map((item) => (
                <li
                  key={item}
                  className='text-sm text-content-muted flex items-start gap-2'
                >
                  <span className='text-rose-500 mt-1'>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
