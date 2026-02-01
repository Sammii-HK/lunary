/**
 * Analytics utility functions for safe calculations
 */

/**
 * Calculate percentage with safeguards against invalid values
 *
 * @param numerator - The numerator value (can be null/undefined)
 * @param denominator - The denominator value (can be null/undefined)
 * @param options - Configuration options
 * @param options.cap - If true, cap result at 100% (default: false)
 * @param options.decimals - Number of decimal places (default: 2)
 * @returns Percentage value, or 0 if denominator is invalid
 *
 * @example
 * safePercentage(25, 100) // 25.00
 * safePercentage(150, 100, { cap: true }) // 100.00 (capped)
 * safePercentage(1, 3, { decimals: 4 }) // 33.3333
 */
export function safePercentage(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  options: { cap?: boolean; decimals?: number } = {},
): number {
  const { cap = false, decimals = 2 } = options;

  // Handle invalid denominator
  if (!denominator || denominator <= 0) return 0;

  const num = numerator || 0;
  let result = (num / denominator) * 100;

  // Cap at 100% if requested and result exceeds
  if (cap && result > 100) {
    console.warn('[analytics] Percentage >100% detected and capped:', {
      numerator: num,
      denominator,
      original: result,
      capped: 100,
    });
    result = 100;
  }

  return Number(result.toFixed(decimals));
}

/**
 * Calculate growth/change percentage between two values
 *
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change, or null if previous is 0
 *
 * @example
 * calculateChange(150, 100) // 50.00 (50% increase)
 * calculateChange(75, 100) // -25.00 (25% decrease)
 * calculateChange(100, 0) // null (undefined growth)
 */
export function calculateChange(
  current: number | null | undefined,
  previous: number | null | undefined,
): number | null {
  if (current === null || current === undefined) return null;
  if (previous === null || previous === undefined || previous === 0)
    return null;

  const change = ((current - previous) / previous) * 100;
  return Number(change.toFixed(2));
}

/**
 * Safely divide two numbers, returning 0 if denominator is invalid
 *
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @param decimals - Number of decimal places (default: 2)
 * @returns Division result, or 0 if invalid
 */
export function safeDivide(
  numerator: number | null | undefined,
  denominator: number | null | undefined,
  decimals: number = 2,
): number {
  if (!denominator || denominator === 0) return 0;
  const result = (numerator || 0) / denominator;
  return Number(result.toFixed(decimals));
}

/**
 * Calculate trend (change) between two values with robust error handling
 * Handles NaN, Infinity, division by zero, and extreme values
 *
 * @param current - Current value
 * @param previous - Previous value
 * @returns Object with change, percentChange, and optional error message
 *
 * @example
 * calculateTrend(150, 100) // { change: 50, percentChange: 50.00 }
 * calculateTrend(100, 0) // { change: 100, percentChange: null, error: 'Division by zero' }
 * calculateTrend(NaN, 100) // { change: null, percentChange: null, error: 'Invalid inputs' }
 */
export function calculateTrend(
  current: number | null | undefined,
  previous: number | null | undefined,
): { change: number | null; percentChange: number | null; error?: string } {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined
  ) {
    return { change: null, percentChange: null };
  }

  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    console.error('[analytics] Invalid trend inputs (NaN or Infinity):', {
      current,
      previous,
    });
    return { change: null, percentChange: null, error: 'Invalid inputs' };
  }

  const change = current - previous;

  if (previous === 0) {
    if (current === 0) return { change: 0, percentChange: 0 };
    return { change, percentChange: null, error: 'Division by zero' };
  }

  const percentChange = (change / previous) * 100;

  if (Math.abs(percentChange) > 10000) {
    console.warn('[analytics] Extreme change detected (>10000%):', {
      current,
      previous,
      percentChange: percentChange.toFixed(2),
    });
  }

  return {
    change: Number(change.toFixed(2)),
    percentChange: Number(percentChange.toFixed(2)),
  };
}
