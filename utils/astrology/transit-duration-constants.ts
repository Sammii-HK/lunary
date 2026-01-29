import {
  YEARLY_TRANSITS,
  YearlyTransit,
} from '@/constants/seo/yearly-transits';

// Average daily motion (degrees per day)
export const PLANET_DAILY_MOTION = {
  Moon: 13.176, // 27.3 days to orbit
  Sun: 0.9856, // 365.25 days
  Mercury: 4.092, // 88 days
  Venus: 1.602, // 225 days
  Mars: 0.524, // 687 days
  Jupiter: 0.083, // 12 years
  Saturn: 0.034, // 29.5 years
  Uranus: 0.012, // 84 years
  Neptune: 0.006, // 165 years
  Pluto: 0.004, // 248 years
} as const;

// Slow planets that use YEARLY_TRANSITS data (Jupiter-Pluto)
export const SLOW_PLANETS = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

// Fast planets that use orbital speed calculations (Moon-Mars)
export const FAST_PLANETS = ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars'];

export interface SignChangeDate {
  start: Date;
  end: Date;
  sign: string;
}

/**
 * Parse YEARLY_TRANSITS dates into structured lookup
 * Returns: { Jupiter: { Gemini: {start: Date, end: Date}, ... }, ... }
 */
export function parseYearlyTransits(): Record<
  string,
  Record<string, SignChangeDate>
> {
  const result: Record<string, Record<string, SignChangeDate>> = {};

  YEARLY_TRANSITS.forEach((transit: YearlyTransit) => {
    const { planet, dates, signs } = transit;

    // Initialize planet entry if not exists
    if (!result[planet]) {
      result[planet] = {};
    }

    // Parse date strings like "June 9, 2025 - June 30, 2026"
    const dateRange = parseDateRange(dates, transit.year);

    if (dateRange && signs.length > 0) {
      // Assign to primary sign
      const sign = signs[0];
      if (!result[planet][sign]) {
        result[planet][sign] = dateRange;
      } else {
        // Extend existing range if dates overlap/extend
        if (dateRange.start < result[planet][sign].start) {
          result[planet][sign].start = dateRange.start;
        }
        if (dateRange.end > result[planet][sign].end) {
          result[planet][sign].end = dateRange.end;
        }
      }
    }
  });

  return result;
}

/**
 * Parse date range strings from YEARLY_TRANSITS
 * Examples:
 * - "June 9, 2025 - June 30, 2026"
 * - "Until June 9, 2025"
 * - "All year (for those born ~1995-1996)"
 */
function parseDateRange(dateStr: string, year: number): SignChangeDate | null {
  // Handle "All year" case
  if (dateStr.includes('All year')) {
    return {
      start: new Date(year, 0, 1), // Jan 1
      end: new Date(year, 11, 31), // Dec 31
      sign: '', // Will be filled by caller
    };
  }

  // Handle "Until X" case
  if (dateStr.startsWith('Until')) {
    const endDateStr = dateStr.replace('Until', '').trim();
    const endDate = parseDate(endDateStr);
    if (endDate) {
      return {
        start: new Date(year, 0, 1), // Start of year
        end: endDate,
        sign: '',
      };
    }
  }

  // Handle "X - Y" case
  if (dateStr.includes(' - ')) {
    const [startStr, endStr] = dateStr.split(' - ').map((s) => s.trim());
    const startDate = parseDate(startStr);
    const endDate = parseDate(endStr);

    if (startDate && endDate) {
      return {
        start: startDate,
        end: endDate,
        sign: '',
      };
    }
  }

  // Single date (treat as start date, end = +1 year)
  const singleDate = parseDate(dateStr);
  if (singleDate) {
    const endDate = new Date(singleDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    return {
      start: singleDate,
      end: endDate,
      sign: '',
    };
  }

  return null;
}

/**
 * Parse date string like "June 9, 2025" into Date object
 */
function parseDate(dateStr: string): Date | null {
  // Remove parenthetical notes
  const cleanStr = dateStr.replace(/\(.*?\)/g, '').trim();

  try {
    const date = new Date(cleanStr);
    // Check if valid date
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    // Invalid date
  }

  return null;
}

// Pre-compute on module load
export const SLOW_PLANET_SIGN_CHANGES = parseYearlyTransits();
