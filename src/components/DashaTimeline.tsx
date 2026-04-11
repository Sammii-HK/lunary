'use client';

import React, { useState } from 'react';
import dayjs from 'dayjs';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CurrentDashaState,
  DashaPeriod,
} from '@utils/astrology/vedic-dasha';

interface DashaTimelineProps {
  currentDasha: CurrentDashaState | null;
  upcomingPeriods: DashaPeriod[];
  loading?: boolean;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Ketu: '☋',
  Rahu: '☊',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  Moon: 'bg-blue-100 text-blue-900 border-blue-300',
  Mercury: 'bg-amber-100 text-amber-900 border-amber-300',
  Venus: 'bg-green-100 text-green-900 border-green-300',
  Mars: 'bg-red-100 text-red-900 border-red-300',
  Jupiter: 'bg-purple-100 text-purple-900 border-purple-300',
  Saturn: 'bg-slate-100 text-slate-900 border-slate-300',
  Uranus: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  Neptune: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  Pluto: 'bg-gray-100 text-gray-900 border-gray-300',
  Ketu: 'bg-orange-100 text-orange-900 border-orange-300',
  Rahu: 'bg-pink-100 text-pink-900 border-pink-300',
};

/**
 * Format a date range for display
 */
function formatDateRange(start: Date, end: Date): string {
  const startStr = dayjs(start).format('MMM YYYY');
  const endStr = dayjs(end).format('MMM YYYY');
  return `${startStr} – ${endStr}`;
}

/**
 * Format years with decimal places
 */
function formatYears(years: number): string {
  if (years >= 1) {
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);
    if (months === 0) return `${wholeYears} yr`;
    return `${wholeYears} yr ${months} mo`;
  }
  const months = Math.round(years * 12);
  return `${months} mo`;
}

/**
 * Current Dasha Card - shows the active mahadasha and antardasha
 */
function CurrentDashaCard({ dasha }: { dasha: CurrentDashaState }) {
  const mahadasha = dasha.mahadasha;
  const antardasha = dasha.antardasha;
  const daysRemaining = mahadasha.daysRemaining;
  const yearsRemaining = daysRemaining / 365.25;

  return (
    <div className='rounded-lg border border-lunary-primary-200 bg-gradient-to-br from-lunary-primary-50 to-transparent p-4 sm:p-6'>
      {/* Header with current age */}
      <div className='mb-4 flex items-baseline justify-between'>
        <h3 className='text-sm font-semibold text-lunary-primary-900'>
          Current Dasha Period
        </h3>
        <p className='text-xs text-lunary-primary-600'>
          Age {Math.floor(dasha.currentAge)}
        </p>
      </div>

      {/* Main dasha info */}
      <div className='mb-4 space-y-3'>
        {/* Mahadasha */}
        <div>
          <div className='flex items-center gap-2 pb-2'>
            <span
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold',
                PLANET_COLORS[mahadasha.planet],
              )}
            >
              {PLANET_SYMBOLS[mahadasha.planet] || mahadasha.planet[0]}
            </span>
            <div className='flex-1'>
              <p className='font-semibold text-gray-900'>
                {mahadasha.planet} Mahadasha
              </p>
              <p className='text-xs text-gray-600'>
                {formatDateRange(mahadasha.startDate, mahadasha.endDate)}
              </p>
            </div>
          </div>

          {/* Progress bar for mahadasha */}
          <div className='mx-0 mt-2 space-y-1'>
            <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className='h-full bg-lunary-primary-500 transition-all'
                style={{
                  width: `${mahadasha.percentComplete}%`,
                }}
              />
            </div>
            <div className='flex justify-between text-xs text-gray-600'>
              <span>{Math.round(mahadasha.percentComplete)}% complete</span>
              <span>{formatYears(yearsRemaining)} remaining</span>
            </div>
          </div>
        </div>

        {/* Antardasha */}
        {antardasha.planet !== 'Unknown' && (
          <div className='border-t border-gray-200 pt-3'>
            <div className='flex items-center gap-2 pb-1'>
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold',
                  PLANET_COLORS[antardasha.planet],
                )}
              >
                {PLANET_SYMBOLS[antardasha.planet] || antardasha.planet[0]}
              </span>
              <p className='text-sm font-medium text-gray-800'>
                {antardasha.planet} Antardasha (sub-period)
              </p>
            </div>
            <p className='ml-8 text-xs text-gray-600'>
              {formatDateRange(antardasha.startDate, antardasha.endDate)}
            </p>
          </div>
        )}

        {/* Transition warning */}
        {dasha.transitionApproaching && (
          <div className='mt-3 rounded bg-amber-50 p-2 text-xs text-amber-800 border border-amber-200'>
            ⚠️ Major dasha transition approaching in {Math.ceil(daysRemaining)}{' '}
            days
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Timeline of upcoming dasha periods
 */
function UpcomingDashaList({ periods }: { periods: DashaPeriod[] }) {
  return (
    <div className='space-y-2'>
      {periods.map((period, idx) => (
        <div
          key={`${period.planet}-${dayjs(period.startDate).format('YYYY-MM')}`}
          className='rounded-lg border border-gray-200 bg-white p-3 hover:border-lunary-primary-300 hover:bg-lunary-primary-50 transition-colors'
        >
          <div className='flex items-center gap-3'>
            {/* Sequence number */}
            <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700'>
              {idx + 1}
            </span>

            {/* Planet info */}
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold',
                    PLANET_COLORS[period.planet],
                  )}
                >
                  {PLANET_SYMBOLS[period.planet] || period.planet[0]}
                </span>
                <span className='font-semibold text-gray-900'>
                  {period.planet}
                </span>
              </div>
              <p className='text-xs text-gray-600 mt-1'>
                {formatDateRange(period.startDate, period.endDate)}
              </p>
            </div>

            {/* Duration */}
            <div className='text-right'>
              <p className='text-sm font-medium text-gray-900'>
                {formatYears(period.years)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main DashaTimeline component
 */
export function DashaTimeline({
  currentDasha,
  upcomingPeriods,
  loading = false,
}: DashaTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='h-32 animate-pulse rounded-lg bg-gray-100' />
        <div className='h-20 animate-pulse rounded-lg bg-gray-100' />
      </div>
    );
  }

  if (!currentDasha) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500'>
        <p className='text-sm'>
          Add your birth chart details to see your dasha periods
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Current Dasha Card */}
      <CurrentDashaCard dasha={currentDasha} />

      {/* Upcoming Periods Section */}
      {upcomingPeriods.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className='flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50 transition-colors'
          >
            <span>Upcoming Dasha Periods</span>
            <ChevronDown
              className={cn(
                'h-5 w-5 transition-transform',
                expanded && 'rotate-180',
              )}
            />
          </button>

          {expanded && (
            <div className='mt-3'>
              <UpcomingDashaList periods={upcomingPeriods} />
            </div>
          )}
        </div>
      )}

      {/* Note about Vedic system */}
      <p className='text-xs text-gray-500'>
        Vimshottari Dasha is a 120-year Vedic cycle. These periods are
        calculated from your natal Moon position.
      </p>
    </div>
  );
}
