export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createItemListSchema,
  createDefinedTermSchema,
  renderJsonLd,
} from '@/lib/schema';
import {
  ASTROLOGY_GLOSSARY,
  type GlossaryTerm,
} from '@/constants/grimoire/glossary';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

const GRIMOIRE_PAGE_LINKS: Record<string, string> = {
  sun: '/grimoire/astronomy/planets/sun',
  moon: '/grimoire/astronomy/planets/moon',
  mercury: '/grimoire/astronomy/planets/mercury',
  venus: '/grimoire/astronomy/planets/venus',
  mars: '/grimoire/astronomy/planets/mars',
  jupiter: '/grimoire/astronomy/planets/jupiter',
  saturn: '/grimoire/astronomy/planets/saturn',
  uranus: '/grimoire/astronomy/planets/uranus',
  neptune: '/grimoire/astronomy/planets/neptune',
  pluto: '/grimoire/astronomy/planets/pluto',
  chiron: '/grimoire/astronomy/planets/chiron',
  lilith: '/grimoire/astronomy/planets/lilith',
  retrograde: '/grimoire/astronomy/retrogrades',
  'fire-signs': '/grimoire/zodiac',
  'earth-signs': '/grimoire/zodiac',
  'air-signs': '/grimoire/zodiac',
  'water-signs': '/grimoire/zodiac',
  house: '/grimoire/houses/overview',
  'angular-house': '/grimoire/houses/overview',
  'succedent-house': '/grimoire/houses/overview',
  'cadent-house': '/grimoire/houses/overview',
  aspect: '/grimoire/aspects/types',
  conjunction: '/grimoire/aspects/types',
  opposition: '/grimoire/aspects/types',
  trine: '/grimoire/aspects/types',
  square: '/grimoire/aspects/types',
  sextile: '/grimoire/aspects/types',
  'grand-trine': '/grimoire/aspects/types',
  't-square': '/grimoire/aspects/types',
  'grand-cross': '/grimoire/aspects/types',
  transit: '/grimoire/transits',
  eclipse: '/grimoire/eclipses',
  'solar-eclipse': '/grimoire/eclipses/solar',
  'lunar-eclipse': '/grimoire/eclipses/lunar',
  'north-node': '/grimoire/lunar-nodes',
  'south-node': '/grimoire/lunar-nodes',
  'lunar-nodes': '/grimoire/lunar-nodes',
  midheaven: '/grimoire/houses/overview/10',
  ic: '/grimoire/houses/overview/4',
  ascendant: '/grimoire/houses/overview/1',
  descendant: '/grimoire/houses/overview/7',
  'saturn-return': '/grimoire/astronomy/retrogrades/saturn',
  synastry: '/grimoire/compatibility',
  zodiac: '/grimoire/zodiac',
  element: '/grimoire/zodiac',
  modality: '/grimoire/zodiac',
  cardinal: '/grimoire/zodiac',
  fixed: '/grimoire/zodiac',
  mutable: '/grimoire/zodiac',
  decan: '/grimoire/decans',
  cusp: '/grimoire/cusps',
  'natal-chart': '/birth-chart',
  'birth-chart': '/birth-chart',
  horoscope: '/horoscope',
};

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

const GLOSSARY_TERMS = ASTROLOGY_GLOSSARY;

function getTermLink(slug: string): string | null {
  return GRIMOIRE_PAGE_LINKS[slug] || null;
}

function TermCard({ term }: { term: GlossaryTerm }) {
  const grimoireLink = getTermLink(term.slug);

  return (
    <article
      id={term.slug}
      className='p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50 scroll-mt-24'
    >
      <div className='flex items-start justify-between gap-3 mb-2'>
        <h4 className='font-medium text-zinc-100 text-sm'>{term.term}</h4>
        {grimoireLink && (
          <Link
            href={grimoireLink}
            className='text-xs px-2 py-1 rounded bg-lunary-primary-900/20 text-lunary-primary-400 hover:bg-lunary-primary-900/40 transition-colors whitespace-nowrap'
          >
            Learn more →
          </Link>
        )}
      </div>
      <p className='text-zinc-400 text-sm leading-relaxed'>{term.definition}</p>
      {term.example && (
        <p className='text-zinc-400 text-xs italic mt-2'>
          Example: {term.example}
        </p>
      )}
      {term.relatedTerms && term.relatedTerms.length > 0 && (
        <div className='flex flex-wrap gap-2 mt-3'>
          <span className='text-zinc-400 text-xs'>See also:</span>
          {term.relatedTerms.map((relatedSlug) => {
            const relatedTerm = GLOSSARY_TERMS.find(
              (t) => t.slug === relatedSlug,
            );
            const relatedGrimoireLink = getTermLink(relatedSlug);

            if (relatedGrimoireLink) {
              return (
                <Link
                  key={relatedSlug}
                  href={relatedGrimoireLink}
                  className='text-xs text-lunary-accent hover:text-lunary-accent/80 transition-colors'
                >
                  {relatedTerm?.term || relatedSlug}
                </Link>
              );
            }

            if (relatedTerm) {
              return (
                <a
                  key={relatedSlug}
                  href={`#${relatedTerm.slug}`}
                  className='text-xs text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
                >
                  {relatedTerm.term}
                </a>
              );
            }

            return null;
          })}
        </div>
      )}
    </article>
  );
}

export default function GlossaryPage() {
  const glossaryListSchema = createItemListSchema({
    name: 'Astrology Glossary Terms',
    description: 'Complete list of astrological terminology and definitions.',
    url: 'https://lunary.app/grimoire/glossary',
    items: GLOSSARY_TERMS.map((term) => ({
      name: term.term,
      url: `https://lunary.app/grimoire/glossary#${term.slug}`,
      description: term.definition,
    })),
  });

  const definedTermSchemas = GLOSSARY_TERMS.slice(0, 20).map((t) =>
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
      {definedTermSchemas.map((schema, index) => (
        <span key={index}>{renderJsonLd(schema)}</span>
      ))}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Glossary' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
          Astrology Glossary
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Complete dictionary of {GLOSSARY_TERMS.length} astrological terms.
          Reference guide for understanding birth charts, planetary aspects,
          houses, and more.
        </p>
      </header>

      <nav className='mb-8'>
        <div className='flex flex-wrap gap-2 justify-center'>
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => {
            const hasTerms = GLOSSARY_TERMS.some((t) =>
              t.term.toUpperCase().startsWith(letter),
            );
            return hasTerms ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className='w-8 h-8 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 text-sm hover:bg-lunary-primary-900/30 hover:text-lunary-primary-300 transition-colors'
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className='w-8 h-8 flex items-center justify-center text-zinc-600 text-sm'
              >
                {letter}
              </span>
            );
          })}
        </div>
      </nav>

      <section className='mb-16'>
        <h2 className='text-2xl font-light text-zinc-100 mb-6'>
          All Terms A-Z
        </h2>
        {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => {
          const letterTerms = GLOSSARY_TERMS.filter((t) =>
            t.term.toUpperCase().startsWith(letter),
          ).sort((a, b) => a.term.localeCompare(b.term));

          if (letterTerms.length === 0) return null;

          return (
            <div
              key={letter}
              id={`letter-${letter}`}
              className='mb-8 scroll-mt-24'
            >
              <h3 className='text-xl font-medium text-lunary-primary-400 mb-4 pb-2 border-b border-zinc-800'>
                {letter}
              </h3>
              <div className='grid gap-3'>
                {letterTerms.map((term) => (
                  <TermCard key={term.slug} term={term} />
                ))}
              </div>
            </div>
          );
        })}
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
    </div>
  );
}
