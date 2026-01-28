import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Heading } from '@/components/ui/Heading';
import { generateYearlyForecast } from '@/lib/forecast/yearly';
import yearlyEventContent from '@/data/grimoire/yearly-event-content.json';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';

// 30-day ISR revalidation
export const revalidate = 2592000;
const AVAILABLE_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const EVENT_KEYS = [
  'mercury-retrograde',
  'venus-retrograde',
  'eclipses',
] as const;

type EventKey = (typeof EVENT_KEYS)[number];

type EventContentTable = {
  title: string;
  headers: string[];
  rows?: string[][];
};

type EventContent = {
  title?: string;
  h1?: string;
  subtitle?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  datePublished?: string;
  dateModified?: string;
  whatIs?: { question: string; answer: string };
  intro?: string;
  tldr?: string;
  meaning?: string;
  emotionalThemes?: string[];
  howToWorkWith?: string[];
  signsMostAffected?: string[];
  tables?: EventContentTable[];
  faqs?: Array<{ question: string; answer: string }>;
  relatedItems?: Array<{ name: string; href: string; type: string }>;
  ctaText?: string;
  ctaHref?: string;
  sources?: Array<{ name: string; url?: string }>;
};

type EventContentData = {
  events: Record<
    EventKey,
    {
      default?: EventContent;
      years?: Record<string, EventContent>;
    }
  >;
};

const DEFAULT_EVENT_COPY: Record<
  EventKey,
  { title: string; description: string; keywords: string[] }
> = {
  'mercury-retrograde': {
    title: 'Mercury Retrograde',
    description: 'Dates, meanings, and how to work with Mercury retrograde.',
    keywords: ['Mercury retrograde', 'retrograde dates', 'astrology events'],
  },
  'venus-retrograde': {
    title: 'Venus Retrograde',
    description: 'Dates, meanings, and how to work with Venus retrograde.',
    keywords: ['Venus retrograde', 'retrograde dates', 'astrology events'],
  },
  eclipses: {
    title: 'Eclipses',
    description: 'Solar and lunar eclipses with dates and zodiac signs.',
    keywords: ['eclipses', 'solar eclipse', 'lunar eclipse'],
  },
};

const eventContentData = yearlyEventContent as EventContentData;

const applyYear = (value: string, year: number) =>
  value.replace(/\{year\}/g, year.toString());

const resolveContent = (content: EventContent, year: number): EventContent => ({
  ...content,
  title: content.title ? applyYear(content.title, year) : content.title,
  h1: content.h1 ? applyYear(content.h1, year) : content.h1,
  subtitle: content.subtitle
    ? applyYear(content.subtitle, year)
    : content.subtitle,
  description: content.description
    ? applyYear(content.description, year)
    : content.description,
  keywords: content.keywords?.map((keyword) => applyYear(keyword, year)),
  canonicalUrl: content.canonicalUrl
    ? applyYear(content.canonicalUrl, year)
    : content.canonicalUrl,
  intro: content.intro ? applyYear(content.intro, year) : content.intro,
  tldr: content.tldr ? applyYear(content.tldr, year) : content.tldr,
  meaning: content.meaning ? applyYear(content.meaning, year) : content.meaning,
  whatIs: content.whatIs
    ? {
        question: applyYear(content.whatIs.question, year),
        answer: applyYear(content.whatIs.answer, year),
      }
    : content.whatIs,
  ctaText: content.ctaText ? applyYear(content.ctaText, year) : content.ctaText,
  ctaHref: content.ctaHref ? applyYear(content.ctaHref, year) : content.ctaHref,
  tables: content.tables?.map((table) => ({
    ...table,
    title: applyYear(table.title, year),
  })),
});

