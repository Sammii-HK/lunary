import { ReactNode } from 'react';

/**
 * Describes trend direction with colored text
 */
export function describeTrend(
  current: number | null,
  previous: number | null,
): ReactNode {
  if (current === null || previous === null) {
    return 'Trend data pending';
  }
  if (current > previous) {
    return <span className='text-lunary-success'>Momentum rising</span>;
  }
  if (current < previous) {
    return <span className='text-lunary-warning'>Momentum easing</span>;
  }
  return <span className='text-lunary-secondary'>Momentum steady</span>;
}

/**
 * Computes week-over-week change metrics
 */
export function computeWeekOverWeekChange(
  current: number | null,
  previous: number | null,
): { change: number | null; percentChange: number | null } {
  if (current === null || previous === null) {
    return { change: null, percentChange: null };
  }
  const change = current - previous;
  const percentChange = previous !== 0 ? (change / previous) * 100 : null;
  return { change, percentChange };
}

/**
 * Formats metric values with proper localization and decimals
 */
export function formatMetricValue(value: number | null, decimals = 0): string {
  return value === null || Number.isNaN(value)
    ? '—'
    : value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
}

/**
 * Computes percentage ratio
 */
export function computePercent(
  numerator?: number,
  denominator?: number,
): number {
  if (!denominator || denominator <= 0) return 0;
  return ((numerator || 0) / denominator) * 100;
}

/**
 * Formats date for API input (YYYY-MM-DD)
 */
export function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Shifts a date string by a number of days
 */
export function shiftDateInput(dateOnly: string, deltaDays: number): string {
  // Treat the date input as UTC for consistent analytics windows.
  const base = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(base.getTime())) return dateOnly;
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return formatDateInput(base);
}
