'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { GlossaryTerm } from '@/constants/grimoire/glossary';

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

function getTermLink(slug: string): string | null {
  return GRIMOIRE_PAGE_LINKS[slug] || null;
}

function TermCard({
  term,
  allTerms,
}: {
  term: GlossaryTerm;
  allTerms: GlossaryTerm[];
}) {
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
            const relatedTerm = allTerms.find((t) => t.slug === relatedSlug);
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

interface GlossaryClientProps {
  terms: GlossaryTerm[];
}

export function GlossaryClient({ terms }: GlossaryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return terms;

    const query = searchQuery.toLowerCase();
    return terms.filter(
      (term) =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query),
    );
  }, [terms, searchQuery]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const letterHasTerms = useMemo(() => {
    const map: Record<string, boolean> = {};
    alphabet.forEach((letter) => {
      map[letter] = filteredTerms.some((t) =>
        t.term.toUpperCase().startsWith(letter),
      );
    });
    return map;
  }, [filteredTerms, alphabet]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      <div className='mb-8'>
        <div className='relative max-w-md mx-auto'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500' />
          <Input
            type='search'
            name='search'
            aria-label='Search terms or definitions...'
            aria-describedby='search-results'
            placeholder='Search terms or definitions...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 pr-10 h-12 bg-zinc-900/50 border-zinc-700'
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className='text-center text-sm text-zinc-500 mt-3'>
            {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''}{' '}
            found
          </p>
        )}
      </div>

      <nav className='mb-8 sticky top-16 z-10 bg-lunary-bg/95 backdrop-blur-sm py-3 -mx-4 px-4'>
        <div className='flex flex-wrap gap-1 justify-center'>
          {alphabet.map((letter) => {
            const hasTerms = letterHasTerms[letter];
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
                className='w-8 h-8 flex items-center justify-center text-zinc-700 text-sm cursor-not-allowed'
              >
                {letter}
              </span>
            );
          })}
        </div>
      </nav>

      <section className='mb-16'>
        <h2 className='text-2xl font-light text-zinc-100 mb-6'>
          {searchQuery ? `Search Results` : 'All Terms A-Z'}
        </h2>
        {alphabet.map((letter) => {
          const letterTerms = filteredTerms
            .filter((t) => t.term.toUpperCase().startsWith(letter))
            .sort((a, b) => a.term.localeCompare(b.term));

          if (letterTerms.length === 0) return null;

          return (
            <div
              key={letter}
              id={`letter-${letter}`}
              className='mb-8 scroll-mt-32'
            >
              <h3 className='text-xl font-medium text-lunary-primary-400 mb-4 pb-2 border-b border-zinc-800'>
                {letter}
              </h3>
              <div className='grid gap-3'>
                {letterTerms.map((term) => (
                  <TermCard key={term.slug} term={term} allTerms={terms} />
                ))}
              </div>
            </div>
          );
        })}

        {filteredTerms.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-zinc-400 mb-4'>
              No terms found matching "{searchQuery}"
            </p>
            <button
              onClick={handleClearSearch}
              className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              Clear search
            </button>
          </div>
        )}
      </section>
    </>
  );
}
