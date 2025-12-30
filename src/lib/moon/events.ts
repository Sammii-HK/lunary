import { SearchMoonPhase } from 'astronomy-engine';
import { getRealPlanetaryPositions } from '../../../utils/astrology/cosmic-og';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MOON_NAMES: Record<number, string> = {
  1: 'Wolf Moon',
  2: 'Snow Moon',
  3: 'Worm Moon',
  4: 'Pink Moon',
  5: 'Flower Moon',
  6: 'Strawberry Moon',
  7: 'Buck Moon',
  8: 'Sturgeon Moon',
  9: 'Harvest Moon',
  10: 'Hunter Moon',
  11: 'Beaver Moon',
  12: 'Cold Moon',
};

const SEARCH_LIMIT_DAYS = 40;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export type MoonPhaseType = 'full' | 'new';

export interface MoonEvent {
  type: MoonPhaseType;
  month: string;
  monthSlug: string;
  name: string;
  sign: string;
  timestamp: string;
  dateLabel: string;
  slug: string;
}

interface YearMoonEvents {
  fullMoons: MoonEvent[];
  newMoons: MoonEvent[];
}

const moonEventsCache = new Map<number, YearMoonEvents>();

export function getMoonEventsForYear(year: number): YearMoonEvents {
  const cached = moonEventsCache.get(year);
  if (cached) {
    return cached;
  }

  const events = {
    fullMoons: collectMoonEvents(year, 'full'),
    newMoons: collectMoonEvents(year, 'new'),
  };

  moonEventsCache.set(year, events);
  return events;
}

function collectMoonEvents(year: number, type: MoonPhaseType): MoonEvent[] {
  const targetLon = type === 'full' ? 180 : 0;
  const events: MoonEvent[] = [];
  const maxSearchDate = new Date(Date.UTC(year + 1, 0, 1));
  let searchDate = new Date(Date.UTC(year, 0, 1));
  let lastMonthIndex = -1;

  while (searchDate < maxSearchDate && events.length < 20) {
    const astroTime = SearchMoonPhase(targetLon, searchDate, SEARCH_LIMIT_DAYS);
    if (!astroTime) {
      break;
    }

    const eventDate = astroTime.date;
    const eventYear = eventDate.getUTCFullYear();
    if (eventYear > year) {
      break;
    }

    if (eventYear < year) {
      searchDate = new Date(eventDate.getTime() + MS_IN_DAY);
      continue;
    }

    const monthIndex = eventDate.getUTCMonth();
    if (monthIndex === lastMonthIndex) {
      searchDate = new Date(eventDate.getTime() + MS_IN_DAY);
      continue;
    }

    lastMonthIndex = monthIndex;

    const monthName = MONTH_NAMES[monthIndex];
    const monthSlug = monthName.toLowerCase();
    const moonName =
      type === 'full'
        ? (MOON_NAMES[monthIndex + 1] ?? 'Full Moon')
        : 'New Moon';
    const slug = `${type === 'full' ? 'full-moon' : 'new-moon'}-${monthSlug}`;
    const dateLabel = `${monthName} ${eventDate.getUTCDate()}`;
    const positions = getRealPlanetaryPositions(eventDate);
    const sign = positions.Moon?.sign || 'Unknown';

    events.push({
      type,
      month: monthName,
      monthSlug,
      name: moonName,
      sign,
      timestamp: eventDate.toISOString(),
      dateLabel,
      slug,
    });

    searchDate = new Date(eventDate.getTime() + MS_IN_DAY);
  }

  return events;
}
