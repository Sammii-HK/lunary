import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
} from '@/constants/seo/yearly-transits';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Heading } from '@/components/ui/Heading';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';
import { createItemListSchema } from '@/lib/schema';
import yearlyTransitsContent from '@/data/grimoire/yearly-transits-content.json';

// 30-day ISR revalidation
export const revalidate = 2592000;
const AVAILABLE_YEARS = Array.from(
  new Set(YEARLY_TRANSITS.map((transit) => transit.year)),
).sort((a, b) => a - b);

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

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = Number(year);

  if (!AVAILABLE_YEARS.includes(yearNum)) {
    return { title: 'Not Found | Lunary' };
  }

  const title = `${year} Astrology Transits: Key Dates & Timing | Lunary`;
  const description = `Track ${year} transits with key dates, standout signs, and timing notes for major planetary shifts.`;

  return {
    title,
    description,
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

  if (!AVAILABLE_YEARS.includes(yearNum)) {
    notFound();
  }

  const content = getTransitsYearContent(yearNum);
  const transits = getTransitsForYear(yearNum);
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
