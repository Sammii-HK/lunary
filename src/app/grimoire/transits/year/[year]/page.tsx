import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getTransitsForYear,
  YearlyTransit,
} from '@/constants/seo/yearly-transits';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Heading } from '@/components/ui/Heading';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';
import { createItemListSchema } from '@/lib/schema';
import yearlyTransitsContent from '@/data/grimoire/yearly-transits-content.json';
import { generateYearlyForecast } from '@/lib/forecast/yearly';
import { format } from 'date-fns';

// 30-day ISR revalidation
export const revalidate = 2592000;

// Keep historical years indexed (starting from 2025) and extend 10 years into the future
const START_YEAR = 2025;
const CURRENT_YEAR = new Date().getFullYear();
const END_YEAR = Math.max(CURRENT_YEAR + 10, START_YEAR + 10);
const AVAILABLE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i,
);

type TransitsYearContentCallout = {
  title: string;
  body: string;
};

type TransitsYearContentColumn = {
  title: string;
  bullets: string[];
};

type TransitsYearContentSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: TransitsYearContentCallout;
  columns?: TransitsYearContentColumn[];
};

type TransitsYearContent = {
  whatIs?: { question: string; answer: string };
  intro?: string;
  tldr?: string;
  tableOfContents?: Array<{ label: string; href: string }>;
  sections?: TransitsYearContentSection[];
  faqs?: Array<{ question: string; answer: string }>;
  sources?: Array<{ name: string; url?: string }>;
};

type TransitsYearContentData = {
  default?: TransitsYearContent;
  years?: Record<string, TransitsYearContent>;
};

const transitsYearContentData =
  yearlyTransitsContent as TransitsYearContentData;

const applyYear = (value: string, year: number) =>
  value.replace(/\{year\}/g, year.toString());

const resolveContent = (
  content: TransitsYearContent,
  year: number,
): TransitsYearContent => ({
  ...content,
  intro: content.intro ? applyYear(content.intro, year) : content.intro,
  tldr: content.tldr ? applyYear(content.tldr, year) : content.tldr,
  whatIs: content.whatIs
    ? {
        question: applyYear(content.whatIs.question, year),
        answer: applyYear(content.whatIs.answer, year),
      }
    : content.whatIs,
  tableOfContents: content.tableOfContents?.map((item) => ({
    ...item,
    label: applyYear(item.label, year),
  })),
  sections: content.sections?.map((section) => ({
    ...section,
    title: applyYear(section.title, year),
    paragraphs: section.paragraphs?.map((p) => applyYear(p, year)),
    bullets: section.bullets?.map((b) => applyYear(b, year)),
    callout: section.callout
      ? {
          title: applyYear(section.callout.title, year),
          body: applyYear(section.callout.body, year),
        }
      : section.callout,
    columns: section.columns?.map((col) => ({
      ...col,
      title: applyYear(col.title, year),
      bullets: col.bullets.map((b) => applyYear(b, year)),
    })),
  })),
  faqs: content.faqs?.map((faq) => ({
    question: applyYear(faq.question, year),
    answer: applyYear(faq.answer, year),
  })),
  sources: content.sources?.map((source) => ({
    ...source,
    name: applyYear(source.name, year),
    url: source.url ? applyYear(source.url, year) : source.url,
  })),
});

const getTransitsYearContent = (year: number): TransitsYearContent => {
  const base = transitsYearContentData.default ?? {};
  const yearly = transitsYearContentData.years?.[year.toString()] ?? {};
  const merged: TransitsYearContent = {
    ...base,
    ...yearly,
    whatIs: yearly.whatIs ?? base.whatIs,
    tableOfContents: yearly.tableOfContents ?? base.tableOfContents,
    sections: yearly.sections ?? base.sections,
    faqs: yearly.faqs ?? base.faqs,
    sources: yearly.sources ?? base.sources,
  };

  return resolveContent(merged, year);
};