const getEventContent = (event: EventKey, year: number): EventContent => {
  const eventData = eventContentData.events?.[event];
  const base = eventData?.default ?? {};
  const yearly = eventData?.years?.[year.toString()] ?? {};
  const merged = {
    ...base,
    ...yearly,
    whatIs: yearly.whatIs ?? base.whatIs,
    tables: yearly.tables ?? base.tables,
    faqs: yearly.faqs ?? base.faqs,
    relatedItems: yearly.relatedItems ?? base.relatedItems,
    howToWorkWith: yearly.howToWorkWith ?? base.howToWorkWith,
    emotionalThemes: yearly.emotionalThemes ?? base.emotionalThemes,
    signsMostAffected: yearly.signsMostAffected ?? base.signsMostAffected,
    sources: yearly.sources ?? base.sources,
  };

  return resolveContent(merged, year);
};

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; event: EventKey }>;
}): Promise<Metadata> {
  const { year, event } = await params;
  const yearNum = parseInt(year, 10);
  const config = DEFAULT_EVENT_COPY[event];
  const content = getEventContent(event, yearNum);

  if (!config || !AVAILABLE_YEARS.includes(yearNum)) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const baseTitle = content.title ?? `${config.title} ${yearNum}`;
  const title = baseTitle.includes('| Lunary')
    ? baseTitle
    : `${baseTitle} | Lunary`;

  return {
    title,
    description: content.description ?? config.description,
    keywords: content.keywords ?? config.keywords,
    openGraph: {
      title,
      description: content.description ?? config.description,
      url: `https://lunary.app/grimoire/events/${year}/${event}`,
      siteName: 'Lunary',
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/events/${year}/${event}`,
    },
  };
}

function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return `${startDate} - ${endDate}`;
    }
    return `${format(start, 'MMMM d')} - ${format(end, 'MMMM d')}`;
  } catch {
    return `${startDate} - ${endDate}`;
  }
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return format(date, 'MMMM d');
  } catch {
    return dateStr;
  }
}

export default async function EventsYearEventPage({
  params,
}: {
  params: Promise<{ year: string; event: EventKey }>;
}) {
  const { year, event } = await params;
  const yearNum = parseInt(year, 10);
  const config = DEFAULT_EVENT_COPY[event];
  const content = getEventContent(event, yearNum);

  if (!config || !AVAILABLE_YEARS.includes(yearNum)) {
    notFound();
  }

  const forecast = await generateYearlyForecast(yearNum);

  const eclipseEntries = forecast.eclipses.map((e) => ({
    date: formatDate(e.date),
    description: `${e.type === 'solar' ? 'Solar' : 'Lunar'} Eclipse in ${e.sign}`,
    type: e.type === 'solar' ? 'Solar Eclipse' : 'Lunar Eclipse',
    sign: e.sign,
  }));

  const retrogradeEntries = forecast.retrogrades
    .filter((r) => r.planet.toLowerCase() === event.split('-')[0])
    .map((r) => ({
      date: formatDateRange(r.startDate, r.endDate),
      description: r.description
        .replace(/retrograde period \(/i, '')
        .replace(/\)$/, ''),
      startDate: r.startDate,
      endDate: r.endDate,
    }));

  const entries = event === 'eclipses' ? eclipseEntries : retrogradeEntries;

  if (entries.length === 0) {
    notFound();
  }

  const defaultTable =
    event === 'eclipses'
      ? {
          title: `${yearNum} Eclipse Calendar`,
          headers: ['Date', 'Type', 'Sign', 'Theme'],
          rows: eclipseEntries.map((entry) => [
            entry.date,
            entry.type ?? 'Eclipse',
            entry.sign ?? '—',
            'Cosmic shift',
          ]),
        }
      : {
          title: `${config.title} ${yearNum} Dates`,
          headers: ['Period', 'Start Date', 'End Date', 'Sign(s)'],
          rows: retrogradeEntries.map((entry, index) => [
            `Period ${index + 1}`,
            formatDate(entry.startDate),
            formatDate(entry.endDate),
            entry.description ?? '—',
          ]),
        };

  const tables = content.tables?.map((table) => ({
    ...table,
    rows: table.rows && table.rows.length > 0 ? table.rows : defaultTable.rows,
  })) ?? [defaultTable];

  const pageTitle = content.title ?? `${config.title} ${yearNum}`;
  const pageH1 = content.h1 ?? pageTitle;

  return (
    <SEOContentTemplate
      title={pageTitle}
      h1={pageH1}
      subtitle={content.subtitle}
      description={content.description ?? config.description}
      keywords={content.keywords ?? config.keywords}
      canonicalUrl={`https://lunary.app/grimoire/events/${year}/${event}`}
      datePublished={content.datePublished}
      dateModified={content.dateModified}
      articleSection='Astrological Events'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Events', href: '/grimoire/events' },
        { label: year, href: `/grimoire/events/${year}` },
        { label: content.title ?? config.title },
      ]}
      whatIs={content.whatIs}
      intro={
        content.intro ??
        `Your ${yearNum} guide to ${config.title.toLowerCase()} dates. Browse the calendar below for timing, zodiac signs, and the key windows to plan around.`
      }
      tldr={
        content.tldr ??
        `${config.title} ${yearNum}: ${entries.length} key dates. Use this page to plan ahead and align with the timing.`
      }
      meaning={content.meaning}
      tables={tables}
      tableHidden={true}
      howToWorkWith={content.howToWorkWith}
      emotionalThemes={content.emotionalThemes}
      signsMostAffected={content.signsMostAffected}
      faqs={content.faqs}
      sources={content.sources}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-events'
          entityKey='events'
          title='Event Connections'
        />
      }
    >
      <div className='mt-8 space-y-6'>
        <section className='rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6'>
          <Heading as='h2' variant='h3'>
            {config.title} Calendar
          </Heading>
          <div className='mt-4 space-y-3'>
            {entries.map((entry) => (
              <div
                key={`${entry.date}-${entry.description}`}
                className='flex flex-col gap-1 border-b border-zinc-800/60 pb-3 last:border-0 last:pb-0 md:flex-row md:items-center md:justify-between'
              >
                <span className='text-zinc-100 font-medium'>{entry.date}</span>
                <span className='text-zinc-400 text-sm'>
                  {entry.description}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SEOContentTemplate>
  );
}
