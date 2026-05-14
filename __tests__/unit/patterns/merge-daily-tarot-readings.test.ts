import { describe, expect, it } from '@jest/globals';
import { getTarotCard } from '../../../utils/tarot/tarot';
import {
  mergeDailyTarotFallbackRows,
  type PatternReadingRow,
} from '@/lib/patterns/merge-daily-tarot-readings';

describe('mergeDailyTarotFallbackRows', () => {
  it('fills missing daily tarot dates without duplicating stored daily rows', () => {
    const rows: PatternReadingRow[] = [
      {
        id: 'spread-1',
        spread_slug: 'three-card',
        reading_date: '2026-05-11',
        created_at: '2026-05-11T10:00:00.000Z',
        cards: [{ card: { name: 'The Tower' } }],
      },
      {
        id: 'daily-1',
        spread_slug: 'daily-tarot',
        reading_date: '2026-05-12',
        created_at: '2026-05-12T00:00:00.000Z',
        cards: [{ card: { name: 'The Star' } }],
      },
    ];

    const merged = mergeDailyTarotFallbackRows({
      rows,
      profile: {
        name: 'Sammii',
        birthday: '1990-01-01',
        timezone: 'Europe/London',
      },
      startDate: new Date('2026-05-11T12:00:00.000Z'),
      endDate: new Date('2026-05-13T12:00:00.000Z'),
    });

    expect(merged).toHaveLength(4);

    const dailyDates = merged
      .filter((row) => row.spread_slug === 'daily-tarot')
      .map((row) => row.reading_date)
      .sort();

    expect(dailyDates).toEqual(['2026-05-11', '2026-05-12', '2026-05-13']);
  });

  it('uses the same personalized daily seed as the app preview', () => {
    const merged = mergeDailyTarotFallbackRows({
      rows: [],
      profile: {
        name: 'Sammii',
        birthday: '1990-01-01',
        timezone: 'Europe/London',
      },
      startDate: new Date('2026-05-12T12:00:00.000Z'),
      endDate: new Date('2026-05-12T12:00:00.000Z'),
    });

    const generatedCards = merged[0].cards as Array<{
      card: { name: string };
    }>;

    expect(generatedCards[0].card.name).toBe(
      getTarotCard('daily-2026-05-12', 'Sammii', '1990-01-01').name,
    );
  });
});
