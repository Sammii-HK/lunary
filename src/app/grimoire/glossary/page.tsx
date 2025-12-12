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

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
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

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Glossary' },
        ]}
      />

      <header className='mb-8'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
          Astrology Glossary
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Complete dictionary of {ASTROLOGY_GLOSSARY.length} astrological terms.
          Reference guide for understanding birth charts, planetary aspects,
          houses, and more.
        </p>
      </header>

      <GlossaryClient terms={ASTROLOGY_GLOSSARY} />

      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          See These Terms in Action
        </h2>
        <p className='text-zinc-400 mb-6'>
          Get your personalized birth chart and see how these astrological
          concepts apply to your unique cosmic blueprint.
        </p>
        <Link
          href='/birth-chart'
          className='inline-block px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
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
