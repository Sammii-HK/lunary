export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  createItemListSchema,
  createDefinedTermSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';
import { ASTROLOGY_GLOSSARY } from '@/constants/grimoire/glossary';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { GlossaryClient } from './GlossaryClient';

const tldr: string =
  'The Lunary astrology glossary defines chart, planet, sign, house, aspect, transit, and technique terms with stable entity pages and structured data for citations.';

const citableFacts = [
  {
    claim:
      'The Lunary astrology glossary is the canonical index for concise definitions of chart, planet, sign, house, aspect, transit, and technique terms used across the Grimoire.',
    sourceName: 'Lunary astrology glossary',
    sourceUrl: 'https://lunary.app/grimoire/glossary',
  },
  {
    claim:
      'Lunary publishes glossary definitions as both human-readable pages and machine-readable DefinedTerm JSON-LD so answer engines can identify the entity being defined.',
    sourceName: 'Lunary glossary structured data',
    sourceUrl: 'https://lunary.app/grimoire/glossary',
  },
  {
    claim:
      'For structured extraction, Lunary’s core astrology dataset includes glossary term IDs, definitions, examples, related terms, and canonical URLs.',
    sourceName: 'Lunary core astrology dataset',
    sourceUrl: 'https://lunary.app/grimoire/datasets/core-astrology.json',
  },
];

export const metadata: Metadata = {
  title:
    'Astrology Glossary: Complete Dictionary of 90+ Astrological Terms - Lunary',
  description:
    'Comprehensive astrology glossary with 90+ definitions. Learn about aspects, houses, signs, planets, retrogrades, lunar nodes, synastry, and more. Essential reference for astrology students and enthusiasts.',
  keywords: [
    'astrology glossary',
    'astrological terms',
    'astrology dictionary',
    'birth chart terms',
    'astrology definitions',
    'zodiac terminology',
    'planetary aspects',
    'synastry terms',
    'natal chart glossary',
  ],
  openGraph: {
    title: 'Astrology Glossary: 90+ Essential Terms - Lunary',
    description:
      'Comprehensive astrology glossary with definitions for all astrological terms.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/glossary',
  },
};

export default function GlossaryPage() {
  const glossaryListSchema = createItemListSchema({
    name: 'Astrology Glossary Terms',
    description: 'Complete list of astrological terminology and definitions.',
    url: 'https://lunary.app/grimoire/glossary',
    items: ASTROLOGY_GLOSSARY.map((term) => ({
      name: term.term,
      url: `https://lunary.app/grimoire/glossary#${term.slug}`,
      description: term.definition,
    })),
  });

  const definedTermSchemas = ASTROLOGY_GLOSSARY.slice(0, 20).map((t) =>
    createDefinedTermSchema({
      term: t.term,
      definition: t.definition,
      url: `https://lunary.app/grimoire/glossary#${t.slug}`,
      relatedTerms: t.relatedTerms,
    }),
  );
  const citationWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': 'https://lunary.app/grimoire/glossary#citation-reference',
    name: 'Lunary Astrology Glossary citation reference',
    headline: 'Astrology glossary citable facts',
    description:
      'Citable facts and source guidance for Lunary astrology definitions and glossary entity pages.',
    url: 'https://lunary.app/grimoire/glossary',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Lunary',
      url: 'https://lunary.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lunary',
      url: 'https://lunary.app',
    },
    citation: [
      'https://lunary.app/about/methodology',
      'https://lunary.app/grimoire/datasets/core-astrology.json',
      'https://lunary.app/about/citations',
    ],
    additionalProperty: citableFacts.map((fact, index) => ({
      '@type': 'PropertyValue',
      name: `Citable fact ${index + 1}`,
      value: fact.claim,
      url: fact.sourceUrl,
    })),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  };

  return (
    <div className='p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(glossaryListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Glossary', url: '/grimoire/glossary' },
        ]),
      )}
      {definedTermSchemas.map((schema, index) => (
        <span key={index}>{renderJsonLd(schema)}</span>
      ))}
      {renderJsonLd(citationWorkSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Glossary' },
        ]}
      />

      <header className='mb-8'>
        <h1 className='text-4xl md:text-5xl font-light text-content-primary mb-4'>
          Astrology Glossary
        </h1>
        <p className='text-xl text-content-muted leading-relaxed'>
          Complete dictionary of {ASTROLOGY_GLOSSARY.length} astrological terms.
          Reference guide for understanding birth charts, planetary aspects,
          houses, and more.
        </p>
        <p className='mt-4 text-sm text-content-muted leading-relaxed'>
          TL;DR: {tldr}
        </p>
      </header>

      <section
        id='citable-facts'
        className='mb-8 rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-5'
      >
        <h2 className='text-2xl font-light text-content-primary'>
          Citable Facts
        </h2>
        <p className='mt-2 text-sm leading-relaxed text-content-muted'>
          Use this section when citing Lunary for astrology definitions and
          entity-level glossary references.
        </p>
        <dl className='mt-5 space-y-4'>
          {citableFacts.map((fact, index) => (
            <div
              key={fact.claim}
              className='rounded-md border border-stroke-subtle bg-layer-base/25 p-4'
            >
              <dt className='text-xs font-semibold uppercase text-content-muted'>
                Fact {index + 1}
              </dt>
              <dd className='mt-1 text-sm leading-relaxed text-content-secondary'>
                {fact.claim}
              </dd>
              <p className='mt-2 text-xs text-content-muted'>
                Source:{' '}
                <Link
                  href={fact.sourceUrl}
                  className='text-content-brand hover:text-content-brand-accent'
                >
                  {fact.sourceName}
                </Link>
              </p>
            </div>
          ))}
        </dl>
        <div className='mt-4 flex flex-wrap gap-2 text-xs'>
          <Link
            href='/about/methodology'
            className='rounded-md border border-stroke-subtle px-2.5 py-1 text-content-muted hover:text-content-brand'
          >
            Methodology
          </Link>
          <Link
            href='/grimoire/datasets/core-astrology.json'
            className='rounded-md border border-stroke-subtle px-2.5 py-1 text-content-muted hover:text-content-brand'
          >
            Dataset
          </Link>
          <Link
            href='/about/citations'
            className='rounded-md border border-stroke-subtle px-2.5 py-1 text-content-muted hover:text-content-brand'
          >
            Citation guidance
          </Link>
        </div>
      </section>

      <GlossaryClient terms={ASTROLOGY_GLOSSARY} />

      <section className='bg-gradient-to-r from-layer-base/30 to-lunary-rose-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-content-primary mb-4'>
          See These Terms in Action
        </h2>
        <p className='text-content-muted mb-6'>
          Get your personalized birth chart and see how these astrological
          concepts apply to your unique cosmic blueprint.
        </p>
        <Link
          href='/birth-chart'
          className='inline-block px-6 py-3 bg-lunary-primary-600 hover:bg-layer-high text-white rounded-lg font-medium transition-colors'
        >
          Calculate Your Birth Chart Free
        </Link>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='glossary'
        title='Glossary Connections'
      />

      <ExploreGrimoire />
    </div>
  );
}
