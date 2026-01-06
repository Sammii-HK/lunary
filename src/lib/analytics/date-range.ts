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
