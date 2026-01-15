export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  createItemListSchema,
  createDefinedTermSchema,
  renderJsonLd,
} from '@/lib/schema';
import { ASTROLOGY_GLOSSARY } from '@/constants/grimoire/glossary';
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

  const breadcrumbs = [
    { label: 'Grimoire', href: '/grimoire' },
    { label: 'Glossary', href: '/grimoire/glossary' },
  ];

  const faqs = [
    {
      question: 'How do I use this astrology glossary?',
      answer:
        'Use it like a reference index: search for a term, read the definition, then follow the related links to see how it shows up in a birth chart (houses, aspects, planets, and signs).',
    },
    {
      question: 'What are the most important astrology terms to learn first?',
      answer:
        'Start with the Big Three (Sun, Moon, Rising), the 12 houses, the major aspects (conjunction, square, trine, opposition), and the inner planets (Mercury, Venus, Mars).',
    },
    {
      question: 'Is this glossary only for Western astrology?',
      answer:
        'Most definitions here are oriented around modern Western astrology, but many terms overlap with traditional sources. When a concept is tradition-specific (like Rahu/Ketu), the glossary notes it.',
    },
    {
      question: 'Can I calculate my chart and see these terms applied?',
      answer:
        'Yes—generate your birth chart and use the glossary as you read placements, houses, and aspects to understand what each term means in context.',
    },
  ];

  return (
    <>
      {renderJsonLd(glossaryListSchema)}
      {definedTermSchemas.map((schema, index) => (
        <span key={index}>{renderJsonLd(schema)}</span>
      ))}

      <SEOContentTemplate
        title={metadata.title as string}
        h1='Astrology Glossary'
        description={
          'Complete dictionary of ' +
          ASTROLOGY_GLOSSARY.length +
          ' astrological terms. Reference guide for birthdays, aspects, houses, and more.'
        }
        keywords={
          Array.isArray(metadata.keywords)
            ? metadata.keywords
            : metadata.keywords
              ? [metadata.keywords]
              : []
        }
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/glossary'
        }
        breadcrumbs={breadcrumbs}
        intro={`Complete dictionary of ${ASTROLOGY_GLOSSARY.length} astrological terms. Reference guide for understanding birth charts, planetary aspects, houses, and more.`}
        tldr='Use this glossary to decode chart language: signs = style, planets = function, houses = life areas, aspects = relationships. Start with the Big Three and build outward.'
        meaning={`Astrology uses a compact vocabulary: houses describe *life areas*, planets describe *functions*, signs describe *style*, and aspects describe *relationships between energies*. This glossary helps you translate chart language into plain meaning.\n\nA good way to study is to move in layers:\n\n- **Learn the base units**: signs, planets, and houses\n- **Add relationships**: aspects (conjunction, square, trine, opposition)\n- **Add timing**: transits, retrogrades, lunations\n\nWhen a term feels abstract, click into a hub page (Birth Chart, Houses, Aspects) and read examples. That’s where definitions become practical.\n\nIf you’re new, focus on the Big Three first, then add houses and aspects. The glossary is most useful when you pair it with your actual chart.\n\nGive yourself permission to learn slowly. Astrology is a language, and fluency comes from repetition, not memorization.`}
        howToWorkWith={[
          'Search for a term and read the definition first.',
          'Cross‑reference related terms to build context.',
          'Apply the term to your birth chart for a real example.',
          'Revisit the glossary when reading horoscopes or guides.',
        ]}
        journalPrompts={[
          'Which term shows up most often in my chart?',
          'What concept feels hardest to understand right now?',
          'How does one aspect change the way a planet expresses?',
          'Which house is most active in my current transits?',
        ]}
        tables={[
          {
            title: 'Glossary Learning Order',
            headers: ['Layer', 'Focus'],
            rows: [
              ['Basics', 'Signs, planets, houses'],
              ['Relationships', 'Aspects between planets'],
              ['Timing', 'Transits, retrogrades, lunations'],
              ['Synthesis', 'Chart interpretation'],
            ],
          },
        ]}
        faqs={faqs}
        tableOfContents={[
          { label: 'Browse Terms', href: '#terms' },
          { label: 'Meaning', href: '#meaning' },
          { label: 'FAQ', href: '#faq' },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-glossary'
            entityKey='glossary'
            title='Glossary Connections'
          />
        }
      >
        <section id='terms'>
          <GlossaryClient terms={ASTROLOGY_GLOSSARY} />
        </section>
        <section className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            How to Use This Glossary
          </h2>
          <p className='text-sm text-zinc-300 mb-3'>
            Look up one term at a time and immediately apply it to your chart.
            You’ll retain definitions faster when you see them in context.
          </p>
          <p className='text-sm text-zinc-300'>
            If a term feels confusing, jump to the related hub page and read a
            few examples. Repetition is the fastest way to learn astrology
            language.
          </p>
        </section>
        <section className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>Start Here</h2>
          <p className='text-sm text-zinc-300 mb-4'>
            If you are brand new, begin with the Big Three, then learn the
            houses and major aspects. This sequence makes chart reading far less
            overwhelming.
          </p>
          <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
              <p className='font-semibold text-zinc-100 mb-2'>Core Terms</p>
              <p>Sun, Moon, Rising, Mercury, Venus, Mars</p>
            </div>
            <div className='rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
              <p className='font-semibold text-zinc-100 mb-2'>Key Aspects</p>
              <p>Conjunction, square, trine, opposition</p>
            </div>
          </div>
        </section>
        <section className='mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Reading Tip
          </h2>
          <p className='text-sm text-zinc-300'>
            When you encounter a term in a horoscope or guide, copy it into a
            note and rewrite the definition in your own words. This turns
            vocabulary into understanding and makes the terms easier to recall.
          </p>
        </section>

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
      </SEOContentTemplate>
    </>
  );
}
