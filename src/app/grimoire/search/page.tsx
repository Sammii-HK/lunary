import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import {
  searchGrimoireIndex,
  GRIMOIRE_SEARCH_INDEX,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';
import { AskTheGrimoire } from '@/components/grimoire/AskTheGrimoire';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

export const metadata: Metadata = {
  title: 'Search the Grimoire | Lunary',
  description:
    'Search our cosmic knowledge base for astrology, tarot, crystals, and rituals. Find in-depth guides on zodiac signs, planets, birth charts, and more.',
  openGraph: {
    title: 'Ask the Grimoire | Lunary',
    description:
      'Search our cosmic knowledge base for astrology, tarot, crystals, and rituals.',
    images: ['/icons/og-grimoire.png'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/search',
  },
};

const CATEGORY_ICONS: Record<GrimoireEntry['category'], string> = {
  zodiac: '♈',
  planet: '🪐',
  tarot: '🎴',
  crystal: '💎',
  ritual: '🌙',
  concept: '✨',
  horoscope: '🔮',
  'chinese-zodiac': '🐉',
  season: '☀️',
  numerology: '🔢',
  birthday: '🎂',
  compatibility: '💕',
  glossary: '📖',
  archetype: '🔮',
};

const CATEGORY_COLORS: Record<GrimoireEntry['category'], string> = {
  zodiac:
    'bg-lunary-primary-900/20 text-lunary-primary-300 border-lunary-primary-700',
  planet:
    'bg-lunary-accent-900 text-lunary-accent-300 border-lunary-accent-700',
  tarot: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  crystal:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  ritual:
    'bg-lunary-primary-900 text-lunary-primary-300 border-lunary-primary-700',
  concept:
    'bg-lunary-success-900 text-lunary-success-300 border-lunary-success-700',
  horoscope:
    'bg-lunary-highlight-900 text-lunary-highlight-300 border-lunary-highlight-700',
  'chinese-zodiac':
    'bg-lunary-error-900 text-lunary-error-300 border-lunary-error-700',
  season: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  numerology:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  birthday: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  compatibility:
    'bg-lunary-highlight-900 text-lunary-highlight-300 border-lunary-highlight-700',
  glossary:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  archetype: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

interface SearchResultCardProps {
  entry: GrimoireEntry;
}

function SearchResultCard({ entry }: SearchResultCardProps) {
  return (
    <Link
      href={`/grimoire/${entry.slug}`}
      className={`
        block p-5 rounded-2xl border
        bg-black/30 backdrop-blur-sm
        hover:bg-lunary-primary-900/10 hover:border-lunary-primary-600
        transition-all duration-300 group
        ${CATEGORY_COLORS[entry.category].split(' ')[2]}
      `}
    >
      <div className='flex items-start gap-4'>
        <span
          className={`
            flex items-center justify-center 
            w-12 h-12 rounded-xl text-xl
            ${CATEGORY_COLORS[entry.category]}
          `}
        >
          {CATEGORY_ICONS[entry.category]}
        </span>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='text-lg font-medium text-white group-hover:text-lunary-primary-200 transition-colors'>
              {entry.title}
            </h3>
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full capitalize
                ${CATEGORY_COLORS[entry.category]}
              `}
            >
              {entry.category}
            </span>
          </div>

          <p className='text-sm text-lunary-primary-300/70 mb-3'>
            {entry.summary}
          </p>

          <div className='flex flex-wrap gap-2'>
            {entry.keywords.slice(0, 5).map((keyword) => (
              <span
                key={keyword}
                className='text-xs px-2 py-1 rounded-lg bg-white/5 text-lunary-primary-300/50'
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <ArrowRight className='h-5 w-5 text-lunary-primary-400/30 group-hover:text-lunary-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1' />
      </div>
    </Link>
  );
}

function SearchContent({ query }: { query: string }) {
  const results = query
    ? searchGrimoireIndex(query, 20)
    : GRIMOIRE_SEARCH_INDEX.slice(0, 12);

  const isDefaultView = !query;

  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Search', url: '/grimoire/search' },
  ];

  return (
    <div className='space-y-6'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      {/* Results Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-lunary-primary-300/70'>
          <Sparkles className='h-4 w-4' />
          <span>
            {isDefaultView
              ? `Explore ${GRIMOIRE_SEARCH_INDEX.length} cosmic entries`
              : `Found ${results.length} ${results.length === 1 ? 'result' : 'results'} for "${query}"`}
          </span>
        </div>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className='grid gap-4'>
          {results.map((entry) => (
            <SearchResultCard key={entry.slug} entry={entry} />
          ))}
        </div>
      ) : (
        <div className='text-center py-16'>
          <Sparkles className='h-12 w-12 text-lunary-primary-400/30 mx-auto mb-4' />
          <h3 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            No cosmic insights found
          </h3>
          <p className='text-lunary-primary-300/60 max-w-md mx-auto'>
            Try searching for a zodiac sign, planet, tarot card, crystal, or
            astrological concept.
          </p>
        </div>
      )}

      {/* Browse by Category */}
      {isDefaultView && (
        <div className='mt-12 pt-8 border-t border-lunary-primary-700'>
          <h2 className='text-xl font-medium text-white mb-6'>
            Browse by Category
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {(
              [
                'zodiac',
                'planet',
                'tarot',
                'crystal',
                'ritual',
                'concept',
              ] as const
            ).map((category) => {
              const count = GRIMOIRE_SEARCH_INDEX.filter(
                (e) => e.category === category,
              ).length;
              return (
                <Link
                  key={category}
                  href={`/grimoire/${category === 'planet' ? 'astronomy' : category === 'concept' ? '' : category}${category === 'concept' ? '' : ''}`}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border
                    hover:bg-white/5 transition-colors
                    ${CATEGORY_COLORS[category].split(' ')[2]}
                  `}
                >
                  <span className='text-2xl'>{CATEGORY_ICONS[category]}</span>
                  <div>
                    <span className='text-white capitalize font-medium'>
                      {category}
                    </span>
                    <span className='text-lunary-primary-300/50 text-sm block'>
                      {count} {count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function GrimoireSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  return (
    <main className='min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white'>
      {/* Header */}
      <div className='border-b border-lunary-primary-700'>
        <div className='max-w-4xl mx-auto px-4 py-6'>
          {/* Title */}
          <div className='flex items-center gap-3 mb-6'>
            <BookOpen className='h-8 w-8 text-lunary-primary-400' />
            <h1 className='text-3xl md:text-4xl font-light'>
              Ask the <span className='font-medium'>Grimoire</span>
            </h1>
          </div>

          <p className='text-lunary-primary-300/70 mb-8 max-w-2xl'>
            Search our cosmic knowledge base for astrology, tarot, crystals,
            rituals, and spiritual wisdom. Find the answers you seek.
          </p>

          {/* Search Box */}
          <AskTheGrimoire
            variant='hero'
            placeholder='What cosmic wisdom do you seek?'
          />
        </div>
      </div>

      {/* Results */}
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center py-16'>
              <div className='animate-spin h-8 w-8 border-2 border-lunary-primary border-t-transparent rounded-full' />
            </div>
          }
        >
          <SearchContent query={query} />
        </Suspense>
      </div>

      {/* Structured Data */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Lunary Grimoire',
            url: 'https://lunary.app/grimoire',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate:
                  'https://lunary.app/grimoire/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      <div className='max-w-4xl mx-auto px-4'>
        <ExploreGrimoire />
      </div>
    </main>
  );
}
