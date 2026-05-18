import { getPersonalizedTarotCard } from '@/lib/tarot/get-personalized-card';
import { getTarotCard } from 'utils/tarot/tarot';
import { getImprovedTarotReading } from 'utils/tarot/improvedTarot';
import { getDateStringInTimeZone } from 'utils/tarot/seed-date';

describe('getPersonalizedTarotCard', () => {
  it('matches the canonical daily tarot card seed used by the tarot page', () => {
    const date = '2026-05-14';
    const userName = 'Sammii Kellow';
    const userBirthday = '1994-10-31';

    const astralGuideCard = getPersonalizedTarotCard(
      date,
      [],
      'Leo',
      'Waxing Crescent',
      24,
      userName,
      userBirthday,
    );
    const tarotPageCard = getTarotCard(`daily-${date}`, userName, userBirthday);

    expect(astralGuideCard.name).toBe(tarotPageCard.name);
    expect(astralGuideCard.keywords).toEqual(tarotPageCard.keywords);
  });

  it('normalizes ISO datetimes to the local daily seed date', () => {
    const astralGuideCard = getPersonalizedTarotCard(
      '2026-05-14T21:30:00.000Z',
      [],
      'Leo',
      'Waxing Crescent',
      24,
      'Sammii',
      '1994-10-31',
    );
    const tarotPageCard = getTarotCard(
      'daily-2026-05-14',
      'Sammii',
      '1994-10-31',
    );

    expect(astralGuideCard.name).toBe(tarotPageCard.name);
  });

  it('keeps the full tarot page daily card on the same timezone-aware seed', async () => {
    const now = new Date('2026-05-14T23:30:00.000Z');
    const timeZone = 'Europe/London';
    const userName = 'Sammii';
    const userBirthday = '1994-10-31';
    const localDate = getDateStringInTimeZone(now, timeZone);

    const reading = await getImprovedTarotReading(
      userName,
      false,
      7,
      userBirthday,
      null,
      now,
      timeZone,
    );
    const expected = getTarotCard(`daily-${localDate}`, userName, userBirthday);

    expect(reading.daily.name).toBe(expected.name);
  });
});