/**
 * Merge static transit data with dynamic astronomical calculations
 * Static data provides rich content (themes, do/avoid lists)
 * Dynamic data provides accurate dates from astronomy-engine
 */
async function getEnhancedTransits(year: number): Promise<YearlyTransit[]> {
  const staticTransits = getTransitsForYear(year);
  const forecast = await generateYearlyForecast(year);

  // Create a map of static transits by planet+sign for easy lookup
  const staticByKey = new Map<string, YearlyTransit>();
  staticTransits.forEach((t) => {
    t.signs.forEach((sign) => {
      staticByKey.set(`${t.planet.toLowerCase()}-${sign.toLowerCase()}`, t);
    });
  });

  // Enhanced transits array
  const enhancedTransits: YearlyTransit[] = [];
  const usedStaticIds = new Set<string>();

  // Process dynamic ingresses and merge with static data
  for (const ingress of forecast.ingresses) {
    const key = `${ingress.planet.toLowerCase()}-${ingress.toSign.toLowerCase()}`;
    const staticData = staticByKey.get(key);

    if (staticData && !usedStaticIds.has(staticData.id)) {
      // Merge: use static content but update with accurate date
      usedStaticIds.add(staticData.id);
      const formattedDate = format(new Date(ingress.exactDate), 'MMMM d, yyyy');
      enhancedTransits.push({
        ...staticData,
        dates: ingress.isRetrograde
          ? `${formattedDate} (Retrograde re-entry)`
          : `From ${formattedDate}`,
      });
    } else if (!ingress.isRetrograde) {
      // Create new transit card from dynamic data (forward motion only)
      enhancedTransits.push({
        id: `${ingress.planet.toLowerCase()}-${ingress.toSign.toLowerCase()}-${year}`,
        year,
        planet: ingress.planet,
        transitType: `${ingress.planet} Ingress`,
        title: `${ingress.planet} in ${ingress.toSign} ${year}`,
        dates: `From ${format(new Date(ingress.exactDate), 'MMMM d, yyyy')}`,
        signs: [ingress.toSign],
        description: ingress.description,
        themes: ingress.themes,
        doList: [],
        avoidList: [],
        tone: `${ingress.planet} shifts into ${ingress.toSign}, bringing new energy to ${ingress.themes.slice(0, 2).join(' and ')}.`,
      });
    }
  }

  // Add any remaining static transits not covered by ingresses (like Saturn Return)
  staticTransits.forEach((t) => {
    if (!usedStaticIds.has(t.id)) {
      enhancedTransits.push(t);
    }
  });

  // Sort by date (extract first date from the dates string)
  enhancedTransits.sort((a, b) => {
    const dateA = a.dates.match(/\d{4}/)
      ? new Date(a.dates.match(/[A-Za-z]+ \d+, \d{4}/)?.[0] || '').getTime()
      : 0;
    const dateB = b.dates.match(/\d{4}/)
      ? new Date(b.dates.match(/[A-Za-z]+ \d+, \d{4}/)?.[0] || '').getTime()
      : 0;
    return dateA - dateB;
  });

  return enhancedTransits;
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = Number(year);

  const minYear = START_YEAR;
  const maxYear = END_YEAR;
  if (yearNum < minYear || yearNum > maxYear) {
    return { title: 'Not Found | Lunary' };
  }

  // Get dynamic data for rich metadata
  const forecast = await generateYearlyForecast(yearNum);
  const majorIngress = forecast.ingresses.find(
    (i) =>
      ['Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(i.planet) &&
      !i.isRetrograde,
  );
  const majorConjunction = forecast.conjunctions.find(
    (c) => c.significance === 'major',
  );

  const highlights = [
    majorIngress ? `${majorIngress.planet} in ${majorIngress.toSign}` : null,
    majorConjunction
      ? `${majorConjunction.planet1}-${majorConjunction.planet2} conjunction`
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  const title = `${year} Astrology Transits: ${highlights ? highlights + ', ' : ''}Key Dates | Lunary`;
  const description = `Track ${year} planetary transits with precise astronomical dates. ${forecast.ingresses.length} major sign changes${forecast.conjunctions.length > 0 ? ` and ${forecast.conjunctions.length} rare planetary conjunction${forecast.conjunctions.length > 1 ? 's' : ''}` : ''}.`;

  return {
    title,
    description,
    keywords: [
      `${year} transits`,
      `${year} astrology transits`,
      `${year} planetary transits`,
      'transit timing',
      ...(majorIngress
        ? [
            `${majorIngress.planet.toLowerCase()} ${majorIngress.toSign.toLowerCase()} ${year}`,
          ]
        : []),
      ...(majorConjunction
        ? [
            `${majorConjunction.planet1.toLowerCase()} ${majorConjunction.planet2.toLowerCase()} conjunction ${year}`,
          ]
        : []),
    ],
    alternates: {
      canonical: `https://lunary.app/grimoire/transits/year/${year}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/transits/year/${year}`,
    },
  };
}

export default async function TransitsYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearNum = Number(year);

  const minYear = START_YEAR;
  const maxYear = END_YEAR;
  if (yearNum < minYear || yearNum > maxYear) {
    notFound();
  }

  const content = getTransitsYearContent(yearNum);
  // Use enhanced transits that merge static content with dynamic astronomical data
  const transits = await getEnhancedTransits(yearNum);
  // Get major planetary conjunctions for the year
  const forecast = await generateYearlyForecast(yearNum);
  const conjunctions = forecast.conjunctions;
  const itemListSchema = createItemListSchema({
    name: `${year} Astrology Transits`,
    description: `Key transits in ${year} with timing notes and standout signs.`,
    url: `https://lunary.app/grimoire/transits/year/${year}`,
    items: transits.map((transit) => ({
      name: transit.title,
      url: `https://lunary.app/grimoire/transits/${transit.id}`,
      description: transit.description,
    })),
  });

  const hubSections = getCosmicConnections('hub-transits', 'transits');
  const cosmicSections = [
    ...hubSections,
    {
      title: `${year} Transit Series`,
      links: transits.map((transit) => ({
        label: transit.title,
        href: `/grimoire/transits/${transit.id}`,
      })),
    },
    {
      title: 'Other Years',
      links: AVAILABLE_YEARS.filter((y) => y !== yearNum).map((y) => ({
        label: `${y} Transits`,
        href: `/grimoire/transits/year/${y}`,
      })),
    },
  ];

  return (
    <SEOContentTemplate
      title={`${year} Astrology Transits: Key Dates & Timing`}
      h1={`${year} Astrology Transits`}
      description={`Key transits in ${year}, including major ingresses and timing highlights.`}
      keywords={[
        `${year} transits`,
        `${year} astrology transits`,
        `${year} planetary transits`,
        'transit timing',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/transits/year/${year}`}
      additionalSchemas={[itemListSchema]}
      intro={
        content.intro ??
        `Browse every major ${year} transit with timing notes and standout signs so you can track the shifts that matter.`
      }
      whatIs={content.whatIs}
      tldr={content.tldr}
      tableOfContents={content.tableOfContents}
      faqs={content.faqs}
      sources={content.sources}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Transits', href: '/grimoire/transits' },
        { label: year },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-transits'
          entityKey='transits'
          title={`${year} Transits Connections`}
          sections={cosmicSections}
        />
      }
    >
      {/* Quick-nav links to individual transit pages — helps Google prefer individual pages over this year page */}
      <nav className='mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'>
        <p className='text-sm font-medium text-zinc-300 mb-3'>
          Looking for a specific transit? Jump to:
        </p>
        <ul className='space-y-1.5'>
          {transits.map((transit) => (
            <li key={`nav-${transit.id}`}>
              <Link
                href={`/grimoire/transits/${transit.id}`}
                className='text-sm text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
              >
                {transit.title}{' '}
                <span className='text-zinc-500'>— {transit.dates}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className='mb-10 grid gap-4 md:grid-cols-2'>
        {transits.map((transit) => (
          <Link
            key={transit.id}
            href={`/grimoire/transits/${transit.id}`}
            className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-lunary-primary-600 transition-colors'
          >
            <div className='text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2'>
              {transit.dates}
            </div>
            <h2 className='text-lg font-medium text-zinc-100 mb-2'>
              {transit.title}
            </h2>
            <p className='text-sm text-zinc-400 mb-3'>{transit.description}</p>
            <div className='flex flex-wrap gap-2'>
              {transit.signs.map((sign) => (
                <span
                  key={sign}
                  className='text-xs px-2 py-1 rounded bg-lunary-primary-900/20 text-lunary-primary-300'
                >
                  {sign}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>

      {/* Major Planetary Conjunctions - Rare and Significant Events */}
      {conjunctions.length > 0 && (
        <section className='mb-16'>
          <Heading as='h2' variant='h2'>
            {year} Major Conjunctions
          </Heading>
          <p className='text-zinc-400 mb-6'>
            Rare planetary alignments that mark significant shifts in collective
            energy. These events happen on cycles of years to centuries.
          </p>
          <div className='grid gap-4 md:grid-cols-2'>
            {conjunctions.map((conjunction) => (
              <div
                key={`${conjunction.planet1}-${conjunction.planet2}-${conjunction.date}`}
                className={`rounded-xl border p-5 ${
                  conjunction.significance === 'major'
                    ? 'border-amber-700/50 bg-amber-900/10'
                    : 'border-zinc-800 bg-zinc-900/40'
                }`}
              >
                <div className='text-xs uppercase tracking-[0.25em] text-zinc-500 mb-2'>
                  {format(new Date(conjunction.date), 'MMMM d, yyyy')}
                </div>
                <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                  {conjunction.planet1}-{conjunction.planet2} Conjunction
                </h3>
                <p className='text-sm text-zinc-400 mb-3'>
                  {conjunction.description}
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='text-xs px-2 py-1 rounded bg-lunary-primary-900/20 text-lunary-primary-300'>
                    {conjunction.sign}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      conjunction.significance === 'major'
                        ? 'bg-amber-900/30 text-amber-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {conjunction.separation}° separation
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.sections?.map((section) => (
        <section key={section.id} id={section.id} className='mb-16'>
          <Heading as='h2' variant='h2'>
            {section.title}
          </Heading>

          {section.paragraphs?.map((paragraph, index) => (
            <p
              key={`${section.id}-p-${index}`}
              className='text-zinc-300 leading-relaxed mb-4'
            >
              {paragraph}
            </p>
          ))}

          {section.bullets && section.bullets.length > 0 ? (
            <ul className='space-y-2 text-zinc-300 mb-6'>
              {section.bullets.map((bullet, index) => (
                <li key={`${section.id}-b-${index}`}>• {bullet}</li>
              ))}
            </ul>
          ) : null}

          {section.columns && section.columns.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              {section.columns.map((column) => (
                <div
                  key={column.title}
                  className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-5'
                >
                  <Heading as='h3' variant='h3' className='text-zinc-100 mb-3'>
                    {column.title}
                  </Heading>
                  <ul className='space-y-2 text-sm text-zinc-400'>
                    {column.bullets.map((bullet, index) => (
                      <li key={`${section.id}-${column.title}-b-${index}`}>
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}

          {section.callout ? (
            <div className='rounded-xl border border-lunary-primary-700 bg-lunary-primary-900/20 p-6'>
              <Heading
                as='h3'
                variant='h3'
                className='text-lunary-primary-300 mb-2'
              >
                {section.callout.title}
              </Heading>
              <p className='text-zinc-300 leading-relaxed'>
                {section.callout.body}
              </p>
            </div>
          ) : null}
        </section>
      ))}
    </SEOContentTemplate>
  );
}
