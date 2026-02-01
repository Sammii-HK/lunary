/**
 * TIMEZONE POLICY FOR ANALYTICS
 * ==============================
 *
 * All analytics date handling follows these rules:
 *
 * 1. **Storage**: All database timestamps are stored in UTC
 * 2. **Queries**: All date range queries use UTC boundaries
 * 3. **Date Parsing**:
 *    - Date-only strings (YYYY-MM-DD) are interpreted as UTC midnight (00:00:00.000Z)
 *    - ISO 8601 timestamps preserve their timezone information
 * 4. **Client Tracking**: Browser-side event timestamps use UTC for consistency
 * 5. **Attribution**: UTM params and referrer data captured in local time, converted to UTC for storage
 *
 * Date Range Boundaries:
 * - Start: INCLUSIVE (>= start at 00:00:00.000Z)
 * - End: EXCLUSIVE (< end+1 at 00:00:00.000Z)
 * - Use >= start AND < end pattern in all SQL queries
 *
 * Examples:
 * - Query for Jan 1-7, 2024:
 *   WHERE created_at >= '2024-01-01T00:00:00.000Z' AND created_at < '2024-01-08T00:00:00.000Z'
 * - Date-only input "2024-01-01" becomes:
 *   - As start: 2024-01-01T00:00:00.000Z (midnight UTC)
 *   - As end: 2024-01-01T23:59:59.999Z (end of day UTC)
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export type DateRange = {
  start: Date;
  end: Date;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toDate = (value: string | null, mode: 'start' | 'end'): Date | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  if (DATE_ONLY_PATTERN.test(value)) {
    if (mode === 'end') {
      date.setUTCHours(23, 59, 59, 999);
    } else {
      date.setUTCHours(0, 0, 0, 0);
    }
  }
  return date;
};

export function resolveDateRange(
  searchParams: URLSearchParams,
  fallbackDays = 30,
): DateRange {
  const end =
    toDate(searchParams.get('end_date'), 'end') ??
    toDate(searchParams.get('endDate'), 'end') ??
    new Date();
  const start =
    toDate(searchParams.get('start_date'), 'start') ??
    toDate(searchParams.get('startDate'), 'start') ??
    new Date(end.getTime() - fallbackDays * DAY_MS);

  if (start > end) {
    return { start: end, end: start };
  }

  return { start, end };
}

export const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export const formatTimestamp = (date: Date) => date.toISOString();
