import {
  generateYearlyForecast,
  type YearlyForecast,
} from '@/lib/forecast/yearly';

const BASE_URL = 'https://lunary.app';
const DATASET_SCHEMA_VERSION = 1;

export type AstrologyCalendarDataset = Awaited<
  ReturnType<typeof buildAstrologyCalendarDataset>
>;

type CalendarEventMeta = {
  canonicalUrl: string;
  methodology: string;
};

export type CalendarMoonEvent = YearlyForecast['moonEvents'][number] &
  CalendarEventMeta & {
    eventType: 'moon_phase';
  };

export type CalendarEclipseEvent = YearlyForecast['eclipses'][number] &
  CalendarEventMeta & {
    eventType: 'eclipse';
  };

export type CalendarRetrogradeEvent = YearlyForecast['retrogrades'][number] &
  CalendarEventMeta & {
    eventType: 'retrograde';
  };

type CalendarIngressEvent = YearlyForecast['ingresses'][number] &
  CalendarEventMeta & {
    eventType: 'planetary_ingress';
  };

export function isSupportedAstrologyCalendarYear(year: number) {
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 2025 && year <= currentYear + 2;
}

export async function buildAstrologyCalendarDataset(year: number) {
  const forecast = await generateYearlyForecast(year);
  const generatedAt = new Date().toISOString();

  const moonEvents: CalendarMoonEvent[] = forecast.moonEvents.map((event) => ({
    ...event,
    eventType: 'moon_phase',
    canonicalUrl: `${BASE_URL}/grimoire/moon/${year}`,
    methodology: `${BASE_URL}/about/methodology`,
  }));

  const eclipses: CalendarEclipseEvent[] = forecast.eclipses.map((event) => ({
    ...event,
    eventType: 'eclipse',
    canonicalUrl: `${BASE_URL}/grimoire/events/${year}/eclipses`,
    methodology: `${BASE_URL}/about/methodology`,
  }));

  const retrogrades: CalendarRetrogradeEvent[] = forecast.retrogrades.map(
    (event) => ({
      ...event,
      eventType: 'retrograde',
      canonicalUrl: `${BASE_URL}/grimoire/events/${year}/retrogrades`,
      methodology: `${BASE_URL}/about/methodology`,
    }),
  );

  const ingresses: CalendarIngressEvent[] = forecast.ingresses.map((event) => ({
    ...event,
    eventType: 'planetary_ingress',
    canonicalUrl: `${BASE_URL}/grimoire/transits/year/${year}`,
    methodology: `${BASE_URL}/about/methodology`,
  }));

  const seasonalEvents = forecast.seasonalEvents.map((event) => ({
    ...event,
    eventType: 'seasonal_event',
    canonicalUrl: `${BASE_URL}/grimoire/events/${year}/equinoxes-solstices`,
    methodology: `${BASE_URL}/about/methodology`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${BASE_URL}/grimoire/datasets/astrology-calendar/${year}.json#dataset`,
    name: `Lunary ${year} Astrology Calendar Dataset`,
    description: `Machine-readable ${year} astrology calendar with moon phases, eclipses, retrogrades, planetary ingresses, equinoxes, solstices, canonical URLs, and methodology links.`,
    schemaVersion: DATASET_SCHEMA_VERSION,
    version: String(year),
    identifier: `lunary-astrology-calendar-${year}`,
    datePublished: `${year}-01-01`,
    dateModified: generatedAt.slice(0, 10),
    generatedAt,
    temporalCoverage: `${year}-01-01/${year}-12-31`,
    license: `${BASE_URL}/terms`,
    publisher: 'Lunary',
    creator: {
      '@type': 'Organization',
      name: 'Lunary',
      url: BASE_URL,
    },
    url: `${BASE_URL}/grimoire/datasets/astrology-calendar/${year}.json`,
    methodology: `${BASE_URL}/about/methodology`,
    isBasedOn: [
      `${BASE_URL}/about/methodology`,
      `${BASE_URL}/grimoire/transits/year/${year}`,
      `${BASE_URL}/grimoire/moon/${year}`,
      `${BASE_URL}/grimoire/events/${year}`,
    ],
    measurementTechnique:
      'Astronomy Engine calculations for moon phase, eclipse, ingress, retrograde, equinox, and solstice timing; Lunary editorial interpretation links for astrology context.',
    variableMeasured: [
      'moonEvents',
      'eclipses',
      'retrogrades',
      'planetaryIngresses',
      'seasonalEvents',
      'majorTransits',
      'keyAspects',
    ],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${BASE_URL}/grimoire/datasets/astrology-calendar/${year}.json`,
      name: `Lunary ${year} Astrology Calendar JSON`,
    },
    citationGuidance:
      'Use this dataset for date-level astrology calendar facts, then cite the linked Grimoire page for interpretation.',
    summary: forecast.summary,
    counts: {
      moonEvents: moonEvents.length,
      eclipses: eclipses.length,
      retrogrades: retrogrades.length,
      planetaryIngresses: ingresses.length,
      seasonalEvents: seasonalEvents.length,
      majorTransits: forecast.majorTransits.length,
      keyAspects: forecast.keyAspects.length,
    },
    moonEvents,
    eclipses,
    retrogrades,
    planetaryIngresses: ingresses,
    seasonalEvents,
    majorTransits: forecast.majorTransits.map((event) => ({
      ...event,
      eventType: 'major_transit',
      canonicalUrl: `${BASE_URL}/grimoire/transits/year/${year}`,
      methodology: `${BASE_URL}/about/methodology`,
    })),
    keyAspects: forecast.keyAspects.map((event) => ({
      ...event,
      eventType: 'planetary_aspect',
      canonicalUrl: `${BASE_URL}/grimoire/transits/year/${year}`,
      methodology: `${BASE_URL}/about/methodology`,
    })),
  };
}

export async function getUpcomingAstrologyEvent(
  type: 'full_moon' | 'new_moon',
  date?: Date,
): Promise<CalendarMoonEvent | null>;
export async function getUpcomingAstrologyEvent(
  type: 'eclipse',
  date?: Date,
): Promise<CalendarEclipseEvent | null>;
export async function getUpcomingAstrologyEvent(
  type: 'mercury_retrograde',
  date?: Date,
): Promise<CalendarRetrogradeEvent | null>;
export async function getUpcomingAstrologyEvent(
  type: 'full_moon' | 'new_moon' | 'eclipse' | 'mercury_retrograde',
  date = new Date(),
): Promise<
  CalendarMoonEvent | CalendarEclipseEvent | CalendarRetrogradeEvent | null
> {
  const dateKey = date.toISOString().slice(0, 10);
  const year = date.getUTCFullYear();
  const datasets = [
    await buildAstrologyCalendarDataset(year),
    await buildAstrologyCalendarDataset(year + 1),
  ];

  if (type === 'full_moon' || type === 'new_moon') {
    const events = datasets
      .flatMap((dataset) => dataset.moonEvents)
      .filter((event) => event.date >= dateKey)
      .filter((event) =>
        type === 'full_moon'
          ? ['full_moon', 'supermoon', 'micromoon', 'blue_moon'].includes(
              event.type,
            )
          : ['new_moon', 'black_moon'].includes(event.type),
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    return events[0] ?? null;
  }

  if (type === 'eclipse') {
    return (
      datasets
        .flatMap((dataset) => dataset.eclipses)
        .filter((event) => event.date >= dateKey)
        .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
    );
  }

  return (
    datasets
      .flatMap((dataset) => dataset.retrogrades)
      .filter((event) => event.planet.toLowerCase() === 'mercury')
      .filter((event) => event.startDate >= dateKey)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null
  );
}
