const DAY_MS = 24 * 60 * 60 * 1000;

export type DateRange = {
  start: Date;
  end: Date;
};

const toDate = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function resolveDateRange(
  searchParams: URLSearchParams,
  fallbackDays = 30,
): DateRange {
  const end =
    toDate(searchParams.get('end_date')) ??
    toDate(searchParams.get('endDate')) ??
    new Date();
  const start =
    toDate(searchParams.get('start_date')) ??
    toDate(searchParams.get('startDate')) ??
    new Date(end.getTime() - fallbackDays * DAY_MS);

  if (start > end) {
    return { start: end, end: start };
  }

  return { start, end };
}

export const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export const formatTimestamp = (date: Date) => date.toISOString();
