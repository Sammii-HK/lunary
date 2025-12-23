import { subDays } from 'date-fns';

type DateParts = {
  year: number;
  month: number;
  day: number;
};

const getDatePartsInTimeZone = (date: Date, timeZone: string): DateParts => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parseInt(
    parts.find((part) => part.type === 'year')?.value || '0',
  );
  const month = parseInt(
    parts.find((part) => part.type === 'month')?.value || '1',
  );
  const day = parseInt(parts.find((part) => part.type === 'day')?.value || '1');
  return { year, month, day };
};

const formatUtcDate = (date: Date): string => date.toISOString().split('T')[0];

export const getDateStringInTimeZone = (
  date: Date,
  timeZone: string,
): string => {
  const { year, month, day } = getDatePartsInTimeZone(date, timeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const getUtcDateForTimeZoneDate = (
  date: Date,
  timeZone: string,
): Date => {
  const { year, month, day } = getDatePartsInTimeZone(date, timeZone);
  return new Date(Date.UTC(year, month - 1, day));
};

export const getWeeklySeedForDate = (date: Date, timeZone: string): string => {
  const localUtcDate = getUtcDateForTimeZoneDate(date, timeZone);
  const dayOfWeek = localUtcDate.getUTCDay();
  const weekStart = subDays(localUtcDate, dayOfWeek);
  const year = weekStart.getUTCFullYear();
  const month = weekStart.getUTCMonth() + 1;
  const day = weekStart.getUTCDate();
  const dayOfYear = Math.floor(
    (weekStart.getTime() - Date.UTC(year, 0, 0)) / 86400000,
  );
  const weekNumber = Math.floor(dayOfYear / 7);
  return `weekly-${year}-W${weekNumber}-${month}-${day}`;
};

export const getDailySeedDateStrings = (
  date: Date,
  timeZone: string,
  days: number,
  includeToday = false,
): string[] => {
  const baseDate = getUtcDateForTimeZoneDate(date, timeZone);
  const startOffset = includeToday ? 0 : 1;
  const results: string[] = [];

  for (let i = startOffset; i <= days; i++) {
    const day = subDays(baseDate, i);
    results.push(formatUtcDate(day));
  }

  return results;
};
