import {
  buildTransitOfDayData,
  selectTransitOfDay,
} from '@/lib/astro/transit-of-day';
import type { CalendarEvent } from '@/lib/astro/event-calendar';

const makeEvent = (
  overrides: Partial<CalendarEvent> & Pick<CalendarEvent, 'id' | 'name'>,
): CalendarEvent => ({
  date: '2026-05-25',
  rarity: 'MEDIUM',
  score: 40,
  convergenceMultiplier: 1,
  hookSuggestions: [],
  category: 'transit',
  rarityFrame: '',
  eventType: 'aspect',
  ...overrides,
});

describe('transit of the day', () => {
  it('skips lookahead countdowns when choosing today’s primary transit', () => {
    const selected = selectTransitOfDay([
      makeEvent({
        id: 'countdown',
        name: 'Jupiter enters Leo tomorrow',
        eventType: 'countdown',
        score: 95,
      }),
      makeEvent({
        id: 'pluto-retrograde',
        name: 'Pluto Retrograde in Aquarius',
        eventType: 'active_retrograde',
        score: 70,
      }),
    ]);

    expect(selected?.name).toBe('Pluto Retrograde in Aquarius');
  });

  it('builds display data with a real event name and guidance', () => {
    const data = buildTransitOfDayData(new Date('2026-05-25T12:00:00Z'), [
      makeEvent({
        id: 'pluto-retrograde',
        name: 'Pluto Retrograde in Aquarius',
        eventType: 'active_retrograde',
        rarity: 'HIGH',
        score: 70,
        hookSuggestions: [
          'Pluto retrograde in Aquarius. The review period continues.',
        ],
        rarityFrame: 'Pluto retrograde in Aquarius',
        historicalContext:
          'Pluto retrograde in Aquarius invites reflection on Aquarius-ruled themes.',
        planet: 'Pluto',
        sign: 'Aquarius',
      }),
    ]);

    expect(data.date).toBe('Monday, May 25, 2026');
    expect(data.primaryEvent.name).toBe('Pluto Retrograde in Aquarius');
    expect(data.primaryEvent.energy).toContain('Aquarius-ruled themes');
    expect(data.highlights.join(' ')).toContain('Pluto retrograde');
    expect(data.horoscopeSnippet).not.toContain('Daily cosmic timing');
  });
});
