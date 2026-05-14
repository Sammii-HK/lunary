import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { getTarotCard } from '../../../utils/tarot/tarot';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);

export type PatternReadingRow = {
  id: string;
  cards: unknown;
  created_at: string;
  spread_slug?: string | null;
  reading_date?: string | null;
};

type DailyTarotProfile = {
  name?: string | null;
  birthday?: string | null;
  timezone?: string | null;
};

type MergeDailyTarotRowsParams = {
  rows: PatternReadingRow[];
  profile: DailyTarotProfile;
  startDate: Date;
  endDate: Date;
};

const getDailyTarotCardForDate = (
  dateStr: string,
  profile: DailyTarotProfile,
) => {
  if (profile.name && profile.birthday) {
    return getTarotCard(`daily-${dateStr}`, profile.name, profile.birthday);
  }

  const localDay = dayjs.tz(`${dateStr}T12:00:00`, profile.timezone || 'UTC');
  const generalSeed = `cosmic-${dateStr}-${localDay.dayOfYear()}-energy`;
  return getTarotCard(generalSeed);
};

const listDateStringsInRange = (
  startDate: Date,
  endDate: Date,
  timeZone: string,
): string[] => {
  const dates: string[] = [];
  let cursor = dayjs(startDate).tz(timeZone).startOf('day');
  const end = dayjs(endDate).tz(timeZone).startOf('day');

  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    dates.push(cursor.format('YYYY-MM-DD'));
    cursor = cursor.add(1, 'day');
  }

  return dates;
};

export function mergeDailyTarotFallbackRows({
  rows,
  profile,
  startDate,
  endDate,
}: MergeDailyTarotRowsParams): PatternReadingRow[] {
  const timeZone = profile.timezone || 'UTC';
  const existingDailyDates = new Set(
    rows
      .filter((row) => row.spread_slug === 'daily-tarot')
      .map(
        (row) =>
          row.reading_date ||
          dayjs(row.created_at).tz(timeZone).format('YYYY-MM-DD'),
      ),
  );

  const missingDailyRows = listDateStringsInRange(startDate, endDate, timeZone)
    .filter((dateStr) => !existingDailyDates.has(dateStr))
    .map((dateStr) => {
      const card = getDailyTarotCardForDate(dateStr, profile);

      return {
        id: `generated-daily-${dateStr}`,
        spread_slug: 'daily-tarot',
        reading_date: dateStr,
        created_at: `${dateStr}T00:00:00.000Z`,
        cards: [
          {
            card: {
              name: card.name,
              keywords: card.keywords,
              information: card.information,
            },
            generatedFallback: true,
          },
        ],
      } satisfies PatternReadingRow;
    });

  return [...rows, ...missingDailyRows].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
