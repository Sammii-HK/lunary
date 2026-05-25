import {
  getEventCalendarForDate,
  type CalendarEvent,
} from '@/lib/astro/event-calendar';
import {
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
  getSignDescription,
} from '@utils/astrology/astronomical-data';

export type TransitOfDayData = {
  date: string;
  dateKey: string;
  primaryEvent: {
    name: string;
    energy: string;
    rarity?: CalendarEvent['rarity'];
    score?: number;
    eventType?: CalendarEvent['eventType'];
  };
  highlights: string[];
  horoscopeSnippet: string;
};

function toUtcDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}

function toDisplayDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function sentenceCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function selectTransitOfDay(events: CalendarEvent[]) {
  return (
    events.find((event) => event.eventType !== 'countdown') ?? events[0] ?? null
  );
}

function eventEnergy(event: CalendarEvent) {
  if (event.historicalContext) return event.historicalContext;
  if (event.rarityFrame) return sentenceCase(event.rarityFrame);

  if (event.eventType === 'active_retrograde' && event.planet && event.sign) {
    return `${event.planet} is retrograde in ${event.sign}, making review and integration the main timing signal.`;
  }

  if (event.eventType === 'ingress' && event.planet && event.sign) {
    return `${event.planet} has entered ${event.sign}, shifting the tone toward ${getSignDescription(event.sign)} themes.`;
  }

  if (event.eventType === 'aspect') {
    return `${event.name} is today’s strongest planetary aspect.`;
  }

  if (event.eventType === 'moon_phase') {
    return `${event.name} sets the emotional timing for the day.`;
  }

  return `${event.name} is the strongest current-sky timing signal today.`;
}

function eventGuidance(event: CalendarEvent, highlights: string[]) {
  const hook = event.hookSuggestions?.[0];

  if (event.eventType === 'active_retrograde') {
    return `${hook || event.name} Use this as a review window: notice what resurfaces, what needs correction, and where pressure is asking for cleaner long-term choices.`;
  }

  if (event.eventType === 'retrograde_station') {
    return `${hook || event.name} Station days are stronger than ordinary background transits, so give decisions extra space and watch what changes direction.`;
  }

  if (event.eventType === 'ingress') {
    return `${hook || event.name} Ingresses mark a tonal shift: the planet keeps its core meaning, but starts expressing through the new sign’s style.`;
  }

  if (event.eventType === 'aspect') {
    return `${hook || event.name} Read the planets first, then the aspect: that tells you what is interacting and whether the day feels supportive, tense, catalytic, or integrating.`;
  }

  return highlights[0] || `${event.name} gives today a clear timing cue.`;
}

export function buildTransitOfDayData(
  date: Date,
  events: CalendarEvent[],
): TransitOfDayData {
  const primary = selectTransitOfDay(events);
  const dateKey = toUtcDateKey(date);

  if (!primary) {
    const positions = getRealPlanetaryPositions(date);
    const moonPhase = getAccurateMoonPhase(date);
    const sunSign = positions.Sun?.sign || 'the current sign';
    const moonSign = positions.Moon?.sign || 'the current moon sign';

    return {
      date: toDisplayDate(date),
      dateKey,
      primaryEvent: {
        name: `Sun in ${sunSign}`,
        energy: `The Sun in ${sunSign} and ${moonPhase.name} in ${moonSign} are today’s baseline current-sky timing signals.`,
        eventType: 'ingress',
      },
      highlights: [
        `Sun in ${sunSign}: ${getSignDescription(sunSign)} themes set the solar tone.`,
        `${moonPhase.name} in ${moonSign}: ${Math.round(moonPhase.illumination)}% illuminated.`,
      ],
      horoscopeSnippet:
        'Use the Sun sign for the broad daily atmosphere and the Moon phase for emotional timing.',
    };
  }

  const secondary = events.find(
    (event) => event.id !== primary.id && event.eventType !== 'countdown',
  );
  const highlights = [
    primary.hookSuggestions?.[0] || primary.name,
    primary.rarityFrame ? `Timing context: ${primary.rarityFrame}.` : undefined,
    secondary ? `Secondary current-sky signal: ${secondary.name}.` : undefined,
  ].filter(Boolean) as string[];
  const energy = eventEnergy(primary);

  return {
    date: toDisplayDate(date),
    dateKey,
    primaryEvent: {
      name: primary.name,
      energy,
      rarity: primary.rarity,
      score: primary.score,
      eventType: primary.eventType,
    },
    highlights,
    horoscopeSnippet: eventGuidance(primary, highlights),
  };
}

export async function getTransitOfDay(
  date: Date = new Date(),
): Promise<TransitOfDayData> {
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(12, 0, 0, 0);
  const events = await getEventCalendarForDate(toUtcDateKey(normalizedDate));

  return buildTransitOfDayData(normalizedDate, events);
}
