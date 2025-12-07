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
  glossaryCategories,
  type GlossaryTerm,
} from '@/constants/grimoire/glossary';

export const metadata: Metadata = {
  title:
    'Astrology Glossary: Complete Dictionary of 80+ Astrological Terms - Lunary',
  description:
    'Comprehensive astrology glossary with 80+ definitions. Learn about aspects, houses, signs, planets, retrogrades, lunar nodes, synastry, and more. Essential reference for astrology students and enthusiasts.',
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
    title: 'Astrology Glossary: 80+ Essential Terms - Lunary',
    description:
      'Comprehensive astrology glossary with definitions for all astrological terms.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/glossary',
  },
};

const GLOSSARY_TERMS = ASTROLOGY_GLOSSARY;

const CATEGORIES = [...new Set(GLOSSARY_TERMS.map((t) => t.category))].sort();

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

  const groupedTerms = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = GLOSSARY_TERMS.filter((t) => t.category === category);
      return acc;
    },
    {} as Record<string, GlossaryTerm[]>,
  );

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(glossaryListSchema)}
      {definedTermSchemas.map((schema, index) => (
        <span key={index}>{renderJsonLd(schema)}</span>
      ))}

      {/* Breadcrumbs */}
      <nav className='text-sm text-zinc-500 mb-8'>
        <Link href='/grimoire' className='hover:text-purple-400'>
          Grimoire
        </Link>
        <span className='mx-2'>→</span>
        <span className='text-zinc-300'>Glossary</span>
      </nav>

      {/* Header */}
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
          Astrology Glossary
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Complete dictionary of astrological terms. Reference guide for
          understanding birth charts, planetary aspects, houses, and more.
        </p>
      </header>

      {/* Quick Navigation */}
      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Browse by Category
        </h2>
        <div className='flex flex-wrap gap-2'>
          {CATEGORIES.map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
              className='px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-purple-900/30 hover:text-purple-300 transition-colors'
            >
              {category}
            </a>
          ))}
        </div>
      </nav>

      {/* Alphabetical Index */}
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
                className='w-8 h-8 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 text-sm hover:bg-purple-900/30 hover:text-purple-300 transition-colors'
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

      {/* Terms by Category */}
      {CATEGORIES.map((category) => (
        <section
          key={category}
          id={category.toLowerCase().replace(/\s+/g, '-')}
          className='mb-12'
        >
          <h2 className='text-2xl font-light text-zinc-100 mb-6 pb-2 border-b border-zinc-800'>
            {category}
          </h2>
          <div className='space-y-6'>
            {groupedTerms[category].map((term) => (
              <article
                key={term.slug}
                id={term.slug}
                className='bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-6'
              >
                <h3 className='text-xl font-medium text-zinc-100 mb-2'>
                  {term.term}
                </h3>
                <p className='text-zinc-300 leading-relaxed mb-3'>
                  {term.definition}
                </p>
                {term.relatedTerms && term.relatedTerms.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    <span className='text-zinc-500 text-sm'>See also:</span>
                    {term.relatedTerms.map((related) => {
                      const relatedTerm = GLOSSARY_TERMS.find(
                        (t) => t.term === related,
                      );
                      return relatedTerm ? (
                        <a
                          key={related}
                          href={`#${relatedTerm.slug}`}
                          className='text-sm text-purple-400 hover:text-purple-300 transition-colors'
                        >
                          {related}
                        </a>
                      ) : (
                        <span key={related} className='text-sm text-zinc-500'>
                          {related}
                        </span>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          See These Terms in Action
        </h2>
        <p className='text-zinc-400 mb-6'>
          Get your personalized birth chart and see how these astrological
          concepts apply to your unique cosmic blueprint.
        </p>
        <Link
          href='/birth-chart'
          className='inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
        >
          Calculate Your Birth Chart Free
        </Link>
      </section>
    </div>
  );
}
