import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ASTROLOGY_GLOSSARY,
  type GlossaryTerm,
} from '@/constants/grimoire/glossary';
import {
  createBreadcrumbSchema,
  createDefinedTermSchema,
  renderJsonLdMulti,
} from '@/lib/schema';

export const revalidate = 2592000;
export const dynamicParams = false;

const BASE_URL = 'https://lunary.app';
const GLOSSARY_URL = `${BASE_URL}/grimoire/glossary`;
const CORE_DATASET_URL = `${BASE_URL}/grimoire/datasets/core-astrology.json`;
const METHODOLOGY_URL = `${BASE_URL}/about/methodology`;

export function generateStaticParams() {
  return ASTROLOGY_GLOSSARY.map((entry) => ({ term: entry.slug }));
}

function findTerm(slug: string) {
  return ASTROLOGY_GLOSSARY.find((entry) => entry.slug === slug);
}

function humanizeSlug(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function resolveRelatedTerms(entry: GlossaryTerm) {
  return (entry.relatedTerms ?? []).map((relatedSlug) => {
    const relatedEntry = findTerm(relatedSlug);

    if (!relatedEntry) {
      return {
        key: relatedSlug,
        label: humanizeSlug(relatedSlug),
        href: null,
        url: null,
        definition: null,
      };
    }

    const href = `/grimoire/glossary/${relatedEntry.slug}`;

    return {
      key: relatedEntry.slug,
      label: relatedEntry.term,
      href,
      url: `${BASE_URL}${href}`,
      definition: relatedEntry.definition,
    };
  });
}

export function buildGlossaryTermSchemas(
  entry: GlossaryTerm,
  relatedTerms = resolveRelatedTerms(entry),
) {
  const url = `${GLOSSARY_URL}/${entry.slug}`;
  const relatedTermUrls = relatedTerms
    .map((related) => related.url)
    .filter((relatedUrl): relatedUrl is string => Boolean(relatedUrl));

  return [
    {
      ...createDefinedTermSchema({
        term: entry.term,
        definition: entry.definition,
        url,
        relatedTerms: relatedTermUrls,
      }),
      identifier: entry.slug,
      termCode: entry.slug,
      mainEntityOfPage: url,
      isPartOf: {
        '@type': 'DefinedTermSet',
        name: 'Lunary Astrology Glossary',
        url: GLOSSARY_URL,
      },
      subjectOf: [
        {
          '@type': 'Dataset',
          name: 'Lunary Core Astrology Dataset',
          url: CORE_DATASET_URL,
        },
        {
          '@type': 'WebPage',
          name: 'Lunary Methodology',
          url: METHODOLOGY_URL,
        },
      ],
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'category',
          value: entry.category,
        },
      ],
    },
    createBreadcrumbSchema([
      { name: 'Grimoire', url: '/grimoire' },
      { name: 'Glossary', url: '/grimoire/glossary' },
      { name: entry.term, url: `/grimoire/glossary/${entry.slug}` },
    ]),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term } = await params;
  const entry = findTerm(term);

  if (!entry) {
    return { title: 'Astrology Term Not Found | Lunary' };
  }

  const url = `${GLOSSARY_URL}/${entry.slug}`;

  return {
    title: `${entry.term} Meaning in Astrology | Lunary Glossary`,
    description: entry.definition,
    keywords: [
      `${entry.term} meaning`,
      `${entry.term} astrology`,
      `${entry.term} definition`,
      'astrology glossary',
      `${entry.category} astrology term`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${entry.term} Meaning in Astrology`,
      description: entry.definition,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${entry.term} Meaning in Astrology`,
      description: entry.definition,
    },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;
  const entry = findTerm(term);

  if (!entry) {
    notFound();
  }

  const relatedTerms = resolveRelatedTerms(entry);
  const linkedRelatedTerms = relatedTerms.filter((related) => related.href);
  const tldr: string = `${entry.term} is a ${entry.category} astrology term: ${entry.definition}`;

  return (
    <main className='min-h-screen bg-surface-base text-content-primary'>
      {renderJsonLdMulti(buildGlossaryTermSchemas(entry, relatedTerms))}

      <article className='mx-auto max-w-3xl px-4 py-12'>
        <nav
          aria-label='Breadcrumb'
          className='mb-8 flex items-center gap-2 text-sm text-content-muted'
        >
          <Link href='/grimoire' className='hover:text-content-secondary'>
            Grimoire
          </Link>
          <span aria-hidden='true'>/</span>
          <Link
            href='/grimoire/glossary'
            className='hover:text-content-secondary'
          >
            Glossary
          </Link>
          <span aria-hidden='true'>/</span>
          <span aria-current='page'>{entry.term}</span>
        </nav>

        <header className='mb-8'>
          <p className='mb-3 text-sm uppercase tracking-wide text-content-muted'>
            {entry.category} term
          </p>
          <h1 className='text-4xl font-light text-content-primary md:text-5xl'>
            {entry.term}
          </h1>
          <p className='mt-5 text-lg leading-relaxed text-content-muted'>
            {entry.definition}
          </p>
          <p className='mt-4 text-sm leading-relaxed text-content-muted'>
            TL;DR: {tldr}
          </p>
        </header>

        <section className='mb-8 border-l-2 border-lunary-primary-600 pl-4'>
          <h2 className='text-lg font-medium text-content-primary'>
            Quick answer
          </h2>
          <p className='mt-2 leading-relaxed text-content-muted'>{tldr}</p>
        </section>

        {entry.example && (
          <section className='mb-8 rounded-lg border border-stroke-subtle bg-surface-elevated/30 p-5'>
            <h2 className='text-lg font-medium text-content-primary'>
              Example
            </h2>
            <p className='mt-2 text-content-muted'>{entry.example}</p>
          </section>
        )}

        {entry.relatedTerms?.length ? (
          <section aria-labelledby='related-terms-heading' className='mb-8'>
            <h2 className='text-lg font-medium text-content-primary'>
              <span id='related-terms-heading'>Related terms</span>
            </h2>
            {linkedRelatedTerms.length ? (
              <p className='mt-2 text-sm leading-relaxed text-content-muted'>
                These glossary entries give more context for {entry.term}.
              </p>
            ) : null}
            <div className='mt-3 flex flex-wrap gap-2'>
              {relatedTerms.map((related) =>
                related.href ? (
                  <Link
                    key={related.key}
                    href={related.href}
                    className='rounded-lg border border-stroke-subtle px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-lunary-primary-600 hover:text-content-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lunary-primary-600'
                  >
                    {related.label}
                  </Link>
                ) : (
                  <span
                    key={related.key}
                    className='rounded-lg border border-stroke-subtle/70 px-3 py-1.5 text-sm text-content-muted/80'
                    title='Referenced concept without a dedicated glossary page yet'
                  >
                    {related.label}
                  </span>
                ),
              )}
            </div>
          </section>
        ) : null}

        <section className='mb-8'>
          <h2 className='text-lg font-medium text-content-primary'>
            How to cite this definition
          </h2>
          <p className='mt-2 text-sm leading-relaxed text-content-muted'>
            Use this page as Lunary&apos;s public definition for {entry.term}.
            The canonical source is{' '}
            <Link
              href={`/grimoire/glossary/${entry.slug}`}
              className='text-content-brand hover:text-content-brand-accent'
            >
              {GLOSSARY_URL}/{entry.slug}
            </Link>
            .
          </p>
        </section>

        <section className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-5'>
          <h2 className='text-lg font-medium text-content-primary'>
            Citation context
          </h2>
          <p className='mt-2 text-sm leading-relaxed text-content-muted'>
            This term is part of Lunary&apos;s public astrology glossary and
            machine-readable core astrology dataset. For calculation standards,
            cite the methodology page.
          </p>
          <div className='mt-4 flex flex-wrap gap-3 text-sm'>
            <Link
              href='/grimoire/datasets/core-astrology.json'
              className='text-content-brand hover:text-content-brand-accent'
            >
              Core dataset
            </Link>
            <Link
              href='/about/methodology'
              className='text-content-brand hover:text-content-brand-accent'
            >
              Methodology
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
